import { Transaction } from './types';
import { totalExpenses, totalIncome, categorySpending, plannedExpenses, autoBudget } from './finance';

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
}

export interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potentialSavings?: number;
}

/**
 * Calcule un score financier de 0 à 100
 * Basé principalement sur la ratio de dépenses réelles par rapport aux revenus,
 * ainsi que l'impact du budget prévu.
 */
export function calculateFinancialScore(transactions: Transaction[]): number {
  const inc = totalIncome(transactions);
  const exp = totalExpenses(transactions);
  const planned = plannedExpenses(transactions);
  
  // Si aucun revenu
  if (inc === 0) {
    return (exp === 0 && planned === 0) ? 100 : 10; 
  }
  
  let score = 100;
  
  const totalCommitments = exp + planned;
  const debtRatio = totalCommitments / inc;
  
  // Règle des 50/30/20 (en simplifié: si les dépenses dépassent 80%, le score chute)
  if (debtRatio > 1) {
    score -= 60; // Dépensé ou prévu de dépenser plus que gagné
  } else if (debtRatio > 0.8) {
    score -= 30; // Budget très serré
  } else if (debtRatio > 0.5) {
    score -= 10; // Bonne maîtrise
  }
  
  // Bonus d'épargne: Si on dépense moins de 50%, c'est excellent
  if (debtRatio < 0.5) {
    score = Math.min(100, score + 10);
  }

  // Bonus: si aucune dépense en retard ou lourde
  if (planned > inc * 0.5) {
    score -= 10; // Trop de dépenses prévues mais pas encore payées
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Génère des alertes à afficher pour prévenir l'utilisateur de risques financiers
 */
export function generateSmartAlerts(transactions: Transaction[]): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  const inc = totalIncome(transactions);
  const exp = totalExpenses(transactions);
  const planned = plannedExpenses(transactions);
  const totalCommitments = exp + planned;

  if (inc > 0 && totalCommitments > inc) {
    alerts.push({
      id: 'alert-over-budget',
      type: 'danger',
      title: 'Dépassement Budgétaire',
      message: `Attention, vos dépenses payées et prévues (${totalCommitments} FCFA) dépassent vos revenus.`
    });
  } else if (inc > 0 && totalCommitments > inc * 0.85) {
    alerts.push({
      id: 'alert-near-limit',
      type: 'warning',
      title: 'Budget Presque Épuisé',
      message: 'Vous avez engagé plus de 85% de vos revenus ce mois-ci.'
    });
  }

  if (planned > 0 && exp === 0) {
    alerts.push({
      id: 'alert-unpaid',
      type: 'info',
      title: 'Factures en Attente',
      message: 'N\'oubliez pas de barrer (cocher) vos dépenses lorsqu\'elles sont réglées.'
    });
  }

  return alerts;
}

/**
 * Analyse les catégories pour suggérer des économies intelligentes
 */
export function generateSavingsSuggestions(transactions: Transaction[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const spending = categorySpending(transactions);
  const inc = totalIncome(transactions);
  const budgetLimits = autoBudget(inc);
  
  // Identifier les dépenses loisirs élevées
  const loisirs = spending.find(s => s.category === 'loisirs');
  if (loisirs && inc > 0 && loisirs.spent > budgetLimits.wants) {
    suggestions.push({
      id: 'sug-loisirs',
      category: 'loisirs',
      title: 'Réduisez vos loisirs',
      description: 'Vos dépenses liées aux loisirs ont dépassé la proportion saine recommandée (30%).',
      impact: 'high',
      potentialSavings: loisirs.spent - budgetLimits.wants
    });
  }
  
  // Transports
  const transport = spending.find(s => s.category === 'transport');
  if (transport && inc > 0 && transport.spent > inc * 0.15) {
    suggestions.push({
      id: 'sug-transport',
      category: 'transport',
      title: 'Optimisation des transports',
      description: 'Le transport pèse lourd dans votre budget (>15%). Envisagez le covoiturage ou des abonnements.',
      impact: 'medium'
    });
  }
  
  // Nourriture
  const nourriture = spending.find(s => s.category === 'nourriture');
  if (nourriture && inc > 0 && nourriture.spent > inc * 0.25) {
    suggestions.push({
      id: 'sug-nourriture',
      category: 'nourriture',
      title: 'Alimentation coûteuse',
      description: 'Vous dépensez plus d\'1/4 de vos revenus en nourriture. Privilégiez les repas faits maison.',
      impact: 'medium'
    });
  }

  // Épargne inexistante
  const epargne = spending.find(s => s.category === 'epargne');
  if (!epargne || epargne.spent < inc * 0.1) {
    suggestions.push({
      id: 'sug-epargne',
      category: 'epargne',
      title: 'Payez-vous en premier',
      description: 'Essayez de mettre de côté au moins 10% de chaque revenu dès réception.',
      impact: 'high'
    });
  }

  return suggestions.slice(0, 3); // Retourner seulement les top 3 pour ne pas surcharger l'UI
}
