export default function PageBanner({ title, blurb }) {
  return (
    <section className="page-banner">
      <div className="container">
        <h1>{title}</h1>
        {blurb && <p>{blurb}</p>}
      </div>
    </section>
  )
}
