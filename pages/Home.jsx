import { Link } from 'react-router-dom'
import { school } from '../siteConfig.js'

const highlights = [
  {
    title: 'Academic Excellence',
    text: 'Dedicated teachers guiding students from S1 to S6 across arts and sciences.',
  },
  {
    title: 'Faith & Character',
    text: 'Islamic values of discipline, honesty and respect shape everyday school life.',
  },
  {
    title: 'Beyond the Classroom',
    text: 'Clubs, sports and leadership opportunities that build confident learners.',
  },
]

const quick = [
  { to: '/admissions', label: 'Admissions' },
  { to: '/academics', label: 'Academics' },
  { to: '/news', label: 'News & Events' },
  { to: '/contact', label: 'Contact Us' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <p className="eyebrow">Welcome to</p>
            <h1>{school.name}</h1>
            <p className="hero-motto">{school.motto}</p>
            <div className="hero-actions">
              <Link to="/admissions" className="btn btn-gold">
                Apply for Admission
              </Link>
              <Link to="/about" className="btn btn-outline">
                Learn About Us
              </Link>
            </div>
          </div>
          <div className="hero-badge">
            <img src="/images.jpeg" alt={`${school.name} crest`} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Why Kibibi Muslim S.S</h2>
          <div className="cards">
            {highlights.map((h) => (
              <article key={h.title} className="card">
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container welcome">
          <div className="photo-placeholder">School photo</div>
          <div>
            <h2 className="section-title left">A Message from the Head Teacher</h2>
            <p>
              Welcome message goes here. Replace this text with the head
              teacher's greeting to parents, students and visitors.
            </p>
            <p className="muted">— Head Teacher, {school.short}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore</h2>
          <div className="quick">
            {quick.map((q) => (
              <Link key={q.to} to={q.to} className="quick-item">
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
                               }
