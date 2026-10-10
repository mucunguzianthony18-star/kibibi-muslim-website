import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import PageBanner from '../components/PageBanner.jsx'

// Simple formatting: blank line = new paragraph,
// "## " at the start of a block = heading,
// lines starting with "- " = bullet list.
function renderBody(body) {
  return body.split(/\n\s*\n/).map((block, i) => {
    const text = block.trim()
    if (!text) return null
    if (text.startsWith('## ')) return <h3 key={i}>{text.slice(3)}</h3>
    const lines = text.split('\n')
    if (lines.every((l) => l.trim().startsWith('- '))) {
      return (
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j}>{l.trim().slice(2)}</li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i}>
        {lines.map((l, j) => (
          <span key={j}>
            {l}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    )
  })
}

export default function Page({ slug, title, blurb }) {
  const [body, setBody] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setBody(null)
    setError('')
    return onSnapshot(
      doc(db, 'pages', slug),
      (snap) => setBody(snap.exists() ? snap.data().body || '' : ''),
      () => setError('Could not load this page right now.')
    )
  }, [slug])

  return (
    <>
      <PageBanner title={title} blurb={blurb} />
      <section className="section">
        <div className="container page-content">
          {error && <p className="muted">{error}</p>}
          {!error && body === null && <p className="muted">Loading...</p>}
          {body !== null && body.trim() === '' && (
            <p className="muted">Content for this page is coming soon.</p>
          )}
          {body !== null && body.trim() !== '' && renderBody(body)}
        </div>
      </section>
    </>
  )
}
