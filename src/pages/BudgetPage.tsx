import { useState, useRef } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useKeyboardSafeArea } from '@/hooks/useKeyboardSafeArea';
import { Transaction, Recurrence, CATEGORY_LABELS } from '@/lib/types';
import { generateId, formatFCFA, totalIncome, totalExpenses, categorySpending, monthlyComparison, predictEndOfMonth, autoBudget, parseFormattedAmount, formatAmount } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowDownRight, TrendingDown, Check, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

// SVG Progress Ring
function ProgressRing({ percent, color, size = 64, strokeWidth = 5 }: { percent: number; color: string; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(0,0%,14%)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export default function BudgetPage() {
  const { transactions, addTransaction, removeTransaction, togglePaid, categories } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('autre');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState<Recurrence>('unique');

  // Keyboard handling for iPhone
  const { registerInput } = useKeyboardSafeArea();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const expenses = transactions.filter(t => t.type === 'expense');
  const inc = totalIncome(transactions);
  const spending = categorySpending(transactions);
  const comparison = monthlyComparison(transactions);
  const predicted = predictEndOfMonth(transactions);
  const budget = autoBudget(inc);
  const needsBudget = budget.needs;

  const handleSubmit = () => {
    if (!source || !amount || Number(amount) <= 0) return;
    const tx: Transaction = {
      id: generateId(),
      type: 'expense',
      source,
      amount: parseFormattedAmount(amount),
      category,
      date,
      recurrence,
      createdAt: new Date().toISOString(),
      isPaid: false,
    };
    addTransaction(tx);
    setSource('');
    setAmount('');
    setShowForm(false);
  };

  // Format amount input with spaces for thousands
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw) {
      setAmount(formatAmount(parseInt(raw, 10)));
    } else {
      setAmount('');
    }
  };

  const categoryColors: Record<string, string> = {
    loyer: 'hsl(0,72%,70%)',
    internet: 'hsl(210,80%,65%)',
    transport: 'hsl(40,96%,64%)',
    nourriture: 'hsl(136,66%,50%)',
    sante: 'hsl(330,70%,60%)',
    education: 'hsl(270,60%,65%)',
    loisirs: 'hsl(180,60%,50%)',
    vetements: 'hsl(30,80%,60%)',
    epargne: 'hsl(150,60%,50%)',
    autre: 'hsl(0,0%,50%)',
  };

  // Get label for a category (supports custom categories)
  const getCategoryLabel = (catId: string) => {
    const customCat = categories.find(c => c.id === catId);
    if (customCat) return customCat.name;
    return CATEGORY_LABELS[catId] || catId;
  };

  // Calculate totals for checklist
  const totalExpensesAmount = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const paidExpenses = expenses.filter(tx => tx.isPaid);
  const paidAmount = paidExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const unpaidAmount = totalExpensesAmount - paidAmount;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-section-title font-bold text-white">Dépenses</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="btn-iphone-sm bg-primary text-black hover:bg-primary/90 gap-2"
        >
          <Plus size={18} /> Dépense
        </Button>
      </div>

      {/* Total des dépenses - Glassmorphism */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Synthèse des dépenses</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-expense/10 border border-expense/20 p-3 rounded-xl">
            <p className="text-xs text-expense/80 uppercase font-bold tracking-wider mb-1">Total Payé</p>
            <p className="text-2xl font-bold text-expense">{formatFCFA(predicted)}</p>
            <p className="text-xs text-muted-foreground mt-1">Dépenses effectuées</p>
          </div>
          <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl">
            <p className="text-xs text-warning/80 uppercase font-bold tracking-wider mb-1">Prévu</p>
            <p className="text-2xl font-bold text-warning">{formatFCFA(unpaidAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">À payer ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Checklist Accordion - Glassmorphism */}
      {expenses.length > 0 && (
        <div className="glass-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <ListChecks size={22} className="text-primary" />
              <div>
                <p className="text-lg font-semibold text-white">Ma Check-list de suivi</p>
                <p className="text-sm text-muted-foreground">
                  {paidExpenses.length}/{expenses.length} dépenses payées
                </p>
              </div>
            </div>
            {showChecklist ? (
              <ChevronUp size={24} className="text-primary" />
            ) : (
              <ChevronDown size={24} className="text-muted-foreground" />
            )}
          </button>

          {showChecklist && (
            <div className="px-5 pb-5 space-y-4 animate-scale-in">
              {/* Summary */}
              <div className="flex justify-between items-center p-4 rounded-xl glass">
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground">Total payé</p>
                  <p className="text-lg font-bold text-income">{formatFCFA(paidAmount)}</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground">Reste à payer</p>
                  <p className="text-lg font-bold text-expense">{formatFCFA(unpaidAmount)}</p>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {expenses.map(tx => (
                  <label
                    key={tx.id}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${tx.isPaid ? 'glass bg-income/5' : 'glass hover:bg-white/5'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={tx.isPaid || false}
                      onChange={() => togglePaid(tx.id)}
                      className="w-6 h-6 rounded-md accent-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`text-lg font-medium ${tx.isPaid ? 'line-through text-muted-foreground' : 'text-white'}`}>
                        {tx.source}
                      </p>
                      <p className={`text-sm ${tx.isPaid ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        {getCategoryLabel(tx.category || 'autre')} · {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`text-xl font-bold ${tx.isPaid ? 'text-income' : 'text-expense'}`}>
                      {tx.isPaid && '✓ '}{formatFCFA(tx.amount)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form - iPhone keyboard optimized - Glassmorphism */}
      {showForm && (
        <div className="glass-card p-5 space-y-4 animate-scale-in">
          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('source', el);
              registerInput(el);
            }}
            placeholder="Libellé (ex: Loyer mars)"
            value={source}
            onChange={e => setSource(e.target.value)}
            className="input-iphone bg-secondary border-none"
            onFocus={() => registerInput(inputRefs.current.get('source') || null)}
          />
          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('amount', el);
              registerInput(el);
            }}
            type="text"
            inputMode="numeric"
            placeholder="Montant (FCFA)"
            value={amount}
            onChange={handleAmountChange}
            className="input-iphone bg-secondary border-none"
            onFocus={() => registerInput(inputRefs.current.get('amount') || null)}
          />

          {/* Category Grid - Scrollable */}
          <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${category === cat.id
                    ? 'bg-primary text-black shadow-lg'
                    : 'bg-secondary text-muted-foreground'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <Input
            ref={(el) => {
              if (el) inputRefs.current.set('date', el);
              registerInput(el);
            }}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-iphone bg-secondary border-none"
            onFocus={() => registerInput(inputRefs.current.get('date') || null)}
          />

          <Button onClick={handleSubmit} className="btn-iphone w-full bg-primary text-black hover:bg-primary/90 gap-2">
            <Check size={18} /> Confirmer
          </Button>
        </div>
      )}

      {/* Progress Rings - Glassmorphism */}
      {spending.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-card-title font-semibold text-white mb-4">Dépenses par catégorie</h3>
          <div className="grid grid-cols-3 gap-5">
            {spending.sort((a, b) => b.spent - a.spent).slice(0, 6).map(s => {
              const pct = needsBudget > 0 ? (s.spent / needsBudget) * 100 : 0;
              const color = categoryColors[s.category] || 'hsl(0,0%,50%)';
              return (
                <div key={s.category} className="flex flex-col items-center">
                  <div className="relative">
                    <ProgressRing percent={pct} color={color} size={70} strokeWidth={6} />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{Math.round(pct)}%</span>
                  </div>
                  <p className="text-sm font-medium mt-2 text-white">{getCategoryLabel(s.category)}</p>
                  <p className="text-xs text-muted-foreground">{formatFCFA(s.spent)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Comparison - Glassmorphism */}
      <div className="glass-card p-5">
        <h3 className="text-card-title font-semibold text-white mb-4">Comparaison mensuelle</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid var(--glass-border)', borderRadius: 16, fontSize: 14 }}
                formatter={(v: number, name: string) => [formatFCFA(v), name === 'income' ? 'Revenus' : 'Dépenses']}
              />
              <Bar dataKey="income" fill="hsl(var(--income))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(var(--expense))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List - Glassmorphism */}
      <div className="glass-card p-5">
        <h3 className="text-card-title font-semibold text-white mb-4">Toutes les dépenses</h3>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body text-muted-foreground">Aucune dépense</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Ajoutez vos dépenses pour suivre votre budget</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl glass">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => togglePaid(tx.id)}
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90 ${tx.isPaid
                        ? 'bg-income border-income text-black'
                        : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                  >
                    {tx.isPaid && <Check size={18} />}
                  </button>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tx.isPaid ? 'bg-income/10' : 'bg-expense/15'
                    }`}>
                    <ArrowDownRight size={20} className={tx.isPaid ? 'text-income' : 'text-expense'} />
                  </div>
                  <div>
                    <p className={`text-body font-medium ${tx.isPaid ? 'line-through text-muted-foreground' : 'text-white'}`}>{tx.source}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(tx.category || 'autre')} · {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${tx.isPaid ? 'text-income' : 'text-expense'}`}>
                    {tx.isPaid ? '✓ ' : '-'}{formatFCFA(tx.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTransaction(tx.id)}
                    className="w-10 h-10 p-2 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-expense transition-colors active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
