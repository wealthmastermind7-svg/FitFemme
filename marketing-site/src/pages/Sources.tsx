import './Legal.css'

export default function Sources() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <h1>Sources & Attribution</h1>
          <p className="last-updated">Last Updated: April 2026</p>

          <section>
            <h2>Open Source Libraries</h2>
            <p>Fit Femme is built with gratitude to the open source community. The following libraries and frameworks power our App:</p>
            
            <h3>Core Framework</h3>
            <ul>
              <li><strong>React Native</strong> - Cross-platform mobile development framework</li>
              <li><strong>Expo</strong> - React Native development platform and framework</li>
              <li><strong>React 19</strong> - JavaScript library for building user interfaces</li>
              <li><strong>TypeScript</strong> - Typed superset of JavaScript</li>
            </ul>

            <h3>Navigation & Routing</h3>
            <ul>
              <li><strong>React Navigation 7</strong> - Routing and navigation library for React Native</li>
            </ul>

            <h3>State Management & Data</h3>
            <ul>
              <li><strong>TanStack Query (@tanstack/react-query)</strong> - Data fetching and synchronization</li>
              <li><strong>AsyncStorage (@react-native-async-storage)</strong> - Local persistent storage</li>
              <li><strong>Zod</strong> - TypeScript-first schema validation</li>
            </ul>

            <h3>Animation & UI</h3>
            <ul>
              <li><strong>React Native Reanimated</strong> - Powerful animation library</li>
              <li><strong>React Native Gesture Handler</strong> - Touch gesture library</li>
              <li><strong>Expo Blur</strong> - Glassmorphism effects</li>
              <li><strong>Expo Linear Gradient</strong> - Gradient backgrounds</li>
              <li><strong>Expo Haptics</strong> - Vibration and haptic feedback</li>
            </ul>

            <h3>Icons & Images</h3>
            <ul>
              <li><strong>Expo Vector Icons (Feather)</strong> - Icon library</li>
              <li><strong>Expo Image</strong> - Optimized image loading</li>
              <li><strong>React Native SVG</strong> - SVG rendering and manipulation</li>
            </ul>

            <h3>Backend & Database</h3>
            <ul>
              <li><strong>Express.js</strong> - Server-side framework</li>
              <li><strong>PostgreSQL</strong> - Relational database</li>
              <li><strong>Drizzle ORM</strong> - Type-safe SQL query builder</li>
              <li><strong>Drizzle-Zod</strong> - Schema validation integration</li>
            </ul>

            <h3>Development Tools</h3>
            <ul>
              <li><strong>ESLint</strong> - Code linting</li>
              <li><strong>Prettier</strong> - Code formatting</li>
              <li><strong>tsx</strong> - TypeScript execution</li>
            </ul>
          </section>

          <section>
            <h2>Design Inspiration</h2>
            <ul>
              <li><strong>Apple Liquid Glass UI</strong> - iOS 26+ design language</li>
              <li><strong>Dark Mode Design</strong> - Modern, premium aesthetics</li>
              <li><strong>Cinematic Photography</strong> - Premium visual experience</li>
            </ul>
          </section>

          <section>
            <h2>Licenses</h2>
            <p>
              All third-party libraries used in Fit Femme are licensed under their respective open-source licenses, including MIT, Apache 2.0, and other permissive licenses. Detailed license information for each dependency can be found in the package.json and node_modules directories of our project.
            </p>
          </section>

          <section>
            <h2>Fitness Content</h2>
            <p>
              Exercise demonstrations and fitness guidance are based on established workout principles and exercise science. All exercises are selected for safety and effectiveness for women of all fitness levels.
            </p>
          </section>

          <section>
            <h2>Acknowledgments</h2>
            <p>
              We extend our gratitude to:
            </p>
            <ul>
              <li>The React and Expo communities for excellent documentation and support</li>
              <li>All contributors to the open-source projects we depend on</li>
              <li>Our users who inspire us to continuously improve</li>
              <li>Women everywhere celebrating their strength, curves, and culture</li>
            </ul>
          </section>

          <section>
            <h2>Contact for Attribution</h2>
            <p>
              If you believe we have missed attributing any open-source software or content, please contact us at{' '}
              <a href="mailto:admin@cerolauto.com">admin@cerolauto.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
