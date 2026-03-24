export type Recurrence = 'unique' | 'weekly' | 'monthly';

export type TransactionType = 'income' | 'expense';

// Base categories that users can extend
export type BaseExpenseCategory = 
  | 'loyer'
  | 'internet'
  | 'transport'
  | 'nourriture'
  | 'sante'
  | 'education'
  | 'loisirs'
  | 'vetements'
  | 'epargne'
  | 'autre';

// Custom category type that allows any string (for user-created categories)
export type ExpenseCategory = BaseExpenseCategory | string;

export interface Transaction {
  id: string;
  type: TransactionType;
  source: string;
  amount: number;
  category?: ExpenseCategory;
  date: string; // ISO string
  recurrence: Recurrence;
  createdAt: string;
  isPaid?: boolean; // For expense tracking checklist
}

export interface BudgetAllocation {
  needs: number;   // 50%
  wants: number;    // 30%
  savings: number; // 20%
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocated: number;
  spent: number;
}

// Custom category created by user
export interface CustomCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export interface AppSettings {
  // User profile
  firstName: string;
  // Finance settings
  defaultMonthlyIncome: number;
  currency: string;           // Default: 'FCFA'
  // Custom categories (both default and user-created)
  customCategories: CustomCategory[];
  // Legacy support for old category format
  expenseCategories: ExpenseCategory[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  loyer: 'Loyer',
  internet: 'Internet',
  transport: 'Transport',
  nourriture: 'Nourriture',
  sante: 'Santé',
  education: 'Éducation',
  loisirs: 'Loisirs',
  vetements: 'Vêtements',
  epargne: 'Épargne',
  autre: 'Autre',
};

export const CATEGORY_ICONS: Record<string, string> = {
  loyer: 'Home',
  internet: 'Wifi',
  transport: 'Car',
  nourriture: 'UtensilsCrossed',
  sante: 'Heart',
  education: 'GraduationCap',
  loisirs: 'Gamepad2',
  vetements: 'Shirt',
  epargne: 'PiggyBank',
  autre: 'MoreHorizontal',
};

export const DEFAULT_CATEGORIES: string[] = [
  'loyer', 'internet', 'transport', 'nourriture', 'sante',
  'education', 'loisirs', 'vetements', 'epargne', 'autre'
];

// Generate unique ID for custom categories
export function generateCategoryId(): string {
  return 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Get display label for a category (handles custom categories)
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

// Create default custom categories from base categories
export function createDefaultCustomCategories(): CustomCategory[] {
  return DEFAULT_CATEGORIES.map(cat => ({
    id: cat,
    name: CATEGORY_LABELS[cat] || cat,
    icon: CATEGORY_ICONS[cat] || 'Tag',
    isDefault: true
  }));
}
