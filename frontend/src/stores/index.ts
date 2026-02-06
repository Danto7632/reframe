import { create } from 'zustand';
import type {
  Application,
  PipelineStage,
  ThoughtRecord,
  ReframeCard,
  DashboardStats,
  EmotionTrend,
  DistortionDistribution,
} from '@/types';
import {
  applicationsApi,
  pipelineApi,
  thoughtRecordsApi,
  reframeCardsApi,
  statsApi,
} from '@/lib/api';
import {
  mockApplications, mockStages, mockThoughtRecords,
  mockReframeCards, mockDashboardStats, mockEmotionTrends,
  mockDistortionDist,
} from '@/lib/mockData';

/* ── Application Store ── */
interface ApplicationStore {
  applications: Application[];
  stages: PipelineStage[];
  loading: boolean;
  initialized: boolean;
  selectedApp: Application | null;
  setApplications: (apps: Application[]) => void;
  setStages: (stages: PipelineStage[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedApp: (app: Application | null) => void;
  fetchAll: () => Promise<void>;
  addApplication: (app: Application) => void;
  createApplication: (data: Record<string, unknown>) => Promise<Application>;
  updateApplication: (id: string, data: Partial<Application>) => void;
  updateApplicationApi: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeApplication: (id: string) => void;
  deleteApplication: (id: string) => Promise<void>;
  updateStageApi: (id: string, stageId: string, memo?: string) => Promise<Application>;
  rejectApi: (id: string, memo?: string) => Promise<Application>;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  stages: [],
  loading: false,
  initialized: false,
  selectedApp: null,
  setApplications: (applications) => set({ applications }),
  setStages: (stages) => set({ stages }),
  setLoading: (loading) => set({ loading }),
  setSelectedApp: (selectedApp) => set({ selectedApp }),
  fetchAll: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const [appsRes, stagesRes] = await Promise.all([
        applicationsApi.getAll(),
        pipelineApi.getAll(),
      ]);
      const apiApps: Application[] = appsRes.data;
      const apiStages: PipelineStage[] = stagesRes.data;
      // API에서 가져온 데이터와 mock 데이터를 합침
      // (DB에 없는 mock 데이터는 기본 표시용으로 유지)
      const existingIds = new Set(apiApps.map((a) => a.id));
      const mergedApps = [
        ...apiApps,
        ...mockApplications
          .filter((m) => !existingIds.has(m.id))
          .map((m) => {
            // mock의 currentStageId를 실제 DB stages에 맵핑
            const matchStage = apiStages.find((s) => s.label === m.currentStage?.label);
            return { ...m, currentStageId: matchStage?.id || null, currentStage: matchStage || m.currentStage };
          }),
      ];
      set({ applications: mergedApps, stages: apiStages, initialized: true, loading: false });
    } catch {
      // API 실패 시 mock 사용
      set({ applications: mockApplications, stages: mockStages, initialized: true, loading: false });
    }
  },
  addApplication: (app) =>
    set((s) => ({ applications: [app, ...s.applications] })),
  createApplication: async (data) => {
    const res = await applicationsApi.create(data);
    const newApp: Application = res.data;
    set((s) => ({ applications: [newApp, ...s.applications] }));
    return newApp;
  },
  updateApplication: (id, data) =>
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, ...data } : a,
      ),
    })),
  updateApplicationApi: async (id, data) => {
    const res = await applicationsApi.update(id, data);
    const updated: Application = res.data;
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? updated : a)),
    }));
  },
  removeApplication: (id) =>
    set((s) => ({
      applications: s.applications.filter((a) => a.id !== id),
    })),
  deleteApplication: async (id) => {
    try {
      await applicationsApi.delete(id);
    } catch {
      // mock 데이터는 DB에 없으므로 무시
    }
    set((s) => ({
      applications: s.applications.filter((a) => a.id !== id),
    }));
  },
  updateStageApi: async (id, stageId, memo) => {
    const res = await applicationsApi.updateStage(id, stageId, memo);
    const updated: Application = res.data;
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },
  rejectApi: async (id, memo) => {
    const res = await applicationsApi.reject(id, memo);
    const updated: Application = res.data;
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },
}));

/* ── Thought Record Store ── */
interface ThoughtRecordStore {
  records: ThoughtRecord[];
  loading: boolean;
  initialized: boolean;
  setRecords: (records: ThoughtRecord[]) => void;
  setLoading: (loading: boolean) => void;
  fetchAll: () => Promise<void>;
  addRecord: (record: ThoughtRecord) => void;
  createRecord: (data: Record<string, unknown>) => Promise<ThoughtRecord>;
  updateRecord: (id: string, data: Partial<ThoughtRecord>) => void;
  updateRecordApi: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useThoughtRecordStore = create<ThoughtRecordStore>((set, get) => ({
  records: [],
  loading: false,
  initialized: false,
  setRecords: (records) => set({ records }),
  setLoading: (loading) => set({ loading }),
  fetchAll: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await thoughtRecordsApi.getAll();
      const apiRecords: ThoughtRecord[] = res.data;
      const existingIds = new Set(apiRecords.map((r) => r.id));
      const merged = [
        ...apiRecords,
        ...mockThoughtRecords.filter((m) => !existingIds.has(m.id)),
      ];
      set({ records: merged, initialized: true, loading: false });
    } catch {
      set({ records: mockThoughtRecords, initialized: true, loading: false });
    }
  },
  addRecord: (record) =>
    set((s) => ({ records: [record, ...s.records] })),
  createRecord: async (data) => {
    const res = await thoughtRecordsApi.create(data);
    const newRecord: ThoughtRecord = res.data;
    set((s) => ({ records: [newRecord, ...s.records] }));
    return newRecord;
  },
  updateRecord: (id, data) =>
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r,
      ),
    })),
  updateRecordApi: async (id, data) => {
    try {
      const res = await thoughtRecordsApi.update(id, data);
      const updated: ThoughtRecord = res.data;
      set((s) => ({
        records: s.records.map((r) => (r.id === id ? updated : r)),
      }));
    } catch {
      // mock 레코드는 DB에 없으므로 로컬만 업데이트
      set((s) => ({
        records: s.records.map((r) =>
          r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r,
        ),
      }));
    }
  },
  deleteRecord: async (id) => {
    try {
      await thoughtRecordsApi.delete(id);
    } catch {
      // mock 데이터는 DB에 없으므로 무시
    }
    set((s) => ({
      records: s.records.filter((r) => r.id !== id),
    }));
  },
}));

/* ── Reframe Card Store ── */
interface ReframeCardStore {
  cards: ReframeCard[];
  loading: boolean;
  initialized: boolean;
  setCards: (cards: ReframeCard[]) => void;
  setLoading: (loading: boolean) => void;
  fetchAll: () => Promise<void>;
  createCard: (data: Record<string, unknown>) => Promise<ReframeCard>;
  toggleBookmark: (id: string) => void;
  toggleBookmarkApi: (id: string) => Promise<void>;
  removeCard: (id: string) => void;
  deleteCard: (id: string) => Promise<void>;
}

export const useReframeCardStore = create<ReframeCardStore>((set, get) => ({
  cards: [],
  loading: false,
  initialized: false,
  setCards: (cards) => set({ cards }),
  setLoading: (loading) => set({ loading }),
  fetchAll: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await reframeCardsApi.getAll();
      const apiCards: ReframeCard[] = res.data;
      const existingIds = new Set(apiCards.map((c) => c.id));
      const merged = [
        ...apiCards,
        ...mockReframeCards.filter((m) => !existingIds.has(m.id)),
      ];
      set({ cards: merged, initialized: true, loading: false });
    } catch {
      set({ cards: mockReframeCards, initialized: true, loading: false });
    }
  },
  createCard: async (data) => {
    const res = await reframeCardsApi.create(data);
    const newCard: ReframeCard = res.data;
    set((s) => ({ cards: [newCard, ...s.cards] }));
    return newCard;
  },
  toggleBookmark: (id) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c,
      ),
    })),
  toggleBookmarkApi: async (id) => {
    try {
      const res = await reframeCardsApi.toggleBookmark(id);
      const updated: ReframeCard = res.data;
      set((s) => ({
        cards: s.cards.map((c) => (c.id === id ? updated : c)),
      }));
    } catch {
      // mock 데이터인 경우 로컬만 토글
      set((s) => ({
        cards: s.cards.map((c) =>
          c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c,
        ),
      }));
    }
  },
  removeCard: (id) =>
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
  deleteCard: async (id) => {
    try {
      await reframeCardsApi.delete(id);
    } catch {
      // mock 데이터는 DB에 없으므로 무시
    }
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
  },
}));

/* ── Dashboard Store ── */
interface DashboardStore {
  stats: DashboardStats | null;
  emotionTrends: EmotionTrend[];
  distortionDist: DistortionDistribution[];
  loading: boolean;
  initialized: boolean;
  setStats: (stats: DashboardStats) => void;
  setEmotionTrends: (trends: EmotionTrend[]) => void;
  setDistortionDist: (dist: DistortionDistribution[]) => void;
  setLoading: (loading: boolean) => void;
  fetchAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  emotionTrends: [],
  distortionDist: [],
  loading: false,
  initialized: false,
  setStats: (stats) => set({ stats }),
  setEmotionTrends: (emotionTrends) => set({ emotionTrends }),
  setDistortionDist: (distortionDist) => set({ distortionDist }),
  setLoading: (loading) => set({ loading }),
  fetchAll: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const [dashRes, trendsRes, distRes] = await Promise.all([
        statsApi.getDashboard(),
        thoughtRecordsApi.getEmotionTrends(),
        thoughtRecordsApi.getDistortionDist(),
      ]);
      const dash = dashRes.data;
      // API 대시보드 데이터를 프론트엔드 DashboardStats 형태로 변환
      const apiStats: DashboardStats = {
        totalApplications: dash?.applications?.total ?? 0,
        documentPassRate: dash?.applications?.passRate ?? 0,
        topDistortion: dash?.topDistortion?.type ?? '-',
        burnoutRisk: dash?.burnoutIndex ?? 0,
      };
      // 실제 데이터가 0이면 mock 표시
      const hasData = apiStats.totalApplications > 0;
      set({
        stats: hasData ? apiStats : mockDashboardStats,
        emotionTrends: (trendsRes.data?.length > 0) ? trendsRes.data : mockEmotionTrends,
        distortionDist: (distRes.data?.length > 0) ? distRes.data : mockDistortionDist,
        initialized: true,
        loading: false,
      });
    } catch {
      set({
        stats: mockDashboardStats,
        emotionTrends: mockEmotionTrends,
        distortionDist: mockDistortionDist,
        initialized: true,
        loading: false,
      });
    }
  },
}));

/* ── UI Store ── */
interface UIStore {
  sidebarOpen: boolean;
  modalType: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalData: any;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  modalType: null,
  modalData: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  openModal: (modalType, modalData = null) => set({ modalType, modalData }),
  closeModal: () => set({ modalType: null, modalData: null }),
}));
