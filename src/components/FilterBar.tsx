import { Search, SlidersHorizontal } from 'lucide-react';

export type SortOption = 'priority' | 'deadline' | 'severity' | 'party';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  severityFilter: string;
  onSeverityChange: (v: string) => void;
  partyFilter: string;
  onPartyChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  sortOption: SortOption;
  onSortChange: (v: SortOption) => void;
  parties: string[];
  categories: string[];
}

export function FilterBar(props: FilterBarProps) {
  const selectClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Search findings..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <select
          value={props.severityFilter}
          onChange={(e) => props.onSeverityChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={props.partyFilter}
          onChange={(e) => props.onPartyChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Parties</option>
          {props.parties.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={props.categoryFilter}
          onChange={(e) => props.onCategoryChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Categories</option>
          {props.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={props.sortOption}
          onChange={(e) => props.onSortChange(e.target.value as SortOption)}
          className={selectClass}
        >
          <option value="priority">Sort: Priority</option>
          <option value="severity">Sort: Severity</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="party">Sort: Party</option>
        </select>
      </div>
    </div>
  );
}
