import { useState } from 'react';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

import { auth, googleProvider, firebaseConfigured } from '../firebase';
import Icon from '../components/Icons';

export default function Login({ onLogin, onBack }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (!firebaseConfigured) {
        throw new Error(
          'Firebase is not configured yet. Paste your Firebase Web App config in src/firebase.js.'
        );
      }

      const r = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      onLogin(r.user);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (!firebaseConfigured) {
        throw new Error(
          'Firebase is not configured yet. Paste your Firebase Web App config in src/firebase.js.'
        );
      }

      const r = await signInWithPopup(auth, googleProvider);

      onLogin(r.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError('');

    if (!form.email) {
      return setError('Enter your email first.');
    }

    try {
      await sendPasswordResetEmail(auth, form.email);
      setMessage('Password reset email sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    }
  };

  return (
    <div className="login-page">

      {/* Left Side / Church Image */}
      <div className="login-photo">

        <button className="back-home" onClick={onBack}>
          ← Home
        </button>

        <div className="login-photo-copy">
          <span>CHURCH EVENT & SERVICE MANAGEMENT</span>

          <h1>
            Serve with faith.
            <br />
            <i>Organize with care.</i>
          </h1>

          <p>“Let all that you do be done in love.”</p>

          <b>1 Corinthians 16:14</b>
        </div>
      </div>

      {/* Right Side / Login Form */}
      <div className="login-side">

        <form className="login-card" onSubmit={submit}>

          {/* Logo */}
          <div className="logo-lockup">
            <span className="logo-mark">
              <Icon name="church" size={30} />
            </span>

            <span>
              <strong>
                DIO<span>ganize</span>
              </strong>

              <small>Parish Service System</small>
            </span>
          </div>

          <span className="eyebrow dark">
            WELCOME BACK
          </span>

          <h2>Sign in to your account</h2>

          <p className="muted">
            Manage your church service requests and schedules in one place.
          </p>

          {/* Email */}
          <label>
            Email Address

            <span className="field">
              <Icon name="mail" size={18} />

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
              />
            </span>
          </label>

          {/* Password */}
          <label>
            Password

            <div className="password-wrap">
              <Icon name="lock" size={18} />

              <input
                type={show ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {/* Forgot Password */}
          <div className="login-options">
            <button type="button" onClick={forgot}>
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="login-success">
              {message}
            </div>
          )}

          {/* Sign In */}
          <button
            className="button button-primary full"
            disabled={busy}
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="or">
            <span>or</span>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="google-button"
            onClick={google}
            disabled={busy}
          >
            <span>G</span>
            Continue with Google
          </button>

          {/* Notes */}
          <p className="secure-note">
            Don't have an account? Contact your administrator.
          </p>

          <p className="secure-note">
            Your account is secured by Firebase Authentication.
          </p>

        </form>
      </div>
    </div>
  );
}