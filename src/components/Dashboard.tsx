import { useMemo } from 'react';
import { useFinance } from '../lib/store';
import { UploadZone } from './UploadZone';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target,
  Sparkles, Plus, Wallet, Pencil, Check, X
} from 'lucide-react';
import './Dashboard.css';
import { useState } from 'react';

/* ═══════════════════════════════════════════
   Dummy data – shown when no Excel is loaded
   ═══════════════════════════════════════════ */
const DUMMY_TRENDS = [
  { rawM: '2026-02', month: '2월', income: 3200000, expense: 2850000 },
  { rawM: '2026-03', month: '3월', income: 3500000, expense: 2680000 },
  { rawM: '2026-04', month: '4월', income: 3150000, expense: 1920000 },
];

const CATEGORY_ICONS: Record<string, string> = {
  '식비': '🍽️', '교통': '🚗', '쇼핑': '🛍️', '주거': '🏠',
  '통신': '📱', '의료': '🏥', '교육': '📚', '여가': '🎮',
  '카페': '☕', '생활': '🏪', '보험': '🛡️', '미분류': '📦',
};

interface CategoryStat {
  name: string;
  value: number;
  icon: string;
}

const DUMMY_CATEGORIES: CategoryStat[] = [
  { name: '식비', value: 680000, icon: '🍽️' },
  { name: '교통', value: 320000, icon: '🚗' },
  { name: '쇼핑', value: 280000, icon: '🛍️' },
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const DEFAULT_BUDGET = 3000000;

/* ═══════════════════════════════════════════
   Dashboard Component
   ═══════════════════════════════════════════ */
export function Dashboard() {
  const { transactions, budget, updateBudget } = useFinance();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());
  const hasRealData = transactions && transactions.length > 0;

  /* ─── Latest month ─── */
  const latestMonth = useMemo(() => {
    if (!hasRealData) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    try {
      return transactions.reduce((latest, tx) => {
        if (!tx.date) return latest;
        const m = tx.date.substring(0, 7);
        return m > latest ? m : latest;
      }, transactions[0]?.date?.substring(0, 7) || '2026-01');
    } catch (e) {
      return '2026-01';
    }
  }, [transactions, hasRealData]);

  const monthNum = parseInt(latestMonth.split('-')[1]) || 1;

  /* ─── Stats (current month) ─── */
  const stats = useMemo(() => {
    if (!hasRealData) {
      return {
        income: 0,
        expense: 0,
        balance: 0,
        topCategories: [],
      };
    }

    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    transactions
      .filter(tx => tx && tx.date && tx.date.startsWith(latestMonth))
      .forEach(tx => {
        if (tx.isIncome) {
          income += tx.amount || 0;
        } else {
          expense += tx.amount || 0;
          const cat = tx.category || '미분류';
          catMap[cat] = (catMap[cat] || 0) + (tx.amount || 0);
        }
      });

    const topCategories: CategoryStat[] = Object.entries(catMap)
      .filter(([name]) => name !== '미분류')
      .map(([name, value]) => ({
        name,
        value,
        icon: CATEGORY_ICONS[name] || '📦',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return { income, expense, balance: income - expense, topCategories };
  }, [transactions, latestMonth, hasRealData]);

  /* ─── 3-month trends ─── */
  const monthlyTrends = useMemo(() => {
    if (!hasRealData) return DUMMY_TRENDS;

    const map: Record<string, { month: string; income: number; expense: number }> = {};
    transactions.forEach(tx => {
      if (!tx.date) return;
      const m = tx.date.substring(0, 7);
      if (!map[m]) {
        map[m] = { month: `${parseInt(m.split('-')[1]) || 1}월`, income: 0, expense: 0 };
      }
      if (tx.isIncome) map[m].income += tx.amount || 0;
      else map[m].expense += tx.amount || 0;
    });

    const realTrends = Object.entries(map)
      .map(([rawM, data]) => ({ rawM, ...data }))
      .sort((a, b) => b.rawM.localeCompare(a.rawM))
      .slice(0, 3);

    if (realTrends.length < 3) {
      const needed = 3 - realTrends.length;
      const dummyPad = DUMMY_TRENDS.slice(0, needed).map(d => ({ 
        ...d, 
        month: d.month + (hasRealData ? '(예시)' : ''),
        income: hasRealData ? d.income : 0,
        expense: hasRealData ? d.expense : 0
      }));
      return [...dummyPad, ...realTrends.reverse()];
    }

    return realTrends.reverse();
  }, [transactions, hasRealData]);

  /* ─── AI insight message ─── */
  const insightMessage = useMemo(() => {
    if (!hasRealData) {
      return '분석을 시작할 준비가 되었습니다! 상단의 파일 업로드 영역에 엑셀 파일을 드롭하거나, "간편 수동 입력"으로 데이터를 추가해 보세요. ✨';
    }
    const top = stats.topCategories[0];
    if (!top) return '충분한 데이터가 쌓이면 AI가 소비 패턴을 분석해 드릴게요.';

    const denominator = stats.income || budget || DEFAULT_BUDGET;
    const ratio = (stats.expense / denominator) * 100;

    if (stats.income === 0) {
      return `수입 내역이 확인되지 않아 예산(${(budget || DEFAULT_BUDGET).toLocaleString()}원) 기준으로 분석했어요. 현재 예산의 ${ratio.toFixed(0)}%를 사용하셨습니다. ${top.name} 지출이 가장 많네요!`;
    }

    if (ratio > 80) {
      return `이번 달 수입 대비 지출 비율이 ${ratio.toFixed(0)}%로 높은 편이에요. ${top.name} 지출을 조금 줄여보는 건 어떨까요?`;
    } else if (ratio > 50) {
      return `${top.name}이(가) 전체 지출의 ${((top.value / (stats.expense || 1)) * 100).toFixed(0)}%를 차지하고 있어요. 다른 항목과 균형을 맞춰보세요!`;
    }
    return `👏 이번 달 지출을 잘 관리하고 계시네요! ${top.name}이(가) 가장 큰 지출 항목이에요.`;
  }, [stats, hasRealData, budget]);

  const budgetPercent = Math.min(100, Math.round((stats.expense / (budget || 1)) * 100));
  const displayCategories = stats.topCategories;
  const maxCatValue = displayCategories[0]?.value || 1;

  const handleBudgetSubmit = () => {
    const val = parseInt(tempBudget.replace(/,/g, ''));
    if (!isNaN(val) && val >= 0) {
      updateBudget(val);
      setIsEditingBudget(false);
    }
  };

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */
  return (
    <div className="dashboard-grid">

      {/* ───── SECTION 1: Summary Header ───── */}
      <section className="dash-summary">
        {/* Income */}
        <div className="dash-summary-card">
          <div className="dash-summary-icon dash-icon-income">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="dash-summary-info">
            <span className="dash-summary-label">{monthNum}월 총 수입</span>
            <span className="dash-summary-value dash-val-income">
              +{stats.income.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Expense */}
        <div className="dash-summary-card">
          <div className="dash-summary-icon dash-icon-expense">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="dash-summary-info">
            <span className="dash-summary-label">{monthNum}월 총 지출</span>
            <span className="dash-summary-value dash-val-expense">
              -{stats.expense.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="dash-summary-card dash-budget-card">
          <div className="dash-summary-icon dash-icon-budget">
            <Target className="w-5 h-5" />
          </div>
          <div className="dash-summary-info">
            <div className="dash-budget-row">
              <span className="dash-summary-label">예산 소진율</span>
              <div className="flex items-center gap-2">
                {!isEditingBudget ? (
                  <button 
                    onClick={() => {
                      setTempBudget(budget.toLocaleString());
                      setIsEditingBudget(true);
                    }}
                    className="p-1 hover:bg-black/5 rounded-md transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-gray-400" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={handleBudgetSubmit} className="p-1 hover:bg-green-50 rounded-md">
                      <Check className="w-3 h-3 text-green-500" />
                    </button>
                    <button onClick={() => setIsEditingBudget(false)} className="p-1 hover:bg-red-50 rounded-md">
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                )}
                <span className="dash-budget-pct">{budgetPercent}%</span>
              </div>
            </div>
            <div className="dash-budget-track">
              <div
                className="dash-budget-fill"
                style={{
                  width: `${budgetPercent}%`,
                  background:
                    budgetPercent > 80
                      ? 'var(--accent-expense)'
                      : budgetPercent > 50
                      ? '#FF9500'
                      : 'var(--accent-income)',
                }}
              />
            </div>
            {isEditingBudget ? (
              <input
                autoFocus
                type="text"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBudgetSubmit()}
                className="dash-budget-input"
              />
            ) : (
              <span className="dash-budget-sub">
                {stats.expense.toLocaleString()} / {budget.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ───── SECTION 2: Chart + Data Action Zone ───── */}
      <section className="dash-middle">
        {/* Left — 3-month trend chart */}
        <Card className="dash-chart-card">
          <CardHeader>
            <div className="dash-chart-header">
              <CardTitle>📊 수입/지출 추이</CardTitle>
              <span className="dash-chart-badge">최근 3개월</span>
            </div>
          </CardHeader>
          <CardContent className="dash-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrends}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 13 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: 'var(--surface-color)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '12px 16px',
                  }}
                  formatter={(value: number) => `${value.toLocaleString()}원`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingBottom: '4px' }}
                />
                <Bar
                  dataKey="income"
                  name="수입"
                  fill="var(--accent-income)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="expense"
                  name="지출"
                  fill="var(--accent-expense)"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right — Data Action Zone */}
        <div className="dash-actions">
          <div className="dash-upload-wrap">
            <UploadZone />
          </div>

          <button className="dash-manual-btn" type="button">
            <Plus className="w-4 h-4" />
            간편 수동 입력
          </button>

          <div className="dash-balance-strip">
            <Wallet className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <div className="dash-balance-info">
              <span className="dash-balance-label">여유 자금</span>
              <span
                className="dash-balance-value"
                style={{
                  color:
                    stats.balance >= 0
                      ? 'var(--accent-income)'
                      : 'var(--accent-expense)',
                }}
              >
                {stats.balance >= 0 ? '+' : ''}
                {stats.balance.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SECTION 3: Spending Insights ───── */}
      <section className="dash-insights">
        {/* AI analysis card */}
        <div className="dash-ai-card">
          <div className="dash-ai-head">
            <div className="dash-ai-icon-wrap">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4>AI 소비 분석</h4>
            {!hasRealData && <span className="dash-demo-tag">데모</span>}
          </div>
          <p className="dash-ai-msg">{insightMessage}</p>
          <div className="dash-ai-tip">
            💡 미분류 항목이 있다면 상세내역에서 수정해 보세요. AI가 학습하여 다음엔 자동 분류합니다.
          </div>
        </div>

        {/* Top 3 Spending */}
        <Card className="dash-rank-card">
          <CardHeader>
            <CardTitle>🏆 지출 TOP 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dash-rank-list">
              {displayCategories.length > 0 ? (
                displayCategories.map((cat, i) => (
                  <div key={cat.name} className="dash-rank-row">
                    <div className="dash-rank-left">
                      <span className="dash-rank-medal">{RANK_MEDALS[i]}</span>
                      <span className="dash-rank-emoji">{cat.icon}</span>
                      <span className="dash-rank-name">{cat.name}</span>
                    </div>
                    <div className="dash-rank-right">
                      <span className="dash-rank-amount">
                        {cat.value.toLocaleString()}원
                      </span>
                      <div className="dash-rank-bar-track">
                        <div
                          className="dash-rank-bar-fill"
                          style={{
                            width: `${(cat.value / maxCatValue) * 100}%`,
                            opacity: 1 - i * 0.2,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">데이터가 입력되면 순위가 표시됩니다.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
