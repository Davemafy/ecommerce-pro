import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Info, Plus, Trash2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { authService, unwrapList } from '../../api/services';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';
import { useCurrentAdmin } from '../auth/use-current-admin';

const tabs = ['general', 'team', 'payments', 'notifications', 'security'] as const;
type SettingsSection = typeof tabs[number];
const labels: Record<SettingsSection, string> = { general: 'General', team: 'Team', payments: 'Payments', notifications: 'Notifications', security: 'Security' };
const notificationEvents = [
  ['new_order', 'New orders', 'Notify administrators when a new order is created.'],
  ['low_stock', 'Low stock', 'Warn when products approach their stock threshold.'],
  ['payment_failed', 'Payment failures', 'Surface failed payment attempts.'],
  ['refund_requested', 'Refund requests', 'Notify when a refund requires attention.'],
  ['weekly_summary', 'Weekly summary', 'Send the weekly store performance summary.'],
] as const;

function gatewayKey(gateway: any, index: number) {
  return gateway.id || gateway._id || gateway.key || gateway.slug || gateway.name || gateway.provider || `gateway-${index}`;
}

function gatewayName(gateway: any, index: number) {
  const value = gateway.name || gateway.provider || gateway.key || gateway.slug || `Gateway ${index + 1}`;
  return String(value).replaceAll('_', ' ');
}

export function SettingsPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, updateSettings, uploadStoreLogo, isSaving, reload } = useStore();
  const { data: currentAdmin } = useCurrentAdmin();
  const toast = useToast();
  const rawSection = section || 'general';
  const isValid = tabs.includes(rawSection as SettingsSection);
  const active = (isValid ? rawSection : 'general') as SettingsSection;
  const [form, setForm] = useState<any>(() => ({ ...data.settings[active] }));
  const [logoPreview, setLogoPreview] = useState<string | null>(() => data.settings.general.logoData || null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const next: any = { ...data.settings[active] };
    setForm(next);
    if (active === 'general') {
      setLogoPreview(data.settings.general.logoData || null);
      setPendingLogo(null);
    }
  }, [active, data.settings]);

  if (!isValid) return <Navigate to="/settings/general" replace />;

  const save = async () => {
    try {
      await updateSettings(active, form);
      if (active === 'general' && pendingLogo) await uploadStoreLogo(pendingLogo);
      setPendingLogo(null);
      toast(`${labels[active]} settings saved`);
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Could not save settings', 'error');
    }
  };

  const reset = () => {
    const saved: any = { ...data.settings[active] };
    setForm(saved);
    if (active === 'general') {
      setLogoPreview(data.settings.general.logoData || null);
      setPendingLogo(null);
    }
    toast('Changes discarded');
  };

  const chooseLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Choose an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Choose an image smaller than 5 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      setLogoPreview(value || null);
      setPendingLogo(file);
    };
    reader.onerror = () => toast('Could not read that image', 'error');
    reader.readAsDataURL(file);
  };

  return <main className="figma-page settings-figma">
    <div className="tabs" role="tablist" aria-label="Settings sections">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={active === tab} className={active === tab ? 'active' : ''} onClick={() => navigate(`/settings/${tab}`)}>{labels[tab]}</button>)}</div>

    {active === 'general' && <>
      <div className="settings-general-grid">
        <div className="settings-main">
          <section className="card settings-section">
            <h2>Store Details</h2>
            <label>Store Name<input value={form.storeName || ''} onChange={(event) => setForm((current: any) => ({ ...current, storeName: event.target.value }))}/></label>
            <div className="regional-grid">
              <label>Contact Email<input type="email" value={form.contactEmail || ''} onChange={(event) => setForm((current: any) => ({ ...current, contactEmail: event.target.value }))} placeholder="support@store.com"/></label>
              <label>Contact Phone<input value={form.contactPhone || ''} onChange={(event) => setForm((current: any) => ({ ...current, contactPhone: event.target.value }))} placeholder="+1 555 0100"/></label>
            </div>
            <label>Store Logo</label>
            <div className="logo-setting"><div className={`logo-placeholder${logoPreview ? ' has-preview' : ''}`}>{logoPreview ? <img src={logoPreview} alt="Store logo preview"/> : <ImageIcon aria-hidden="true"/>}</div><div><div className="logo-actions"><button onClick={() => logoInputRef.current?.click()}>Change</button></div><input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" hidden onChange={(event) => chooseLogo(event.target.files?.[0])}/><p>{pendingLogo?.name || 'SVG, PNG, JPG or GIF (max. 5 MB)'}</p></div></div>
          </section>
          <section className="card settings-section"><h2>Regional Settings</h2><div className="regional-grid"><label>Default Currency<select value={form.currency || 'USD'} onChange={(event) => setForm((current: any) => ({ ...current, currency: event.target.value }))}><option value="USD">USD ($) - US Dollar</option><option value="NGN">NGN (₦) - Nigerian Naira</option><option value="GBP">GBP (£) - British Pound</option><option value="EUR">EUR (€) - Euro</option></select></label><label>Store Timezone<input value={form.timezone || ''} onChange={(event) => setForm((current: any) => ({ ...current, timezone: event.target.value }))} placeholder="UTC"/></label></div></section>
          <div className="settings-actions"><button onClick={reset}>Cancel</button><button className="primary" disabled={isSaving} onClick={save}>{isSaving ? 'Saving…' : 'Save Changes'}</button></div>
        </div>
        <aside className="card settings-help"><h3><Info aria-hidden="true"/>About General Settings</h3><p>These values are stored by the ecommerce admin API and are used as the store's primary profile.</p><small>Logo uploads are sent directly to the store logo endpoint.</small></aside>
      </div>
      <section className="settings-danger-zone"><h2>Danger Zone</h2><div className="settings-danger-card"><div><b>Delete Store</b><p>Store deletion is not exposed by the current backend API.</p></div><button className="danger-button" disabled title="No delete-store endpoint is available">Delete Store</button></div></section>
    </>}

    {active === 'team' && <TeamSettings/>}
    {active === 'payments' && <PaymentsSettings form={form} setForm={setForm} onSave={save} onReset={reset} saving={isSaving}/>}
    {active === 'notifications' && <NotificationSettings form={form} reload={reload}/>}
    {active === 'security' && <SecuritySettings currentAdmin={currentAdmin}/>}
  </main>;
}

function TeamSettings() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Administrator' });
  const [error, setError] = useState('');

  const teamQuery = useQuery({ queryKey: ['admin-team'], queryFn: authService.team, staleTime: 30_000, retry: false });
  const members = unwrapList<any>(teamQuery.data, ['admins', 'team', 'members', 'users']);

  const createMutation = useMutation({
    mutationFn: () => authService.createTeamMember({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      isSuperAdmin: form.role === 'Super Admin',
      isAdmin: true,
      permissions: [],
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      setCreating(false);
      setForm({ name: '', email: '', password: '', role: 'Administrator' });
      toast('Team member created');
    },
    onError: (cause: any) => setError(cause?.message || 'Could not create team member.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authService.deleteTeamMember(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast('Team member removed');
    },
    onError: (cause: any) => toast(cause?.message || 'Could not remove team member', 'error'),
  });

  return <section className="card settings-panel"><header><div><h2>Team</h2><p>Manage administrator accounts backed by the admin team API.</p></div><button className="primary" onClick={() => setCreating(true)}><Plus/>Add administrator</button></header><div className="settings-panel-body">
    {teamQuery.isLoading && <div className="table-empty-state"><strong>Loading team…</strong></div>}
    {!teamQuery.isLoading && !members.length && <div className="table-empty-state"><strong>No team members returned.</strong><span>Add an administrator or confirm your account has permission to view the team.</span></div>}
    {!!members.length && <div className="settings-team-list">{members.map((member: any, index: number) => <div className="toggle-row" key={member._id || member.id || member.email || index}><span><b>{member.name || 'Administrator'}</b><small>{member.email || ''} · {member.isSuperAdmin ? 'Super Admin' : 'Administrator'}</small></span><button className="bare" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(member._id || member.id)} aria-label={`Remove ${member.name || 'administrator'}`}><Trash2/></button></div>)}</div>}
  </div>
  <Modal open={creating} title="Add administrator" description="Create an account through the admin team endpoint." onClose={() => { setCreating(false); setError(''); }} footer={<><button onClick={() => setCreating(false)}>Cancel</button><button className="primary" disabled={createMutation.isPending || !form.name.trim() || !form.email.includes('@') || form.password.length < 6} onClick={() => { setError(''); createMutation.mutate(); }}>{createMutation.isPending ? 'Creating…' : 'Create administrator'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'password', label: 'Temporary password', type: 'password', required: true }]}/><label>Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}><option>Administrator</option><option>Super Admin</option></select></label>{error && <p className="form-error">{error}</p>}</Modal>
  </section>;
}

function PaymentsSettings({ form, setForm, onSave, onReset, saving }: { form: any; setForm: any; onSave: () => void; onReset: () => void; saving: boolean }) {
  const gateways = Array.isArray(form.gateways) ? form.gateways : [];
  const toggle = (index: number, enabled: boolean) => setForm((current: any) => ({
    ...current,
    gateways: current.gateways.map((gateway: any, gatewayIndex: number) => gatewayIndex === index ? { ...gateway, enabled } : gateway),
  }));

  return <section className="card settings-panel"><header><h2>Payments</h2><p>Manage payment gateways returned by the backend.</p></header><div className="settings-panel-body">
    {!gateways.length && <div className="table-empty-state"><strong>No payment gateways configured.</strong><span>The API did not return any gateway records.</span></div>}
    <div className="settings-toggle-list">{gateways.map((gateway: any, index: number) => <label className="toggle-row" key={gatewayKey(gateway, index)}><span><b>{gatewayName(gateway, index)}</b><small>{gateway.description || gateway.mode || 'Payment gateway'}</small></span><input type="checkbox" checked={Boolean(gateway.enabled ?? gateway.isEnabled)} onChange={(event) => toggle(index, event.target.checked)}/></label>)}</div>
  </div><footer><button onClick={onReset}>Cancel</button><button className="primary" disabled={saving || !gateways.length} onClick={onSave}>{saving ? 'Saving…' : 'Save Changes'}</button></footer></section>;
}

function NotificationSettings({ form, reload }: { form: any; reload: () => any }) {
  const toast = useToast();
  const preferences = Array.isArray(form.preferences) ? form.preferences : [];
  const mutation = useMutation({
    mutationFn: ({ eventType, enabled }: { eventType: string; enabled: boolean }) => authlessUpdateNotification(eventType, enabled, preferences),
    onSuccess: async () => { await reload(); toast('Notification preference updated'); },
    onError: (cause: any) => toast(cause?.message || 'Could not update notification preference', 'error'),
  });

  return <section className="card settings-panel"><header><h2>Notifications</h2><p>Control the store events that notify administrators.</p></header><div className="settings-panel-body"><div className="settings-toggle-list">{notificationEvents.map(([eventType, label, description]) => {
    const current = preferences.find((item: any) => item.eventType === eventType || item.type === eventType);
    const enabled = Boolean(current?.enabled);
    return <label className="toggle-row" key={eventType}><span><b>{label}</b><small>{description}</small></span><input type="checkbox" disabled={mutation.isPending} checked={enabled} onChange={(event) => mutation.mutate({ eventType, enabled: event.target.checked })}/></label>;
  })}</div></div></section>;
}

async function authlessUpdateNotification(eventType: string, enabled: boolean, preferences: any[]) {
  const { notificationService } = await import('../../api/services');
  const current = preferences.find((item: any) => item.eventType === eventType || item.type === eventType);
  return notificationService.updateEvent(
    eventType,
    current?.channels ? { enabled, channels: current.channels } : { enabled },
  );
}

function SecuritySettings({ currentAdmin }: { currentAdmin: any }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');

  const twoFactorMutation = useMutation({
    mutationFn: (enabled: boolean) => authService.setTwoFactor(enabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-admin'] });
      toast('Two-factor setting updated');
    },
    onError: (cause: any) => toast(cause?.message || 'Could not update two-factor authentication', 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setError('');
      toast('Password changed');
    },
    onError: (cause: any) => setError(cause?.message || 'Could not change password.'),
  });

  return <section className="card settings-panel"><header><h2>Security</h2><p>Manage administrator authentication and account protection.</p></header><div className="settings-panel-body">
    <div className="settings-toggle-list"><label className="toggle-row"><span><b>Two-factor authentication</b><small>Require the backend's additional verification step for sign-in.</small></span><input type="checkbox" disabled={twoFactorMutation.isPending} checked={Boolean(currentAdmin?.twoFactorEnabled)} onChange={(event) => twoFactorMutation.mutate(event.target.checked)}/></label></div>
    <div className="settings-field-stack settings-password-block"><h3>Change password</h3><FormFields values={passwordForm} onChange={(name, value) => { setError(''); setPasswordForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'currentPassword', label: 'Current password', type: 'password', required: true }, { name: 'newPassword', label: 'New password', type: 'password', required: true }]}/>{error && <p className="form-error">{error}</p>}<div className="settings-actions"><button className="primary" disabled={passwordMutation.isPending || passwordForm.currentPassword.length < 1 || passwordForm.newPassword.length < 6} onClick={() => passwordMutation.mutate()}>{passwordMutation.isPending ? 'Updating…' : 'Change Password'}</button></div></div>
  </div></section>;
}
