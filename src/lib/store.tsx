import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Transaction } from './types';
import { supabase } from './supabase';

interface FinanceState {
  transactions: Transaction[];
  addTransactions: (txs: Transaction[]) => Promise<void>;
  updateTransactionCategory: (id: string, newCategory: string) => Promise<void>;
  budget: number;
  updateBudget: (amount: number) => void;
  clearTransactions: () => Promise<void>;
  familyCode: string | null;
  login: (code: string) => void;
  logout: () => void;
}

const FinanceContext = createContext<FinanceState | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [familyCode, setFamilyCode] = useState<string | null>(() => localStorage.getItem('FAMILY_CODE'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('FINANCE_BUDGET');
    return saved ? parseInt(saved) : 3000000;
  });

  // 1. 초기 데이터 로드 (Supabase)
  const fetchTransactions = useCallback(async (code: string) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('family_code', code)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    if (data) {
      // DB 필드(is_income)를 앱 필드(isIncome)로 변환
      const mappedData = data.map(item => ({
        id: item.id,
        date: item.date,
        description: item.description,
        amount: Number(item.amount),
        isIncome: item.is_income,
        category: item.category
      }));
      setTransactions(mappedData as Transaction[]);
    }
  }, []);

  useEffect(() => {
    if (familyCode && supabase) {
      fetchTransactions(familyCode);

      // 2. 실시간 구독 (Realtime)
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `family_code=eq.${familyCode}`,
          },
          () => {
            fetchTransactions(familyCode);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setTransactions([]);
    }
  }, [familyCode, fetchTransactions]);

  useEffect(() => {
    localStorage.setItem('FINANCE_BUDGET', budget.toString());
  }, [budget]);

  const login = (code: string) => {
    const cleanCode = code.trim();
    if (cleanCode) {
      setFamilyCode(cleanCode);
      localStorage.setItem('FAMILY_CODE', cleanCode);
    }
  };

  const logout = () => {
    setFamilyCode(null);
    setTransactions([]);
    localStorage.removeItem('FAMILY_CODE');
  };

  const addTransactions = async (newTxs: Transaction[]) => {
    if (!familyCode || !supabase) return;

    // Supabase DB 스키마(snake_case)에 맞춰 데이터 변환
    const txsToInsert = newTxs.map(tx => ({
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      is_income: tx.isIncome, // 매핑 핵심
      category: tx.category,
      family_code: familyCode
      // id는 DB에서 자동 생성하거나 암묵적으로 전달
    }));

    const { error } = await supabase
      .from('transactions')
      .insert(txsToInsert);

    if (error) {
      console.error('Error adding transactions:', error);
      alert('데이터 저장 중 오류가 발생했습니다. (DB 필드 불일치 또는 권한 문제)');
    }
  };

  const updateTransactionCategory = async (id: string, newCategory: string) => {
    if (!familyCode || !supabase) return;

    const { error } = await supabase
      .from('transactions')
      .update({ category: newCategory })
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
    }
  };

  const updateBudget = (amount: number) => setBudget(amount);

  const clearTransactions = async () => {
    if (!familyCode || !supabase) return;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('family_code', familyCode);

    if (error) {
      console.error('Error clearing transactions:', error);
      alert('초기화에 실패했습니다: ' + error.message);
    } else {
      setTransactions([]); // 즉시 UI 반영
    }
  };

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      addTransactions, 
      updateTransactionCategory, 
      clearTransactions,
      budget,
      updateBudget,
      familyCode,
      login,
      logout
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
