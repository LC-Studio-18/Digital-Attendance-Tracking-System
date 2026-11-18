import { useCallback, useEffect, useState } from 'react';
import { isFirebaseConfigured } from '../services/firebase';
import {
  completePasswordlessSignIn,
  isPasswordlessSignInLink,
  loginUser,
  registerUser,
  resetPassword,
  sendPasswordlessSignInLink,
} from '../services/authService';
import '../styles/Login.css';

const authErrorMessages = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/email-already-in-use': 'An account already exists for this email.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/expired-action-code': 'This sign-in link has expired. Request a new one.',
  'auth/invalid-action-code': 'This sign-in link is invalid. Request a new one.',
  'auth/email-required': 'Enter the email address that received the sign-in link.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled for this Firebase project.',
  'auth/invalid-api-key':
    'Firebase is not configured correctly. Check the Web app values.',
  'app/firebase-config-missing':
    'Firebase setup is incomplete. Add the Web app values to frontend/.env and restart the app.',
};

function Login({ onLoginSuccess }) {
  const emailLinkReady = isFirebaseConfigured && isPasswordlessSignInLink();

  const [mode, setMode] = useState(emailLinkReady ? 'email' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() =>
    emailLinkReady ? window.localStorage.getItem('emailForSignIn') || '' : '',
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailLinkActive] = useState(emailLinkReady);

  const configError = isFirebaseConfigured
    ? ''
    : authErrorMessages['app/firebase-config-missing'];

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearMessages();
  };

  const resolveAuthError = useCallback(
    (authError) =>
      !navigator.onLine
        ? "You're offline. Check your internet connection and try again."
        : authErrorMessages[authError.code] ||
          'Something went wrong. Please try again.',
    [],
  );

  useEffect(() => {
    if (!emailLinkReady) return;

    let isActive = true;
    const storedEmail = window.localStorage.getItem('emailForSignIn');

    completePasswordlessSignIn(storedEmail)
      .then((user) => {
        if (isActive && user) onLoginSuccess?.(user);
      })
      .catch((authError) => {
        if (isActive) setError(resolveAuthError(authError));
      });

    return () => {
      isActive = false;
    };
  }, [emailLinkReady, onLoginSuccess, resolveAuthError]);

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
      setError(resolveAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password, name);
      onLoginSuccess?.(user);
    } catch (authError) {
      setError(resolveAuthError(authError));
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
      setError(resolveAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLink = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (emailLinkActive) {
        const user = await completePasswordlessSignIn(email);
        if (user) onLoginSuccess?.(user);
      } else {
        await sendPasswordlessSignInLink(email);
        setNotice('Check your email for a secure sign-in link.');
      }
    } catch (authError) {
      setError(resolveAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';
  const isEmail = mode === 'email';
  const title = isSignup
    ? 'Create an account'
    : isReset
      ? 'Forgot your password?'
      : isEmail
        ? 'Sign in with an email link'
        : 'Welcome Back!';

  return (
    <main className={`login-page${isReset ? ' reset-page' : ''}${isSignup ? ' signup-page' : ''}${isEmail ? ' email-page' : ''}`}>
      <section className="login-card" aria-label={isSignup ? 'Sign up' : isReset ? 'Reset password' : 'Sign in'}>
        <div className="login-logo">LOGO</div>
        <h1 className={isReset || isSignup || isEmail ? 'form-title' : ''}>{title}</h1>

        {isSignup && (
          <p className="reset-description">
            Create your account to start tracking attendance.
          </p>
        )}

        {isEmail && (
          <p className="reset-description">
            {emailLinkActive
              ? 'Confirm your email address to finish signing in.'
              : 'We will email you a secure link. No password needed.'}
          </p>
        )}

        {isReset && (
          <p className="reset-description">
            Enter your email address and we’ll send you a link to reset your password.
          </p>
        )}

        {isSignup ? (
          <form onSubmit={handleSignup} autoComplete="on" noValidate>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="signup-password"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                name="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <FormMessage error={configError || error} notice={notice} />
            <button className="login-button" type="submit" disabled={loading || !isFirebaseConfigured}>
              {loading ? 'Creating account...' : 'Create Account'}
              {loading && <span className="loading-indicator" />}
            </button>
          </form>
        ) : isEmail ? (
          <form onSubmit={handleEmailLink} autoComplete="on" noValidate>
            <div className="form-group">
              <label htmlFor="email-link-email">Email Address</label>
              <input
                id="email-link-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <FormMessage error={configError || error} notice={notice} />
            <button className="login-button" type="submit" disabled={loading || !isFirebaseConfigured}>
              {loading
                ? 'Please wait...'
                : emailLinkActive
                  ? 'Complete Sign In'
                  : 'Send Sign-In Link'}
            </button>
          </form>
        ) : isReset ? (
          <form onSubmit={handlePasswordReset} autoComplete="on" noValidate>
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                name="email"
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
        ) : (
          <form onSubmit={handleLogin} autoComplete="on" noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="username"
                type="email"
                autoComplete="username"
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
                  name="password"
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
              <button className="forgot-link" type="button" onClick={() => switchMode('reset')}>
                Forgot password?
              </button>
            </div>
            <button className="login-button" type="submit" disabled={loading || !isFirebaseConfigured}>
              {loading ? 'Logging in...' : 'Login'}
              {loading && <span className="loading-indicator" />}
            </button>
          </form>
        )}

        {isSignup ? (
          <button className="back-to-login" type="button" onClick={() => switchMode('login')}>
            ← <span>Back to login</span>
          </button>
        ) : (
          <div className="auth-mode-switch">
            {!isEmail && (
              <button type="button" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
                {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            )}
            {!isEmail && (
              <button type="button" onClick={() => switchMode('email')}>
                Sign in with an email link
              </button>
            )}
            {isEmail && (
              <button type="button" onClick={() => switchMode('login')}>
                ← <span>Back to login</span>
              </button>
            )}
          </div>
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
