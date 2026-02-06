import type {
  Application,
  PipelineStage,
  ThoughtRecord,
  ReframeCard,
  DashboardStats,
  EmotionTrend,
  DistortionDistribution,
} from '@/types';

export const mockStages: PipelineStage[] = [
  { id: 's1', userId: 'u1', label: '지원', order: 0, isDefault: true, encouragement: '첫 발을 내딛었어요!', createdAt: '', updatedAt: '' },
  { id: 's2', userId: 'u1', label: '서류', order: 1, isDefault: true, encouragement: '한 걸음 더 나아갔어요!', createdAt: '', updatedAt: '' },
  { id: 's3', userId: 'u1', label: '코딩테스트', order: 2, isDefault: false, encouragement: '실력을 보여줄 차례에요!', createdAt: '', updatedAt: '' },
  { id: 's4', userId: 'u1', label: '1차면접', order: 3, isDefault: false, encouragement: '거의 다 왔어요, 힘내세요!', createdAt: '', updatedAt: '' },
  { id: 's5', userId: 'u1', label: '2차면접', order: 4, isDefault: false, encouragement: '끝이 보여요! 파이팅!', createdAt: '', updatedAt: '' },
  { id: 's6', userId: 'u1', label: '오퍼', order: 5, isDefault: true, encouragement: '해냈어요! 축하합니다!', createdAt: '', updatedAt: '' },
];

export const mockApplications: Application[] = [
  {
    id: 'a1', userId: 'u1', company: '네이버', position: '프론트엔드 개발자',
    appliedAt: '2026-01-15', resumeType: 'label', resumeValue: 'v3.2',
    currentStageId: 's4', currentStage: mockStages[3], isRejected: false,
    memo: '기술 면접 준비 중', createdAt: '2026-01-15', updatedAt: '2026-02-01',
    thoughtRecordCount: 2,
  },
  {
    id: 'a2', userId: 'u1', company: '카카오', position: '풀스택 개발자',
    appliedAt: '2026-01-20', resumeType: 'link', resumeValue: 'https://notion.so/resume',
    currentStageId: 's2', currentStage: mockStages[1], isRejected: true,
    memo: '서류 탈락', createdAt: '2026-01-20', updatedAt: '2026-01-28',
    thoughtRecordCount: 1,
  },
  {
    id: 'a3', userId: 'u1', company: '토스', position: '백엔드 개발자',
    appliedAt: '2026-01-25', resumeType: 'label', resumeValue: 'v3.2',
    currentStageId: 's3', currentStage: mockStages[2], isRejected: false,
    memo: '코딩테스트 대기 중', createdAt: '2026-01-25', updatedAt: '2026-02-03',
    thoughtRecordCount: 0,
  },
  {
    id: 'a4', userId: 'u1', company: '라인', position: 'iOS 개발자',
    appliedAt: '2026-02-01', resumeType: null, resumeValue: null,
    currentStageId: 's1', currentStage: mockStages[0], isRejected: false,
    memo: null, createdAt: '2026-02-01', updatedAt: '2026-02-01',
    thoughtRecordCount: 0,
  },
  {
    id: 'a5', userId: 'u1', company: '쿠팡', position: '프론트엔드 개발자',
    appliedAt: '2026-01-10', resumeType: 'label', resumeValue: 'v3.0',
    currentStageId: 's6', currentStage: mockStages[5], isRejected: false,
    memo: '오퍼 수령! 연봉 협상 중', createdAt: '2026-01-10', updatedAt: '2026-02-05',
    thoughtRecordCount: 3,
  },
];

export const mockThoughtRecords: ThoughtRecord[] = [
  {
    id: 't1', userId: 'u1', applicationId: 'a2',
    application: mockApplications[1],
    situationType: 'rejection', situationDetail: '카카오 서류 탈락 통보를 받았다. 열심히 준비한 이력서였는데...',
    emotionsBefore: [{ name: '자괴감', intensity: 8 }, { name: '우울', intensity: 7 }, { name: '무력감', intensity: 6 }],
    automaticThought: '나는 아무리 노력해도 안 되는 사람인 것 같다. 카카오급 회사에는 능력이 안 되는 걸까.',
    distortions: [
      { type: 'overgeneralization', label: '과잉일반화', reason: '한 번의 탈락을 "아무리 해도 안 된다"로 확장하고 있습니다' },
      { type: 'all_or_nothing', label: '흑백논리', reason: '"능력이 안 된다"는 0 또는 100의 판단입니다' },
    ],
    aiReframe: '한 곳의 결과가 당신의 전체 능력을 정의하지 않아요. 채용은 회사의 현재 상황, 타이밍, 포지션 적합도 등 다양한 요소가 작용합니다.',
    userReframe: '이번 탈락은 나의 능력 부족이 아니라, 카카오의 현재 채용 기준과 내 경력의 방향성이 달랐던 것일 수 있다.',
    emotionsAfter: [{ name: '자괴감', intensity: 4 }, { name: '우울', intensity: 3 }, { name: '무력감', intensity: 3 }],
    isCompleted: true,
    createdAt: '2026-01-28T14:30:00', updatedAt: '2026-01-28T15:00:00',
  },
  {
    id: 't2', userId: 'u1', applicationId: 'a1',
    application: mockApplications[0],
    situationType: 'interview_after', situationDetail: '네이버 1차 면접을 마쳤다. 기술 질문에 제대로 대답 못한 부분이 있었다.',
    emotionsBefore: [{ name: '불안', intensity: 9 }, { name: '초조', intensity: 7 }],
    automaticThought: '면접관 표정이 안 좋았어. 분명 떨어질 거야. 기술 질문에 하나라도 못 대답하면 끝이야.',
    distortions: [
      { type: 'mind_reading', label: '독심술', reason: '면접관의 표정만으로 결과를 단정짓고 있습니다' },
      { type: 'catastrophizing', label: '파국화', reason: '하나의 질문 실수를 전체 실패로 연결하고 있습니다' },
    ],
    aiReframe: '면접관의 표정은 다양한 이유가 있을 수 있어요. 기술 면접에서 모든 질문에 완벽하게 답하는 것은 현실적으로 어렵고, 면접관도 그것을 기대하지 않습니다.',
    userReframe: null,
    emotionsAfter: null,
    isCompleted: false,
    createdAt: '2026-02-01T16:00:00', updatedAt: '2026-02-01T16:30:00',
  },
  {
    id: 't3', userId: 'u1', applicationId: 'a5',
    application: mockApplications[4],
    situationType: 'acceptance', situationDetail: '쿠팡에서 오퍼를 받았다. 하지만 기대한 연봉보다 낮았다.',
    emotionsBefore: [{ name: '혼란', intensity: 6 }, { name: '불안', intensity: 5 }],
    automaticThought: '연봉이 기대보다 낮으면 내가 그만큼의 가치가 없다는 뜻 아닐까?',
    distortions: [
      { type: 'emotional_reasoning', label: '감정적 추론', reason: '연봉이 자신의 가치를 결정한다고 느끼고 있습니다' },
    ],
    aiReframe: '초봉이나 오퍼 금액은 회사의 급여 체계, 직무 레벨 등 여러 요인에 의해 결정됩니다. 이것이 개인의 가치를 대변하지는 않습니다.',
    userReframe: '연봉은 협상 가능한 숫자이고, 내 시장 가치는 하나의 오퍼로 결정되지 않는다. 경험을 쌓으면서 차차 올려갈 수 있다.',
    emotionsAfter: [{ name: '혼란', intensity: 3 }, { name: '불안', intensity: 2 }],
    isCompleted: true,
    createdAt: '2026-02-05T10:00:00', updatedAt: '2026-02-05T10:30:00',
  },
];

export const mockReframeCards: ReframeCard[] = [
  {
    id: 'rc1', userId: 'u1', thoughtRecordId: 't1',
    thoughtRecord: mockThoughtRecords[0],
    content: '이번 탈락은 나의 능력 부족이 아니라, 카카오의 현재 채용 기준과 내 경력의 방향성이 달랐던 것일 수 있다.',
    distortionType: 'overgeneralization', effectScore: 4.3,
    isBookmarked: true, createdAt: '2026-01-28T15:00:00', updatedAt: '2026-01-28T15:00:00',
  },
  {
    id: 'rc2', userId: 'u1', thoughtRecordId: 't3',
    thoughtRecord: mockThoughtRecords[2],
    content: '연봉은 협상 가능한 숫자이고, 내 시장 가치는 하나의 오퍼로 결정되지 않는다.',
    distortionType: 'emotional_reasoning', effectScore: 3.0,
    isBookmarked: false, createdAt: '2026-02-05T10:30:00', updatedAt: '2026-02-05T10:30:00',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalApplications: 5,
  documentPassRate: 60,
  topDistortion: '과잉일반화',
  burnoutRisk: 42,
};

export const mockEmotionTrends: EmotionTrend[] = [
  { date: '01/20', avgBefore: 7.5, avgAfter: 4.0 },
  { date: '01/25', avgBefore: 6.0, avgAfter: 3.5 },
  { date: '01/28', avgBefore: 7.0, avgAfter: 3.3 },
  { date: '02/01', avgBefore: 8.0, avgAfter: 5.0 },
  { date: '02/03', avgBefore: 5.5, avgAfter: 2.5 },
  { date: '02/05', avgBefore: 5.5, avgAfter: 2.5 },
];

export const mockDistortionDist: DistortionDistribution[] = [
  { type: 'overgeneralization', label: '과잉일반화', count: 5, percentage: 28 },
  { type: 'catastrophizing', label: '파국화', count: 4, percentage: 22 },
  { type: 'all_or_nothing', label: '흑백논리', count: 3, percentage: 17 },
  { type: 'mind_reading', label: '독심술', count: 3, percentage: 17 },
  { type: 'emotional_reasoning', label: '감정적 추론', count: 2, percentage: 11 },
  { type: 'mental_filter', label: '정신적 필터링', count: 1, percentage: 5 },
];
