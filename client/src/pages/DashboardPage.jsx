import { useApi } from '../hooks/useApi';
import KpiCard from '../components/KpiCard';
import EsgScoreCard from '../components/EsgScoreCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { formatDate, formatCO2 } from '../utils/formatters';
import { Users, Building2, Trophy, CloudCog, Leaf, Heart, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

export default function DashboardPage() {
  const { data, loading } = useApi('/dashboard');

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const d = data || {};
  const stats = d.statistics || {};
  const scores = d.scores || {};

  const deptChartData = (d.departmentBreakdown || []).map(dept => ({
    name: dept.code || dept.name,
    employees: dept._count?.employees || dept.employeeCount || 0,
    carbon: dept._count?.carbonTxns || 0,
    activities: dept._count?.csrActivities || 0,
  }));

  const challengeColumns = [
    { key: 'title', label: 'Challenge' },
    { key: 'difficulty', label: 'Difficulty', render: (val) => (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
        val === 'HARD' ? 'bg-eco-rose/10 text-eco-rose' :
        val === 'MEDIUM' ? 'bg-eco-amber/10 text-eco-amber' :
        'bg-eco-green/10 text-eco-green'
      }`}>{val}</span>
    )},
    { key: 'xp', label: 'XP', render: (val) => <span className="font-mono text-eco-green">{val} XP</span> },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created', render: (val) => formatDate(val) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Executive Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Real-time ESG performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <KpiCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="#3b82f6" />
        <KpiCard title="Departments" value={stats.totalDepartments} icon={Building2} color="#8b5cf6" />
        <KpiCard title="Active Challenges" value={stats.totalChallenges} icon={Trophy} color="#f59e0b" />
        <KpiCard title="Total CO₂ Emitted" value={formatCO2(stats.totalCarbon)} icon={CloudCog} color="#f43f5e" />
      </div>

      {/* ESG Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
        <EsgScoreCard label="Environmental" score={scores.environmentalScore || 0} color="#10b981" icon={Leaf} />
        <EsgScoreCard label="Social" score={scores.socialScore || 0} color="#3b82f6" icon={Heart} />
        <EsgScoreCard label="Governance" score={scores.governanceScore || 0} color="#8b5cf6" icon={Shield} />
        <EsgScoreCard label="Overall ESG" score={Number(scores.overallScore) || 0} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Department Overview" subtitle="Employees and activities by department">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="employees" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Employees" />
              <Bar dataKey="activities" fill="#10b981" radius={[6, 6, 0, 0]} name="CSR Activities" />
              <Bar dataKey="carbon" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Carbon Txns" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ESG Score Distribution" subtitle="Performance across three pillars">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Environmental', value: scores.environmentalScore || 0 },
                  { name: 'Social', value: scores.socialScore || 0 },
                  { name: 'Governance', value: scores.governanceScore || 0 },
                ]}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#10b981" />
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {[
              { label: 'Environmental', color: '#10b981' },
              { label: 'Social', color: '#3b82f6' },
              { label: 'Governance', color: '#8b5cf6' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Challenges</h3>
        <DataTable
          columns={challengeColumns}
          data={d.recentChallenges || []}
          emptyMessage="No challenges yet. Create one in Gamification."
        />
      </div>
    </div>
  );
}
