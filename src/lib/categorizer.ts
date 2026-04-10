export const CATEGORY_ALIASES: Record<string, string> = {
  "현카": "현대카드",
  "국카": "국민카드",
  "삼카": "삼성카드",
  "신카": "신한카드",
  "우카": "우리카드",
  "롯백": "롯데백화점",
  "현백": "현대백화점",
  "신백": "신세계백화점",
  "스벅": "스타벅스",
  "맥날": "맥도날드",
  "배민": "배달의민족"
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "식비/카페": ["스타벅스", "배달의민족", "요기요", "맥도날드", "버거킹", "cu", "gs25", "세븐일레븐", "이마트24", "커피", "카페", "제과", "베이커리", "식당", "음식점", "횟집", "고기"],
  "교통/차량": ["지하철", "버스", "코레일", "srt", "택시", "카카오t", "카카오티", "주유소", "하이패스", "킥고잉", "따릉이", "주차장", "대리운전"],
  "통신비": ["skt", "kt", "lgu+", "알뜰폰", "이동통신", "통신요금"],
  "쇼핑": ["쿠팡", "네이버페이", "무신사", "에이블리", "지그재그", "올리브영", "다이소", "롯데백화점", "현대백화점", "신세계백화점", "이마트", "홈플러스", "롯데마트", "지에스샵", "cjmall", "11번가", "g마켓", "옥션"],
  "주거/공과금": ["관리비", "가스요금", "전기요금", "수도요금", "한전", "한국전력", "가스공사", "도시가스"],
  "문화/여가": ["cgv", "메가박스", "롯데시네마", "넷플릭스", "유튜브", "티빙", "웨이브", "멜론", "지니", "리디북스", "밀리의서재", "인터파크", "티켓링크", "게임", "스팀", "앱스토어", "플레이스토어"],
  "병원/건강": ["병원", "의원", "약국", "치과", "한의원", "피부과"],
  "금융/보험": ["보험", "대출", "이자", "은행", "송금", "수수료", "카드대금", "이체", "출금"],
  "업무": ["업무", "비품", "출장", "회식", "접대", "사무용품", "명함"],
  "급여": ["급여", "월급", "상여금", "보너스"],
  "기타 수입": ["입금", "환불", "캐시백", "지원금", "용돈", "수입"],
  "기타 지출": ["지출", "결제"]
};

// 로컬스토리지 키
export const CUSTOM_CATEGORY_KEY = "CUSTOM_CATEGORY_MAP";

export function getCustomMappings(): Record<string, string> {
  const data = localStorage.getItem(CUSTOM_CATEGORY_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveCustomMapping(keyword: string, category: string) {
  const mappings = getCustomMappings();
  const cleanKeyword = keyword.replace(/\s+/g, "").toLowerCase();
  
  if (!cleanKeyword || cleanKeyword.length < 1) return; // 빈칸 오염 방지

  mappings[cleanKeyword] = category;
  localStorage.setItem(CUSTOM_CATEGORY_KEY, JSON.stringify(mappings));
}

// 텍스트 정제 함수
function normalizeText(text: string): string {
  if (!text) return "";
  return text.toLowerCase().replace(/\s+/g, ""); // 소문자화 및 모든 공백 제거
}

export function categorizeTransaction(description: string, isIncome: boolean): string {
  const normDesc = normalizeText(description);

  // 1. 사용자 정의 사전 (오염 방지를 위해 정확히 일치할 때만 적용)
  const customMappings = getCustomMappings();
  if (customMappings[normDesc]) {
    return customMappings[normDesc];
  }

  // 2. 동의어/약어 치환 (현카 -> 현대카드)
  let resolvedDesc = description;
  for (const [alias, realName] of Object.entries(CATEGORY_ALIASES)) {
    if (resolvedDesc.includes(alias)) {
      resolvedDesc = resolvedDesc.replace(new RegExp(alias, 'g'), realName);
    }
  }
  const fullyNormDesc = normalizeText(resolvedDesc); // 다시 정제

  // 3. 키워드 기반 분류
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (fullyNormDesc.includes(normalizeText(keyword))) {
        return category;
      }
    }
  }

  // 4. 수입/지출 기본 분류 (기본값)
  return isIncome ? "기타 수입" : "기타 지출";
}
