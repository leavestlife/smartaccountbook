# Apple-style Design System (가계부 웹앱 디자인 가이드)

본 문서는 가계부 애플리케이션의 시각적 완성도와 사용자 경험을 극대화하기 위한 Apple 스타일(Human Interface Guidelines 영감)의 디자인 원칙과 토큰을 정의합니다.

## 1. 핵심 디자인 원칙 (Core Principles)
- **명료성 (Clarity) & 여백 (Whitespace)**: 불필요한 장식을 배제하고 데이터(입출금 내역, 차트)가 가장 잘 보이도록 넉넉한 여백과 명확한 대비를 활용합니다.
- **깊이감과 재질 (Depth & Material)**: 글래스모피즘(Glassmorphism)을 활용해 계층 구조를 시각적으로 표현합니다. 투명한 배경과 `backdrop-filter: blur`를 적극 사용하여 뒤의 컨텐츠가 은은하게 비치도록 합니다.
- **유동적인 애니메이션 (Fluidity)**: 거친 전환 대신, 스프링(Spring) 기반의 부드럽고 자연스러운 마이크로 애니메이션(Hover, 클릭, 탭 전환 시)을 적용하여 '살아있는 듯한' 느낌을 줍니다.

## 2. 타이포그래피 (Typography)
Apple의 룩앤필을 구축하기 위해 폰트 웨이트의 대비를 극적으로 사용합니다.
- **Font Family**: `Pretendard`, `Inter`, 시스템 기본 폰트(San Francisco 등) 활용.
- **Heading (금액, 타이틀)**: Bold (700) 혹은 SemiBold (600), 자간(letter-spacing)을 좁게 설정하여 타격감 있게 표현.
- **Body (내역, 부가 설명)**: Regular (400) 혹은 Medium (500), 가독성을 위해 적절한 행간(line-height: 1.5) 부여.

## 3. 컬러 팔레트 (Color Palette)

고급스럽고 부드러운 Apple 스타일의 라이트/다크 모드 범용 팔레트입니다. 원색보다는 약간의 채도를 뺀 색상을 사용합니다.

### 3.1 Background & Surface
- **App Background**: 
  - Light: `#F5F5F7` (Apple 특유의 은은한 웜-쿨 믹스 그레이)
  - Dark: `#000000` (완벽한 블랙으로 OLED 화면에서 깊이감 제공)
- **Card Surface (Glassmorphism)**:
  - Light: `rgba(255, 255, 255, 0.7)` + `backdrop-filter: blur(20px)`
  - Dark: `rgba(28, 28, 30, 0.7)` + `backdrop-filter: blur(20px)`
- **Border/Divider**:
  - Light: `rgba(0, 0, 0, 0.05)` (매우 얇고 연한 테두리)
  - Dark: `rgba(255, 255, 255, 0.1)`

### 3.2 Semantic & Accent Colors
재무 상태를 명확히 보여주는 시맨틱 컬러. 원색의 생동감을 위해 Apple의 시스템 컬러 값을 차용합니다.
- **Primary (강조, 버튼)**: `#007AFF` (Light) / `#0A84FF` (Dark)
- **Income (입금/플러스)**: `#34C759` (Light) / `#30D158` (Dark) - 생동감 있는 그린.
- **Expense (출금/마이너스/경고)**: `#FF3B30` (Light) / `#FF453A` (Dark) - 선명한 레드.
- **Text Primary**: `#1D1D1F` (Light) / `#F5F5F7` (Dark)
- **Text Secondary (보조 텍스트)**: `#86868B` / `#98989D`

## 4. UI 컴포넌트 스타일링 가이드
- **Cards (카드 요소)**: 
  - 모서리 곡률(Border-radius): `16px` ~ `20px` 정도로 둥글게 처리.
  - 그림자(Box-shadow): 하단으로 길고 부드럽게 퍼지는 그림자 (`box-shadow: 0 4px 24px rgba(0,0,0,0.04)`).
- **Buttons (버튼)**: 
  - 기본 형태: 완전히 둥근 알약 형태(Pill shape) 또는 `12px` 곡률 적용.
  - 클릭 상호작용: 클릭 시 `transform: scale(0.96)` 상태를 부여해 즉각적인 터치 피드백 제공.
- **Segmented Control (탭 네비게이션)**: 
  - 뒷배경은 연한 회색/검정 캡슐 모양. 선택된 탭은 부드럽게 슬라이드되는(하얀색/진한색) 형태 구현.
- **Forms & Inputs (검색, 필터)**:
  - 배경이 투명하거나 회색빛이 도는 둥근 인풋. Focus 시 파란색 외곽선이 나타나는 심플한 이펙트.
