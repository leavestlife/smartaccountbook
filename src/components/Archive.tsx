import { useMemo, useState } from 'react';
import { useFinance } from '../lib/store';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { X, Archive as ArchiveIcon, Search } from 'lucide-react';
import type { Transaction } from '../lib/types';

export function Archive() {
  const { transactions } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    if (!transactions.length) return [];

    const map: Record<string, { income: number, expense: number, label: string, txs: Transaction[] }> = {};

    transactions.forEach(tx => {
      const monthStr = tx.date.substring(0, 7); // YYYY-MM
      if (!map[monthStr]) {
        const [yyyy, mm] = monthStr.split('-');
        map[monthStr] = { income: 0, expense: 0, label: `${yyyy}년 ${parseInt(mm)}월`, txs: [] };
      }
      
      map[monthStr].txs.push(tx);

      if (tx.isIncome) {
        map[monthStr].income += tx.amount;
      } else {
        map[monthStr].expense += tx.amount;
      }
    });

    return Object.entries(map)
      .map(([key, value]) => ({ month: key, ...value }))
      .sort((a, b) => b.month.localeCompare(a.month)); // 최신순
  }, [transactions]);

  if (monthlyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
          <ArchiveIcon className="w-10 h-10" style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>보관된 내역이 없습니다</h3>
        <p className="max-w-xs text-center leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          상단 대시보드에서 엑셀 파일을 업로드하면 월별로 분석된 내역이 이곳에 쌓입니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {monthlyData.map((data) => (
          <Card 
            key={data.month} 
            className="apple-card hover:cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]" 
            onClick={() => setSelectedMonth(data.month)}
            style={{ border: "1px solid var(--border-color)" }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">{data.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50" style={{ color: 'var(--text-secondary)' }}>수입</span>
                  <div className="text-sm font-bold" style={{ color: 'var(--accent-income)' }}>+{data.income.toLocaleString()}원</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50" style={{ color: 'var(--text-secondary)' }}>지출</span>
                  <div className="text-sm font-bold" style={{ color: 'var(--accent-expense)' }}>-{data.expense.toLocaleString()}원</div>
                </div>
              </div>
              <div className="pt-3 flex justify-between items-center text-sm" style={{ borderTop: "1px solid var(--border-color)" }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>월간 잔액</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {(data.income - data.expense).toLocaleString()}원
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Overlay / Details */}
      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="apple-card w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            {(() => {
              const data = monthlyData.find(d => d.month === selectedMonth);
              if (!data) return null;
              return (
                <>
                  <div className="p-6 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-10" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.label} 상세 내역</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>총 {data.txs.length}건의 거래</p>
                    </div>
                    <button 
                      onClick={() => setSelectedMonth(null)} 
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <X className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  </div>
                  <div className="p-0 overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="sticky top-0 bg-gray-50 dark:bg-white/5 z-0">
                        <tr>
                          <th className="px-6 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>날짜</th>
                          <th className="px-6 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>내역</th>
                          <th className="px-6 py-3 font-semibold text-right" style={{ color: "var(--text-secondary)" }}>금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                        {data.txs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                          <tr key={tx.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{tx.date.substring(5)}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{tx.description}</div>
                              <div className="text-[10px] uppercase font-bold opacity-40 mt-0.5 tracking-tight">{tx.category}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold" style={{ color: tx.isIncome ? "var(--accent-income)" : "var(--text-primary)" }}>
                                {tx.isIncome ? "+" : "-"}{tx.amount.toLocaleString()}원
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-6 bg-gray-50/50 dark:bg-white/5" style={{ borderTop: "1px solid var(--border-color)" }}>
                    <div className="flex justify-between items-center font-bold">
                      <span style={{ color: "var(--text-secondary)" }}>월 합계</span>
                      <span className="text-lg" style={{ color: "var(--text-primary)" }}>{(data.income - data.expense).toLocaleString()}원</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </div>
      )}
    </>
  );
}
