import { FormEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, LockKeyhole, Mail, Store, UserRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { authService, unwrapData } from '../../api/services';
import { isAuthenticated, login } from './auth-session';

export function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['super-admin-status'],
    queryFn: authService.superAdminStatus,
    staleTime: 0,
    retry: 1,
  });
  const status = statusQuery.data ? unwrapData<{ exists?: boolean }>(statusQuery.data) : null;

  if (isAuthenticated()) return <Navigate to="/" replace />;
  if (!created && statusQuery.isSuccess && status?.exists === true) return <Navigate to="/login" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter the account name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await authService.createSuperAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setCreated(true);
      await queryClient.invalidateQueries({ queryKey: ['super-admin-status'] });
      await login(email.trim().toLowerCase(), password, true);
      navigate('/', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['super-admin-status'] });
        setError('The owner account has already been created. Sign in instead.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not create the owner account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card setup-card">
        <div className="login-brand">
          <span><Store /></span>
          <div><strong>CommercePro</strong><small>Enterprise Admin</small></div>
        </div>
        <div className="login-copy">
          <h1>Set up the store owner</h1>
          <p>Create the one-time super admin account for this store.</p>
        </div>

        {statusQuery.isLoading ? (
          <p className="setup-note">Checking store setup…</p>
        ) : statusQuery.isError ? (
          <div className="setup-status-error">
            <p>Could not confirm the store setup status.</p>
            <button type="button" onClick={() => statusQuery.refetch()}>Try again</button>
          </div>
        ) : (
          <form onSubmit={submit} className="login-form">
            <label>
              Name
              <div className="login-field">
                <UserRound />
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required autoFocus />
              </div>
            </label>
            <label>
              Email address
              <div className="login-field">
                <Mail />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
            </label>
            <label>
              Password
              <div className="login-field">
                <LockKeyhole />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
                <button type="button" className="login-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button>
              </div>
            </label>
            <label>
              Confirm password
              <div className="login-field">
                <LockKeyhole />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
              </div>
            </label>
            {error && <p className="form-error login-error">{error}</p>}
            <button className="primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create owner account'}</button>
            <p className="setup-note">This setup closes after the first super admin is created.</p>
          </form>
        )}
      </section>
    </main>
  );
}
