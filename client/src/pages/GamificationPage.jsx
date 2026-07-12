import { useState } from 'react';
import { useApi, usePost } from '../hooks/useApi';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import Modal, { FormField, Input, Select, Button } from '../components/Modal';
import { formatDate } from '../utils/formatters';
import { Trophy, Star, Gift, Crown, Plus, Swords, Medal } from 'lucide-react';

export default function GamificationPage() {
  const [tab, setTab] = useState('challenges');
  const [showModal, setShowModal] = useState(false);
  const { data: challengeData, refetch: refetchChallenges } = useApi('/gamification/challenges');
  const { data: badgeData } = useApi('/gamification/badges');
  const { data: rewardData } = useApi('/gamification/rewards');
  const { data: leaderboardData } = useApi('/gamification/leaderboard');
  const { data: catData } = useApi('/settings/categories', { params: { type: 'CHALLENGE' } });
  const { post, loading: posting } = usePost();

  const [form, setForm] = useState({});

  const challenges = challengeData?.data || [];
  const badges = badgeData?.data || [];
  const rewards = rewardData?.data || [];
  const leaderboard = leaderboardData?.data || [];

  const handleAddChallenge = async () => {
    try {
      await post('/gamification/challenges', form);
      refetchChallenges();
      setShowModal(false);
      setForm({});
    } catch (e) { /* handled */ }
  };

  const handleJoinChallenge = async (id) => {
    try {
      await post(`/gamification/challenges/${id}/join`);
      refetchChallenges();
    } catch (e) { alert(e.message); }
  };

  const handleRedeem = async (id) => {
    try {
      await post(`/gamification/rewards/${id}/redeem`);
      alert('Reward redeemed!');
    } catch (e) { alert(e.message); }
  };

  const tabs = [
    { id: 'challenges', label: 'Challenges', icon: Swords },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
    { id: 'badges', label: 'Badges', icon: Medal },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  const challengeColumns = [
    { key: 'title', label: 'Challenge' },
    { key: 'category', label: 'Category', render: (v) => v?.name || '—' },
    { key: 'difficulty', label: 'Difficulty', render: (v) => (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${v === 'HARD' ? 'bg-eco-rose/10 text-eco-rose' : v === 'MEDIUM' ? 'bg-eco-amber/10 text-eco-amber' : 'bg-eco-green/10 text-eco-green'}`}>{v}</span>
    )},
    { key: 'xp', label: 'XP Reward', render: (v) => <span className="font-mono text-eco-amber">⚡ {v}</span> },
    { key: '_count', label: 'Joined', render: (v) => v?.participations || 0 },
    { key: 'status', label: 'Status' },
    { key: 'id', label: 'Action', render: (v, row) => (
      row.status === 'ACTIVE' ? (
        <button onClick={() => handleJoinChallenge(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-eco-amber/10 text-eco-amber hover:bg-eco-amber/20 transition-all">
          Join
        </button>
      ) : <span className="text-xs text-text-muted">—</span>
    )},
  ];

  const leaderboardColumns = [
    { key: 'rank', label: '#', render: (v) => (
      <span className={`font-bold ${v === 1 ? 'text-eco-amber text-lg' : v === 2 ? 'text-gray-400' : v === 3 ? 'text-amber-700' : 'text-text-secondary'}`}>
        {v === 1 ? '🥇' : v === 2 ? '🥈' : v === 3 ? '🥉' : v}
      </span>
    )},
    { key: 'name', label: 'Employee' },
    { key: 'department', label: 'Department', render: (v) => v?.name || '—' },
    { key: 'xpTotal', label: 'Total XP', render: (v) => <span className="font-mono text-eco-green font-bold">{v}</span> },
    { key: 'pointsBalance', label: 'Points', render: (v) => <span className="font-mono text-eco-blue">{v}</span> },
    { key: '_count', label: 'Badges', render: (v) => <span className="text-eco-amber">🏅 {v?.employeeBadges || 0}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gamification Module</h1>
          <p className="text-sm text-text-muted mt-1">Challenges, badges, rewards & leaderboard</p>
        </div>
        {tab === 'challenges' && (
          <Button onClick={() => { setShowModal(true); setForm({}); }}>
            <span className="flex items-center gap-2"><Plus size={16} /> New Challenge</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
        <KpiCard title="Active Challenges" value={challenges.filter(c => c.status === 'ACTIVE').length} icon={Trophy} color="#f59e0b" />
        <KpiCard title="Total Badges" value={badges.length} icon={Star} color="#8b5cf6" />
        <KpiCard title="Available Rewards" value={rewards.filter(r => r.status === 'ACTIVE').length} icon={Gift} color="#10b981" />
        <KpiCard title="Competitors" value={leaderboard.length} icon={Crown} color="#3b82f6" />
      </div>

      <div className="flex gap-2 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              tab === t.id ? 'bg-surface-elevated text-eco-amber border-b-2 border-eco-amber' : 'text-text-secondary hover:text-text-primary'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'challenges' && <DataTable columns={challengeColumns} data={challenges} emptyMessage="No challenges yet" />}

      {tab === 'leaderboard' && <DataTable columns={leaderboardColumns} data={leaderboard} emptyMessage="No employees ranked yet" />}

      {tab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {badges.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-elevated rounded-2xl">
              <Medal size={48} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No badges created yet</p>
            </div>
          ) : badges.map((badge) => (
            <div key={badge.id} className={`glass-elevated rounded-2xl p-5 card-hover text-center ${badge.earned ? 'ring-2 ring-eco-amber/30' : ''}`}>
              <div className="text-4xl mb-3">{badge.icon || '🏅'}</div>
              <h4 className="font-semibold text-text-primary">{badge.name}</h4>
              <p className="text-xs text-text-muted mt-1">{badge.description || badge.unlockRule}</p>
              <p className="text-xs mt-2">
                {badge.earned ? <span className="text-eco-amber font-medium">✓ Earned</span> : <span className="text-text-muted">Locked</span>}
              </p>
              <p className="text-xs text-text-muted mt-1">{badge._count?.employeeBadges || 0} holders</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'rewards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {rewards.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-elevated rounded-2xl">
              <Gift size={48} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No rewards available</p>
            </div>
          ) : rewards.map((reward) => (
            <div key={reward.id} className="glass-elevated rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-text-primary">{reward.name}</h4>
                  <p className="text-xs text-text-muted mt-1">{reward.description || ''}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${reward.status === 'ACTIVE' ? 'bg-eco-green/10 text-eco-green' : 'bg-eco-rose/10 text-eco-rose'}`}>
                  {reward.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-sm font-mono text-eco-blue">{reward.pointsRequired} pts</span>
                <span className="text-xs text-text-muted">Stock: {reward.stock}</span>
              </div>
              {reward.status === 'ACTIVE' && reward.stock > 0 && (
                <button onClick={() => handleRedeem(reward.id)} className="w-full mt-3 py-2 rounded-xl text-xs font-medium bg-eco-green/10 text-eco-green hover:bg-eco-green/20 transition-all">
                  Redeem
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Challenge">
        <div className="space-y-4">
          <FormField label="Title"><Input placeholder="Challenge title" onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Category">
            <Select options={[{ value: '', label: 'Select...' }, ...(catData?.data || []).map(c => ({ value: c.id, label: c.name }))]}
              onChange={e => setForm({ ...form, categoryId: e.target.value })} />
          </FormField>
          <FormField label="Description"><Input placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="XP Reward"><Input type="number" defaultValue="100" onChange={e => setForm({ ...form, xp: Number(e.target.value) })} /></FormField>
            <FormField label="Difficulty">
              <Select options={['EASY', 'MEDIUM', 'HARD'].map(d => ({ value: d, label: d }))}
                onChange={e => setForm({ ...form, difficulty: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Deadline"><Input type="date" onChange={e => setForm({ ...form, deadline: e.target.value })} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAddChallenge} disabled={posting}>{posting ? 'Saving...' : 'Create Challenge'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
