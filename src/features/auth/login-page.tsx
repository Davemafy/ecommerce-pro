import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Store } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, startSession } from './auth-session';

export function LoginPage(){
  const navigate=useNavigate();
  const location=useLocation();
  const [showPassword,setShowPassword]=useState(false);
  const [email,setEmail]=useState('admin@commercepro.com');
  const [password,setPassword]=useState('commercepro');
  const [remember,setRemember]=useState(true);
  const [error,setError]=useState('');

  if(isAuthenticated()) {
    const target=(location.state as {from?:string}|null)?.from||'/';
    navigate(target,{replace:true});
  }

  const submit=(event:FormEvent)=>{
    event.preventDefault();
    if(!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if(password.length<6) { setError('Password must be at least 6 characters.'); return; }
    startSession(remember);
    setError('');
    const target=(location.state as {from?:string}|null)?.from||'/';
    navigate(target,{replace:true});
  };

  return <main className="login-page"><section className="login-card"><div className="login-brand"><span><Store/></span><div><strong>CommercePro</strong><small>Enterprise Admin</small></div></div><div className="login-copy"><h1>Welcome back</h1><p>Sign in to manage your store.</p></div><form onSubmit={submit} className="login-form"><label>Email address<div className="login-field"><Mail/><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@commercepro.com" autoComplete="email" required/></div></label><label>Password<div className="login-field"><LockKeyhole/><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/><button type="button" className="login-eye" onClick={()=>setShowPassword((value)=>!value)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>{error&&<p className="form-error login-error">{error}</p>}<div className="login-options"><label><input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)}/> Remember me</label><button type="button" className="login-link" onClick={()=>setError('Use the demo credentials shown above to access this preview.')}>Forgot password?</button></div><button className="primary login-submit" type="submit">Sign in</button></form><div className="login-demo-note"><strong>Demo access</strong><span>admin@commercepro.com · commercepro</span></div><p className="login-help">Need help? Contact your administrator.</p></section></main>;
}
