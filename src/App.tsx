import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './lib/store';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Archive } from './components/Archive';
import { Modal } from './components/ui/Modal';
import { Wallet, PieChart, List, HardDrive, Trash2, AlertTriangle } from 'lucide-react';
import './index.css';

type Tab = 'DASHBOARD' | 'TRANSACTION' | 'ARCHIVE';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'DASHBOARD', label: '대시보드', icon: <PieChart className="w-4 h-4" /> },
  { id: 'TRANSACTION', label: '상세내역', icon: <List className="w-4 h-4" /> },
  { id: 'ARCHIVE', label: '보관소', icon: <HardDrive className="w-4 h-4" /> },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { transactions, clearTransactions } = useFinance();

  const handleReset = () => {
    clearTransactions();
    setIsResetModalOpen(false);
    // 피드백은 모달 닫힘 이후 부드럽게 알림 등으로 처리할 수 있으나 현재는 간단히 유지
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center glass" style={{ color: "var(--accent-primary)" }}>
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">스마트 가계부</h1>
            <p style={{ color: "var(--text-secondary)" }}>엑셀만 넣으면 끝나는 자동 분석</p>
          </div>
        </div>
        
        {/* Reset Button */}
        {transactions.length > 0 && (
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 active:scale-95 z-50"
            style={{ 
              color: "var(--accent-expense)", 
              backgroundColor: "rgba(255,59,48,0.1)", 
              borderRadius: "var(--radius-pill)",
              cursor: "pointer"
            }}
          >
            <Trash2 className="w-4 h-4" />
            초기화
          </button>
        )}
      </header>

      {/* Tabs / Segmented Control — always visible */}
      <div className="flex items-center gap-2 p-1.5 rounded-full glass overflow-x-auto w-fit" style={{ border: "1px solid var(--border-color)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--bg-color)' : 'var(--text-secondary)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <main className="min-h-[400px]">
        {activeTab === 'DASHBOARD' && <Dashboard />}
        {activeTab === 'TRANSACTION' && <Transactions />}
        {activeTab === 'ARCHIVE' && <Archive />}
      </main>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="데이터 초기화"
        description="모든 거래 내역이 삭제되며 복구할 수 없습니다."
        footer={
          <>
            <button 
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              취소
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors text-white"
              style={{ backgroundColor: "var(--accent-expense)" }}
            >
              모든 내역 삭제
            </button>
          </>
        }
      >
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10" style={{ border: "1px solid rgba(255, 59, 48, 0.1)" }}>
          <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
            현재 등록된 <strong>{transactions.length}건</strong>의 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
