import { useFinance } from '@/hooks/useFinance';
import { balance, totalIncome, totalExpenses, autoBudget, weeklyBalanceData, formatFCFA } from '@/lib/finance';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { transactions, firstName } = useFinance();
  const bal = balance(transactions);
  const inc = totalIncome(transactions);
  const exp = totalExpenses(transactions);
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
    <div className="space-y-5 animate-fade-in">
      {/* Welcome Greeting */}
      <div className="animate-slide-up">
        <h2 className="text-giant-title text-white">
          {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
        </h2>
        <p className="text-body text-muted-foreground mt-1">
          Voici un aperçu de vos finances
        </p>
      </div>

      {/* Giant Balance Card - Glassmorphism */}
      <div className="glass-card p-6 animate-scale-in">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
          <Wallet size={18} />
          <span>Solde Total</span>
        </div>
        <p className={`text-financial-large font-black tracking-tight ${bal >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatFCFA(bal)}
        </p>
        <div className="flex gap-6 mt-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-income/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-income" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenus</p>
              <p className="text-lg font-bold text-income">{formatFCFA(inc)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-expense/10 flex items-center justify-center">
              <TrendingDown size={18} className="text-expense" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dépenses</p>
              <p className="text-lg font-bold text-expense">{formatFCFA(exp)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Area Chart - Glassmorphism */}
      <div className="glass-card p-5">
        <h3 className="text-card-title font-semibold text-white mb-4">Évolution (7 jours)</h3>
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
        <div className="glass-card p-5">
          <h3 className="text-card-title font-semibold text-white mb-4">Répartition 50/30/20</h3>
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
      <div className="glass-card p-5">
        <h3 className="text-card-title font-semibold text-white mb-4">Dernières transactions</h3>
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
