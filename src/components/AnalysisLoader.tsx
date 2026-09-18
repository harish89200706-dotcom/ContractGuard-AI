import { ScanSearch, FileText, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisLoaderProps {
  stage: number;
}

const stages = [
  { icon: FileText, label: 'Extracting text from document', desc: 'Reading and parsing contract pages' },
  { icon: ScanSearch, label: 'Scanning contractual clauses', desc: 'Identifying obligations and responsibilities' },
  { icon: Brain, label: 'AI analyzing compliance risks', desc: 'Cross-referencing with compliance patterns' },
  { icon: AlertTriangle, label: 'Detecting deadlines and risk priorities', desc: 'Evaluating severity and evidence' },
  { icon: CheckCircle, label: 'Compiling structured analysis', desc: 'Preparing your evidence-backed report' },
];

export function AnalysisLoader({ stage }: AnalysisLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-3">
        {stages.map((s, i) => {
          const isDone = i < stage;
          const isActive = i === stage;
          const Icon = s.icon;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-500 ${
                isActive
                  ? 'border-brand-200 bg-brand-50 shadow-sm'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white opacity-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-100 text-brand-600 animate-pulse-soft'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isActive ? 'text-brand-700' : isDone ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
              {isDone && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {isActive && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
