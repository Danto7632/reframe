<p align="center">
  <img src="favicon.png" alt="Reframe Logo" width="80" />
</p>

<h1 align="center">리프레임 — Reframe</h1>

<p align="center">
  <b>취업 준비생을 위한 CBT 기반 멘탈 케어 플랫폼</b><br/>
  구직 과정의 감정을 기록하고, 인지 왜곡을 발견하며, 건강한 사고로 전환하세요.
</p>

<p align="center">
  <a href="https://reframe.kro.kr">🌐 Live Demo</a>
</p>

---

## 📖 프로젝트 소개

**리프레임**은 취업 준비생과 구직자들이 서류 탈락, 면접 실패, 코딩테스트 후 불안 등 구직 과정에서 겪는 부정적 감정을 **인지행동치료(CBT)** 방법론을 통해 관리할 수 있도록 돕는 웹 애플리케이션입니다.

AI 상담사와의 대화형 인터페이스를 통해 자동적 사고를 기록하고, 인지 왜곡 패턴을 탐지하며, 건강한 대안 사고(리프레이밍)를 연습할 수 있습니다.

### 핵심 가치

- 🧠 **인지 왜곡 인식** — 흑백논리, 과잉일반화, 파국화 등 7가지 인지 왜곡 패턴 자동 탐지
- 💬 **대화형 CBT** — AI 상담사와 소크라테스식 질문법 기반 대화를 통한 사고 재구조화
- 📊 **데이터 기반 관리** — 감정 추이, 왜곡 분포, 번아웃 지수 등 시각화된 통계
- 🃏 **반복 카드** — 위기 순간에 꺼내볼 수 있는 리프레이밍 카드 보관함

---

## ✨ 주요 기능

### 📋 대시보드
- 누적 지원 수, 서류 합격률, 주요 인지 왜곡, 번아웃 위험도 한눈에 확인
- 감정 추이 분석 차트 (재구조화 전/후 비교)
- 인지 왜곡 분포 시각화
- 진행 중인 지원 현황 & 최근 사고 기록 요약

### 💼 지원 이력 관리
- 기업·포지션별 지원 이력 CRUD
- 커스터마이징 가능한 파이프라인 단계 (서류 접수 → 코딩테스트 → 면접 → 오퍼)
- 단계 변경 시 응원 메시지 제공
- 이력서 유형(파일/링크/라벨) 관리
- 필터링(전체/진행 중/탈락/오퍼) 및 검색

### 🧠 사고 기록지 (AI 대화형)
- AI 상담사와의 채팅 형태로 진행되는 CBT 세션
- 상황 유형 선택 (서류 탈락, 면접 후, 코딩테스트 후, 합격, 기타)
- 감정 선택 및 강도 측정 (10단계)
- 자동적 사고 입력 → AI 인지 왜곡 분석
- 리프레이밍 제안 → 사용자 자기만의 리프레이밍 작성
- 재구조화 전/후 감정 변화 비교
- 위기 키워드 감지 시 전문 상담기관 안내

### 🃏 반복 카드 보관함
- 사고 기록에서 생성된 리프레이밍 카드 관리
- 즐겨찾기 & 사용 횟수 추적
- 인지 왜곡 유형별 분류

### 📊 통계 분석
- 지원 현황 KPI (지원 수, 합격률, 면접 수, 최종 합격)
- 채용 단계별 통과 현황 (Funnel)
- 월별 지원 추이
- 인지 왜곡 분포 분석
- AI 심층 리포트 생성

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18 | UI 라이브러리 |
| TypeScript | 5.5 | 타입 안전성 |
| Vite | 5.4 | 빌드 도구 |
| Tailwind CSS | 3.4 | 스타일링 |
| Zustand | 4.5 | 상태 관리 |
| React Router | 6 | 라우팅 |
| Recharts | 2.12 | 차트 시각화 |
| Axios | 1.7 | HTTP 클라이언트 |
| Lucide React | — | 아이콘 |
| Gemini API | 2.0 Flash | AI 대화 (클라이언트 사이드) |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| NestJS | 10 | 서버 프레임워크 |
| TypeScript | 5.3 | 타입 안전성 |
| TypeORM | 0.3 | ORM |
| MySQL | — | 데이터베이스 |
| Swagger | 7.3 | API 문서화 |
| class-validator | 0.14 | 요청 유효성 검증 |

---

## 📁 프로젝트 구조

```
reframe/
├── frontend/                    # React 프론트엔드
│   ├── public/                  # 정적 파일 (favicon, CNAME, 404.html)
│   ├── src/
│   │   ├── components/          # UI 컴포넌트
│   │   │   ├── layout/          #   레이아웃 (Sidebar, Layout)
│   │   │   ├── applications/    #   지원 이력 모달 (추가/수정/단계변경/축하)
│   │   │   └── GeminiKeyModal   #   Gemini API 키 설정
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   ├── Dashboard        #   대시보드
│   │   │   ├── Applications     #   지원 이력 관리
│   │   │   ├── ThoughtRecords   #   사고 기록 목록
│   │   │   ├── ThoughtRecordNew #   새 사고 기록 (AI 대화형)
│   │   │   ├── ThoughtRecordDetail # 사고 기록 상세
│   │   │   ├── ReframeCards     #   반복 카드 보관함
│   │   │   └── Statistics       #   통계 분석
│   │   ├── stores/              # Zustand 상태 관리
│   │   ├── lib/                 # 유틸리티
│   │   │   ├── api.ts           #   API 클라이언트
│   │   │   ├── gemini.ts        #   Gemini AI 연동
│   │   │   ├── utils.ts         #   공통 유틸
│   │   │   └── mockData.ts      #   목업 데이터
│   │   └── types/               # TypeScript 타입 정의
│   └── package.json
│
├── backend/                     # NestJS 백엔드
│   ├── src/
│   │   ├── applications/        # 지원 이력 모듈
│   │   ├── pipeline-stages/     # 파이프라인 단계 모듈
│   │   ├── thought-records/     # 사고 기록 모듈
│   │   ├── reframe-cards/       # 반복 카드 모듈
│   │   ├── stats/               # 통계/대시보드 모듈
│   │   ├── ai/                  # AI 분석 모듈 (Mock)
│   │   ├── app.module.ts        # 루트 모듈
│   │   └── main.ts              # 엔트리포인트
│   └── package.json
│
├── .github/workflows/deploy.yml # GitHub Pages 배포 워크플로우
├── .gitignore
├── favicon.png
└── README.md
```

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 20 이상
- **MySQL** 8.0 이상
- **Gemini API Key** ([Google AI Studio](https://aistudio.google.com/)에서 발급)

### 1. 저장소 클론

```bash
git clone https://github.com/danto7632/reframe.git
cd reframe
```

### 2. 백엔드 설정

```bash
cd backend
npm install
```

`.env` 파일을 생성합니다:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=reframe
PORT=4000
```

MySQL에 데이터베이스를 생성합니다:

```sql
CREATE DATABASE reframe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

백엔드를 실행합니다:

```bash
npm run dev
```

> API 서버: http://localhost:4000  
> Swagger 문서: http://localhost:4000/api/docs

### 3. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

> 개발 서버: http://localhost:3000

### 4. Gemini API 키 설정

앱 실행 후 사이드바 하단의 **⚙️ AI 설정** 버튼을 클릭하여 Gemini API 키를 등록합니다.  
API 키는 브라우저 LocalStorage에 저장되며, 서버로 전송되지 않습니다.

---

## 🌐 배포

### GitHub Pages (프론트엔드)

`main` 브랜치에 push하면 GitHub Actions가 자동으로 프론트엔드를 빌드하여 GitHub Pages에 배포합니다.

- **배포 URL**: https://reframe.kro.kr
- **워크플로우**: `.github/workflows/deploy.yml`

> GitHub 저장소 Settings → Pages에서 Source를 **GitHub Actions**으로 설정해야 합니다.

---

## 📡 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/applications` | 지원 이력 목록 |
| `POST` | `/api/applications` | 지원 이력 생성 |
| `PATCH` | `/api/applications/:id` | 지원 이력 수정 |
| `PATCH` | `/api/applications/:id/stage` | 채용 단계 변경 |
| `PATCH` | `/api/applications/:id/reject` | 탈락 처리 |
| `DELETE` | `/api/applications/:id` | 지원 이력 삭제 |
| `GET` | `/api/pipeline-stages` | 파이프라인 단계 목록 |
| `POST` | `/api/pipeline-stages` | 단계 생성 |
| `PATCH` | `/api/pipeline-stages/reorder` | 단계 순서 변경 |
| `GET` | `/api/thought-records` | 사고 기록 목록 |
| `POST` | `/api/thought-records` | 사고 기록 생성 |
| `PUT` | `/api/thought-records/:id` | 사고 기록 수정 |
| `POST` | `/api/thought-records/analyze-distortions` | AI 인지 왜곡 분석 |
| `POST` | `/api/thought-records/reframe-suggestions` | AI 리프레이밍 제안 |
| `GET` | `/api/reframe-cards` | 반복 카드 목록 |
| `POST` | `/api/reframe-cards` | 반복 카드 생성 |
| `PATCH` | `/api/reframe-cards/:id/bookmark` | 즐겨찾기 토글 |
| `GET` | `/api/stats/dashboard` | 대시보드 통계 |
| `GET` | `/api/stats/applications` | 지원 현황 통계 |
| `GET` | `/api/stats/insights` | AI 인사이트 |
| `GET` | `/api/stats/report` | 심층 리포트 |

> 전체 API 문서는 Swagger UI(`/api/docs`)에서 확인할 수 있습니다.

---

## 🎨 디자인 시스템

| 컬러 | 용도 |
|------|------|
| `calm` (보라) | 메인 브랜드 컬러, 버튼, 강조 |
| `warm` (앰버) | 따뜻한 피드백, 경고 |
| `sage` (그린) | 긍정 상태, 합격 |
| `rose` (레드) | 부정 상태, 탈락 |

- **폰트**: Pretendard
- **레이아웃**: 반응형 사이드바 + 콘텐츠 영역
- **스타일**: 라운드 카드 UI, 부드러운 그림자, 애니메이션 전환

---

## 🧪 인지 왜곡 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| ⚫⚪ 흑백논리 | 모든 것을 전부 아니면 전무로 판단 | "면접 하나 떨어졌으니 난 완전 실패야" |
| 🔄 과잉일반화 | 하나의 사건을 모든 상황에 적용 | "이번에도 떨어졌으니 앞으로도 다 떨어질 거야" |
| 🔍 정신적 필터링 | 부정적인 측면만 선택적으로 집중 | "합격한 곳도 있지만 탈락에만 신경 쓰여" |
| ❌ 긍정 격하 | 긍정적 경험을 무시하거나 축소 | "붙은 건 운이 좋았을 뿐이야" |
| 🧠 독심술 | 타인의 생각을 부정적으로 추측 | "면접관이 날 무능하다고 생각했을 거야" |
| 💥 파국화 | 최악의 시나리오를 예상 | "이대로면 영원히 취업 못 할 거야" |
| 💭 감정적 추론 | 감정을 사실의 근거로 사용 | "불안하니까 분명 안 될 거야" |

---

## 👥 팀원

| 이름 | 역할 |
|------|------|
| 김인성 | 팀원 |
| 김광일 | 팀원 |
| 이재환 | 팀원 |
| 고은서 | 팀원 |

---

## 📄 라이선스

이 프로젝트는 학술·교육 목적으로 제작되었습니다.

---

<p align="center">
  <i>"탈락은 끝이 아니라, 더 나은 기회를 향한 리프레이밍의 시작입니다."</i>
</p>
