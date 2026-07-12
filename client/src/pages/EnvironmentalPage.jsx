import { useState } from 'react';
import { useApi, usePost } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import ChartCard from '../components/ChartCard';
import KpiCard from '../components/KpiCard';
import Modal, { FormField, Input, Select, Button } from '../components/Modal';
import { formatDate, formatCO2 } from '../utils/formatters';
import { CloudCog, Target, Package, Plus, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EnvironmentalPage() {
  const [tab, setTab] = useState('transactions');
  const [showModal, setShowModal] = useState(false);
  const { data: txnData, loading: txnLoading, refetch: refetchTxns } = useApi('/environmental/transactions');
  const { data: goalData, refetch: refetchGoals } = useApi('/environmental/goals');
  const { data: productData, refetch: refetchProducts } = useApi('/environmental/products');
  const { data: factorData } = useApi('/environmental/emission-factors');
  const { data: deptData } = useApi('/settings/departments');
  const { post, loading: posting } = usePost();

  const [form, setForm] = useState({});

  const tabs = [
    { id: 'transactions', label: 'Carbon Transactions', icon: CloudCog },
    { id: 'goals', label: 'Environmental Goals', icon: Target },
    { id: 'products', label: 'Product ESG Profiles', icon: Package },
  ];

  const handleAdd = async () => {
    try {
      if (tab === 'transactions') {
        if (!form.departmentId || !form.emissionFactorId || !form.quantity || !form.txnDate) {
          alert("All fields (Department, Emission Factor, Source, Quantity, Date) are required.");
          return;
        }
        await post('/environmental/transactions', { sourceType: 'MANUAL', ...form });
        refetchTxns();
      } else if (tab === 'goals') {
        if (!form.departmentId || !form.metric || !form.targetValue || !form.deadline) {
          alert("All fields (Department, Metric, Target, Deadline) are required.");
          return;
        }
        await post('/environmental/goals', form);
        refetchGoals();
      } else {
        if (!form.productName || form.carbonScore === undefined) {
          alert("Product Name and Carbon Score are required.");
          return;
        }
        await post('/environmental/products', { recyclable: false, ...form });
        refetchProducts();
      }
      setShowModal(false);
      setForm({});
    } catch (e) { /* error handled by hook */ }
  };

  const txnColumns = [
    { key: 'department', label: 'Department', render: (v) => v?.name || '—' },
    { key: 'emissionFactor', label: 'Activity', render: (v) => v?.activityType || '—' },
    { key: 'sourceType', label: 'Source' },
    { key: 'quantity', label: 'Quantity', render: (v) => Number(v).toFixed(2) },
    { key: 'co2Emitted', label: 'CO₂ (kg)', render: (v) => <span className="text-eco-rose font-mono">{Number(v).toFixed(2)}</span> },
    { key: 'txnDate', label: 'Date', render: (v) => formatDate(v) },
  ];

  const goalColumns = [
    { key: 'department', label: 'Department', render: (v) => v?.name || '—' },
    { key: 'metric', label: 'Metric' },
    { key: 'targetValue', label: 'Target', render: (v) => Number(v).toFixed(1) },
    { key: 'currentValue', label: 'Current', render: (v) => Number(v).toFixed(1) },
    { key: 'progress', label: 'Progress', render: (_, row) => {
      const pct = Math.min(100, (Number(row.currentValue) / Number(row.targetValue)) * 100);
      return (
        <div className="flex items-center gap-3">
          <div className="progress-bar flex-1">
            <div className="progress-bar-fill bg-gradient-to-r from-eco-green to-eco-green-light" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-mono text-text-secondary">{pct.toFixed(0)}%</span>
        </div>
      );
    }},
    { key: 'status', label: 'Status' },
    { key: 'deadline', label: 'Deadline', render: (v) => formatDate(v) },
  ];

  const productColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'carbonScore', label: 'Carbon Score', render: (v) => (
      <span className={`font-mono ${Number(v) < 3 ? 'text-eco-green' : Number(v) < 6 ? 'text-eco-amber' : 'text-eco-rose'}`}>{Number(v).toFixed(1)}</span>
    )},
    { key: 'recyclable', label: 'Recyclable', render: (v) => v ? '♻️ Yes' : '❌ No' },
    { key: 'sustainabilityNotes', label: 'Notes', render: (v) => v || '—' },
  ];

  const departments = deptData?.data || [];
  const factors = factorData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Environmental Module</h1>
          <p className="text-sm text-text-muted mt-1">Carbon tracking, goals & product sustainability</p>
        </div>
        <Button onClick={() => { setShowModal(true); setForm({}); }}>
          <span className="flex items-center gap-2"><Plus size={16} /> Add {tabs.find(t => t.id === tab)?.label.split(' ').pop()}</span>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <KpiCard title="Total CO₂ Emitted" value={formatCO2((txnData?.data || []).reduce((s, t) => s + Number(t.co2Emitted), 0))} icon={Flame} color="#f43f5e" />
        <KpiCard title="Active Goals" value={(goalData?.data || []).filter(g => g.status === 'ACTIVE' || g.status === 'ON_TRACK').length} icon={Target} color="#10b981" />
        <KpiCard title="Products Tracked" value={(productData?.data || []).length} icon={Package} color="#3b82f6" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              tab === t.id ? 'bg-surface-elevated text-eco-green border-b-2 border-eco-green' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'transactions' && (
        <DataTable columns={txnColumns} data={txnData?.data || []} emptyMessage="No carbon transactions yet" />
      )}
      {tab === 'goals' && (
        <DataTable columns={goalColumns} data={goalData?.data || []} emptyMessage="No environmental goals set" />
      )}
      {tab === 'products' && (
        <DataTable columns={productColumns} data={productData?.data || []} emptyMessage="No product ESG profiles" />
      )}

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${tabs.find(t => t.id === tab)?.label.split(' ').pop()}`}>
        <div className="space-y-4">
          {tab === 'transactions' && (
            <>
              <FormField label="Department">
                <Select options={[{ value: '', label: 'Select...' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })} />
              </FormField>
              <FormField label="Emission Factor">
                <Select options={[{ value: '', label: 'Select...' }, ...factors.map(f => ({ value: f.id, label: `${f.activityType} (${f.unit})` }))]}
                  onChange={e => setForm({ ...form, emissionFactorId: e.target.value })} />
              </FormField>
              <FormField label="Source Type">
                <Select options={['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'MANUAL'].map(s => ({ value: s, label: s }))}
                  onChange={e => setForm({ ...form, sourceType: e.target.value })} />
              </FormField>
              <FormField label="Quantity">
                <Input type="number" step="0.01" placeholder="Enter quantity" onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
              </FormField>
              <FormField label="Date">
                <Input type="date" onChange={e => setForm({ ...form, txnDate: e.target.value })} />
              </FormField>
            </>
          )}
          {tab === 'goals' && (
            <>
              <FormField label="Department">
                <Select options={[{ value: '', label: 'Select...' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })} />
              </FormField>
              <FormField label="Metric">
                <Input placeholder="e.g. Reduce CO₂ by 20%" onChange={e => setForm({ ...form, metric: e.target.value })} />
              </FormField>
              <FormField label="Target Value">
                <Input type="number" step="0.01" placeholder="Target value" onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} />
              </FormField>
              <FormField label="Deadline">
                <Input type="date" onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </FormField>
            </>
          )}
          {tab === 'products' && (
            <>
              <FormField label="Product Name">
                <Input placeholder="Product name" onChange={e => setForm({ ...form, productName: e.target.value })} />
              </FormField>
              <FormField label="Carbon Score (0-10)">
                <Input type="number" step="0.1" min="0" max="10" placeholder="Carbon score" onChange={e => setForm({ ...form, carbonScore: Number(e.target.value) })} />
              </FormField>
              <FormField label="Recyclable">
                <Select options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
                  onChange={e => setForm({ ...form, recyclable: e.target.value === 'true' })} />
              </FormField>
              <FormField label="Sustainability Notes">
                <Input placeholder="Notes..." onChange={e => setForm({ ...form, sustainabilityNotes: e.target.value })} />
              </FormField>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={posting}>{posting ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
