import { Home, ArrowDownLeft, ArrowUpRight, Settings, LucideIcon } from 'lucide-react';

type Tab = 'dashboard' | 'revenus' | 'depenses' | 'settings';

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
  { id: 'revenus', label: 'Revenus', icon: ArrowDownLeft },
  { id: 'depenses', label: 'Dépenses', icon: ArrowUpRight },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] glass-nav z-50 safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 min-w-[64px] transition-all duration-200 rounded-xl ${active === id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-white/80'
              }`}
          >
            <Icon size={22} strokeWidth={active === id ? 2.5 : 2} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { Tab };
