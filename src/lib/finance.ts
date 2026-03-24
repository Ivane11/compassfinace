import { Transaction, BudgetAllocation, CategoryBudget, ExpenseCategory, AppSettings, DEFAULT_CATEGORIES, CustomCategory, createDefaultCustomCategories } from './types';

const STORAGE_KEYS = {
  transactions: 'cashcompass_transactions',
  settings: 'cashcompass_settings',
  userProfile: 'cashcompass_user',
};

// --- Default Settings ---
function getDefaultSettings(): AppSettings {
  return {
    firstName: '',
    defaultMonthlyIncome: 0,
    currency: 'FCFA',
    customCategories: createDefaultCustomCategories(),
    expenseCategories: DEFAULT_CATEGORIES,
  };
}

// --- Storage Helpers ---
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// --- Storage Operations ---
export function loadTransactions(): Transaction[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.transactions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('Failed to load transactions from localStorage');
    return [];
  }
}

export function saveTransactions(txs: Transaction[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadSettings(): AppSettings {
  if (!isLocalStorageAvailable()) return getDefaultSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return getDefaultSettings();

    const settings = JSON.parse(raw) as AppSettings;

    // Migration: Ensure new fields exist in old settings
    const migrated: AppSettings = {
      firstName: settings.firstName || '',
      defaultMonthlyIncome: settings.defaultMonthlyIncome || 0,
      currency: settings.currency || 'FCFA',
      customCategories: settings.customCategories || createDefaultCustomCategories(),
      expenseCategories: settings.expenseCategories || DEFAULT_CATEGORIES,
    };

    return migrated;
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(s: AppSettings): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function resetAllData(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.transactions);
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.userProfile);
}

// --- Calculations ---
export function totalIncome(txs: Transaction[]): number {
  return txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

export function totalExpenses(txs: Transaction[]): number {
  return txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

export function balance(txs: Transaction[]): number {
  return totalIncome(txs) - totalExpenses(txs);
}

export function autoBudget(income: number): BudgetAllocation {
  return {
    needs: Math.round(income * 0.5),
    wants: Math.round(income * 0.3),
    savings: Math.round(income * 0.2),
  };
}

export function categorySpending(txs: Transaction[]): CategoryBudget[] {
  const expenses = txs.filter(t => t.type === 'expense');
  const map = new Map<string, number>();
  expenses.forEach(t => {
    const cat = t.category || 'autre';
    map.set(cat, (map.get(cat) || 0) + t.amount);
  });
  return Array.from(map.entries()).map(([category, spent]) => ({
    category,
    allocated: 0,
    spent,
  }));
}

export function monthlyTransactions(txs: Transaction[], year: number, month: number): Transaction[] {
  return txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function weeklyBalanceData(txs: Transaction[]): { day: string; balance: number }[] {
  const now = new Date();
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const result: { day: string; balance: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const dayTxs = txs.filter(t => t.date.startsWith(dayStr));
    const dayBalance = dayTxs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
    result.push({ day: days[d.getDay()], balance: dayBalance });
  }

  // Make cumulative
  let cumulative = balance(txs.filter(t => {
    const d = new Date(t.date);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return d < sevenDaysAgo;
  }));

  return result.map(r => {
    cumulative += r.balance;
    return { ...r, balance: cumulative };
  });
}

export function predictEndOfMonth(txs: Transaction[]): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get only current month's expenses
  const monthTxs = monthlyTransactions(txs, year, month);
  const monthExpenses = totalExpenses(monthTxs);

  // Return only the actual expenses for this month (no projection)
  return monthExpenses;
}

export function monthlyComparison(txs: Transaction[]): { month: string; income: number; expenses: number }[] {
  const now = new Date();
  const result = [];
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mTxs = monthlyTransactions(txs, d.getFullYear(), d.getMonth());
    result.push({
      month: monthNames[d.getMonth()],
      income: totalIncome(mTxs),
      expenses: totalExpenses(mTxs),
    });
  }
  return result;
}

// --- Currency Formatting ---
export function formatFCFA(amount: number): string {
  // Format with French locale and space as thousands separator
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

// Format without currency symbol (for inputs/display)
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse formatted amount string back to number
export function parseFormattedAmount(value: string): number {
  // Remove spaces and non-numeric characters
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// Format amount for display with currency
export function formatWithCurrency(amount: number, currency: string = 'FCFA'): string {
  if (currency === 'FCFA') {
    return formatFCFA(amount);
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --- Category Management ---
export function getAllCategories(settings: AppSettings): CustomCategory[] {
  return settings.customCategories.length > 0
    ? settings.customCategories
    : createDefaultCustomCategories();
}

export function addCustomCategory(settings: AppSettings, name: string, icon?: string): CustomCategory {
  const newCategory: CustomCategory = {
    id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    icon: icon || 'Tag',
    isDefault: false,
  };
  return newCategory;
}

export function updateCustomCategory(
  settings: AppSettings,
  categoryId: string,
  updates: Partial<Pick<CustomCategory, 'name' | 'icon' | 'color'>>
): AppSettings {
  const categories = settings.customCategories.map(cat => {
    if (cat.id === categoryId) {
      return { ...cat, ...updates };
    }
    return cat;
  });
  return { ...settings, customCategories: categories };
}

export function removeCustomCategory(settings: AppSettings, categoryId: string): AppSettings {
  const categories = settings.customCategories.filter(cat => cat.id !== categoryId || cat.isDefault);
  return { ...settings, customCategories: categories };
}

