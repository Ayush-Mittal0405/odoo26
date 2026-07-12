export function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toLocaleString?.() ?? '0';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCO2(kg) {
  const val = Number(kg || 0);
  if (val >= 1000) return (val / 1000).toFixed(2) + ' t';
  return val.toFixed(2) + ' kg';
}

export function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#f43f5e';
}

export function getSeverityColor(severity) {
  const map = {
    LOW: '#3b82f6',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };
  return map[severity] || '#94a3b8';
}

export function getStatusColor(status) {
  const map = {
    ACTIVE: '#10b981',
    COMPLETED: '#3b82f6',
    DRAFT: '#94a3b8',
    PLANNED: '#8b5cf6',
    IN_PROGRESS: '#f59e0b',
    OPEN: '#f43f5e',
    RESOLVED: '#10b981',
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    ACKNOWLEDGED: '#10b981',
    OVERDUE: '#ef4444',
    PUBLISHED: '#10b981',
    ARCHIVED: '#64748b',
    ON_TRACK: '#10b981',
    FAILED: '#ef4444',
    UNDER_REVIEW: '#8b5cf6',
  };
  return map[status] || '#94a3b8';
}
