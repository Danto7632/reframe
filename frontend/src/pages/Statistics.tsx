import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  FileText, TrendingUp, Users, Award,
  Download, Calendar, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { statsApi } from '@/lib/api';

const PIE_COLORS = ['#4C3AED', '#F09E0F', '#F06E80', '#302C80', '#22c55e', '#383593'];

// Fallback statistics data
const defaultKpiData = {
  totalApplications: 25,
  documentPassRate: 52,
  interviewCount: 8,
  finalAcceptance: 2,
};

const defaultCompanySizeData = [
  { size: '대기업', count: 8, passRate: 25 },
  { size: '중견기업', count: 6, passRate: 50 },
  { size: '중소기업', count: 5, passRate: 80 },
  { size: '스타트업', count: 6, passRate: 67 },
];

const defaultStageData = [
  { stage: '지원', count: 25 },
  { stage: '서류 통과', count: 13 },
  { stage: '코딩테스트', count: 8 },
  { stage: '면접', count: 6 },
  { stage: '최종 합격', count: 2 },
];

const defaultMonthlyData = [
  { month: '10월', applications: 3, passes: 1 },
  { month: '11월', applications: 5, passes: 2 },
  { month: '12월', applications: 6, passes: 3 },
  { month: '1월', applications: 7, passes: 4 },
  { month: '2월', applications: 4, passes: 3 },
];

const defaultDomainData = [
  { domain: '프론트엔드', count: 10, percentage: 40 },
  { domain: '백엔드', count: 8, percentage: 32 },
  { domain: '풀스택', count: 4, percentage: 16 },
  { domain: 'iOS', count: 3, percentage: 12 },
];

const defaultInsights = [
  {
    type: 'positive',
    title: '합격률이 높은 조건',
    content: '중소기업·스타트업 프론트엔드 직무에서 서류 통과율 75%로 가장 높습니다.',
    icon: '🎯',
  },
  {
    type: 'warning',
    title: '불리한 패턴',
    content: '대기업 지원 시 서류 탈락률이 75%입니다. 이력서 키워드 최적화를 고려해보세요.',
    icon: '⚠️',
  },
  {
    type: 'suggestion',
    title: '지원 전략 제안',
    content: '중견기업 백엔드 포지션의 면접 전환율이 높은 편입니다. 해당 분야 지원을 늘려보세요.',
    icon: '💡',
  },
];

type Period = 'all' | '3months' | 'year';

export default function Statistics() {
  const [period, setPeriod] = useState<Period>('all');
  const [kpiData, setKpiData] = useState(defaultKpiData);
  const [companySizeData] = useState(defaultCompanySizeData);
  const [stageData] = useState(defaultStageData);
  const [monthlyData] = useState(defaultMonthlyData);
  const [domainData] = useState(defaultDomainData);
  const [aiInsights] = useState(defaultInsights);

  useEffect(() => {
    // API에서 통계 가져오기
    statsApi.getApplicationStats().then((res) => {
      const d = res.data;
      if (d && d.totalApplications !== undefined) {
        setKpiData({
          totalApplications: d.totalApplications ?? defaultKpiData.totalApplications,
          documentPassRate: d.documentPassRate ?? defaultKpiData.documentPassRate,
          interviewCount: d.interviewCount ?? defaultKpiData.interviewCount,
          finalAcceptance: d.finalAcceptance ?? defaultKpiData.finalAcceptance,
        });
      }
    }).catch(() => {
      // fallback to defaults
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">지원 통계 분석</h1>
          <p className="mt-1 text-sm text-slate-400">지원 이력 심층 리포트</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {[
              { key: 'all' as Period, label: '전체' },
              { key: '3months' as Period, label: '3개월' },
              { key: 'year' as Period, label: '올해' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  period === tab.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="btn-secondary text-sm">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: '총 지원 수', value: kpiData.totalApplications, icon: FileText, color: 'text-calm-500', bg: 'bg-calm-50' },
          { label: '서류 합격률', value: `${kpiData.documentPassRate}%`, icon: TrendingUp, color: 'text-sage-500', bg: 'bg-sage-50' },
          { label: '면접 진행 수', value: kpiData.interviewCount, icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: '최종 합격', value: kpiData.finalAcceptance, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 채용 단계별 통계 (Funnel) */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">채용 단계별 통계</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#4C3AED" radius={[0, 6, 6, 0]} name="건수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 도메인별 분포 */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">도메인별 결과 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="domain"
                >
                  {domainData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 기업 규모별 분석 */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">기업 규모별 분석</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companySizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="size" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#4C3AED" radius={[6, 6, 0, 0]} name="지원 수" />
                <Bar dataKey="passRate" fill="#4F8A4F" radius={[6, 6, 0, 0]} name="합격률(%)"/>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 월별 추이 */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">월별 지원 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="applications" stroke="#4C3AED" strokeWidth={2} name="지원" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="passes" stroke="#4F8A4F" strokeWidth={2} name="합격" dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-amber-500" />
          <h3 className="text-base font-semibold text-slate-800">AI 개인 맞춤 분석</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {aiInsights.map((insight, i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl border p-4',
                insight.type === 'positive' && 'border-sage-100 bg-sage-50',
                insight.type === 'warning' && 'border-amber-100 bg-amber-50',
                insight.type === 'suggestion' && 'border-calm-100 bg-calm-50',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{insight.icon}</span>
                <span className="text-sm font-semibold text-slate-700">{insight.title}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{insight.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
