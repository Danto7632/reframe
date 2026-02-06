import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import {
  FileText, TrendingUp, Brain, AlertTriangle,
  ArrowRight, Plus,
} from 'lucide-react';
import { useDashboardStore, useApplicationStore, useThoughtRecordStore } from '@/stores';
import { cn, formatDate, getStageColor, getEncouragement } from '@/lib/utils';

const PIE_COLORS = ['#4C3AED', '#F09E0F', '#F06E80', '#302C80', '#6252EF', '#22c55e', '#383593'];

export default function Dashboard() {
  const { stats, emotionTrends, distortionDist } = useDashboardStore();
  const dashFetchAll = useDashboardStore((s) => s.fetchAll);
  const { applications, stages } = useApplicationStore();
  const appFetchAll = useApplicationStore((s) => s.fetchAll);
  const { records } = useThoughtRecordStore();
  const recFetchAll = useThoughtRecordStore((s) => s.fetchAll);

  useEffect(() => {
    dashFetchAll();
    appFetchAll();
    recFetchAll();
  }, [dashFetchAll, appFetchAll, recFetchAll]);

  const summaryCards = [
    { label: '누적 지원 수', value: stats?.totalApplications ?? 0, icon: FileText, color: 'text-calm-500', bg: 'bg-calm-50' },
    { label: '서류 합격률', value: `${stats?.documentPassRate ?? 0}%`, icon: TrendingUp, color: 'text-sage-500', bg: 'bg-sage-50' },
    { label: '주요 인지 왜곡', value: stats?.topDistortion ?? '-', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: '번아웃 위험도', value: `${stats?.burnoutRisk ?? 0}%`, icon: AlertTriangle, color: (stats?.burnoutRisk ?? 0) > 60 ? 'text-rose-500' : 'text-amber-500', bg: (stats?.burnoutRisk ?? 0) > 60 ? 'bg-rose-50' : 'bg-amber-50' },
  ];

  // 진행 중인 지원 현황 (탈락 제외)
  const activeApps = applications.filter((a) => !a.isRejected).slice(0, 4);
  // 최근 사고 기록
  const recentRecords = records.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="mt-1 text-sm text-slate-400">현재 취업 상태와 감정 상태를 한눈에 확인하세요</p>
        </div>
        <Link
          to="/thought-records/new"
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          새 사고 기록하기
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-4">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', bg)}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Emotion Trend */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">감정 추이 분석</h3>
          <p className="mb-4 text-xs text-slate-400">재구조화 전/후 감정 강도 비교</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emotionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgBefore"
                  stroke="#EB3D5B"
                  strokeWidth={2}
                  name="재구조화 전"
                  dot={{ r: 4, fill: '#EB3D5B' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgAfter"
                  stroke="#4F8A4F"
                  strokeWidth={2}
                  name="재구조화 후"
                  dot={{ r: 4, fill: '#4F8A4F' }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distortion Distribution */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">인지 왜곡 분포</h3>
          <p className="mb-4 text-xs text-slate-400">가장 많이 발생하는 왜곡 유형</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distortionDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="label"
                >
                  {distortionDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}건`, name]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress & Recent Records */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 진행 중인 지원 현황 */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">진행 중인 지원 현황</h3>
            <Link to="/applications" className="text-xs text-calm-500 hover:text-calm-600 flex items-center gap-1">
              전체 보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeApps.map((app) => {
              const stageIdx = stages.findIndex((s) => s.id === app.currentStageId);
              const progress = stages.length > 0 ? ((stageIdx + 1) / stages.length) * 100 : 0;
              const enc = getEncouragement(app.currentStage?.label || '', app.isRejected);
              return (
                <div key={app.id} className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{app.company}</span>
                      <span className="text-xs text-slate-400">{app.position}</span>
                    </div>
                    <span className={cn('badge', getStageColor(app.currentStage?.label || '', app.isRejected))}>
                      {app.isRejected ? '탈락' : app.currentStage?.label}
                    </span>
                  </div>
                  {/* Mini Pipeline Progress */}
                  <div className="mt-2">
                    <div className="flex items-center gap-1 mb-1">
                      {stages.map((s, i) => (
                        <div
                          key={s.id}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-all',
                            i <= stageIdx ? 'bg-calm-400' : 'bg-gray-100',
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span>{enc.emoji}</span>
                      <span>{enc.message}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 최근 사고 기록 */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">최근 사고 기록</h3>
            <Link to="/thought-records" className="text-xs text-calm-500 hover:text-calm-600 flex items-center gap-1">
              전체 보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <Link
                key={record.id}
                to={`/thought-records/${record.id}`}
                className="block rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{formatDate(record.createdAt)}</span>
                  <span className={cn('badge', record.isCompleted ? 'badge-green' : 'badge-yellow')}>
                    {record.isCompleted ? '완료' : '진행 중'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2 mb-2">{record.automaticThought}</p>
                <div className="flex flex-wrap gap-1">
                  {record.distortions.map((d) => (
                    <span key={d.type} className="badge badge-blue">{d.label}</span>
                  ))}
                  {record.emotionsBefore.slice(0, 3).map((e) => (
                    <span key={e.name} className="badge bg-warm-100 text-warm-700">{e.name} {e.intensity}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
