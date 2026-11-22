import { useEffect, useState } from 'react';
import {
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function friendlyAuthError(err, fallback) {
  const code = err?.code || '';
  if (code === 'auth/unauthorized-domain') {
    return `This website (${window.location.hostname}) is not yet authorized for Google Sign-In. Add it in Firebase Console → Authentication → Settings → Authorized domains.`;
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Incorrect email or password. If you registered with Google, please click Continue with Google.';
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/network-request-failed') return 'Network error. Please check your internet connection.';
  if (code === 'auth/popup-closed-by-user') return 'Sign-in cancelled.';
  return err?.message || fallback;
}

async function finishLogin(user, onLogin, provider = 'password', remember = false) {
  let role = 'User';
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const raw = String(snap.data()?.role || '').trim().toLowerCase();
      if (raw === 'admin') role = 'Admin';
    }
  } catch {
    const cached = localStorage.getItem(`dioganize_role_${user.uid}`);
    if (cached === 'Admin') role = 'Admin';
  }

  onLogin(role, {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || role,
    photoURL: user.photoURL || '',
    provider,
    remember
  });
}

function Login({ onLogin, onBack }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle redirect result when returning from Google OAuth on mobile
  useEffect(() => {
    let active = true;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!active || !result || !result.user) return;
        await finishLogin(result.user, onLogin, 'google', false);
      })
      .catch((err) => {
        if (!active) return;
        if (err && err.code && err.code !== 'auth/credential-already-in-use') {
          console.error('[AUTH] Redirect sign-in error:', err);
          setError(friendlyAuthError(err, 'Google sign-in could not be completed.'));
        }
      });

    return () => {
      active = false;
    };
  }, [onLogin]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      await finishLogin(result.user, onLogin, 'password', remember);
    } catch (err) {
      setError(friendlyAuthError(err, 'Email and password sign-in failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setGoogleLoading(true);

    try {
      if (isMobileDevice()) {
        // Mobile browsers block popups: use seamless redirect
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      // Desktop browsers: use popup
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await finishLogin(result.user, onLogin, 'google', false);
      } catch (popupErr) {
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request'
        ) {
          // If popup is blocked by the browser, fallback to redirect
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupErr;
        }
      }
    } catch (err) {
      console.error('[AUTH] Google login error:', err);
      setError(friendlyAuthError(err, 'Google sign-in could not be completed.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const forgotPassword = async () => {
    setError('');
    setMessage('');
    if (!form.email) {
      setError('Enter your email address first, then click Forgot password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err?.message || 'Could not send the password reset email.');
    }
  };

  return (
    <div className="simple-login-page">
      <div className="simple-login-photo">
        <button className="back-home" onClick={onBack}>← Home</button>
        <div className="photo-copy">
          <p className="small-kicker">DIOGANIZE PARISH</p>
          <h1>Welcome back.</h1>
          <p>“Let all that you do be done in love.”</p>
          <span>1 Corinthians 16:14</span>
        </div>
      </div>

      <div className="simple-login-side">
        <form className="simple-login-card" onSubmit={submit}>
          <div className="simple-brand">
            <span className="parish-logo">D</span>
            <span><strong>DIOganize</strong><small>Parish Service System</small></span>
          </div>
          <p className="small-kicker">PARISH ACCOUNT</p>
          <h2>Sign in</h2>
          <p className="login-intro">Use your account to manage church service requests and schedules.</p>

          <label>Email Address
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>Password
            <div className="simple-password">
              <input
                type={passwordVisible ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setPasswordVisible((v) => !v)}>
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="simple-login-options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              /> Remember me
            </label>
            <button type="button" onClick={forgotPassword}>Forgot password?</button>
          </div>

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-success">{message}</div>}

          <button className="simple-signin" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="simple-divider"><span>or</span></div>
          <button
            type="button"
            className="simple-google"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <span>G</span>{googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <p className="simple-note">Your account is secured by Firebase Authentication.</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
