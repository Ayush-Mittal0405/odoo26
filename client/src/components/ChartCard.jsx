export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`glass-elevated rounded-2xl p-5 card-hover ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
