import { useState } from 'react';
import { useApi, usePost } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import Modal, { FormField, Input, Select, Button } from '../components/Modal';
import { formatDate, getSeverityColor } from '../utils/formatters';
import { Shield, FileCheck, AlertTriangle, Search, Plus } from 'lucide-react';

export default function GovernancePage() {
  const [tab, setTab] = useState('policies');
  const [showModal, setShowModal] = useState(false);
  const { data: policyData, refetch: refetchPolicies } = useApi('/governance/policies');
  const { data: auditData, refetch: refetchAudits } = useApi('/governance/audits');
  const { data: issueData, refetch: refetchIssues } = useApi('/governance/compliance-issues');
  const { data: deptData } = useApi('/settings/departments');
  const { post, loading: posting } = usePost();

  const [form, setForm] = useState({});

  const policies = policyData?.data || [];
  const audits = auditData?.data || [];
  const issues = issueData?.data || [];

  const handleAdd = async () => {
    try {
      if (tab === 'policies') {
        await post('/governance/policies', form);
        refetchPolicies();
      } else if (tab === 'audits') {
        await post('/governance/audits', form);
        refetchAudits();
      } else {
        await post('/governance/compliance-issues', form);
        refetchIssues();
      }
      setShowModal(false);
      setForm({});
    } catch (e) { /* handled */ }
  };

  const handleAcknowledge = async (id) => {
    try {
      await post(`/governance/policies/${id}/acknowledge`);
      refetchPolicies();
    } catch (e) { alert(e.message); }
  };

  const tabs = [
    { id: 'policies', label: 'ESG Policies', icon: FileCheck },
    { id: 'audits', label: 'Audits', icon: Search },
    { id: 'issues', label: 'Compliance Issues', icon: AlertTriangle },
  ];

  const policyColumns = [
    { key: 'title', label: 'Policy Title' },
    { key: 'category', label: 'Category', render: (v) => v || '—' },
    { key: 'version', label: 'Version' },
    { key: 'status', label: 'Status' },
    { key: '_count', label: 'Acknowledged', render: (v) => <span className="text-eco-green">{v?.acknowledgements || 0}</span> },
    { key: 'effectiveDate', label: 'Effective', render: (v) => formatDate(v) },
    { key: 'id', label: 'Action', render: (v, row) => (
      row.status === 'PUBLISHED' ? (
        <button onClick={() => handleAcknowledge(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-eco-blue/10 text-eco-blue hover:bg-eco-blue/20 transition-all">
          Acknowledge
        </button>
      ) : <span className="text-xs text-text-muted">—</span>
    )},
  ];

  const auditColumns = [
    { key: 'department', label: 'Department', render: (v) => v?.name || '—' },
    { key: 'auditType', label: 'Type' },
    { key: 'auditor', label: 'Auditor', render: (v) => v || '—' },
    { key: 'status', label: 'Status' },
    { key: '_count', label: 'Issues', render: (v) => (
      <span className={v?.complianceIssues > 0 ? 'text-eco-rose' : 'text-eco-green'}>
        {v?.complianceIssues || 0}
      </span>
    )},
    { key: 'auditDate', label: 'Date', render: (v) => formatDate(v) },
  ];

  const issueColumns = [
    { key: 'description', label: 'Issue', render: (v) => <span className="truncate max-w-[200px] block">{v}</span> },
    { key: 'severity', label: 'Severity', render: (v) => (
      <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ color: getSeverityColor(v), background: `${getSeverityColor(v)}15` }}>
        {v}
      </span>
    )},
    { key: 'audit', label: 'Audit', render: (v) => v?.auditType || '—' },
    { key: 'ownerEmployee', label: 'Owner', render: (v) => v?.name || '—' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due', render: (v) => formatDate(v) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Governance Module</h1>
          <p className="text-sm text-text-muted mt-1">Policies, audits & compliance management</p>
        </div>
        <Button onClick={() => { setShowModal(true); setForm({}); }}>
          <span className="flex items-center gap-2"><Plus size={16} /> Add</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <KpiCard title="ESG Policies" value={policies.length} icon={FileCheck} color="#8b5cf6" />
        <KpiCard title="Audits" value={audits.length} icon={Search} color="#3b82f6" />
        <KpiCard title="Open Issues" value={issues.filter(i => i.status === 'OPEN').length} icon={AlertTriangle} color="#f43f5e" />
      </div>

      <div className="flex gap-2 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              tab === t.id ? 'bg-surface-elevated text-eco-purple border-b-2 border-eco-purple' : 'text-text-secondary hover:text-text-primary'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'policies' && <DataTable columns={policyColumns} data={policies} emptyMessage="No policies" />}
      {tab === 'audits' && <DataTable columns={auditColumns} data={audits} emptyMessage="No audits" />}
      {tab === 'issues' && <DataTable columns={issueColumns} data={issues} emptyMessage="No compliance issues" />}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${tabs.find(t => t.id === tab)?.label}`}>
        <div className="space-y-4">
          {tab === 'policies' && (
            <>
              <FormField label="Title"><Input placeholder="Policy title" onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
              <FormField label="Description"><Input placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
              <FormField label="Category"><Input placeholder="E.g. Environmental, Social" onChange={e => setForm({ ...form, category: e.target.value })} /></FormField>
              <FormField label="Version"><Input placeholder="1.0" defaultValue="1.0" onChange={e => setForm({ ...form, version: e.target.value })} /></FormField>
              <FormField label="Status">
                <Select options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]}
                  onChange={e => setForm({ ...form, status: e.target.value })} />
              </FormField>
              <FormField label="Effective Date"><Input type="date" onChange={e => setForm({ ...form, effectiveDate: e.target.value })} /></FormField>
            </>
          )}
          {tab === 'audits' && (
            <>
              <FormField label="Department">
                <Select options={[{ value: '', label: 'Select...' }, ...(deptData?.data || []).map(d => ({ value: d.id, label: d.name }))]}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })} />
              </FormField>
              <FormField label="Audit Type"><Input placeholder="E.g. Internal, External, ESG" onChange={e => setForm({ ...form, auditType: e.target.value })} /></FormField>
              <FormField label="Auditor"><Input placeholder="Auditor name" onChange={e => setForm({ ...form, auditor: e.target.value })} /></FormField>
              <FormField label="Audit Date"><Input type="date" onChange={e => setForm({ ...form, auditDate: e.target.value })} /></FormField>
            </>
          )}
          {tab === 'issues' && (
            <>
              <FormField label="Audit">
                <Select options={[{ value: '', label: 'Select...' }, ...audits.map(a => ({ value: a.id, label: `${a.auditType} - ${a.department?.name}` }))]}
                  onChange={e => setForm({ ...form, auditId: e.target.value })} />
              </FormField>
              <FormField label="Severity">
                <Select options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => ({ value: s, label: s }))}
                  onChange={e => setForm({ ...form, severity: e.target.value })} />
              </FormField>
              <FormField label="Description"><Input placeholder="Issue description" onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
              <FormField label="Due Date"><Input type="date" onChange={e => setForm({ ...form, dueDate: e.target.value })} /></FormField>
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
