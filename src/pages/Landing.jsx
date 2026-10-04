function Landing({ onContinue }) {
  return (
    <div className="parish-landing">
      <header className="parish-header">
        <button className="parish-brand" onClick={onContinue} aria-label="Open login">
          <span className="parish-logo">D</span>
          <span>
            <strong>DIOganize</strong>
            <small>Parish Service System</small>
          </span>
        </button>
        <nav className="parish-nav" aria-label="Main navigation">
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
          <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Services</button>
          <button className="header-login" onClick={onContinue}>Login</button>
        </nav>
      </header>

      <main>
        <section className="parish-hero">
          <div className="hero-copy">
            <p className="small-kicker">WELCOME TO DIOGANIZE</p>
            <h1>Serving the parish<br /><span>with faith and care.</span></h1>
            <p className="hero-text">
              A simple online space for requesting church services, checking schedules,
              and keeping parish applications organized.
            </p>
            <button className="hero-button" onClick={onContinue}>Get Started</button>
            <p className="hero-verse">“Let all that you do be done in love.” <b>1 Corinthians 16:14</b></p>
          </div>
          <div className="hero-photo-note">
            <span>PARISH SERVICE SYSTEM</span>
            <span className="gold-line" />
            <span>Faith • Service • Community</span>
          </div>
        </section>

        <section className="parish-intro" id="about">
          <p className="small-kicker">A SIMPLE WAY TO CONNECT</p>
          <h2>Parish services, made easier.</h2>
          <p>
            DIOganize helps parishioners submit service requests and view schedules in one place,
            while keeping the experience clear and easy to use.
          </p>
          <div className="intro-lines" id="services">
            <div><b>01</b><span><strong>Request a service</strong><small>Baptism, Wedding, Funeral Service and other parish services.</small></span></div>
            <div><b>02</b><span><strong>Choose a schedule</strong><small>Send the preferred date, time, venue and needed details.</small></span></div>
            <div><b>03</b><span><strong>Keep track</strong><small>Review your applications and upcoming parish schedules.</small></span></div>
          </div>
        </section>
      </main>

      <footer className="parish-footer">DIOganize Parish Service System</footer>
    </div>
  );
}

export default Landing;
