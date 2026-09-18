import { X, FileText, Quote, ArrowRight } from 'lucide-react';

interface EvidenceViewerProps {
  evidence: string;
  pageNumber: number | null;
  explanation?: string;
  findingTitle: string;
  onClose: () => void;
}

export function EvidenceViewer({
  evidence,
  pageNumber,
  explanation,
  findingTitle,
  onClose,
}: EvidenceViewerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Source Evidence</h3>
              <p className="text-sm text-slate-500">{findingTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-6 py-5">
          {/* Page reference */}
          {pageNumber !== null && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              <FileText className="h-4 w-4" />
              Page {pageNumber}
            </div>
          )}

          {/* Evidence text */}
          <div className="rounded-xl border-l-4 border-brand-500 bg-brand-50/50 p-4">
            <p className="text-sm leading-relaxed text-slate-700">{evidence}</p>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ArrowRight className="h-4 w-4 text-brand-500" />
                How this evidence supports the finding
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
