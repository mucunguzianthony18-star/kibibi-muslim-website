import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'
import Gallery from './pages/Gallery.jsx'
import Page from './pages/Page.jsx'
import Placeholder from './pages/Placeholder.jsx'
import { editablePages } from './pageList.js'

// Pages not editable yet (News and Downloads get their own tools later)
const comingSoon = [
  ['/news', 'News & Events', 'School announcements, activities and events.'],
  ['/downloads', 'Downloads', 'Prospectus, admission forms and notices.'],
]

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/gallery" element={<Gallery />} />
          {editablePages.map((p) => (
            <Route
              key={p.slug}
              path={p.path}
              element={<Page slug={p.slug} title={p.title} blurb={p.blurb} />}
            />
          ))}
          {comingSoon.map(([path, title, blurb]) => (
            <Route
              key={path}
              path={path}
              element={<Placeholder title={title} blurb={blurb} />}
            />
          ))}
          <Route
            path="*"
            element={<Placeholder title="Page not found" blurb="That page does not exist." />}
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
