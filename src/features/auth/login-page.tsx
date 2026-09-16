import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage(){
  const navigate=useNavigate();
  const [showPassword,setShowPassword]=useState(false);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const submit=(event:FormEvent)=>{event.preventDefault(); if(email.trim()&&password) navigate('/');};
  return <main className="login-page"><section className="login-card"><div className="login-brand"><span><Store/></span><div><strong>CommercePro</strong><small>Enterprise Admin</small></div></div><div className="login-copy"><h1>Welcome back</h1><p>Sign in to manage your store.</p></div><form onSubmit={submit} className="login-form"><label>Email address<div className="login-field"><Mail/><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@commercepro.com" required/></div></label><label>Password<div className="login-field"><LockKeyhole/><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" className="login-eye" onClick={()=>setShowPassword((value)=>!value)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label><div className="login-options"><label><input type="checkbox"/> Remember me</label><button type="button" className="login-link">Forgot password?</button></div><button className="primary login-submit" type="submit">Sign in</button></form><p className="login-help">Need help? Contact your administrator.</p></section></main>;
}
