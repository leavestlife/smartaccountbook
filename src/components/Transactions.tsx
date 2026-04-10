import React, { useState, useMemo } from 'react';
import { useFinance } from '../lib/store';
import { CATEGORY_KEYWORDS, saveCustomMapping } from '../lib/categorizer';
import { Card } from './ui/Card';
import { Search } from 'lucide-react';

export function Transactions() {
  const { transactions, updateTransactionCategory } = useFinance();
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [search, setSearch] = useState('');
  
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  type SortKey = 'date' | 'description' | 'category' | 'amount';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  const categories = useMemo(() => ["미분류", ...Object.keys(CATEGORY_KEYWORDS)], []);

  // '미분류'라는 명시적 카테고리만 미분류로 취급 (기타 수입/지출은 정상 카테고리로 인정)
  const uncatCount = transactions.filter(t => t.category === "미분류").length;

  const toggleSort = (key: SortKey) => {
    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'asc') setSortConfig({ key, direction: 'desc' });
      else setSortConfig(null);
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const filtered = useMemo(() => {
    let result = transactions.filter(tx => {
      // 1. 수입/지출 대분류 필터
      if (filterType === 'INCOME' && !tx.isIncome) return false;
      if (filterType === 'EXPENSE' && tx.isIncome) return false;
      
      // 2. 개별 카테고리 필터
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
      
      // 3. 검색어 필터
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
      
      return true;
    });

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];
        
        if (sortConfig.key === 'date') {
           valA = new Date(valA).getTime();
           valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // 기본은 최신 날짜순
      result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [transactions, filterType, categoryFilter, search, sortConfig]);

  const handleCategoryChange = (id: string, description: string, newCategory: string) => {
    updateTransactionCategory(id, newCategory);
    if (newCategory !== '미분류') {
      // 별도의 확인 창 없이 자동으로 사용자 사전에 저장하여 '스마트'하게 학습함
      saveCustomMapping(description, newCategory);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {uncatCount > 0 && (
        <Card className="apple-card" style={{ backgroundColor: 'rgba(255, 59, 48, 0.05)', borderColor: 'rgba(255, 59, 48, 0.1)' }}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-expense)' }}></div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                분류가 필요한 <span style={{ color: 'var(--accent-expense)'}}>{uncatCount}</span>건의 미분류 내역이 있습니다.
              </p>
            </div>
            <button className="apple-btn apple-btn-sm apple-btn-outline" onClick={() => setCategoryFilter('미분류')}>확인하기</button>
          </div>
        </Card>
      )}

      {/* 필터 영역 */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex p-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: filterType === type ? 'var(--surface-color)' : 'transparent',
                color: filterType === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: filterType === type ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {type === 'ALL' ? '전체' : type === 'INCOME' ? '수입' : '지출'}
            </button>
          ))}
          
          <div className="w-[1px] h-4 bg-white/10 mx-2 self-center"></div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-sm font-medium outline-none cursor-pointer transition-colors"
            style={{ 
              backgroundColor: categoryFilter !== 'ALL' ? 'var(--surface-color)' : 'transparent',
              color: categoryFilter !== 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              appearance: 'none' // Remove default arrow or styling natively
            }}
          >
            <option value="ALL" style={{ backgroundColor: 'var(--bg-color)' }}>모든 카테고리</option>
            {categories.map(c => <option key={c} value={c} style={{ backgroundColor: 'var(--bg-color)' }}>{c}</option>)}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <input 
            type="text" 
            placeholder="내역 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full outline-none transition-all"
            style={{ 
              backgroundColor: "rgba(0,0,0,0.03)", 
              color: "var(--text-primary)",
              border: "1px solid transparent",
              width: "240px",
              fontSize: "0.875rem"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
            onBlur={(e) => e.target.style.borderColor = "transparent"}
          />
        </div>
      </div>

      {/* 리스트 영역 */}
      <Card className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" style={{ color: "var(--text-secondary)", width: "120px" }} onClick={() => toggleSort('date')}>
                  날짜 {sortConfig?.key === 'date' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" style={{ color: "var(--text-secondary)" }} onClick={() => toggleSort('description')}>
                  가맹점/내역 {sortConfig?.key === 'description' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors" style={{ color: "var(--text-secondary)", width: "160px" }} onClick={() => toggleSort('category')}>
                  카테고리 {sortConfig?.key === 'category' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th className="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors" style={{ color: "var(--text-secondary)", width: "140px" }} onClick={() => toggleSort('amount')}>
                  금액 {sortConfig?.key === 'amount' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background-color 0.2s" }} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{tx.date}</td>
                  <td className="p-4 font-medium" style={{ color: "var(--text-primary)" }}>{tx.description}</td>
                  <td className="p-4">
                    <select
                      value={tx.category}
                      onChange={(e) => handleCategoryChange(tx.id, tx.description, e.target.value)}
                      className="px-2 py-1 rounded-md text-sm outline-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{ 
                        backgroundColor: tx.category === '미분류' ? 'rgba(255,59,48,0.1)' : 'transparent',
                        color: tx.category === '미분류' ? 'var(--accent-expense)' : 'var(--text-primary)',
                        border: 'none',
                        appearance: 'none',
                        paddingRight: '1.5rem'
                      }}
                    >
                      {categories.map(c => (
                        <option 
                          key={c} 
                          value={c} 
                          style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right font-semibold" style={{ color: tx.isIncome ? "var(--accent-income)" : "var(--accent-expense)" }}>
                    {tx.isIncome ? "+" : "-"}{tx.amount.toLocaleString()}원
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
