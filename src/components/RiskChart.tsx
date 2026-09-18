import type { RiskSeverity } from '@/lib/types';

interface RiskDistribution {
  High: number;
  Medium: number;
  Low: number;
}

interface RiskChartProps {
  distribution: RiskDistribution;
}

export function RiskChart({ distribution }: RiskChartProps) {
  const total = distribution.High + distribution.Medium + distribution.Low;
  const segments = [
    { label: 'High', value: distribution.High, color: 'bg-red-500', text: 'text-red-600' },
    { label: 'Medium', value: distribution.Medium, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Low', value: distribution.Low, color: 'bg-emerald-500', text: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {total === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-slate-400">No risks detected</span>
          </div>
        ) : (
          segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={seg.label}
                className={`${seg.color} transition-all duration-700 ease-out`}
                style={{ width: `${pct}%` }}
                title={`${seg.label}: ${seg.value}`}
              />
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-2">
            <span className={`text-2xl font-bold ${seg.text}`}>{seg.value}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className={`h-2 w-2 rounded-full ${seg.color}`} />
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function getRiskDistribution(
  risks: { severity: RiskSeverity | string }[]
): RiskDistribution {
  return {
    High: risks.filter((r) => r.severity === 'High').length,
    Medium: risks.filter((r) => r.severity === 'Medium').length,
    Low: risks.filter((r) => r.severity === 'Low').length,
  };
}
