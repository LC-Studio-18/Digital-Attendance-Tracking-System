import { useState } from 'react';
import { isFirebaseConfigured } from '../services/firebase';
import { loginUser, resetPassword } from '../services/authService';
import '../styles/Login.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const configError = isFirebaseConfigured
    ? ''
    : 'Firebase setup is incomplete. Add the Web app values to frontend/.env and restart the app.';

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password, rememberMe);
      onLoginSuccess?.(user);
    } catch (authError) {
      const messages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-not-found': 'Email or password is incorrect.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/wrong-password': 'Email or password is incorrect.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/operation-not-allowed':
          'Email and password sign-in is not enabled for this Firebase project.',
        'auth/invalid-api-key':
          'Firebase is not configured correctly. Check the Web app values.',
        'app/firebase-config-missing': configError,
      };

      setError(
        !navigator.onLine
          ? "You're offline. Check your internet connection and try again."
          : messages[authError.code] || 'Login failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setNotice('If an account exists for this email, a reset link is on its way.');
    } catch (authError) {
      setError(
        authError.code === 'app/firebase-config-missing'
          ? configError
          : 'Could not send the reset email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`login-page${resetMode ? ' reset-page' : ''}`}>
      <section className="login-card" aria-label={resetMode ? 'Reset password' : 'Sign in'}>
        <div className="login-logo">LOGO</div>

        {resetMode ? (
          <>
            <h1 className="reset-title">Forgot your password?</h1>
            <p className="reset-description">
              Enter your email address and we’ll send you a link to reset your password.
            </p>
            <form onSubmit={handlePasswordReset} noValidate>
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <button className="login-button" type="submit" disabled={loading || !isFirebaseConfigured}>
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </form>
            <button className="back-to-login" type="button" onClick={() => { setResetMode(false); clearMessages(); }}>
              ← <span>Back to login</span>
            </button>
          </>
        ) : (
          <>
            <h1>Welcome Back!</h1>
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)}>
                    {showPassword ? 'Hide' : 'Show/Hide'}
                  </button>
                </div>
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <div className="login-options">
                <label className="remember-option">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                  <span>Remember Me</span>
                </label>
                <button className="forgot-link" type="button" onClick={() => { setResetMode(true); clearMessages(); }}>
                  Forgot password?
                </button>
              </div>
              <button className="login-button" type="submit" disabled={loading || !isFirebaseConfigured}>
                {loading ? 'Logging in...' : 'Login'}
                {loading && <span className="loading-indicator" />}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function FormMessage({ error, notice }) {
  if (error) return <div className="login-error" role="alert">{error}</div>;
  if (notice) return <div className="login-notice" role="status">{notice}</div>;
  return null;
}

export default Login;
