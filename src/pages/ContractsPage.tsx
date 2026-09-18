import { FileText, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';
import { UploadArea } from '@/components/UploadArea';
import type { ContractRecord, RiskSeverity } from '@/lib/types';

interface ContractsPageProps {
  contracts: ContractRecord[];
  onFileSelected: (file: File) => void;
  onDemo: () => void;
  onSelectContract: (id: string) => void;
  onDeleteContract: (id: string) => void;
}

export function ContractsPage({
  contracts,
  onFileSelected,
  onDemo,
  onSelectContract,
  onDeleteContract,
}: ContractsPageProps) {
  const sorted = [...contracts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage your analyzed contracts
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Upload New Contract</h2>
        <UploadArea onFileSelected={onFileSelected} onDemo={onDemo} />
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-base font-semibold text-slate-500">No contracts uploaded yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Upload a PDF contract or try the demo to see the full analysis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:shadow-slate-200/50"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FileText className="h-6 w-6" />
              </div>

              <button
                onClick={() => onSelectContract(c.id)}
                className="flex-1 text-left"
              >
                <p className="font-semibold text-slate-800 group-hover:text-brand-700">
                  {c.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  <span>{c.page_count} pages</span>
                  <span>{(c.file_size / 1024).toFixed(0)} KB</span>
                  {c.analysis && (
                    <span>
                      {c.analysis.obligations.length} obligations · {c.analysis.compliance_risks.length} risks
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-3">
                {c.status === 'completed' && c.analysis ? (
                  <RiskBadge severity={c.overall_risk as RiskSeverity} size="md" />
                ) : c.status === 'analyzing' ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing
                  </span>
                ) : c.status === 'failed' ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Failed
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Pending</span>
                )}

                <button
                  onClick={() => onDeleteContract(c.id)}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete contract"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
