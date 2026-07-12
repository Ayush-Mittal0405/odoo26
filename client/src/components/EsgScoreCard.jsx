import { getScoreColor } from '../utils/formatters';

export default function EsgScoreCard({ label, score, color: customColor, icon: Icon }) {
  const color = customColor || getScoreColor(score);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-elevated rounded-2xl p-5 card-hover flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {Icon && <Icon size={16} className="mx-auto mt-1 text-text-muted" />}
      </div>
    </div>
  );
}
