import React from 'react';
import { useFinance } from '@/hooks/useFinance';
import { calculateFinancialScore } from '@/lib/intelligence';
import { Activity } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ScoreRingContent() {
  const { transactions } = useFinance();
  const score = calculateFinancialScore(transactions);

  // Determine color based on score
  let scoreColor = 'text-primary';
  let ringColor = 'stroke-primary';
  let message = 'Excellente gestion !';
  
  if (score < 40) {
    scoreColor = 'text-expense';
    ringColor = 'stroke-expense';
    message = 'Attention à vos dépenses.';
  } else if (score < 70) {
    scoreColor = 'text-warning';
    ringColor = 'stroke-warning';
    message = 'Vous êtes sur la bonne voie.';
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-5 border border-white/5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1 opacity-80">
          <Activity size={16} className={scoreColor} />
          <h3 className="text-xs uppercase font-bold tracking-wider">Score Financier</h3>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span className={`absolute text-2xl font-black ${scoreColor}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

export default function FinancialScoreRing() {
  return (
    <ErrorBoundary>
      <ScoreRingContent />
    </ErrorBoundary>
  );
}
