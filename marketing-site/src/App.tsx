import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Sources from './pages/Sources'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/sources" element={<Sources />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
