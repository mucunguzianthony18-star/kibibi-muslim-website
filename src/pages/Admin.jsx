import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db, cloudinary } from '../firebase.js'
import { editablePages } from '../pageList.js'
import PageBanner from '../components/PageBanner.jsx'

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100

function youtubeId(link) {
  const m = link.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  )
  return m ? m[1] : null
}

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', cloudinary.uploadPreset)
    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/auto/upload`
    )
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let json = {}
      try {
        json = JSON.parse(xhr.responseText)
      } catch {
        json = {}
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json)
      else reject(new Error(json.error?.message || 'Upload failed'))
    }
    xhr.onerror = () =>
      reject(new Error('Network error. Check your connection and try again.'))
    xhr.send(data)
  })
}

function thumb(it) {
  if (it.type === 'youtube') {
    return `https://img.youtube.com/vi/${it.videoId}/hqdefault.jpg`
  }
  if (it.type === 'video') {
    return it.url
      .replace('/upload/', '/upload/so_0,f_jpg,w_400/')
      .replace(/\.[^./]+$/, '.jpg')
  }
  return it.url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Wrong email or password.')
    }
    setBusy(false)
  }

  return (
    <form className="admin-box" onSubmit={handleLogin}>
      <h2>Admin login</h2>
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="admin-error">{error}</p>}
      <button className="btn btn-gold" type="submit" disabled={busy}>
        {busy ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

function PageEditor() {
  const [slug, setSlug] = useState(editablePages[0].slug)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMsg('')
    getDoc(doc(db, 'pages', slug))
      .then((snap) => {
        if (cancelled) return
        setBody(snap.exists() ? snap.data().body || '' : '')
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setMsg('Could not load: ' + err.message)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await setDoc(doc(db, 'pages', slug), {
        body,
        updatedAt: serverTimestamp(),
      })
      setMsg('Saved. The page is now updated.')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setSaving(false)
  }

  const current = editablePages.find((p) => p.slug === slug)

  return (
    <form className="admin-box wide" onSubmit={save}>
      <h2>Edit a page</h2>
      <label>Which page?</label>
      <select value={slug} onChange={(e) => setSlug(e.target.value)}>
        {editablePages.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.title}
          </option>
        ))}
      </select>

      <label>Text for “{current.title}”</label>
      <textarea
        value={loading ? '' : body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={loading ? 'Loading...' : 'Type the page text here...'}
        disabled={loading}
      />
      <p className="admin-help">
        Leave a blank line between paragraphs. Start a line with <b>## </b> for
        a heading (put a blank line after it). Start lines with <b>- </b> to
        make a bullet list.
      </p>

      <button className="btn btn-gold" type="submit" disabled={saving || loading}>
        {saving ? 'Saving...' : 'Save page'}
      </button>
      <a className="admin-view" href={current.path} target="_blank" rel="noreferrer">
        View page
      </a>
      {msg && <p className="admin-msg">{msg}</p>}
    </form>
  )
}

function GalleryManager() {
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')

  const [ytLink, setYtLink] = useState('')
  const [ytCaption, setYtCaption] = useState('')
  const [ytMsg, setYtMsg] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setMsg('Could not load items: ' + err.message)
    )
  }, [])

  async function upload(e) {
    e.preventDefault()
    const form = e.target
    if (!file) {
      setMsg('Choose a photo or video first.')
      return
    }
    const isVideo = file.type.startsWith('video/')
    const limit = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
    if (file.size > limit * 1024 * 1024) {
      setMsg(
        `That file is too large. ${isVideo ? 'Videos' : 'Photos'} must be under ${limit} MB. For long videos, use a YouTube link below.`
      )
      return
    }
    setBusy(true)
    setProgress(0)
    setMsg('Uploading...')
    try {
      const json = await uploadToCloudinary(file, setProgress)
      await addDoc(collection(db, 'gallery'), {
        type: json.resource_type === 'video' ? 'video' : 'image',
        url: json.secure_url,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
      })
      setFile(null)
      setCaption('')
      form.reset()
      setMsg(isVideo ? 'Video added.' : 'Photo added.')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setBusy(false)
  }

  async function addYoutube(e) {
    e.preventDefault()
    const id = youtubeId(ytLink.trim())
    if (!id) {
      setYtMsg('That does not look like a YouTube link.')
      return
    }
    try {
      await addDoc(collection(db, 'gallery'), {
        type: 'youtube',
        url: ytLink.trim(),
        videoId: id,
        caption: ytCaption.trim(),
        createdAt: serverTimestamp(),
      })
      setYtLink('')
      setYtCaption('')
      setYtMsg('YouTube video added.')
    } catch (err) {
      setYtMsg('Error: ' + err.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Remove this from the gallery?')) return
    try {
      await deleteDoc(doc(db, 'gallery', id))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  return (
    <div>
      <form className="admin-box" onSubmit={upload}>
        <h2>Upload a photo or video</h2>
        <label>
          File (photo up to {MAX_IMAGE_MB} MB, video up to {MAX_VIDEO_MB} MB)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <label>Caption (optional)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. Morning assembly"
        />
        <button className="btn btn-gold" type="submit" disabled={busy}>
          {busy ? `Uploading ${progress}%` : 'Upload'}
        </button>
        {msg && <p className="admin-msg">{msg}</p>}
      </form>

      <form className="admin-box" onSubmit={addYoutube}>
        <h2>Add a YouTube video</h2>
        <label>YouTube link</label>
        <input
          type="text"
          value={ytLink}
          onChange={(e) => setYtLink(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <label>Caption (optional)</label>
        <input
          type="text"
          value={ytCaption}
          onChange={(e) => setYtCaption(e.target.value)}
          placeholder="e.g. Sports day highlights"
        />
        <button className="btn btn-gold" type="submit">
          Add video
        </button>
        {ytMsg && <p className="admin-msg">{ytMsg}</p>}
      </form>

      <h2 className="admin-sub">On the site ({items.length})</h2>
      <div className="admin-grid">
        {items.map((it) => (
          <div key={it.id} className="admin-photo">
            <img src={thumb(it)} alt={it.caption || 'Gallery item'} />
            {it.type === 'video' && <span className="admin-badge">Video</span>}
            {it.type === 'youtube' && <span className="admin-badge">YouTube</span>}
            <p>{it.caption || '(no caption)'}</p>
            <button className="admin-remove" onClick={() => remove(it.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState('pages')

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  return (
    <>
      <PageBanner title="Admin" blurb="Manage website content." />
      <section className="section">
        <div className="container">
          {user === undefined ? (
            <p className="muted">Loading...</p>
          ) : user ? (
            <>
              <div className="admin-bar">
                <span>Signed in as {user.email}</span>
                <button className="btn btn-gold" onClick={() => signOut(auth)}>
                  Sign out
                </button>
              </div>
              <div className="admin-tabs">
                <button
                  className={tab === 'pages' ? 'admin-tab active' : 'admin-tab'}
                  onClick={() => setTab('pages')}
                >
                  Pages
                </button>
                <button
                  className={tab === 'gallery' ? 'admin-tab active' : 'admin-tab'}
                  onClick={() => setTab('gallery')}
                >
                  Gallery
                </button>
              </div>
              {tab === 'pages' ? <PageEditor /> : <GalleryManager />}
            </>
          ) : (
            <Login />
          )}
        </div>
      </section>
    </>
  )
}
