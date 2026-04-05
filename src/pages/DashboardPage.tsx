import { useFinance } from '@/hooks/useFinance';
import { balance, totalIncome, totalExpenses, plannedExpenses, autoBudget, weeklyBalanceData, formatFCFA } from '@/lib/finance';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SmartInsights from '@/components/dashboard/SmartInsights';
import FinancialScoreRing from '@/components/dashboard/FinancialScoreRing';

export default function DashboardPage() {
  const { transactions, firstName } = useFinance();
  const bal = balance(transactions);
  const inc = totalIncome(transactions);
  const exp = totalExpenses(transactions);
  const plannedExp = plannedExpenses(transactions);
  const budget = autoBudget(inc);
  const chartData = weeklyBalanceData(transactions);
  const recent = transactions.slice(0, 5);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Greeting with futuristic gradient text */}
      <div className="animate-slide-up bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
        <h2 className="text-giant-title">
          {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
        </h2>
        <p className="text-body text-white mt-1">
          Votre interface financière intelligente
        </p>
      </div>

      {/* Giant Balance Card - Futuristic Glow Effect */}
      <div className="glass-card relative overflow-hidden p-6 animate-scale-in border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.15)] group">
        {/* Animated background flare */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-700 animate-pulse-glow" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary/80 text-sm font-semibold tracking-wider uppercase mb-2">
            <Wallet size={18} />
            <span>Solde Disponible</span>
          </div>
          <p className={`text-financial-large font-black tracking-tight drop-shadow-md ${bal >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatFCFA(bal)}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <TrendingUp size={14} className="text-income" /> Revenus
              </div>
              <p className="text-base font-extrabold text-income">{formatFCFA(inc)}</p>
            </div>
            
            <div className="flex flex-col gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <TrendingDown size={14} className="text-expense" /> Payé
              </div>
              <p className="text-base font-extrabold text-expense">{formatFCFA(exp)}</p>
            </div>

            <div className="flex flex-col gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Clock size={14} className="text-warning" /> Prévu
              </div>
              <p className="text-base font-extrabold text-warning">{formatFCFA(plannedExp)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Alerts & Suggestions (IA Module) */}
      <SmartInsights />

      {/* Financial Score Ring (IA Module) */}
      <FinancialScoreRing />

      {/* Area Chart - Glassmorphism */}
      <div className="glass-card p-5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-card-title font-semibold text-white mb-4 relative z-10 flex items-center gap-2">
          Évolution (7 jours)
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid var(--glass-border)', borderRadius: 16, fontSize: 14 }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                formatter={(v: number) => [formatFCFA(v), 'Solde']}
              />
              <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#balGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 50/30/20 Budget - Glassmorphism */}
      {inc > 0 && (
        <div className="glass-card p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <h3 className="text-card-title font-semibold text-white mb-4 relative z-10 flex items-center gap-2">
            Répartition 50/30/20
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">IA</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Besoins', value: budget.needs, pct: 50, color: 'bg-primary' },
              { label: 'Envies', value: budget.wants, pct: 30, color: 'bg-warning' },
              { label: 'Épargne', value: budget.savings, pct: 20, color: 'bg-income' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <div className={`h-2 rounded-full ${b.color} mb-3`} />
                <p className="text-sm text-muted-foreground">{b.label}</p>
                <p className="text-base font-bold text-white mt-1">{formatFCFA(b.value)}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">({b.pct}%)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions - Glassmorphism */}
      <div className="glass-card p-5 hover:border-primary/10 transition-all duration-500">
        <h3 className="text-card-title font-semibold text-white mb-4 flex items-center justify-between">
          <span>Activité Récente</span>
          <div className="flex gap-1.5">
            <div className="w-1 h-3 bg-primary/40 rounded-full" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0ms infinite' }} />
            <div className="w-1 h-4 bg-primary/70 rounded-full" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 150ms infinite' }} />
            <div className="w-1 h-2 bg-primary rounded-full" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 300ms infinite' }} />
          </div>
        </h3>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body text-muted-foreground">Aucune transaction</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Ajoutez vos revenus et dépenses pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl glass">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-income/15' : 'bg-expense/15'}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={20} className="text-income" /> : <ArrowDownRight size={20} className="text-expense" />}
                  </div>
                  <div>
                    <p className="text-body font-medium text-white">{tx.source}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatFCFA(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
