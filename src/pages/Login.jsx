import { useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

function Login({ onLogin, onBack }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      onLogin('User', {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        photoURL: result.user.photoURL,
        provider: 'password',
        remember
      });
    } catch (err) {
      setError(err?.message || 'Email and password sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin('User', {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        photoURL: result.user.photoURL,
        provider: 'google'
      });
    } catch (err) {
      setError(err?.message || 'Google sign-in could not be completed.');
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
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </label>

          <label>Password
            <div className="simple-password">
              <input type={passwordVisible ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
              <button type="button" onClick={() => setPasswordVisible((v) => !v)}>{passwordVisible ? 'Hide' : 'Show'}</button>
            </div>
          </label>

          <div className="simple-login-options">
            <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
            <button type="button" onClick={forgotPassword}>Forgot password?</button>
          </div>

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-success">{message}</div>}

          <button className="simple-signin" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <div className="simple-divider"><span>or</span></div>
          <button type="button" className="simple-google" onClick={handleGoogleLogin} disabled={googleLoading}>
            <span>G</span>{googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <p className="simple-note">Your account is secured by Firebase Authentication.</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
