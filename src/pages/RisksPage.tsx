import { useState } from 'react';
import { AlertTriangle, Eye, ChevronDown, ChevronUp, HelpCircle, Lightbulb, User, Clock, FileText } from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { FilterBar, type SortOption } from '@/components/FilterBar';
import { RiskChart, getRiskDistribution } from '@/components/RiskChart';
import type { ContractRecord, ComplianceRisk, RiskSeverity } from '@/lib/types';

interface RisksPageProps {
  contracts: ContractRecord[];
  onSelectContract: (id: string) => void;
}

interface RiskWithContract extends ComplianceRisk {
  contractId: string;
  contractName: string;
}

export function RisksPage({ contracts, onSelectContract }: RisksPageProps) {
  const [evidenceModal, setEvidenceModal] = useState<{
    evidence: string;
    pageNumber: number | null;
    title: string;
    explanation?: string;
  } | null>(null);
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('severity');

  const completed = contracts.filter((c) => c.status === 'completed' && c.analysis);
  const allRisks: RiskWithContract[] = completed.flatMap((c) =>
    c.analysis!.compliance_risks.map((r) => ({
      ...r,
      contractId: c.id,
      contractName: c.name,
    }))
  );

  const parties = [...new Set(allRisks.map((r) => r.responsible_party))];
  const riskDist = getRiskDistribution(allRisks);
  const severityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  const filtered = allRisks.filter((r) => {
    if (search && !(r.risk_title + r.description + r.why_flagged).toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (partyFilter !== 'all' && r.responsible_party !== partyFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'severity') return severityRank[b.severity] - severityRank[a.severity];
    if (sortOption === 'party') return a.responsible_party.localeCompare(b.responsible_party);
    return 0;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Risks</h1>
        <p className="mt-1 text-sm text-slate-500">
          All detected compliance risks across your contracts, with evidence-backed reasoning
        </p>
      </div>

      {/* Risk distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Risk Distribution Overview</h2>
        <RiskChart distribution={riskDist} />
      </div>

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-400">
            {allRisks.length === 0 ? 'No compliance risks detected yet' : 'No risks match your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const expanded = expandedRisks.has(r.id);
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:shadow-slate-200/50">
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
                    <button
                      onClick={() => onSelectContract(r.contractId)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {r.contractName}
                    </button>
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

                {expanded && (
                  <div className="mt-4 space-y-4 animate-slide-up">
                    <div className="rounded-xl bg-amber-50/50 border border-amber-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <HelpCircle className="h-4 w-4" />
                        Why was this flagged?
                      </div>
                      <p className="text-sm leading-relaxed text-amber-900">{r.why_flagged}</p>
                    </div>
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
