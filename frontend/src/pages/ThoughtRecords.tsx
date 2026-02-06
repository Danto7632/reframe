import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Brain, Filter } from 'lucide-react';
import { useThoughtRecordStore } from '@/stores';
import { cn, formatDate } from '@/lib/utils';
import { DISTORTION_TYPES, SITUATION_LABELS } from '@/types';
import type { SituationType } from '@/types';

export default function ThoughtRecords() {
  const { records } = useThoughtRecordStore();
  const fetchAll = useThoughtRecordStore((s) => s.fetchAll);
  const [search, setSearch] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = records.filter((r) => {
    const matchSearch =
      r.automaticThought.includes(search) ||
      r.situationDetail.includes(search) ||
      r.application?.company.includes(search);
    if (filterCompleted === 'completed') return matchSearch && r.isCompleted;
    if (filterCompleted === 'pending') return matchSearch && !r.isCompleted;
    return matchSearch;
  });

  // Group by company
  const grouped = filtered.reduce((acc, record) => {
    const key = record.application?.company || '직접 기록';
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">사고 기록지</h1>
          <p className="mt-1 text-sm text-slate-400">감정과 사고 패턴을 기록하고 분석하세요</p>
        </div>
        <Link to="/thought-records/new" className="btn-primary w-full sm:w-auto justify-center">
          <Plus size={18} />
          새 사고 기록
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {[
            { key: 'all' as const, label: '전체' },
            { key: 'completed' as const, label: '완료' },
            { key: 'pending' as const, label: '진행 중' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterCompleted(tab.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                filterCompleted === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="기록 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grouped Records */}
      {Object.entries(grouped).map(([company, companyRecords]) => (
        <div key={company}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-calm-100 text-calm-600 text-xs">
              {company[0]}
            </span>
            {company}
            <span className="text-xs text-slate-400 font-normal">({companyRecords.length})</span>
          </h3>
          <div className="space-y-3">
            {companyRecords.map((record) => (
              <Link
                key={record.id}
                to={`/thought-records/${record.id}`}
                className="card block hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400">{formatDate(record.createdAt)}</span>
                      <span className="badge badge-gray text-xs">
                        {SITUATION_LABELS[record.situationType]}
                      </span>
                      <span className={cn('badge', record.isCompleted ? 'badge-green' : 'badge-yellow')}>
                        {record.isCompleted ? '리프레이밍 완료' : '진행 중'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2 mb-3">
                      {record.situationDetail}
                    </p>
                    <p className="text-sm text-slate-400 italic line-clamp-1 mb-3">
                      "{record.automaticThought}"
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {record.distortions.map((d) => {
                        const info = DISTORTION_TYPES.find((dt) => dt.key === d.type);
                        return (
                          <span key={d.type} className="badge bg-purple-100 text-purple-600">
                            {info?.emoji} {d.label}
                          </span>
                        );
                      })}
                      {record.emotionsBefore.slice(0, 3).map((e) => (
                        <span key={e.name} className="badge bg-warm-100 text-warm-700">
                          {e.name} {e.intensity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Emotion Change Indicator */}
                  {record.isCompleted && record.emotionsAfter && (
                    <div className="ml-4 flex flex-col items-center gap-1 rounded-xl bg-sage-50 px-3 py-2">
                      <span className="text-xs text-sage-600 font-medium">감정 변화</span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-rose-400">
                          {Math.round(record.emotionsBefore.reduce((s, e) => s + e.intensity, 0) / record.emotionsBefore.length)}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-lg font-bold text-sage-500">
                          {Math.round(record.emotionsAfter.reduce((s, e) => s + e.intensity, 0) / record.emotionsAfter.length)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <Brain size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-slate-400 mb-2">아직 사고 기록이 없어요</p>
          <p className="text-xs text-gray-300 mb-4">
            감정을 기록하고 인지 왜곡 패턴을 발견해보세요
          </p>
          <Link to="/thought-records/new" className="btn-primary">
            <Plus size={18} /> 첫 사고 기록 작성하기
          </Link>
        </div>
      )}
    </div>
  );
}
