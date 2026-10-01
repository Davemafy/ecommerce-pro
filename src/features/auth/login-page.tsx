import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Store } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { isAuthenticated, login } from './auth-session';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const target = (location.state as { from?: string } | null)?.from || '/';

  if (isAuthenticated()) return <Navigate to={target} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password, remember);
      navigate(target, { replace: true });
    } catch (cause) {
      const message =
        cause instanceof ApiError && cause.status === 401
          ? 'Email or password is incorrect.'
          : cause instanceof Error
            ? cause.message
            : 'Unable to sign in.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span><Store /></span>
          <div><strong>CommercePro</strong><small>Enterprise Admin</small></div>
        </div>
        <div className="login-copy">
          <h1>Welcome back</h1>
          <p>Sign in with your administrator account.</p>
        </div>
        <form onSubmit={submit} className="login-form">
          <label>
            Email address
            <div className="login-field">
              <Mail />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter admin email" autoComplete="email" required autoFocus />
            </div>
          </label>
          <label>
            Password
            <div className="login-field">
              <LockKeyhole />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
              <button type="button" className="login-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button>
            </div>
          </label>
          {error && <p className="form-error login-error">{error}</p>}
          <div className="login-options">
            <label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember this browser</label>
          </div>
          <button className="primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="login-help">Use the administrator credentials provided for this store.</p>
      </section>
    </main>
  );
}
