import { useState } from 'react';
import { CalendarClock, Eye, FileText, Clock, User, AlertCircle } from 'lucide-react';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { FilterBar, type SortOption } from '@/components/FilterBar';
import type { ContractRecord, Deadline } from '@/lib/types';

interface DeadlinesPageProps {
  contracts: ContractRecord[];
  onSelectContract: (id: string) => void;
}

interface DeadlineWithContract extends Deadline {
  contractId: string;
  contractName: string;
}

export function DeadlinesPage({ contracts, onSelectContract }: DeadlinesPageProps) {
  const [evidenceModal, setEvidenceModal] = useState<{
    evidence: string;
    pageNumber: number | null;
    title: string;
  } | null>(null);

  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('deadline');

  const completed = contracts.filter((c) => c.status === 'completed' && c.analysis);
  const allDeadlines: DeadlineWithContract[] = completed.flatMap((c) =>
    c.analysis!.deadlines.map((d) => ({
      ...d,
      contractId: c.id,
      contractName: c.name,
    }))
  );

  const parties = [...new Set(allDeadlines.map((d) => d.responsible_party))];

  const filtered = allDeadlines.filter((d) => {
    if (search && !(d.description + d.responsible_party + d.deadline).toLowerCase().includes(search.toLowerCase())) return false;
    if (partyFilter !== 'all' && d.responsible_party !== partyFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'deadline') return a.deadline.localeCompare(b.deadline);
    if (sortOption === 'party') return a.responsible_party.localeCompare(b.responsible_party);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deadlines</h1>
        <p className="mt-1 text-sm text-slate-500">
          All contractual deadlines across your analyzed contracts
        </p>
      </div>

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <CalendarClock className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-400">
            {allDeadlines.length === 0 ? 'No deadlines detected yet' : 'No deadlines match your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
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
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {d.responsible_party}
                  </span>
                  <span className="font-semibold text-amber-700">{d.deadline}</span>
                  <span className={`font-semibold ${
                    d.status === 'Overdue' ? 'text-red-600' :
                    d.status === 'Upcoming' ? 'text-amber-600' :
                    d.status === 'Completed' ? 'text-emerald-600' :
                    'text-slate-400'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <button
                  onClick={() => onSelectContract(d.contractId)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <FileText className="h-3 w-3" />
                  {d.contractName}
                </button>
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

      {evidenceModal && (
        <EvidenceViewer
          evidence={evidenceModal.evidence}
          pageNumber={evidenceModal.pageNumber}
          findingTitle={evidenceModal.title}
          onClose={() => setEvidenceModal(null)}
        />
      )}
    </div>
  );
}
