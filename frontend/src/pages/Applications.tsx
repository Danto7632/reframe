import { useEffect, useState } from 'react';
import {
  Plus, Search, Filter, Briefcase, Calendar,
  MoreVertical, Pencil, Trash2, ArrowRight, Heart,
} from 'lucide-react';
import { useApplicationStore, useUIStore } from '@/stores';
import { cn, formatDate, getStageColor, getEncouragement } from '@/lib/utils';
import ApplicationModal from '@/components/applications/ApplicationModal';
import StageChangeModal from '@/components/applications/StageChangeModal';
import CelebrationModal from '@/components/applications/CelebrationModal';
import type { Application } from '@/types';

type FilterType = 'all' | 'active' | 'rejected' | 'offer';

export default function Applications() {
  const { applications, stages, deleteApplication } = useApplicationStore();
  const fetchAll = useApplicationStore((s) => s.fetchAll);
  const { openModal, modalType, closeModal, modalData } = useUIStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = applications.filter((app) => {
    const matchSearch = app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active') return matchSearch && !app.isRejected && app.currentStage?.label !== '오퍼';
    if (filter === 'rejected') return matchSearch && app.isRejected;
    if (filter === 'offer') return matchSearch && app.currentStage?.label === '오퍼';
    return matchSearch;
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !a.isRejected).length,
    rejected: applications.filter((a) => a.isRejected).length,
    offer: applications.filter((a) => a.currentStage?.label === '오퍼').length,
  };

  const filterTabs = [
    { key: 'all' as FilterType, label: '전체', count: stats.total },
    { key: 'active' as FilterType, label: '진행 중', count: stats.active },
    { key: 'rejected' as FilterType, label: '탈락', count: stats.rejected },
    { key: 'offer' as FilterType, label: '오퍼', count: stats.offer },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">지원 이력 관리</h1>
          <p className="mt-1 text-sm text-slate-400">지원 현황을 한눈에 관리하세요</p>
        </div>
        <button onClick={() => openModal('application-add')} className="btn-primary w-full sm:w-auto justify-center">
          <Plus size={18} />
          새 지원 이력
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-400">총 지원</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-calm-500">{stats.active}</p>
          <p className="text-xs text-slate-400">진행 중</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-rose-500">{stats.rejected}</p>
          <p className="text-xs text-slate-400">탈락</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-sage-500">{stats.offer}</p>
          <p className="text-xs text-slate-400">오퍼</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                filter === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700',
              )}
            >
              {tab.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                filter === tab.key ? 'bg-calm-100 text-calm-600' : 'bg-gray-200 text-slate-400',
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="기업명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Application Cards */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const stageIdx = stages.findIndex((s) => s.id === app.currentStageId);
          const enc = getEncouragement(app.currentStage?.label || '', app.isRejected);

          return (
            <div
              key={app.id}
              className="card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-800">{app.company}</h3>
                    <span className={cn('badge', getStageColor(app.currentStage?.label || '', app.isRejected))}>
                      {app.isRejected ? '탈락' : app.currentStage?.label}
                    </span>
                    {(app.thoughtRecordCount ?? 0) > 0 && (
                      <span className="badge bg-purple-100 text-purple-600">
                        감정 기록 {app.thoughtRecordCount}건
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{app.position}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(app.appliedAt)}
                    </span>
                    {app.resumeValue && (
                      <span className="flex items-center gap-1">
                        📄 {app.resumeValue}
                      </span>
                    )}
                  </div>
                  {app.memo && (
                    <p className="mt-2 text-sm text-slate-400 bg-gray-50 rounded-lg px-3 py-2">{app.memo}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal('stage-change', app)}
                    className="btn-ghost !px-2 !py-1.5 text-xs"
                  >
                    상태 변경
                  </button>
                  <button
                    onClick={() => openModal('application-edit', app)}
                    className="btn-ghost !p-1.5"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('이 지원 이력을 삭제하시겠습니까?')) {
                        deleteApplication(app.id);
                      }
                    }}
                    className="btn-ghost !p-1.5 text-rose-400 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Pipeline Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  {stages.map((s, i) => {
                    const isCurrent = s.id === app.currentStageId;
                    const isPast = i < stageIdx;
                    const isReject = app.isRejected && i === stageIdx;
                    return (
                      <div key={s.id} className="flex-1 flex flex-col items-center relative">
                        {/* Connection line */}
                        {i > 0 && (
                          <div
                            className={cn(
                              'absolute top-[18px] -left-1/2 w-full h-[3px] rounded-full',
                              isPast || isCurrent ? 'bg-calm-300' : 'bg-gray-100',
                              isReject && 'bg-rose-300',
                            )}
                          />
                        )}
                        {/* Node */}
                        <div
                          className={cn(
                            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all',
                            isCurrent && !app.isRejected && 'bg-calm-500 text-white ring-4 ring-calm-100 animate-bounce-soft',
                            isCurrent && app.isRejected && 'bg-rose-500 text-white ring-4 ring-rose-100',
                            isPast && !isReject && 'bg-calm-400 text-white',
                            !isPast && !isCurrent && 'bg-gray-100 text-slate-400',
                          )}
                        >
                          {isCurrent ? (app.isRejected ? '✕' : '🏃') : isPast ? '✓' : (i + 1)}
                        </div>
                        <span className={cn(
                          'mt-1.5 text-xs',
                          isCurrent ? 'text-slate-700 font-semibold' : 'text-slate-400',
                        )}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Encouragement */}
                <div className="mt-3 text-center">
                  <span className="text-sm text-slate-400">{enc.emoji} {enc.message}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => openModal('thought-record-prompt', app)}
                  className="btn-ghost text-xs !py-1.5 text-purple-500 hover:bg-purple-50"
                >
                  <Heart size={14} /> 감정 기록하기
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card text-center py-16">
            <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-slate-400">아직 지원 이력이 없어요</p>
            <button onClick={() => openModal('application-add')} className="btn-primary mt-4">
              <Plus size={18} /> 첫 지원 이력 추가하기
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalType === 'application-add' || modalType === 'application-edit') && (
        <ApplicationModal
          isOpen={true}
          onClose={closeModal}
          editData={modalType === 'application-edit' ? (modalData as Application) : undefined}
        />
      )}
      {modalType === 'stage-change' && modalData && (
        <StageChangeModal
          isOpen={true}
          onClose={closeModal}
          application={modalData as Application}
          onCelebrate={(msg) => { setCelebrationMsg(msg); setShowCelebration(true); }}
        />
      )}
      {showCelebration && (
        <CelebrationModal
          isOpen={true}
          onClose={() => setShowCelebration(false)}
          message={celebrationMsg}
        />
      )}
    </div>
  );
}
