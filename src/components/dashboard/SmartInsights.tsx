import React from 'react';
import { Lightbulb, AlertTriangle, Info, TrendingDown, Target } from 'lucide-react';
import { generateSmartAlerts, generateSavingsSuggestions } from '@/lib/intelligence';
import { useFinance } from '@/hooks/useFinance';
import { formatFCFA } from '@/lib/finance';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function SmartInsightsContent() {
  const { transactions } = useFinance();
  const alerts = generateSmartAlerts(transactions);
  const suggestions = generateSavingsSuggestions(transactions);

  if (alerts.length === 0 && suggestions.length === 0) {
    return null; // Rien à afficher, le composant se replie
  }

  return (
    <div className="space-y-4 mb-6">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-xl border flex gap-3 ${
                alert.type === 'danger' 
                  ? 'bg-expense/10 border-expense/30 text-expense' 
                  : alert.type === 'warning'
                  ? 'bg-warning/10 border-warning/30 text-warning'
                  : 'bg-primary/10 border-primary/30 text-primary'
              }`}
            >
              {alert.type === 'danger' ? <AlertTriangle size={24} /> : alert.type === 'warning' ? <TrendingDown size={24} /> : <Info size={24} />}
              <div>
                <h4 className="font-bold text-sm">{alert.title}</h4>
                <p className="text-xs opacity-90 mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="glass-card p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <Lightbulb size={20} />
            <h3 className="font-semibold text-sm tracking-wide uppercase">Coup de Pouce IA</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map(sug => (
              <div key={sug.id} className="relative pl-4 border-l-2 border-primary/40">
                <h4 className="text-sm font-semibold text-white">{sug.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sug.description}</p>
                {sug.potentialSavings && sug.potentialSavings > 0 ? (
                  <p className="text-xs font-bold text-income mt-1">
                    Économie estimée : {formatFCFA(sug.potentialSavings)} / mois
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SmartInsights() {
  return (
    <ErrorBoundary>
      <SmartInsightsContent />
    </ErrorBoundary>
  );
}
