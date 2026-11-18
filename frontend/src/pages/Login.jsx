import { useCallback, useEffect, useRef, useState } from 'react';
import { isFirebaseConfigured } from '../services/firebase';
import {
  completePasswordlessSignIn,
  isPasswordlessSignInLink,
  loginUser,
  registerUser,
  resetPassword,
  sendPasswordlessSignInLink,
} from '../services/authService';
import logo from '../assets/logo.png';
import '../styles/Login.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authErrorMessages = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/email-already-in-use': 'An account already exists for this email.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/expired-action-code':
    'This sign-in link has expired. Request a new one.',
  'auth/invalid-action-code':
    'This sign-in link is invalid. Request a new one.',
  'auth/email-required':
    'Enter the email address that received the sign-in link.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled for this Firebase project.',
  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
  'auth/unauthorized-domain':
    'This domain is not authorized in Firebase Authentication.',
  'auth/internal-error': 'Something went wrong. Please try again.',
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
    emailLinkReady ? window.localStorage.getItem('emailForSignIn') || '' : ''
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailLinkActive] = useState(emailLinkReady);
  const busyRef = useRef(false);

  const configError = isFirebaseConfigured
    ? ''
    : authErrorMessages['app/firebase-config-missing'];

  const clearMessages = () => {
    setError('');
    setNotice('');
    setFieldErrors({});
  };

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email address is required.';
    if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.';
    return '';
  };

  const validateRequired = (value, label) =>
    value.trim() ? '' : `${label} is required.`;

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
    []
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
    if (busyRef.current) return;
    clearMessages();

    const errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    busyRef.current = true;
    setLoading(true);
    try {
      const user = await loginUser(email, password, rememberMe);
      onLoginSuccess?.(user);
    } catch (authError) {
      setError(resolveAuthError(authError));
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    clearMessages();

    const errors = {};
    const nameError = validateRequired(name, 'Full name');
    if (nameError) errors.name = nameError;
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = 'Password is required.';
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    }
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    busyRef.current = true;
    setLoading(true);
    try {
      const user = await registerUser(email, password, name);
      onLoginSuccess?.(user);
    } catch (authError) {
      setError(resolveAuthError(authError));
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    clearMessages();

    const errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    busyRef.current = true;
    setLoading(true);
    try {
      await resetPassword(email);
      setNotice(
        'If an account exists for this email, a reset link is on its way.'
      );
    } catch (authError) {
      setError(resolveAuthError(authError));
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const handleEmailLink = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    clearMessages();

    const errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    busyRef.current = true;
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
      busyRef.current = false;
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';
  const isEmail = mode === 'email';

  const cardCopy = {
    signup: {
      eyebrow: 'GET STARTED',
      title: 'Create an account',
      description: 'Create your account to start tracking attendance.',
    },
    reset: {
      eyebrow: 'ACCOUNT RECOVERY',
      title: 'Forgot your password?',
      description:
        'Enter your email address and we’ll send you a link to reset your password.',
    },
    email: {
      eyebrow: 'SECURE SIGN IN',
      title: 'Sign in with an email link',
      description: emailLinkActive
        ? 'Confirm your email address to finish signing in.'
        : 'We will email you a secure link. No password needed.',
    },
    login: {
      eyebrow: 'WELCOME BACK',
      title: 'Sign in to your account',
      description: 'Enter your details below to continue.',
    },
  }[mode];

  return (
    <main
      className={`login-page${isReset ? ' reset-page' : ''}${isSignup ? ' signup-page' : ''}${isEmail ? ' email-page' : ''}`}
    >
      <header className="portal-header">
        <div className="portal-brand">
          <span>LC</span> Attends
        </div>
        <div className="portal-status">
          <span className="portal-status-dot" aria-hidden="true" />
          Staff Attendance Portal
        </div>
      </header>

      <div className="login-layout">
        <section className="welcome-section">
          <img className="login-logo" src={logo} alt="Life Choices" />
          <h1 className="welcome-heading">
            <span>Welcome to</span>
            <strong>LC Attends.</strong>
          </h1>
          <p className="welcome-copy">
            Your attendance, made simpler. Sign in to manage your working day
            and stay connected.
          </p>
          <span className="welcome-divider" aria-hidden="true" />
          <p className="welcome-tagline">
            A smarter way to manage staff attendance.
          </p>
        </section>

        <section
          className="login-card"
          aria-label={
            isSignup ? 'Sign up' : isReset ? 'Reset password' : 'Sign in'
          }
        >
          <span className="card-accent" aria-hidden="true" />
          <p className="card-eyebrow">{cardCopy.eyebrow}</p>
          <h2 className="card-title">{cardCopy.title}</h2>
          <p className="card-description">{cardCopy.description}</p>

          {isSignup ? (
            <form
              onSubmit={handleSignup}
              autoComplete="on"
              noValidate
              aria-busy={loading}
            >
              <div className="form-group">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  onChange={(event) => setName(event.target.value)}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldError message={fieldErrors.email} />
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
                    aria-invalid={Boolean(fieldErrors.password)}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm password</label>
                <input
                  id="signup-confirm"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <FieldError message={fieldErrors.confirmPassword} />
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <button
                className="login-button"
                type="submit"
                disabled={loading || !isFirebaseConfigured}
              >
                <span>
                  {loading ? 'Creating account...' : 'Create account'}
                </span>
                {loading ? (
                  <span className="loading-indicator" />
                ) : (
                  <span className="button-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </form>
          ) : isEmail ? (
            <form
              onSubmit={handleEmailLink}
              autoComplete="on"
              noValidate
              aria-busy={loading}
            >
              <div className="form-group">
                <label htmlFor="email-link-email">Email address</label>
                <input
                  id="email-link-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <button
                className="login-button"
                type="submit"
                disabled={loading || !isFirebaseConfigured}
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : emailLinkActive
                      ? 'Complete sign in'
                      : 'Send sign-in link'}
                </span>
                {loading ? (
                  <span className="loading-indicator" />
                ) : (
                  <span className="button-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </form>
          ) : isReset ? (
            <form
              onSubmit={handlePasswordReset}
              autoComplete="on"
              noValidate
              aria-busy={loading}
            >
              <div className="form-group">
                <label htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <button
                className="login-button"
                type="submit"
                disabled={loading || !isFirebaseConfigured}
              >
                <span>{loading ? 'Sending...' : 'Send email'}</span>
                {loading ? (
                  <span className="loading-indicator" />
                ) : (
                  <span className="button-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleLogin}
              autoComplete="on"
              noValidate
              aria-busy={loading}
            >
              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  name="username"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldError message={fieldErrors.email} />
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
                    aria-invalid={Boolean(fieldErrors.password)}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
              </div>
              <FormMessage error={configError || error} notice={notice} />
              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  className="forgot-link"
                  type="button"
                  disabled={loading}
                  onClick={() => switchMode('reset')}
                >
                  Forgot password?
                </button>
              </div>
              <button
                className="login-button"
                type="submit"
                disabled={loading || !isFirebaseConfigured}
              >
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                {loading ? (
                  <span className="loading-indicator" />
                ) : (
                  <span className="button-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </form>
          )}

          <div className="support-block">
            <p>Need help accessing your account?</p>
            <a href="mailto:support@daymark.app">Contact support</a>
          </div>

          <div className="secondary-actions">
            {!isSignup && !isEmail && (
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode('signup')}
              >
                Create account
              </button>
            )}
            {!isEmail && (
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode('email')}
              >
                Sign in with an email link
              </button>
            )}
            {mode !== 'login' && (
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode('login')}
              >
                ← <span>Back to sign in</span>
              </button>
            )}
          </div>
        </section>
      </div>

      <footer className="portal-footer">
        <span>ATTENDS.</span>
        <span>STAFF ATTENDANCE MANAGEMENT SYSTEM</span>
      </footer>
    </main>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  );
}

function FormMessage({ error, notice }) {
  if (error)
    return (
      <div className="login-error" role="alert">
        {error}
      </div>
    );
  if (notice)
    return (
      <div className="login-notice" role="status">
        {notice}
      </div>
    );
  return null;
}

export default Login;
