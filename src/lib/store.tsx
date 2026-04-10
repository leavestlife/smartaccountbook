import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Transaction, MonthlyArchive } from './types';

interface FinanceState {
  transactions: Transaction[];
  addTransactions: (txs: Transaction[]) => void;
  updateTransactionCategory: (id: string, newCategory: string) => void;
  budget: number;
  updateBudget: (amount: number) => void;
  clearTransactions: () => void;
}

const FinanceContext = createContext<FinanceState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'FINANCE_TRANSACTIONS';

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('FINANCE_BUDGET');
    return saved ? parseInt(saved) : 3000000;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('FINANCE_BUDGET', budget.toString());
  }, [budget]);

  const addTransactions = (newTxs: Transaction[]) => {
    // 중복 제거 없이 무조건 붙이는 방식 (원할 경우 고유 id로 처리 가능)
    setTransactions((prev) => [...prev, ...newTxs]);
  };

  const updateTransactionCategory = (id: string, newCategory: string) => {
    setTransactions((prev) => prev.map(t => t.id === id ? { ...t, category: newCategory } : t));
  };

  const updateBudget = (amount: number) => setBudget(amount);

  const clearTransactions = () => {
    setTransactions([]);
    setBudget(3000000); // Reset to default budget as well on total reset
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('FINANCE_BUDGET');
  };

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      addTransactions, 
      updateTransactionCategory, 
      clearTransactions,
      budget,
      updateBudget 
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
