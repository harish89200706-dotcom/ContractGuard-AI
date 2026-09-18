import { useState } from 'react';
import {
  FileText,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  ArrowLeft,
  User,
  Tag,
  Lightbulb,
} from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { FilterBar, type SortOption } from '@/components/FilterBar';
import type { ContractRecord, ComplianceRisk, Obligation, Deadline, RiskSeverity } from '@/lib/types';
import type { PageId } from '@/components/Sidebar';

interface AnalysisPageProps {
  contract: ContractRecord | null;
  onBack: (page: PageId) => void;
}

type Tab = 'overview' | 'obligations' | 'deadlines' | 'risks';

export function AnalysisPage({ contract, onBack }: AnalysisPageProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [evidenceModal, setEvidenceModal] = useState<{
    evidence: string;
    pageNumber: number | null;
    title: string;
    explanation?: string;
  } | null>(null);
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  // Filter state
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('priority');

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="mb-4 h-12 w-12 text-slate-300" />
        <p className="text-base font-semibold text-slate-500">No contract selected</p>
        <p className="mt-1 text-sm text-slate-400">
          Go to the Contracts page and select a contract to view its analysis
        </p>
        <button
          onClick={() => onBack('contracts')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Contracts
        </button>
      </div>
    );
  }

  const analysis = contract.analysis;
  const status = contract.status;

  if (status === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-base font-semibold text-slate-700">Analyzing contract...</p>
        <p className="mt-1 text-sm text-slate-400">AI is reading and extracting insights</p>
      </div>
    );
  }

  if (status === 'failed' || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-300" />
        <p className="text-base font-semibold text-slate-700">Analysis Failed</p>
        <p className="mt-1 text-sm text-slate-400">
          This contract could not be analyzed. Try uploading it again.
        </p>
        <button
          onClick={() => onBack('contracts')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </button>
      </div>
    );
  }

  // Collect filter options
  const parties = [...new Set(analysis.obligations.map((o) => o.responsible_party))];
  const categories = [...new Set(analysis.obligations.map((o) => o.category))];

  // Filtering logic
  const severityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  function matchesSearch(text: string): boolean {
    return text.toLowerCase().includes(search.toLowerCase());
  }

  const filteredObligations = analysis.obligations.filter((o) => {
    if (search && !matchesSearch(o.obligation + o.responsible_party + o.category)) return false;
    if (severityFilter !== 'all' && o.priority !== severityFilter) return false;
    if (partyFilter !== 'all' && o.responsible_party !== partyFilter) return false;
    if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'priority') return severityRank[b.priority] - severityRank[a.priority];
    if (sortOption === 'party') return a.responsible_party.localeCompare(b.responsible_party);
    if (sortOption === 'deadline') return a.deadline.localeCompare(b.deadline);
    return 0;
  });

  const filteredDeadlines = analysis.deadlines.filter((d) => {
    if (search && !matchesSearch(d.description + d.responsible_party)) return false;
    if (partyFilter !== 'all' && d.responsible_party !== partyFilter) return false;
    return true;
  });

  const filteredRisks = analysis.compliance_risks.filter((r) => {
    if (search && !matchesSearch(r.risk_title + r.description + r.why_flagged)) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (partyFilter !== 'all' && r.responsible_party !== partyFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'severity' || sortOption === 'priority') return severityRank[b.severity] - severityRank[a.severity];
    if (sortOption === 'party') return a.responsible_party.localeCompare(b.responsible_party);
    return 0;
  });

  const tabs: { id: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { id: 'overview', label: 'Overview', count: 0, icon: FileText },
    { id: 'obligations', label: 'Obligations', count: analysis.obligations.length, icon: ShieldCheck },
    { id: 'deadlines', label: 'Deadlines', count: analysis.deadlines.length, icon: Calendar },
    { id: 'risks', label: 'Compliance Risks', count: analysis.compliance_risks.length, icon: AlertTriangle },
  ];

  function toggleRisk(id: string) {
    setExpandedRisks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div>
        <button
          onClick={() => onBack('contracts')}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
      </div>

      {/* Contract meta */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Upload Date</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {new Date(contract.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Pages</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{contract.page_count}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Status</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Completed
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Overall Risk</p>
          <div className="mt-1">
            <RiskBadge severity={contract.overall_risk as RiskSeverity} size="md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-base font-semibold text-slate-800">AI Summary</h2>
            <p className="text-sm leading-relaxed text-slate-600">{analysis.summary}</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <ShieldCheck className="mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-2xl font-bold text-slate-900">{analysis.obligations.length}</p>
              <p className="text-xs text-slate-400">Obligations</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Calendar className="mb-2 h-6 w-6 text-amber-500" />
              <p className="text-2xl font-bold text-slate-900">{analysis.deadlines.length}</p>
              <p className="text-xs text-slate-400">Deadlines</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <AlertTriangle className="mb-2 h-6 w-6 text-red-500" />
              <p className="text-2xl font-bold text-slate-900">{analysis.compliance_risks.length}</p>
              <p className="text-xs text-slate-400">Compliance Risks</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <User className="mb-2 h-6 w-6 text-brand-500" />
              <p className="text-2xl font-bold text-slate-900">{parties.length}</p>
              <p className="text-xs text-slate-400">Responsible Parties</p>
            </div>
          </div>

          {/* Top risks preview */}
          {analysis.compliance_risks.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">Top Compliance Risks</h2>
              <div className="space-y-3">
                {analysis.compliance_risks
                  .sort((a, b) => severityRank[b.severity] - severityRank[a.severity])
                  .slice(0, 3)
                  .map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <RiskBadge severity={r.severity} />
                            {r.inferred && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                <Lightbulb className="h-3 w-3" /> Inferred
                              </span>
                            )}
                          </div>
                          <p className="mt-2 font-semibold text-slate-800">{r.risk_title}</p>
                          <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                        </div>
                        <button
                          onClick={() =>
                            setEvidenceModal({
                              evidence: r.evidence,
                              pageNumber: r.page_number,
                              title: r.risk_title,
                              explanation: r.why_flagged,
                            })
                          }
                          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Evidence
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'obligations' && (
        <div className="space-y-4 animate-fade-in">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            partyFilter={partyFilter}
            onPartyChange={setPartyFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            parties={parties}
            categories={categories}
          />
          {filteredObligations.length === 0 ? (
            <EmptyState message="No obligations match your filters" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Obligation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Responsible Party</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deadline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredObligations.map((o: Obligation) => (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{o.obligation}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{o.responsible_party}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{o.deadline}</td>
                      <td className="px-4 py-3"><RiskBadge severity={o.priority} /></td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          <Tag className="h-3 w-3" />
                          {o.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            setEvidenceModal({
                              evidence: o.evidence,
                              pageNumber: o.page_number,
                              title: o.obligation,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'deadlines' && (
        <div className="space-y-4 animate-fade-in">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            severityFilter="all"
            onSeverityChange={() => {}}
            partyFilter={partyFilter}
            onPartyChange={setPartyFilter}
            categoryFilter="all"
            onCategoryChange={() => {}}
            sortOption={sortOption}
            onSortChange={setSortOption}
            parties={parties}
            categories={[]}
          />
          {filteredDeadlines.length === 0 ? (
            <EmptyState message="No deadlines match your filters" />
          ) : (
            <div className="space-y-3">
              {filteredDeadlines.map((d: Deadline) => (
                <div
                  key={d.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:shadow-slate-200/50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{d.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Party: {d.responsible_party}</span>
                      <span>Deadline: {d.deadline}</span>
                      <span className={`font-semibold ${
                        d.status === 'Overdue' ? 'text-red-600' :
                        d.status === 'Upcoming' ? 'text-amber-600' :
                        d.status === 'Completed' ? 'text-emerald-600' :
                        'text-slate-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setEvidenceModal({
                        evidence: d.evidence,
                        pageNumber: d.page_number,
                        title: d.description,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Evidence
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'risks' && (
        <div className="space-y-4 animate-fade-in">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            partyFilter={partyFilter}
            onPartyChange={setPartyFilter}
            categoryFilter="all"
            onCategoryChange={() => {}}
            sortOption={sortOption}
            onSortChange={setSortOption}
            parties={parties}
            categories={[]}
          />
          {filteredRisks.length === 0 ? (
            <EmptyState message="No compliance risks match your filters" />
          ) : (
            <div className="space-y-3">
              {filteredRisks.map((r: ComplianceRisk) => {
                const expanded = expandedRisks.has(r.id);
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:shadow-slate-200/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <RiskBadge severity={r.severity} size="md" />
                          {r.inferred && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
                              <Lightbulb className="h-3 w-3" />
                              AI Inferred
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900">{r.risk_title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                      </div>
                      <button
                        onClick={() => toggleRisk(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Why flagged?
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {r.responsible_party}
                      </span>
                      {r.relevant_deadline !== 'Not specified' && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {r.relevant_deadline}
                        </span>
                      )}
                    </div>

                    {/* Why flagged expansion */}
                    {expanded && (
                      <div className="mt-4 space-y-4 animate-slide-up">
                        {/* Why flagged */}
                        <div className="rounded-xl bg-amber-50/50 border border-amber-200 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                            <HelpCircle className="h-4 w-4" />
                            Why was this flagged?
                          </div>
                          <p className="text-sm leading-relaxed text-amber-900">{r.why_flagged}</p>
                        </div>

                        {/* Evidence */}
                        <div className="rounded-xl border-l-4 border-brand-500 bg-brand-50/50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-800">
                            <Eye className="h-4 w-4" />
                            Source Evidence
                            {r.page_number !== null && (
                              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                                Page {r.page_number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700">{r.evidence}</p>
                        </div>
                      </div>
                    )}

                    {/* Evidence button always visible */}
                    {!expanded && (
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            setEvidenceModal({
                              evidence: r.evidence,
                              pageNumber: r.page_number,
                              title: r.risk_title,
                              explanation: r.why_flagged,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Evidence
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Evidence modal */}
      {evidenceModal && (
        <EvidenceViewer
          evidence={evidenceModal.evidence}
          pageNumber={evidenceModal.pageNumber}
          findingTitle={evidenceModal.title}
          explanation={evidenceModal.explanation}
          onClose={() => setEvidenceModal(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
      <FileText className="mb-3 h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
