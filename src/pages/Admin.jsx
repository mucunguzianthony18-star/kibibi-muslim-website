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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, cloudinary } from '../firebase.js'
import PageBanner from '../components/PageBanner.jsx'

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

function GalleryManager() {
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setMsg('Could not load photos: ' + err.message)
    )
  }, [])

  async function upload(e) {
    e.preventDefault()
    if (!file) {
      setMsg('Choose a photo first.')
      return
    }
    setBusy(true)
    setMsg('Uploading...')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', cloudinary.uploadPreset)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
        { method: 'POST', body: data }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || 'Upload failed')
      await addDoc(collection(db, 'gallery'), {
        url: json.secure_url,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
      })
      setFile(null)
      setCaption('')
      e.target.reset()
      setMsg('Photo added.')
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
    setBusy(false)
  }

  async function remove(id) {
    if (!window.confirm('Remove this photo from the gallery?')) return
    try {
      await deleteDoc(doc(db, 'gallery', id))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  return (
    <div>
      <form className="admin-box" onSubmit={upload}>
        <h2>Add a gallery photo</h2>
        <label>Photo</label>
        <input
          type="file"
          accept="image/*"
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
          {busy ? 'Please wait...' : 'Upload'}
        </button>
        {msg && <p className="admin-msg">{msg}</p>}
      </form>

      <h2 className="admin-sub">Photos on the site ({items.length})</h2>
      <div className="admin-grid">
        {items.map((it) => (
          <div key={it.id} className="admin-photo">
            <img
              src={it.url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}
              alt={it.caption || 'Gallery photo'}
            />
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
              <GalleryManager />
            </>
          ) : (
            <Login />
          )}
        </div>
      </section>
    </>
  )
}
