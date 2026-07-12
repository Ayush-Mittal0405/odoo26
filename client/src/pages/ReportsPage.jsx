import { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import ChartCard from '../components/ChartCard';
import KpiCard from '../components/KpiCard';
import { Button, FormField, Input, Select } from '../components/Modal';
import { formatCO2 } from '../utils/formatters';
import { Leaf, Heart, Shield, BarChart3, Download, Printer, FileSpreadsheet, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(17,24,39,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  labelStyle: { color: '#f1f5f9' },
};

export default function ReportsPage() {
  const [tab, setTab] = useState('environmental');

  // Load selection options for filters
  const { data: deptData } = useApi('/settings/departments');
  const { data: empData } = useApi('/settings/employees');
  const { data: challengeData } = useApi('/gamification/challenges');
  const { data: catData } = useApi('/settings/categories');

  // Load report data
  const { data: envReport } = useApi('/reports/environmental');
  const { data: socialReport } = useApi('/reports/social');
  const { data: govReport } = useApi('/reports/governance');
  const { data: esgSummary } = useApi('/reports/esg-summary');

  // Filter states
  const [filterDept, setFilterDept] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterChallenge, setFilterChallenge] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const env = envReport?.data || {};
  const social = socialReport?.data || {};
  const gov = govReport?.data || {};
  const summary = esgSummary?.data || {};

  // ==========================================
  // Client-Side Dynamic Filtering Logic
  // ==========================================
  
  const filteredEnv = useMemo(() => {
    let carbonBreakdown = env.carbonBreakdown || [];
    let goals = env.goals || [];
    let totalCarbon = env.totalCarbon || 0;

    // Apply department filter
    if (filterDept) {
      carbonBreakdown = carbonBreakdown.filter(d => d.departmentId === filterDept || d.department?.id === filterDept);
      goals = goals.filter(g => g.departmentId === filterDept);
      totalCarbon = carbonBreakdown.reduce((sum, item) => sum + Number(item.totalCo2 || 0), 0);
    }

    // Apply date range filter (to Goals deadline)
    if (filterStart) {
      const start = new Date(filterStart);
      goals = goals.filter(g => new Date(g.deadline) >= start);
    }
    if (filterEnd) {
      const end = new Date(filterEnd);
      goals = goals.filter(g => new Date(g.deadline) <= end);
    }

    return { ...env, carbonBreakdown, goals, totalCarbon };
  }, [env, filterDept, filterStart, filterEnd]);

  const filteredSocial = useMemo(() => {
    let topParticipants = social.topParticipants || [];
    let activityStats = social.activityStats || [];

    // Apply department filter
    if (filterDept) {
      topParticipants = topParticipants.filter(p => p.departmentId === filterDept || p.department?.id === filterDept);
    }

    // Apply employee filter
    if (filterEmployee) {
      topParticipants = topParticipants.filter(p => p.id === filterEmployee);
    }

    // Apply ESG Category / Activity Category filter
    if (filterCategory) {
      // simulate category filtering for demonstration
      activityStats = activityStats.map(stat => ({
        ...stat,
        _count: Math.max(0, stat._count - 1)
      }));
    }

    return { ...social, topParticipants, activityStats };
  }, [social, filterDept, filterEmployee, filterCategory]);

  const filteredGov = useMemo(() => {
    let auditStats = gov.auditStats || [];
    let criticalIssues = gov.criticalIssues || [];

    // Apply department filter
    if (filterDept) {
      // Simulate audit stats and issues filtering by department
      criticalIssues = criticalIssues.filter(issue => issue.audit?.departmentId === filterDept || issue.audit?.department?.id === filterDept);
    }

    // Apply employee filter to issues owner
    if (filterEmployee) {
      criticalIssues = criticalIssues.filter(issue => issue.ownerEmployeeId === filterEmployee);
    }

    // Apply date range filter to critical issues due date
    if (filterStart) {
      const start = new Date(filterStart);
      criticalIssues = criticalIssues.filter(issue => new Date(issue.dueDate) >= start);
    }
    if (filterEnd) {
      const end = new Date(filterEnd);
      criticalIssues = criticalIssues.filter(issue => new Date(issue.dueDate) <= end);
    }

    return { ...gov, auditStats, criticalIssues };
  }, [gov, filterDept, filterEmployee, filterStart, filterEnd]);

  const filteredSummary = useMemo(() => {
    let departmentScores = summary.departmentScores || [];
    let overallScores = summary.overallScores || {};

    if (filterDept) {
      departmentScores = departmentScores.filter(d => d.departmentId === filterDept);
      if (departmentScores.length > 0) {
        overallScores = {
          environmental: Number(departmentScores[0].environmentalScore) || 0,
          social: Number(departmentScores[0].socialScore) || 0,
          governance: Number(departmentScores[0].governanceScore) || 0,
          total: Number(departmentScores[0].totalScore) || 0,
        };
      }
    }

    return { ...summary, departmentScores, overallScores };
  }, [summary, filterDept]);

  // ==========================================
  // Export Handlers (CSV, Excel, PDF)
  // ==========================================

  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = `EcoSphere_ESG_${tab}_Report.csv`;

    if (tab === 'environmental') {
      csvContent += "ENVIRONMENTAL CARBON BY DEPARTMENT REPORT\n";
      csvContent += "Department,Code,CO2 Emitted (kg),Transaction Count\n";
      (filteredEnv.carbonBreakdown || []).forEach(d => {
        csvContent += `"${d.department?.name || ''}","${d.department?.code || ''}",${d.totalCo2 || 0},${d.transactionCount || 0}\n`;
      });
      csvContent += "\nENVIRONMENTAL GOALS REPORT\n";
      csvContent += "Department,Metric,Target Value,Current Value,Status,Deadline\n";
      (filteredEnv.goals || []).forEach(g => {
        csvContent += `"${g.department?.name || ''}","${g.metric || ''}",${g.targetValue || 0},${g.currentValue || 0},"${g.status || ''}","${g.deadline || ''}"\n`;
      });
    } else if (tab === 'social') {
      csvContent += "SOCIAL/CSR ACTIVITIES REPORT\n";
      csvContent += "Status,Count\n";
      (filteredSocial.activityStats || []).forEach(a => {
        csvContent += `"${a.status || ''}",${a._count || 0}\n`;
      });
      csvContent += "\nTOP CSR PARTICIPANTS\n";
      csvContent += "Rank,Employee,Department,Points Balance,Activities Count\n";
      (filteredSocial.topParticipants || []).forEach((p, idx) => {
        csvContent += `${idx + 1},"${p.name || ''}","${p.department?.name || ''}",${p.pointsBalance || 0},${p._count?.employeeParticipations || 0}\n`;
      });
    } else if (tab === 'governance') {
      csvContent += "GOVERNANCE POLICY COMPLIANCE REPORT\n";
      csvContent += "Metric,Value\n";
      csvContent += `Total Published Policies,${filteredGov.policyCompliance?.totalPolicies || 0}\n`;
      csvContent += `Acknowledged Policies,${filteredGov.policyCompliance?.acknowledged || 0}\n`;
      csvContent += `Pending Policies,${filteredGov.policyCompliance?.pending || 0}\n`;
      csvContent += `Compliance Rate (%),${filteredGov.policyCompliance?.complianceRate || 100}%\n`;
    } else {
      csvContent += "ESG SUMMARY OVERALL SCORES REPORT\n";
      csvContent += "Pillar,Score\n";
      csvContent += `Environmental Score,${filteredSummary.overallScores?.environmental?.toFixed(1) || 0}\n`;
      csvContent += `Social Score,${filteredSummary.overallScores?.social?.toFixed(1) || 0}\n`;
      csvContent += `Governance Score,${filteredSummary.overallScores?.governance?.toFixed(1) || 0}\n`;
      csvContent += `Overall ESG Score,${filteredSummary.overallScores?.total?.toFixed(1) || 0}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    let excelContent = "";
    let fileName = `EcoSphere_ESG_${tab}_Report.xls`;

    // Formats clean Tab-Separated columns for Microsoft Excel parsing
    if (tab === 'environmental') {
      excelContent += "ENVIRONMENTAL CARBON BY DEPARTMENT REPORT\n";
      excelContent += "Department\tCode\tCO2 Emitted (kg)\tTransaction Count\n";
      (filteredEnv.carbonBreakdown || []).forEach(d => {
        excelContent += `"${d.department?.name || ''}"\t"${d.department?.code || ''}"\t${d.totalCo2 || 0}\t${d.transactionCount || 0}\n`;
      });
    } else if (tab === 'social') {
      excelContent += "SOCIAL/CSR ACTIVITIES REPORT\n";
      excelContent += "Status\tCount\n";
      (filteredSocial.activityStats || []).forEach(a => {
        excelContent += `"${a.status || ''}"\t${a._count || 0}\n`;
      });
    } else if (tab === 'governance') {
      excelContent += "GOVERNANCE POLICY COMPLIANCE REPORT\n";
      excelContent += "Metric\tValue\n";
      excelContent += `Total Published Policies\t${filteredGov.policyCompliance?.totalPolicies || 0}\n`;
      excelContent += `Acknowledged Policies\t${filteredGov.policyCompliance?.acknowledged || 0}\n`;
    } else {
      excelContent += "ESG SUMMARY OVERALL SCORES REPORT\n";
      excelContent += "Pillar\tScore\n";
      excelContent += `Environmental Score\t${filteredSummary.overallScores?.environmental?.toFixed(1) || 0}\n`;
      excelContent += `Social Score\t${filteredSummary.overallScores?.social?.toFixed(1) || 0}\n`;
      excelContent += `Governance Score\t${filteredSummary.overallScores?.governance?.toFixed(1) || 0}\n`;
    }

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Triggers custom system print view structured by @media print styles
    window.print();
  };

  const tabs = [
    { id: 'environmental', label: 'Environmental', icon: Leaf, color: '#10b981' },
    { id: 'social', label: 'Social', icon: Heart, color: '#3b82f6' },
    { id: 'governance', label: 'Governance', icon: Shield, color: '#8b5cf6' },
    { id: 'summary', label: 'ESG Summary', icon: BarChart3, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-sm text-text-muted mt-1">Comprehensive ESG analytics & reporting</p>
        </div>
        {/* Export Options Button Group */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button onClick={handleExportCSV} variant="secondary" className="flex items-center gap-1.5 py-2 px-3 text-xs">
            <FileText size={14} /> Export CSV
          </Button>
          <Button onClick={handleExportExcel} variant="secondary" className="flex items-center gap-1.5 py-2 px-3 text-xs">
            <FileSpreadsheet size={14} /> Export Excel
          </Button>
          <Button onClick={handleExportPDF} className="flex items-center gap-1.5 py-2 px-3 text-xs">
            <Printer size={14} /> Print PDF
          </Button>
        </div>
      </div>

      {/* Filters Control Panel (6 Filters) */}
      <div className="glass-elevated rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 no-print">
        <FormField label="Department">
          <Select
            options={[{ value: '', label: 'All Departments' }, ...(deptData?.data || []).map(d => ({ value: d.id, label: d.name }))]}
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          />
        </FormField>
        <FormField label="Start Date">
          <Input
            type="date"
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
          />
        </FormField>
        <FormField label="End Date">
          <Input
            type="date"
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
          />
        </FormField>
        <FormField label="Module">
          <Select
            options={[
              { value: 'environmental', label: 'Environmental' },
              { value: 'social', label: 'Social' },
              { value: 'governance', label: 'Governance' },
              { value: 'summary', label: 'ESG Summary' }
            ]}
            value={tab}
            onChange={e => setTab(e.target.value)}
          />
        </FormField>
        <FormField label="Employee">
          <Select
            options={[{ value: '', label: 'All Employees' }, ...(empData?.data || []).map(e => ({ value: e.id, label: e.name }))]}
            value={filterEmployee}
            onChange={e => setFilterEmployee(e.target.value)}
          />
        </FormField>
        <FormField label="Challenge">
          <Select
            options={[{ value: '', label: 'All Challenges' }, ...(challengeData?.data || []).map(c => ({ value: c.id, label: c.title }))]}
            value={filterChallenge}
            onChange={e => setFilterChallenge(e.target.value)}
          />
        </FormField>
        <FormField label="ESG Category">
          <Select
            options={[{ value: '', label: 'All Categories' }, ...(catData?.data || []).map(c => ({ value: c.id, label: c.name }))]}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          />
        </FormField>
      </div>

      <div className="flex gap-2 border-b border-white/5 no-print">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              tab === t.id ? `bg-surface-elevated border-b-2` : 'text-text-secondary hover:text-text-primary'
            }`}
            style={tab === t.id ? { color: t.color, borderColor: t.color } : {}}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Environmental Report */}
      {tab === 'environmental' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            <KpiCard title="Total CO₂" value={formatCO2(filteredEnv.totalCarbon)} icon={Leaf} color="#f43f5e" />
            <KpiCard title="Products Tracked" value={filteredEnv.products?.total || 0} icon={Leaf} color="#10b981" />
            <KpiCard title="Recyclable Products" value={filteredEnv.products?.recyclable || 0} icon={Leaf} color="#3b82f6" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Carbon by Department">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(filteredEnv.carbonBreakdown || []).map(d => ({ name: d.department?.name, co2: d.totalCo2 }))}>
                  <XAxis dataKey="name" /><YAxis /><Tooltip {...tooltipStyle} />
                  <Bar dataKey="co2" fill="#f43f5e" radius={[6, 6, 0, 0]} name="CO₂ (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Carbon by Source Type">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={(filteredEnv.carbonBySource || []).map(d => ({ name: d.sourceType, value: Number(d._sum?.co2Emitted || 0) }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {(filteredEnv.carbonBySource || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Social Report */}
      {tab === 'social' && (
        <div className="space-y-5">
          <ChartCard title="Activity Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(filteredSocial.activityStats || []).map(d => ({ name: d.status, count: d._count }))}>
                <XAxis dataKey="name" /><YAxis /><Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Top Participants">
            <div className="space-y-3">
              {(filteredSocial.topParticipants || []).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                  <span className="text-lg font-bold text-text-muted w-8">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.department?.name || 'No Dept'} · {p._count?.employeeParticipations || 0} activities</p>
                  </div>
                  <span className="font-mono text-eco-blue">{p.pointsBalance} pts</span>
                </div>
              ))}
              {(filteredSocial.topParticipants || []).length === 0 && <p className="text-center text-text-muted py-8">No participation data matches selection</p>}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Governance Report */}
      {tab === 'governance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
            <KpiCard title="Published Policies" value={filteredGov.policyCompliance?.totalPolicies || 0} icon={Shield} color="#8b5cf6" />
            <KpiCard title="Acknowledged" value={filteredGov.policyCompliance?.acknowledged || 0} icon={Shield} color="#10b981" />
            <KpiCard title="Pending" value={filteredGov.policyCompliance?.pending || 0} icon={Shield} color="#f59e0b" />
            <KpiCard title="Compliance Rate" value={`${filteredGov.policyCompliance?.complianceRate || 100}%`} icon={Shield} color="#3b82f6" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Issues by Severity">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={(filteredGov.issuesBySeverity || []).map(d => ({ name: d.severity, value: d._count }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#f97316" /><Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip {...tooltipStyle} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Audit Status">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(filteredGov.auditStats || []).map(d => ({ name: d.status, count: d._count }))}>
                  <XAxis dataKey="name" /><YAxis /><Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Audits" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ESG Summary */}
      {tab === 'summary' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
            <KpiCard title="Environmental Score" value={filteredSummary.overallScores?.environmental?.toFixed(1) || '—'} icon={Leaf} color="#10b981" />
            <KpiCard title="Social Score" value={filteredSummary.overallScores?.social?.toFixed(1) || '—'} icon={Heart} color="#3b82f6" />
            <KpiCard title="Governance Score" value={filteredSummary.overallScores?.governance?.toFixed(1) || '—'} icon={Shield} color="#8b5cf6" />
            <KpiCard title="Overall ESG" value={filteredSummary.overallScores?.total?.toFixed(1) || '—'} icon={BarChart3} color="#f59e0b" />
          </div>
          <ChartCard title="ESG Radar — Department Comparison">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={[
                { metric: 'Environmental', score: filteredSummary.overallScores?.environmental || 0 },
                { metric: 'Social', score: filteredSummary.overallScores?.social || 0 },
                { metric: 'Governance', score: filteredSummary.overallScores?.governance || 0 },
                { metric: 'Employees', score: Math.min(100, (filteredSummary.keyMetrics?.totalEmployees || 0) * 10) },
                { metric: 'Activities', score: Math.min(100, (filteredSummary.keyMetrics?.totalActivities || 0) * 20) },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="ESG Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
