import PageBanner from '../components/PageBanner.jsx'

export default function Placeholder({ title, blurb }) {
  return (
    <>
      <PageBanner title={title} blurb={blurb} />
      <section className="section">
        <div className="container">
          <p className="muted">Content for this page is coming soon.</p>
        </div>
      </section>
    </>
  )
}
