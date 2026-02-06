import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ── Applications ── */
export const applicationsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/applications', { params }),
  getOne: (id: string) => api.get(`/applications/${id}`),
  create: (data: Record<string, unknown>) => api.post('/applications', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
  updateStage: (id: string, stageId: string, memo?: string) =>
    api.patch(`/applications/${id}/stage`, { stageId, memo }),
  reject: (id: string, memo?: string) =>
    api.patch(`/applications/${id}/reject`, { memo }),
};

/* ── Pipeline Stages ── */
export const pipelineApi = {
  getAll: () => api.get('/pipeline-stages'),
  create: (data: { label: string; order: number; encouragement?: string }) =>
    api.post('/pipeline-stages', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/pipeline-stages/${id}`, data),
  delete: (id: string) => api.delete(`/pipeline-stages/${id}`),
  reorder: (stages: { id: string; order: number }[]) =>
    api.patch('/pipeline-stages/reorder', { stages }),
};

/* ── Thought Records ── */
export const thoughtRecordsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/thought-records', { params }),
  getOne: (id: string) => api.get(`/thought-records/${id}`),
  create: (data: Record<string, unknown>) => api.post('/thought-records', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/thought-records/${id}`, data),
  delete: (id: string) => api.delete(`/thought-records/${id}`),
  getEmotionTrends: () => api.get('/thought-records/emotion-trends'),
  getDistortionDist: () => api.get('/thought-records/distortion-distribution'),
  analyzeDistortions: (data: { thought: string; situationType: string; situationDetail: string }) =>
    api.post('/thought-records/analyze-distortions', data),
  getReframeSuggestions: (data: {
    thought: string;
    distortions: string[];
    situationType: string;
    company?: string;
    position?: string;
  }) => api.post('/thought-records/reframe-suggestions', data),
};

/* ── Reframe Cards ── */
export const reframeCardsApi = {
  getAll: (params?: Record<string, string>) => api.get('/reframe-cards', { params }),
  getOne: (id: string) => api.get(`/reframe-cards/${id}`),
  create: (data: Record<string, unknown>) => api.post('/reframe-cards', data),
  toggleBookmark: (id: string) => api.patch(`/reframe-cards/${id}/bookmark`),
  recordUse: (id: string) => api.patch(`/reframe-cards/${id}/use`),
  delete: (id: string) => api.delete(`/reframe-cards/${id}`),
};

/* ── Dashboard / Statistics ── */
export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
  getApplicationStats: () => api.get('/stats/applications'),
  getInsights: () => api.get('/stats/insights'),
  getReport: () => api.get('/stats/report'),
};

export default api;
