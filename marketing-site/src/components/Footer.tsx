import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Fit Femme</h4>
            <p>Premium workouts with guided timers. Celebrate your power, curves, and culture.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#download">Download App</a></li>
              <li><Link to="/sources">Sources</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              <a href="mailto:admin@cerolauto.com">admin@cerolauto.com</a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Fit Femme. Made with love for women. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
