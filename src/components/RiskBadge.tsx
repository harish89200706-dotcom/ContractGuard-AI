import type { RiskSeverity } from '@/lib/types';

const styles: Record<RiskSeverity, { bg: string; text: string; border: string; dot: string }> = {
  High: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  Medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

interface RiskBadgeProps {
  severity: RiskSeverity | string;
  size?: 'sm' | 'md';
}

export function RiskBadge({ severity, size = 'sm' }: RiskBadgeProps) {
  const s = styles[severity as RiskSeverity] || styles.Low;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${s.bg} ${s.text} ${s.border} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {severity}
    </span>
  );
}
