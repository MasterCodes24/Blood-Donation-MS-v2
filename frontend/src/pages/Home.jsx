import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <span className="pill"><span className="dot" /> Every donation matters</span>
        <h1>One small act.<br /><span className="text-red">A lifetime of hope.</span></h1>
        <p className="hero-description">Connect with your community, book a blood donation appointment, and help make lifesaving care possible.</p>
        <div className="hero-actions"><Link className="button button-primary" to="/donor/register">Register as a donor <span>→</span></Link><Link className="button button-outline" to="/donor/login">Donor sign in</Link></div>
        <div className="hero-trust"><span className="trust-icon">✓</span> A simple way to support your community</div>
      </div>
      <div className="hero-art">
        <div className="art-circle circle-back" />
        <div className="art-card"><div className="drop">♥</div><div className="art-label">GIVE BLOOD<br /><strong>GIVE HOPE</strong></div><div className="art-line" /><div className="art-small">Your kindness can save lives.</div></div>
        <div className="floating-note"><span className="floating-heart">♥</span><div><strong>Be someone's hero</strong><small>Donate when you can</small></div></div>
        <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div>
      </div>
    </section>
    <section className="feature-section">
      <div className="section-heading"><div className="eyebrow">HOW IT WORKS</div><h2>Helping others, made simple</h2><p>Three easy steps to make a meaningful difference.</p></div>
      <div className="feature-grid">
        <article className="feature-card"><div className="feature-icon">01</div><h3>Create your profile</h3><p>Register with your contact details and blood group.</p></article>
        <article className="feature-card"><div className="feature-icon">02</div><h3>Book an appointment</h3><p>Choose a future date and track your request status.</p></article>
        <article className="feature-card"><div className="feature-icon">03</div><h3>Make a difference</h3><p>View your donation history after staff records the donation.</p></article>
      </div>
    </section>
    <section className="staff-strip"><div><div className="eyebrow">FOR BLOOD DONATION STAFF</div><h2>Manage appointments in one place.</h2><p>Review requests and update appointment status from the staff dashboard.</p></div><Link className="button button-dark" to="/staff/login">Staff sign in <span>→</span></Link></section>
  </main>;
}
