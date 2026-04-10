import * as xlsx from 'xlsx';
import type { Transaction } from './types';
import { categorizeTransaction } from './categorizer';

/** 엑셀 날짜 포맷 (문자열 또는 엑셀 시리얼 넘버) 처리 */
function parseDate(rawDate: any): string {
  if (rawDate === undefined || rawDate === null) return "2026-01-01";
  
  // 1. 네이티브 Date 객체 처리 (xlsx cellDates: true일 때 넘어옴)
  if (rawDate instanceof Date) {
    if (!Number.isNaN(rawDate.getTime())) {
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const d = String(rawDate.getDate()).padStart(2, '0');
      if (y >= 2000) return `${y}-${m}-${d}`;
    }
  }

  // 2. 엑셀 숫자 포맷 (시리얼 넘버)
  if (typeof rawDate === 'number') {
    // 엑셀 시리얼 넘버는 1900년 1월 1일 기준. 
    // 타임존 영향을 줄이기 위해 정오(12시) 기준으로 계산하거나 UTC 사용 관례를 따름.
    const date = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    if (y >= 2000) return `${y}-${m}-${d}`;
  }

  const str = String(rawDate).trim();
  
  // 3. (연도 포함) 2026.04.08, 2026-04-08, 2026/04/08 포맷 대응
  const matchYMD = str.match(/(20\d{2})[^\d]?(\d{1,2})[^\d]?(\d{1,2})/);
  if (matchYMD) {
    return `${matchYMD[1]}-${matchYMD[2].padStart(2, '0')}-${matchYMD[3].padStart(2, '0')}`;
  }
  
  // 4. (연도 생략) 04/08, 04-08 포맷
  const matchMD = str.match(/^(\d{1,2})[^\d]?(\d{1,2})/);
  if (matchMD) {
    const y = new Date().getFullYear();
    return `${y}-${matchMD[1].padStart(2, '0')}-${matchMD[2].padStart(2, '0')}`;
  }
  
  // 5. 숫자로만 8자리 딱 붙어있을 때 (20260408)
  const plain = str.replace(/[^\d]/g, '');
  if (plain.length >= 8 && plain.startsWith("20")) {
    return `${plain.substring(0,4)}-${plain.substring(4,6)}-${plain.substring(6,8)}`;
  }
  
  return "2026-01-01";
}

/** 숫자에 포함된 컴마, 특수기호 제거 후 parseFloat, 실패 시 0 반환 */
function parseAmount(rawAmt: any): number {
  if (rawAmt === undefined || rawAmt === null || rawAmt === "") return 0;
  if (typeof rawAmt === 'number') return rawAmt;
  const str = String(rawAmt).replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return Number.isNaN(num) ? 0 : num;
}

export async function parseExcel(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("파일 데이터를 읽을 수 없습니다.");
        
        // readAsArrayBuffer 사용에 따른 설정
        const workbook = xlsx.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
        const transactions: Transaction[] = [];

        let headerRowIndex = -1;
        let dateIdx = -1, descIdx = -1, amountIdx = -1, inIdx = -1, outIdx = -1;

        for (let i = 0; i < Math.min(rows.length, 30); i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row)) continue;
          
          let tempDate = -1, tempDesc = -1, tempAmt = -1, tempIn = -1, tempOut = -1;
          
          for (let j = 0; j < row.length; j++) {
            const val = String(row[j] || "").replace(/\s/g, '');
            if (!val) continue;

            if (/일시|일자|날짜|이용일|거래일/.test(val) && tempDate === -1) tempDate = j;
            if (/가맹점|사용처|내용|거래내역|상호|거래명/.test(val)) tempDesc = j;
            else if (tempDesc === -1 && /적요|거래처/.test(val)) tempDesc = j;
            if (/이용금액|승인금액|거래금액|결제금액|사용금액|매출금액|^금액$|합계/.test(val)) tempAmt = j;
            if (/입금|맡기신|수입/.test(val)) tempIn = j;
            if (/출금|찾으신|지출/.test(val)) tempOut = j;
          }

          if (tempDate !== -1 && tempDesc !== -1 && (tempAmt !== -1 || (tempIn !== -1 && tempOut !== -1))) {
            headerRowIndex = i;
            dateIdx = tempDate;
            descIdx = tempDesc;
            amountIdx = tempAmt;
            inIdx = tempIn;
            outIdx = tempOut;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error("지원하지 않는 엑셀 파일 형식입니다. 날짜, 내역, 금액(또는 입/출금) 컬럼이 포함된 파일을 업로드해 주세요.");
        }

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          const rawDate = row[dateIdx];
          const rawDesc = row[descIdx];
          
          if (rawDate === undefined || rawDesc === undefined || String(rawDesc).trim() === "") continue;

          const date = parseDate(rawDate);
          const description = String(rawDesc).trim();
          
          let amount = 0;
          let isIncome = false;

          if (inIdx !== -1 && outIdx !== -1 && (row[inIdx] !== "" || row[outIdx] !== "")) {
            const inValue = parseAmount(row[inIdx]);
            const outValue = parseAmount(row[outIdx]);
            
            if (inValue > 0) {
              amount = inValue;
              isIncome = true;
            } else if (outValue > 0) {
              amount = outValue;
              isIncome = false;
            }
          } else if (amountIdx !== -1) {
            const amt = parseAmount(row[amountIdx]);
            if (amt < 0) {
              isIncome = true;
              amount = Math.abs(amt);
            } else {
              isIncome = false;
              amount = amt;
            }
          }

          if (amount <= 0) continue;

          transactions.push({
            id: crypto.randomUUID(),
            date,
            description,
            amount,
            isIncome,
            category: categorizeTransaction(description, isIncome)
          });
        }
        resolve(transactions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
    reader.readAsArrayBuffer(file);
  });
}
