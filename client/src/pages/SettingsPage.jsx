import { useState } from 'react';
import { useApi, usePost } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import Modal, { FormField, Input, Select, Button } from '../components/Modal';
import { Building2, Tag, Cog, Bell, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [tab, setTab] = useState('departments');
  const [showModal, setShowModal] = useState(false);
  const { data: deptData, refetch: refetchDepts } = useApi('/settings/departments');
  const { data: catData, refetch: refetchCats } = useApi('/settings/categories');
  const { data: settingsData, refetch: refetchSettings } = useApi('/settings/app');
  const { data: notifData, refetch: refetchNotifs } = useApi('/settings/notifications');
  const { post, put, loading: saving } = usePost();

  const [form, setForm] = useState({});

  const departments = deptData?.data || [];
  const categories = catData?.data || [];
  const settings = settingsData?.data || {};
  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  const handleAdd = async () => {
    try {
      if (tab === 'departments') {
        await post('/settings/departments', form);
        refetchDepts();
      } else if (tab === 'categories') {
        await post('/settings/categories', form);
        refetchCats();
      }
      setShowModal(false);
      setForm({});
    } catch (e) { /* handled */ }
  };

  const handleToggleSetting = async (key, currentVal) => {
    try {
      await put('/settings/app', { [key]: !currentVal });
      refetchSettings();
    } catch (e) { alert(e.message); }
  };

  const handleMarkRead = async (id) => {
    try {
      await put(`/settings/notifications/${id}/read`);
      refetchNotifs();
    } catch (e) { /* handled */ }
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'app', label: 'App Settings', icon: Cog },
    { id: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Bell },
  ];

  const deptColumns = [
    { key: 'name', label: 'Department' },
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono text-eco-blue">{v}</span> },
    { key: 'headEmployee', label: 'Head', render: (v) => v?.name || '—' },
    { key: '_count', label: 'Employees', render: (v) => v?.employees || 0 },
    { key: 'status', label: 'Status' },
  ];

  const catColumns = [
    { key: 'name', label: 'Category' },
    { key: 'type', label: 'Type', render: (v) => (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${v === 'CSR_ACTIVITY' ? 'bg-eco-blue/10 text-eco-blue' : 'bg-eco-amber/10 text-eco-amber'}`}>
        {v?.replace('_', ' ')}
      </span>
    )},
    { key: '_count', label: 'Usage', render: (v) => (v?.csrActivities || 0) + (v?.challenges || 0) },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Platform configuration & management</p>
        </div>
        {(tab === 'departments' || tab === 'categories') && (
          <Button onClick={() => { setShowModal(true); setForm({}); }}>
            <span className="flex items-center gap-2"><Plus size={16} /> Add</span>
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              tab === t.id ? 'bg-surface-elevated text-eco-green border-b-2 border-eco-green' : 'text-text-secondary hover:text-text-primary'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' && <DataTable columns={deptColumns} data={departments} emptyMessage="No departments" />}
      {tab === 'categories' && <DataTable columns={catColumns} data={categories} emptyMessage="No categories" />}

      {tab === 'app' && (
        <div className="glass-elevated rounded-2xl p-6 space-y-1">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Application Settings</h3>
          {[
            { key: 'autoEmissionCalculation', label: 'Auto Emission Calculation', desc: 'Automatically calculate CO₂ from emission factors' },
            { key: 'requireEvidenceForCSR', label: 'Require Evidence for CSR', desc: 'Employees must upload proof for CSR participation' },
            { key: 'autoAwardBadges', label: 'Auto Award Badges', desc: 'Automatically award badges when criteria are met' },
            { key: 'complianceNotifications', label: 'Compliance Notifications', desc: 'Send notifications for compliance deadlines' },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{s.label}</p>
                <p className="text-xs text-text-muted">{s.desc}</p>
              </div>
              <button
                onClick={() => handleToggleSetting(s.key, settings[s.key])}
                className={`w-12 h-6 rounded-full transition-all relative ${settings[s.key] ? 'bg-eco-green' : 'bg-surface-base border border-border-default'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${settings[s.key] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <Bell size={48} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No notifications</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id}
              className={`glass-elevated rounded-xl p-4 flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-2 border-eco-green' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              style={{ cursor: !n.isRead ? 'pointer' : 'default' }}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-eco-green' : 'bg-transparent'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${tab === 'departments' ? 'Department' : 'Category'}`}>
        <div className="space-y-4">
          {tab === 'departments' && (
            <>
              <FormField label="Name"><Input placeholder="Department name" onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
              <FormField label="Code"><Input placeholder="E.g. MFG, LOG" onChange={e => setForm({ ...form, code: e.target.value })} /></FormField>
            </>
          )}
          {tab === 'categories' && (
            <>
              <FormField label="Name"><Input placeholder="Category name" onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
              <FormField label="Type">
                <Select options={[{ value: 'CSR_ACTIVITY', label: 'CSR Activity' }, { value: 'CHALLENGE', label: 'Challenge' }]}
                  onChange={e => setForm({ ...form, type: e.target.value })} />
              </FormField>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
