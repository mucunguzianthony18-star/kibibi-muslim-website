import { Link } from 'react-router-dom'
import { school, nav } from '../siteConfig.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h4>{school.name}</h4>
          <p className="motto">“{school.motto}”</p>
          <p>{school.location}</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <ul>
            {nav.slice(1, 6).map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>{school.phone}</p>
          <p>{school.email}</p>
          <a
            className="portal-link"
            href={school.portalUrl}
            target="_blank"
            rel="noreferrer"
          >
            Student / Parent Portal →
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {school.name}. All rights reserved.
      </div>
    </footer>
  )
}
