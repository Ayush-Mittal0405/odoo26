import { formatNumber } from '../utils/formatters';

export default function KpiCard({ title, value, icon: Icon, color = '#10b981', subtitle, trend }) {
  return (
    <div className="glass-elevated rounded-2xl p-5 card-hover gradient-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-text-primary">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium ${trend >= 0 ? 'text-eco-green' : 'text-eco-rose'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          {Icon && <Icon size={24} style={{ color }} />}
        </div>
      </div>
    </div>
  );
}
