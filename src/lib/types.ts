export interface Transaction {
  id: string;
  date: string;          // YYYY-MM-DD
  time?: string;         // HH:mm:ss
  description: string;   // 가맹점명 혹은 거래내역
  amount: number;        // 절대값 금액
  isIncome: boolean;     // 입금 여부
  category: string;      // 카테고리
}

export interface MonthlyArchive {
  monthId: string;       // YYYY-MM
  label: string;         // 예: "2026년 4월"
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}
