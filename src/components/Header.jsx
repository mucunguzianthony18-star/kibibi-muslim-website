import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { school, nav } from '../siteConfig.js'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img
            src="/images.jpeg"
            alt={`${school.name} logo`}
            className="brand-logo"
          />
          <span className="brand-text">
            <strong>{school.name}</strong>
            <em>{school.motto}</em>
          </span>
        </Link>
        <button
          className="menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
      <nav className={`main-nav ${open ? 'open' : ''}`}>
        <div className="container nav-row">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </NavLink>
          ))}
          <a
            className="portal-btn"
            href={school.portalUrl}
            target="_blank"
            rel="noreferrer"
          >
            Student / Parent Portal
          </a>
        </div>
      </nav>
    </header>
  )
            }
