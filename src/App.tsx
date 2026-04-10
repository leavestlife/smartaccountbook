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

function LoginScreen() {
  const [code, setCode] = useState('');
  const { login } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      login(code);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-black">
      <Card className="apple-card w-full max-w-sm p-8 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ color: 'var(--accent-primary)' }}>
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>스마트 가계부</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>배우자와 함께 쓰는 실시간 가계부</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: 'var(--text-secondary)' }}>가족 공유 코드</label>
            <input
              type="password"
              placeholder="코드를 입력하세요"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-none outline-none transition-all"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--text-primary)' }}
          >
            입장하기
          </button>
        </form>
        
        <p className="text-center text-[11px] opacity-40" style={{ color: 'var(--text-secondary)' }}>
          개인정보는 안전하게 보호됩니다.
        </p>
      </Card>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { transactions, clearTransactions, familyCode, logout } = useFinance();

  if (!familyCode) {
    return <LoginScreen />;
  }

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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500 uppercase">Live Sync</span>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>가족 코드: {familyCode}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
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

          {/* Logout Button */}
          <button 
            onClick={() => {
              if (window.confirm("공유 코드 접속을 종료할까요?")) {
                logout();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 z-50"
            style={{ 
              color: "var(--text-secondary)", 
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer"
            }}
          >
            로그아웃
          </button>
        </div>
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
