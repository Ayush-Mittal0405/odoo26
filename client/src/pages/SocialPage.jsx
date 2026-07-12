import { useState } from 'react';
import { useApi, usePost } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import Modal, { FormField, Input, Select, Button } from '../components/Modal';
import { formatDate } from '../utils/formatters';
import { Heart, UserPlus, CheckCircle, Plus } from 'lucide-react';

export default function SocialPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: actData, refetch } = useApi('/social/activities');
  const { data: deptData } = useApi('/settings/departments');
  const { data: catData } = useApi('/settings/categories', { params: { type: 'CSR_ACTIVITY' } });
  const { post, loading: posting } = usePost();

  const [form, setForm] = useState({});

  const activities = actData?.data || [];
  const activeCount = activities.filter(a => a.status === 'ACTIVE').length;
  const totalParticipations = activities.reduce((s, a) => s + (a._count?.participations || 0), 0);

  const handleAdd = async () => {
    try {
      await post('/social/activities', form);
      refetch();
      setShowModal(false);
      setForm({});
    } catch (e) { /* handled */ }
  };

  const handleJoin = async (id) => {
    try {
      await post(`/social/activities/${id}/join`);
      refetch();
    } catch (e) { alert(e.message); }
  };

  const columns = [
    { key: 'title', label: 'Activity' },
    { key: 'department', label: 'Department', render: (v) => v?.name || '—' },
    { key: 'category', label: 'Category', render: (v) => v?.name || '—' },
    { key: '_count', label: 'Participants', render: (v) => (
      <span className="flex items-center gap-1.5 text-eco-blue">
        <UserPlus size={14} /> {v?.participations || 0}
      </span>
    )},
    { key: 'status', label: 'Status' },
    { key: 'activityDate', label: 'Date', render: (v) => formatDate(v) },
    { key: 'id', label: 'Action', render: (v, row) => (
      row.status === 'ACTIVE' ? (
        <button onClick={() => handleJoin(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-eco-green/10 text-eco-green hover:bg-eco-green/20 transition-all">
          Join
        </button>
      ) : <span className="text-xs text-text-muted">—</span>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Social / CSR Module</h1>
          <p className="text-sm text-text-muted mt-1">CSR activities & employee participation</p>
        </div>
        <Button onClick={() => { setShowModal(true); setForm({}); }}>
          <span className="flex items-center gap-2"><Plus size={16} /> Add Activity</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <KpiCard title="Total Activities" value={activities.length} icon={Heart} color="#3b82f6" />
        <KpiCard title="Active Activities" value={activeCount} icon={CheckCircle} color="#10b981" />
        <KpiCard title="Total Participations" value={totalParticipations} icon={UserPlus} color="#8b5cf6" />
      </div>

      <DataTable columns={columns} data={activities} emptyMessage="No CSR activities yet" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add CSR Activity">
        <div className="space-y-4">
          <FormField label="Title">
            <Input placeholder="Activity title" onChange={e => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Department">
            <Select options={[{ value: '', label: 'Select...' }, ...(deptData?.data || []).map(d => ({ value: d.id, label: d.name }))]}
              onChange={e => setForm({ ...form, departmentId: e.target.value })} />
          </FormField>
          <FormField label="Category">
            <Select options={[{ value: '', label: 'Select...' }, ...(catData?.data || []).map(c => ({ value: c.id, label: c.name }))]}
              onChange={e => setForm({ ...form, categoryId: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <Input placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="Activity Date">
            <Input type="date" onChange={e => setForm({ ...form, activityDate: e.target.value })} />
          </FormField>
          <FormField label="Status">
            <Select options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'ACTIVE', label: 'Active' }]}
              onChange={e => setForm({ ...form, status: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={posting}>{posting ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
