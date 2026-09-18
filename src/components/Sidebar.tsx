import { ShieldCheck, LayoutDashboard, FileText, ScanSearch, AlertTriangle, CalendarClock, Settings, type LucideIcon } from 'lucide-react';

export type PageId = 'dashboard' | 'contracts' | 'analysis' | 'risks' | 'deadlines' | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'analysis', label: 'Analysis', icon: ScanSearch },
  { id: 'risks', label: 'Risks', icon: AlertTriangle },
  { id: 'deadlines', label: 'Deadlines', icon: CalendarClock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  riskCount: number;
  deadlineCount: number;
}

export function Sidebar({ current, onNavigate, riskCount, deadlineCount }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">ContractGuard</h1>
          <p className="text-xs font-medium text-brand-600">AI Compliance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = current === item.id;
          const Icon = item.icon;
          const badge =
            item.id === 'risks' && riskCount > 0
              ? riskCount
              : item.id === 'deadlines' && deadlineCount > 0
              ? deadlineCount
              : null;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive
                      ? 'bg-brand-200 text-brand-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">AI-Powered Analysis</p>
          <p className="mt-1 text-xs text-slate-500">
            Evidence-backed contract intelligence
          </p>
        </div>
      </div>
    </aside>
  );
}
