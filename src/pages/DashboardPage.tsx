import { FileText, AlertTriangle, CalendarClock, ShieldCheck, TrendingUp, Clock, Upload } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskChart, getRiskDistribution } from '@/components/RiskChart';
import { UploadArea } from '@/components/UploadArea';
import type { ContractRecord, RiskSeverity } from '@/lib/types';
import type { PageId } from '@/components/Sidebar';

interface DashboardPageProps {
  contracts: ContractRecord[];
  onFileSelected: (file: File) => void;
  onDemo: () => void;
  onNavigate: (page: PageId) => void;
  onSelectContract: (id: string) => void;
}

export function DashboardPage({
  contracts,
  onFileSelected,
  onDemo,
  onNavigate,
  onSelectContract,
}: DashboardPageProps) {
  const completed = contracts.filter((c) => c.status === 'completed' && c.analysis);
  const allObligations = completed.flatMap((c) => c.analysis!.obligations);
  const allDeadlines = completed.flatMap((c) => c.analysis!.deadlines);
  const allRisks = completed.flatMap((c) => c.analysis!.compliance_risks);
  const riskDist = getRiskDistribution(allRisks);

  const recentContracts = [...contracts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcomingDeadlines = allDeadlines
    .filter((d) => d.status === 'Upcoming' && d.deadline !== 'Not specified')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered contract compliance intelligence at a glance
          </p>
        </div>
        <button
          onClick={() => onNavigate('contracts')}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md"
        >
          <Upload className="h-4 w-4" />
          Upload Contract
        </button>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Upload a New Contract</h2>
        <UploadArea onFileSelected={onFileSelected} onDemo={onDemo} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Contracts Analyzed"
          value={completed.length}
          icon={FileText}
          color="brand"
          subtitle={`${contracts.length} total uploaded`}
        />
        <StatCard
          label="Obligations Detected"
          value={allObligations.length}
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          label="Deadlines Tracked"
          value={allDeadlines.length}
          icon={CalendarClock}
          color="amber"
        />
        <StatCard
          label="Compliance Risks"
          value={allRisks.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Risk overview + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Risk Distribution</h2>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <RiskChart distribution={riskDist} />
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Overall Risk Profile</span>
              <RiskBadge
                severity={
                  riskDist.High >= 3 ? 'High' : riskDist.High >= 1 ? 'Medium' : 'Low'
                }
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Recent contracts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Recently Analyzed</h2>
            <button
              onClick={() => onNavigate('contracts')}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all →
            </button>
          </div>
          {recentContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-400">No contracts yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Upload a PDF or try the demo contract to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentContracts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectContract(c.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition-all hover:border-brand-200 hover:bg-brand-50/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()} · {c.page_count} pages
                    </p>
                  </div>
                  {c.status === 'completed' && c.analysis ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {c.analysis.obligations.length} obl · {c.analysis.compliance_risks.length} risks
                      </span>
                      <RiskBadge severity={c.overall_risk as RiskSeverity} />
                    </div>
                  ) : c.status === 'analyzing' ? (
                    <span className="text-xs font-medium text-brand-600">Analyzing...</span>
                  ) : c.status === 'failed' ? (
                    <span className="text-xs font-medium text-red-600">Failed</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Pending</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming deadlines */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Upcoming Deadlines</h2>
          <button
            onClick={() => onNavigate('deadlines')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all →
          </button>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingDeadlines.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{d.description}</p>
                  <p className="text-xs text-slate-400">{d.responsible_party}</p>
                </div>
                <span className="text-sm font-semibold text-amber-700">{d.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
