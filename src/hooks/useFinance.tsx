import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, AppSettings, CustomCategory, createDefaultCustomCategories } from '@/lib/types';
import { loadTransactions, saveTransactions, loadSettings, saveSettings, resetAllData, addCustomCategory, updateCustomCategory, removeCustomCategory } from '@/lib/finance';

interface FinanceContextType {
  transactions: Transaction[];
  settings: AppSettings;
  addTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateSettings: (s: AppSettings) => void;
  updateFirstName: (name: string) => void;
  addCategory: (name: string, icon?: string) => void;
  editCategory: (id: string, updates: Partial<Pick<CustomCategory, 'name' | 'icon' | 'color'>>) => void;
  deleteCategory: (id: string) => void;
  resetData: () => void;
  // Convenience getters
  firstName: string;
  categories: CustomCategory[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Persist data changes
  useEffect(() => { saveTransactions(transactions); }, [transactions]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    setSettings(s);
  }, []);

  const updateFirstName = useCallback((name: string) => {
    setSettings(prev => ({ ...prev, firstName: name }));
  }, []);

  const addCategory = useCallback((name: string, icon?: string) => {
    const newCat = addCustomCategory(settings, name, icon);
    setSettings(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, newCat],
      expenseCategories: [...prev.expenseCategories, newCat.name],
    }));
  }, [settings]);

  const editCategory = useCallback((id: string, updates: Partial<Pick<CustomCategory, 'name' | 'icon' | 'color'>>) => {
    setSettings(prev => updateCustomCategory(prev, id, updates));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setSettings(prev => removeCustomCategory(prev, id));
  }, []);

  const resetDataFn = useCallback(() => {
    resetAllData();
    setTransactions([]);
    setSettings(loadSettings());
  }, []);

  // Convenience getters
  const firstName = settings.firstName;
  const categories = settings.customCategories.length > 0
    ? settings.customCategories
    : createDefaultCustomCategories();

  return (
    <FinanceContext.Provider value={{
      transactions,
      settings,
      addTransaction,
      removeTransaction,
      updateSettings,
      updateFirstName,
      addCategory,
      editCategory,
      deleteCategory,
      resetData: resetDataFn,
      firstName,
      categories,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
