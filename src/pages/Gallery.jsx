import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import PageBanner from '../components/PageBanner.jsx'

function Media({ it }) {
  if (it.type === 'youtube') {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${it.videoId}`}
        title={it.caption || 'YouTube video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  if (it.type === 'video') {
    const poster = it.url
      .replace('/upload/', '/upload/so_0,f_jpg,w_600/')
      .replace(/\.[^./]+$/, '.jpg')
    return (
      <video controls preload="none" poster={poster} src={it.url} playsInline />
    )
  }
  return (
    <a href={it.url} target="_blank" rel="noreferrer">
      <img
        src={it.url.replace('/upload/', '/upload/f_auto,q_auto,w_600/')}
        alt={it.caption || 'School photo'}
        loading="lazy"
      />
    </a>
  )
}

export default function Gallery() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setError('Could not load the gallery right now.')
    )
  }, [])

  return (
    <>
      <PageBanner title="Gallery" blurb="Photos and videos from around the school." />
      <section className="section">
        <div className="container">
          {error && <p className="muted">{error}</p>}
          {!error && items === null && <p className="muted">Loading...</p>}
          {items && items.length === 0 && (
            <p className="muted">Nothing here yet. Please check back soon.</p>
          )}
          {items && items.length > 0 && (
            <div className="gallery-grid">
              {items.map((it) => (
                <div key={it.id} className="gallery-item">
                  <div className="gallery-media">
                    <Media it={it} />
                  </div>
                  {it.caption && <span>{it.caption}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
