import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/ui/feedback';
import { PageHeader } from '../../components/ui/page-header';
import { useStore } from '../../data/store';

const tabs=['general','team','payments','notifications','security'];
const labels={general:'General',team:'Team',payments:'Payments',notifications:'Notifications',security:'Security'};

export function SettingsPage(){
 const {section}=useParams(),navigate=useNavigate(),{data,updateSettings}=useStore(),toast=useToast();
 const active=section||'general'; if(!tabs.includes(active)) return <Navigate to="/settings/general" replace/>;
 const [form,setForm]=useState(data.settings[active]);
 useEffect(()=>setForm(data.settings[active]),[active,data.settings]);
 const save=()=>{updateSettings(active,form);toast('Settings saved')};
 return <main className="figma-page settings-figma"><div className="tabs">{tabs.map(t=><button key={t} className={active===t?'active':''} onClick={()=>navigate(`/settings/${t}`)}>{labels[t]}</button>)}</div>
 {active==='general'?<><div className="settings-general-grid"><div className="settings-main"><section className="card settings-section"><h2>Store Details</h2><label>Store Name<input value={form.storeName||''} onChange={e=>setForm(x=>({...x,storeName:e.target.value}))}/></label><label>Store Logo</label><div className="logo-setting"><div className="logo-placeholder">▧</div><div><div><button>Change</button><button className="danger-link">Remove</button></div><p>SVG, PNG, JPG or GIF (max. 800×400px)</p></div></div></section><section className="card settings-section"><h2>Regional Settings</h2><div className="regional-grid"><label>Default Currency<select value={form.currency||'USD'} onChange={e=>setForm(x=>({...x,currency:e.target.value}))}><option value="USD">USD ($) - US Dollar</option><option value="NGN">NGN (₦) - Nigerian Naira</option></select></label><label>Store Timezone<select><option>Pacific Time (PT) - US & Canada</option></select></label></div></section><div className="settings-actions"><button>Cancel</button><button className="primary" onClick={save}>Save Changes</button></div></div><aside className="card settings-help"><h3>ⓘ About General Settings</h3><p>These settings define your store's primary identity and how it handles regional data. The store name appears on receipts and customer emails.</p><a>Read documentation ↗</a></aside></div><section className="danger-zone"><h2>Danger Zone</h2><div><span><b>Delete Store</b><p>Once you delete a store, there is no going back. Please be certain.</p></span><button className="danger-button">Delete Store</button></div></section></>:<section className="card form settings-real"><h2>{labels[active]}</h2><SettingsFields section={active} form={form} setForm={setForm}/><button className="primary" onClick={save}>Save Changes</button></section>}
 </main>;
}
function SettingsFields({section,form,setForm}){const set=(k,v)=>setForm(x=>({...x,[k]:v}));
 if(section==='general') return <><label>Store Name<input value={form.storeName||''} onChange={e=>set('storeName',e.target.value)}/></label><label>Default Currency<select value={form.currency||'USD'} onChange={e=>set('currency',e.target.value)}><option value="USD">USD ($) - US Dollar</option><option value="NGN">NGN (₦) - Nigerian Naira</option></select></label></>;
 if(section==='team') return <><p>Manage team access defaults and invitations.</p><label>Invite email<input type="email" value={form.inviteEmail||''} onChange={e=>set('inviteEmail',e.target.value)} placeholder="name@company.com"/></label><label>Default role<select value={form.defaultRole||'Staff'} onChange={e=>set('defaultRole',e.target.value)}><option>Staff</option><option>Manager</option><option>Administrator</option></select></label></>;
 if(section==='payments') return <><p>Choose how store payouts and billing notices are handled.</p><label>Payout schedule<select value={form.payoutSchedule||'Weekly'} onChange={e=>set('payoutSchedule',e.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label><label>Billing email<input type="email" value={form.invoiceEmail||''} onChange={e=>set('invoiceEmail',e.target.value)}/></label></>;
 if(section==='notifications') return <><p>Choose the store activity you want to be notified about.</p>{[['orders','Order updates'],['inventory','Low stock alerts'],['reports','Weekly performance report']].map(([k,l])=><label className="toggle-row" key={k}><span>{l}</span><input type="checkbox" checked={Boolean(form[k])} onChange={e=>set(k,e.target.checked)}/></label>)}</>;
 return <><p>Protect administrator access to CommercePro.</p><label className="toggle-row"><span>Two-factor authentication</span><input type="checkbox" checked={Boolean(form.twoFactor)} onChange={e=>set('twoFactor',e.target.checked)}/></label><label className="toggle-row"><span>New session alerts</span><input type="checkbox" checked={Boolean(form.sessionAlerts)} onChange={e=>set('sessionAlerts',e.target.checked)}/></label></>;
}
