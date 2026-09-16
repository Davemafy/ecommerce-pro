import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Info } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog, useToast } from '../../components/ui/feedback';
import { useStore } from '../../data/store';

const tabs = ['general','team','payments','notifications','security'] as const;
type SettingsSection = typeof tabs[number];

const labels: Record<SettingsSection,string> = {
  general:'General',
  team:'Team',
  payments:'Payments',
  notifications:'Notifications',
  security:'Security',
};

const sectionCopy: Record<Exclude<SettingsSection,'general'>,string> = {
  team:'Set the default access level for new teammates and prepare invitations.',
  payments:'Manage payout timing and where billing notices are delivered.',
  notifications:'Choose which store events should reach administrators.',
  security:'Control the safeguards applied to administrator sessions.',
};

export function SettingsPage(){
  const {section}=useParams();
  const navigate=useNavigate();
  const {data,updateSettings}=useStore();
  const toast=useToast();
  const rawSection=section||'general';
  const isValid=tabs.includes(rawSection as SettingsSection);
  const active=(isValid?rawSection:'general') as SettingsSection;
  const [form,setForm]=useState<any>(()=>({...data.settings[active]}));
  const [deleteOpen,setDeleteOpen]=useState(false);
  const [logoPreview,setLogoPreview]=useState<string|null>(null);
  const logoInputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>setForm({...data.settings[active]}),[active,data.settings]);
  useEffect(()=>()=>{ if(logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview); },[logoPreview]);

  if(!isValid) return <Navigate to="/settings/general" replace/>;

  const save=()=>{ updateSettings(active,form); toast(`${labels[active]} settings saved`); };
  const reset=()=>{ setForm({...data.settings[active]}); if(active==='general') setLogoPreview(null); toast('Changes discarded'); };
  const chooseLogo=(file?:File)=>{
    if(!file) return;
    if(!file.type.startsWith('image/')){toast('Choose an image file');return;}
    if(file.size>5*1024*1024){toast('Choose an image smaller than 5 MB');return;}
    setLogoPreview(URL.createObjectURL(file));
    setForm((value:any)=>({...value,logoName:file.name}));
  };

  return <main className="figma-page settings-figma">
    <div className="tabs" role="tablist" aria-label="Settings sections">
      {tabs.map(t=><button key={t} role="tab" aria-selected={active===t} className={active===t?'active':''} onClick={()=>navigate(`/settings/${t}`)}>{labels[t]}</button>)}
    </div>

    {active==='general'?<>
      <div className="settings-general-grid">
        <div className="settings-main">
          <section className="card settings-section">
            <h2>Store Details</h2>
            <label>Store Name<input value={form.storeName||''} onChange={e=>setForm((x:any)=>({...x,storeName:e.target.value}))}/></label>
            <label>Store Logo</label>
            <div className="logo-setting">
              <div className={`logo-placeholder${logoPreview?' has-preview':''}`}>{logoPreview?<img src={logoPreview} alt="Store logo preview"/>:<ImageIcon aria-hidden="true"/>}</div>
              <div>
                <div className="logo-actions">
                  <button onClick={()=>logoInputRef.current?.click()}>Change</button>
                  <button className="danger-link" onClick={()=>{setLogoPreview(null);setForm((x:any)=>({...x,logoName:''}))}}>Remove</button>
                </div>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" hidden onChange={e=>chooseLogo(e.target.files?.[0])}/>
                <p>SVG, PNG, JPG or GIF (max. 5 MB)</p>
              </div>
            </div>
          </section>

          <section className="card settings-section">
            <h2>Regional Settings</h2>
            <div className="regional-grid">
              <label>Default Currency<select value={form.currency||'USD'} onChange={e=>setForm((x:any)=>({...x,currency:e.target.value}))}><option value="USD">USD ($) - US Dollar</option><option value="NGN">NGN (₦) - Nigerian Naira</option><option value="GBP">GBP (£) - British Pound</option><option value="EUR">EUR (€) - Euro</option></select></label>
              <label>Store Timezone<select value={form.timezone||'Pacific Time (PT) - US & Canada'} onChange={e=>setForm((x:any)=>({...x,timezone:e.target.value}))}><option>Pacific Time (PT) - US & Canada</option><option>West Africa Time (WAT) - UTC+1</option><option>Greenwich Mean Time (GMT)</option><option>Eastern Time (ET) - US & Canada</option></select></label>
            </div>
          </section>

          <div className="settings-actions"><button onClick={reset}>Cancel</button><button className="primary" onClick={save}>Save Changes</button></div>
        </div>

        <aside className="card settings-help">
          <h3><Info aria-hidden="true"/>About General Settings</h3>
          <p>These settings define your store's primary identity and how it handles regional data. The store name appears on receipts and customer emails.</p>
          <small>Changes are reflected in this frontend preview immediately.</small>
        </aside>
      </div>

      <section className="settings-danger-zone">
        <h2>Danger Zone</h2>
        <div className="settings-danger-card">
          <div><b>Delete Store</b><p>Once you delete a store, there is no going back. Please be certain.</p></div>
          <button className="danger-button" onClick={()=>setDeleteOpen(true)}>Delete Store</button>
        </div>
      </section>
    </>:<section className="card settings-panel">
      <header><h2>{labels[active]}</h2><p>{sectionCopy[active]}</p></header>
      <div className="settings-panel-body"><SettingsFields section={active} form={form} setForm={setForm}/></div>
      <footer><button onClick={reset}>Cancel</button><button className="primary" onClick={save}>Save Changes</button></footer>
    </section>}

    <ConfirmDialog open={deleteOpen} title="Delete this store?" description="This is a protected destructive action. The frontend preview will not remove store data." confirmLabel="Confirm deletion" danger onClose={()=>setDeleteOpen(false)} onConfirm={()=>{setDeleteOpen(false);toast('Delete confirmation captured safely')}}/>
  </main>;
}

function SettingsFields({section,form,setForm}:{section:Exclude<SettingsSection,'general'>;form:any;setForm:any}){
  const set=(key:string,value:any)=>setForm((current:any)=>({...current,[key]:value}));
  if(section==='team') return <div className="settings-field-stack"><label>Invite email<input type="email" value={form.inviteEmail||''} onChange={e=>set('inviteEmail',e.target.value)} placeholder="name@company.com"/></label><label>Default role<select value={form.defaultRole||'Staff'} onChange={e=>set('defaultRole',e.target.value)}><option>Staff</option><option>Manager</option><option>Administrator</option></select></label></div>;
  if(section==='payments') return <div className="settings-field-stack"><label>Payout schedule<select value={form.payoutSchedule||'Weekly'} onChange={e=>set('payoutSchedule',e.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label><label>Billing email<input type="email" value={form.invoiceEmail||''} onChange={e=>set('invoiceEmail',e.target.value)}/></label></div>;
  if(section==='notifications') return <div className="settings-toggle-list">{[['orders','Order updates','New orders and fulfillment changes'],['inventory','Low stock alerts','Warnings when products approach reorder levels'],['reports','Weekly performance report','A weekly summary of store performance']].map(([key,label,description])=><label className="toggle-row" key={key}><span><b>{label}</b><small>{description}</small></span><input type="checkbox" checked={Boolean(form[key])} onChange={e=>set(key,e.target.checked)}/></label>)}</div>;
  return <div className="settings-toggle-list"><label className="toggle-row"><span><b>Two-factor authentication</b><small>Require an additional verification step for administrator sign-in.</small></span><input type="checkbox" checked={Boolean(form.twoFactor)} onChange={e=>set('twoFactor',e.target.checked)}/></label><label className="toggle-row"><span><b>New session alerts</b><small>Notify administrators when a new browser session is created.</small></span><input type="checkbox" checked={Boolean(form.sessionAlerts)} onChange={e=>set('sessionAlerts',e.target.checked)}/></label></div>;
}
