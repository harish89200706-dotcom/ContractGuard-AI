import { Settings, ShieldCheck, Brain, Database, Zap, Info } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your ContractGuard AI preferences
        </p>
      </div>

      {/* AI Engine */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">AI Analysis Engine</h2>
            <p className="text-sm text-slate-500">How contracts are analyzed</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Analysis Mode</p>
              <p className="mt-1 text-xs text-slate-500">
                Rule-based analysis is active. When an OpenAI API key is configured as an edge function secret, the system automatically upgrades to GPT-4o-powered analysis.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Evidence-Backed Findings</p>
              <p className="mt-1 text-xs text-slate-500">
                Every finding includes the exact contract clause that supports it
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Always On
            </span>
          </div>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Data & Storage</h2>
            <p className="text-sm text-slate-500">Where your contract data is stored</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Storage Backend</p>
              <p className="mt-1 text-xs text-slate-500">
                Contracts and analysis results are stored in your Supabase database
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">Supabase</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Max File Size</p>
              <p className="mt-1 text-xs text-slate-500">Maximum PDF upload size</p>
            </div>
            <span className="text-xs font-medium text-slate-400">20 MB</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">About ContractGuard AI</h2>
            <p className="text-sm text-slate-500">AI-powered contract compliance intelligence</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Zap className="h-4 w-4 text-brand-500" />
            How it works
          </div>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">1.</span>
              Upload a PDF contract or try the demo
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">2.</span>
              Text is extracted from the PDF and sent to the AI analysis engine
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">3.</span>
              AI identifies obligations, deadlines, responsibilities, and compliance risks
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">4.</span>
              Every finding includes the exact contract clause as evidence
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">5.</span>
              Review the "Why was this flagged?" explanation for each risk
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
