/* ── 공통 ── */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/* ── 파이프라인 단계 ── */
export interface PipelineStage extends BaseEntity {
  userId: string;
  label: string;
  order: number;
  isDefault: boolean;
  encouragement: string | null;
}

/* ── 지원 이력 ── */
export type ResumeType = 'file' | 'link' | 'label';

export interface Application extends BaseEntity {
  userId: string;
  company: string;
  position: string;
  appliedAt: string;
  resumeType: ResumeType | null;
  resumeValue: string | null;
  currentStageId: string | null;
  currentStage?: PipelineStage;
  isRejected: boolean;
  memo: string | null;
  thoughtRecordCount?: number;
}

/* ── 감정 ── */
export interface EmotionEntry {
  name: string;
  intensity: number;
}

export const EMOTION_LIST = [
  '불안', '우울', '분노', '자괴감', '무력감',
  '좌절', '두려움', '슬픔', '초조', '혼란',
] as const;

export type EmotionName = (typeof EMOTION_LIST)[number];

/* ── 상황 유형 ── */
export type SituationType =
  | 'rejection'
  | 'interview_after'
  | 'coding_test_after'
  | 'acceptance'
  | 'other';

export const SITUATION_LABELS: Record<SituationType, string> = {
  rejection: '서류 탈락',
  interview_after: '면접 후',
  coding_test_after: '코딩테스트 후',
  acceptance: '합격',
  other: '기타',
};

/* ── 인지 왜곡 ── */
export const DISTORTION_TYPES = [
  { key: 'all_or_nothing', label: '흑백논리', emoji: '⚫⚪', desc: '모든 것을 전부 아니면 전무로 판단' },
  { key: 'overgeneralization', label: '과잉일반화', emoji: '🔄', desc: '하나의 사건을 모든 상황에 적용' },
  { key: 'mental_filter', label: '정신적 필터링', emoji: '🔍', desc: '부정적인 측면만 선택적으로 집중' },
  { key: 'disqualifying_positive', label: '긍정 격하', emoji: '❌', desc: '긍정적 경험을 무시하거나 축소' },
  { key: 'mind_reading', label: '독심술', emoji: '🧠', desc: '타인의 생각을 부정적으로 추측' },
  { key: 'catastrophizing', label: '파국화', emoji: '💥', desc: '최악의 시나리오를 예상' },
  { key: 'emotional_reasoning', label: '감정적 추론', emoji: '💭', desc: '감정을 사실의 근거로 사용' },
] as const;

export type DistortionKey = (typeof DISTORTION_TYPES)[number]['key'];

/* ── 사고 기록 ── */
export interface DistortionResult {
  type: DistortionKey;
  label: string;
  reason: string;
}

export interface ThoughtRecord extends BaseEntity {
  userId: string;
  applicationId: string | null;
  application?: Application;
  situationType: SituationType;
  situationDetail: string;
  emotionsBefore: EmotionEntry[];
  automaticThought: string;
  distortions: DistortionResult[];
  aiReframe: string | null;
  userReframe: string | null;
  emotionsAfter: EmotionEntry[] | null;
  isCompleted: boolean;
}

/* ── 반복 카드 ── */
export interface ReframeCard extends BaseEntity {
  userId: string;
  thoughtRecordId: string;
  thoughtRecord?: ThoughtRecord;
  content: string;
  distortionType: DistortionKey;
  effectScore: number;
  isBookmarked: boolean;
}

/* ── 대시보드 통계 ── */
export interface DashboardStats {
  totalApplications: number;
  documentPassRate: number;
  topDistortion: string;
  burnoutRisk: number;
}

export interface EmotionTrend {
  date: string;
  avgBefore: number;
  avgAfter: number;
}

export interface DistortionDistribution {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface StageCount {
  stage: string;
  count: number;
}

/* ── API 응답 ── */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
