import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Placeholder from './pages/Placeholder.jsx'

const pages = [
  ['/about', 'About Us', 'History, vision, mission, values and leadership.'],
  ['/academics', 'Academics', 'Subjects, departments and academic programmes.'],
  ['/admissions', 'Admissions', 'Admission requirements, process and fees.'],
  ['/students', 'Student Life', 'Clubs, leadership, sports and achievements.'],
  ['/news', 'News & Events', 'School announcements, activities and events.'],
  ['/gallery', 'Gallery', 'Photos from around the school.'],
  ['/staff', 'Staff', 'Administration and teaching staff.'],
  ['/downloads', 'Downloads', 'Prospectus, admission forms and notices.'],
  ['/contact', 'Contact Us', 'Location, phone, email and enquiries.'],
]

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {pages.map(([path, title, blurb]) => (
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
