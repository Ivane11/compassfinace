import { useState, useRef } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useKeyboardSafeArea } from '@/hooks/useKeyboardSafeArea';
import { Transaction, Recurrence } from '@/lib/types';
import { generateId, formatFCFA, autoBudget, parseFormattedAmount, formatAmount } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowUpRight, RefreshCw, Check } from 'lucide-react';

const recurrenceLabels: Record<Recurrence, string> = {
  unique: 'Unique',
  weekly: 'Hebdo',
  monthly: 'Mensuel',
};

export default function RevenusPage() {
  const { transactions, addTransaction, removeTransaction } = useFinance();
  const incomes = transactions.filter(t => t.type === 'income');

  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState<Recurrence>('unique');
  const [showBudget, setShowBudget] = useState<Transaction | null>(null);

  // Keyboard handling for iPhone
  const { registerInput } = useKeyboardSafeArea();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleSubmit = () => {
    if (!source || !amount || Number(amount) <= 0) return;
    const tx: Transaction = {
      id: generateId(),
      type: 'income',
      source,
      amount: parseFormattedAmount(amount),
      date,
      recurrence,
      createdAt: new Date().toISOString(),
    };
    addTransaction(tx);
    setShowBudget(tx);
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

  const budget = showBudget ? autoBudget(showBudget.amount) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-section-title font-bold text-white">Revenus</h2>
        <Button
          size="sm"
          onClick={() => { setShowForm(!showForm); setShowBudget(null); }}
          className="btn-iphone-sm bg-primary text-black hover:bg-primary/90 gap-2"
        >
          <Plus size={18} /> Ajouter
        </Button>
      </div>

      {/* Budget suggestion - Glassmorphism */}
      {budget && showBudget && (
        <div className="glass-card p-5 animate-scale-in">
          <p className="text-sm font-medium text-primary mb-3">💡 Répartition suggérée pour {formatFCFA(showBudget.amount)}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl glass">
              <p className="text-sm text-muted-foreground">Besoins 50%</p>
              <p className="text-lg font-bold text-white mt-1">{formatFCFA(budget.needs)}</p>
            </div>
            <div className="p-3 rounded-xl glass">
              <p className="text-sm text-muted-foreground">Envies 30%</p>
              <p className="text-lg font-bold text-white mt-1">{formatFCFA(budget.wants)}</p>
            </div>
            <div className="p-3 rounded-xl glass">
              <p className="text-sm text-muted-foreground">Épargne 20%</p>
              <p className="text-lg font-bold text-white mt-1">{formatFCFA(budget.savings)}</p>
            </div>
          </div>
          <button onClick={() => setShowBudget(null)} className="text-sm text-muted-foreground mt-3 underline">Fermer</button>
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
            placeholder="Source (ex: Salaire)"
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
          <div className="flex gap-2">
            {(['unique', 'weekly', 'monthly'] as Recurrence[]).map(r => (
              <button
                key={r}
                onClick={() => setRecurrence(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${recurrence === r ? 'bg-primary text-black shadow-lg' : 'bg-secondary text-muted-foreground'
                  }`}
              >
                {recurrenceLabels[r]}
              </button>
            ))}
          </div>
          <Button onClick={handleSubmit} className="btn-iphone w-full bg-primary text-black hover:bg-primary/90 gap-2">
            <Check size={18} /> Confirmer
          </Button>
        </div>
      )}

      {/* List - Glassmorphism */}
      <div className="space-y-3">
        {incomes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body text-muted-foreground">Aucun revenu enregistré</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Ajoutez vos revenus pour commencer</p>
          </div>
        )}
        {incomes.map(tx => (
          <div key={tx.id} className="flex items-center justify-between glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-income/15 flex items-center justify-center">
                <ArrowUpRight size={20} className="text-income" />
              </div>
              <div>
                <p className="text-body font-medium text-white">{tx.source}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                  {tx.recurrence !== 'unique' && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <RefreshCw size={12} /> {recurrenceLabels[tx.recurrence]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-income">+{formatFCFA(tx.amount)}</span>
              <button
                onClick={() => removeTransaction(tx.id)}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-expense transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
