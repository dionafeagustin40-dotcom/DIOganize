```jsx
export default function Landing({ onContinue }) {
  return (
    <div className="landing-page">

      {/* Header */}
      <header className="landing-header">

        <div className="logo-lockup light">
          <span className="logo-mark">✚</span>

          <span>
            <strong>
              DIO<span>ganize</span>
            </strong>

            <small>
              CHURCH SERVICE MANAGEMENT
            </small>
          </span>
        </div>

        {/* Navigation */}
        <nav>
          <button>Home</button>
          <button>Services</button>
          <button>About</button>

          <button
            onClick={onContinue}
            className="landing-login"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Background Overlay */}
      <div className="landing-overlay" />

      {/* Main Content */}
      <main className="landing-content">

        <span className="eyebrow">
          PARISH SERVICE SYSTEM
        </span>

        <h1>
          Organize with <span>Purpose.</span>
          <br />
          Serve with <span>Love.</span>
        </h1>

        <p>
          A simple and organized way to manage church events,
          services, schedules, applications, and important parish
          activities.
        </p>

        {/* Get Started Button */}
        <button
          className="hero-button"
          onClick={onContinue}
        >
          Get Started <span>→</span>
        </button>

        {/* Features */}
        <div className="landing-features">

          <div>
            <b>01</b>
            <span>
              Easy Event
              <br />
              Scheduling
            </span>
          </div>

          <div>
            <b>02</b>
            <span>
              Church Service
              <br />
              Management
            </span>
          </div>

          <div>
            <b>03</b>
            <span>
              Meaningful
              <br />
              Church Events
            </span>
          </div>

        </div>

        {/* Bible Verse */}
        <blockquote>
          “For where two or three gather in my name, there am I with them.”
          <small>Matthew 18:20</small>
        </blockquote>

      </main>

      {/* Footer */}
      <footer>
        Serving the Church Community
      </footer>

    </div>
  );
}
```
