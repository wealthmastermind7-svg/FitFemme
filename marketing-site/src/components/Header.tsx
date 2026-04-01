import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text">Fit</span>
            <span className="logo-accent">Femme</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <a href="#features" className="nav-link">Features</a>
            <a href="#download" className="nav-link">Download</a>
            <div className="nav-divider"></div>
            <Link to="/privacy" className="nav-link">Privacy</Link>
            <Link to="/terms" className="nav-link">Terms</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
