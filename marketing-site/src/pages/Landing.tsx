import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Celebrate Your <span className="gradient-text">Power</span>
            </h1>
            <p className="hero-subtitle">
              Premium workouts designed for women. Guided timers with visual demos, 
              progress tracking, and celebration of your curves and culture.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary" id="download">
                Download Now
                <span>→</span>
              </button>
              <a href="#features" className="btn btn-secondary">
                Learn More
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">6</div>
                <div className="stat-label">Curated Workouts</div>
              </div>
              <div className="stat">
                <div className="stat-number">100+</div>
                <div className="stat-label">Exercises</div>
              </div>
              <div className="stat">
                <div className="stat-number">∞</div>
                <div className="stat-label">Empowerment</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-gradient"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Why Fit Femme?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Guided Timers</h3>
              <p>No confusing videos. Follow guided timers while we count the reps. Focus on your form, not the screen.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Visual Progress</h3>
              <p>See your workout distribution across muscle groups. Track which areas you're focusing on with precision.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Exercise Demos</h3>
              <p>Visual GIF demonstrations for every exercise. Get proper form guidance for maximum results.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Design</h3>
              <p>Dark mode with cinematic photography. Liquid glass UI inspired by modern luxury design.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Celebrate You</h3>
              <p>Premium app designed for women. Celebrate your curves, your culture, and your strength.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>No Subscriptions</h3>
              <p>Get lifetime access to all workouts. One-time premium experience, no recurring fees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workouts Section */}
      <section className="workouts">
        <div className="container">
          <h2>Our Workout Collection</h2>
          <div className="workouts-grid">
            <div className="workout-card">
              <div className="workout-label">HIIT</div>
              <h3>Full Body Burn</h3>
              <p>30 mins • High Intensity</p>
              <ul>
                <li>Jump Squats</li>
                <li>Burpees</li>
                <li>Mountain Climbers</li>
                <li>Push-ups</li>
              </ul>
            </div>
            <div className="workout-card">
              <div className="workout-label">Strength</div>
              <h3>Glute Gains</h3>
              <p>15 mins • Medium Intensity</p>
              <ul>
                <li>Glute Bridge Walk</li>
                <li>Donkey Kicks</li>
                <li>Resistance Band Work</li>
                <li>Weighted Squats</li>
              </ul>
            </div>
            <div className="workout-card">
              <div className="workout-label">Core</div>
              <h3>Core Crusher</h3>
              <p>20 mins • High Intensity</p>
              <ul>
                <li>Bicycle Crunches</li>
                <li>Leg Raises</li>
                <li>Russian Twists</li>
                <li>Plank Variations</li>
              </ul>
            </div>
            <div className="workout-card">
              <div className="workout-label">Cardio</div>
              <h3>Cardio Queen</h3>
              <p>25 mins • High Intensity</p>
              <ul>
                <li>High Knee Taps</li>
                <li>Jump Rope</li>
                <li>Box Jumps</li>
                <li>Sprint Intervals</li>
              </ul>
            </div>
            <div className="workout-card">
              <div className="workout-label">Stretch</div>
              <h3>Flexibility Flow</h3>
              <p>20 mins • Low Intensity</p>
              <ul>
                <li>Forward Folds</li>
                <li>Hamstring Stretches</li>
                <li>Hip Openers</li>
                <li>Yoga Poses</li>
              </ul>
            </div>
            <div className="workout-card">
              <div className="workout-label">Core</div>
              <h3>No-Equipment Abs</h3>
              <p>15 mins • High Intensity</p>
              <ul>
                <li>Jack Split Crunches</li>
                <li>Reverse Crunches</li>
                <li>Bicycle Crunches</li>
                <li>Dead Bugs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Celebrate Your Power?</h2>
            <p>Join thousands of women transforming their fitness journey with guided timers and visual progress tracking.</p>
            <button className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 48px' }}>
              Download Fit Femme Now
              <span>→</span>
            </button>
            <p className="cta-note">Available on iOS and Android • No subscription required</p>
          </div>
        </div>
      </section>
    </div>
  )
}
