import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Briefcase, Calendar, Bookmark, Star,
  Share2, Trash2, MessageCircle, CheckCircle, ArrowDown,
} from 'lucide-react';
import { useThoughtRecordStore, useReframeCardStore } from '@/stores';
import { cn, formatDate } from '@/lib/utils';
import { DISTORTION_TYPES, SITUATION_LABELS } from '@/types';

export default function ThoughtRecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records, deleteRecord } = useThoughtRecordStore();
  const fetchAll = useThoughtRecordStore((s) => s.fetchAll);
  const { createCard } = useReframeCardStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const record = records.find((r) => r.id === id);

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">기록을 찾을 수 없습니다</p>
      </div>
    );
  }

  const avgBefore = record.emotionsBefore.reduce((s, e) => s + e.intensity, 0) / record.emotionsBefore.length;
  const avgAfter = record.emotionsAfter
    ? record.emotionsAfter.reduce((s, e) => s + e.intensity, 0) / record.emotionsAfter.length
    : null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link to="/thought-records" className="hover:text-calm-500 transition-colors">사고 기록지</Link>
        <span>›</span>
        <span className="text-slate-700">기록 상세</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-900">{record.situationDetail}</h1>
            <span className={cn('badge', record.isCompleted ? 'badge-green' : 'badge-yellow')}>
              {record.isCompleted ? '리프레이밍 완료' : '진행 중'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>📅 {formatDate(record.createdAt)}</span>
            {record.application && (
              <>
                <span>•</span>
                <span>{record.application.company}</span>
                <span>•</span>
                <span>{record.application.position}</span>
              </>
            )}
            <span>•</span>
            <span>🔴 주된 감정: {record.emotionsBefore[0]?.name} ({Math.round(avgBefore * 10)}%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const text = `📋 사고 기록\n\n상황: ${record.situationDetail}\n\n자동적 사고: ${record.automaticThought}\n\n${record.userReframe ? `대안 사고: ${record.userReframe}` : ''}`;
              navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사되었습니다!'));
            }}
            className="btn-secondary text-sm"
          >
            <Share2 size={14} /> 공유하기
          </button>
          <button
            onClick={async () => {
              if (confirm('이 기록을 삭제하시겠습니까?')) {
                await deleteRecord(record.id);
                navigate('/thought-records');
              }
            }}
            className="btn-ghost text-sm text-rose-500 hover:bg-rose-50"
          >
            <Trash2 size={14} /> 삭제
          </button>
        </div>
      </div>

      {/* 2-column Layout: Left = 나눈 대화, Right = AI 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: 나눈 대화 (채팅 형식) */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">나눈 대화</h3>
              <span className="text-xs text-slate-400">기반 메시지</span>
            </div>

            <div className="space-y-4">
              {/* AI Counselor Message */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
                  <MessageCircle size={16} className="text-calm-500" />
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-md bg-slate-50 p-4 max-w-[85%]">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {record.situationDetail}에 대해 떠오른 생각과 감정을 함께 살펴볼까요? 지금 가장 먼저 머릿속에 떠오르는 생각은 무엇인가요?
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">오전 10:15</span>
                </div>
              </div>

              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tr-md bg-calm-500 p-4 text-white">
                    <p className="text-sm leading-relaxed">
                      "{record.automaticThought}"
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block text-right">오전 10:17</span>
                </div>
              </div>

              {/* AI Follow-up */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
                  <MessageCircle size={16} className="text-calm-500" />
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-md bg-slate-50 p-4 max-w-[85%]">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      그 기준에 못 미친다는 '증거'가 있을까요? 아니면 반대로, 지무님이 충분히 해낼 수 있다는 것을 보여주는 과거의 경험이 있을까요?
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">오전 10:20</span>
                </div>
              </div>

              {/* User Reframe Response */}
              {record.userReframe && (
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tr-md bg-calm-500 p-4 text-white">
                      <p className="text-sm leading-relaxed">
                        {record.userReframe}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block text-right">오전 10:25</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI 분석 사이드 패널 */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI 사고 요약 */}
          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              🧠 AI 사고 요약
            </h3>
            <div className="space-y-3">
              {/* 핵심 인지 왜곡 */}
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
                <span className="text-xs font-semibold text-rose-500 block mb-1">핵심 인지 왜곡</span>
                <p className="text-sm text-slate-700">
                  {record.distortions.map((d) => {
                    const info = DISTORTION_TYPES.find((dt) => dt.key === d.type);
                    return `'${info?.label}'`;
                  }).join(' 및 ')} 양상이 관찰됩니다.
                </p>
              </div>

              {/* 요약된 감정 추론 */}
              <div className="rounded-xl bg-warm-50 border border-warm-100 p-3">
                <span className="text-xs font-semibold text-warm-600 block mb-1">요약된 감정 추론</span>
                <p className="text-sm text-slate-700">
                  {record.emotionsBefore.map(e => `${e.name}(${e.intensity * 10}%)`).join(', ')}
                  {avgAfter !== null ? ` → 재구조화 후 ${Math.round(avgAfter * 10)}%로 개선` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 리프레이밍 결과 */}
          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              ✨ 리프레이밍 결과
            </h3>

            {/* Before */}
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 mb-3">
              <span className="text-xs font-semibold text-rose-500 block mb-1">자동 사고 (BEFORE)</span>
              <p className="text-sm text-slate-700 italic">"{record.automaticThought}"</p>
            </div>

            <div className="flex justify-center my-2">
              <ArrowDown size={16} className="text-slate-400" />
            </div>

            {/* After */}
            {record.userReframe && (
              <div className="rounded-xl bg-calm-600 p-3 mb-3">
                <span className="text-xs font-semibold text-calm-200 block mb-1">대안 사고 (AFTER)</span>
                <p className="text-sm text-white font-medium leading-relaxed">"{record.userReframe}"</p>
              </div>
            )}

            {/* Emotion Change */}
            {record.emotionsAfter && (
              <div className="rounded-xl bg-sage-50 border border-sage-100 p-3 mt-3">
                <span className="text-xs text-sage-600 font-medium block mb-2">사후 감정 결과</span>
                <div className="flex items-center gap-2">
                  {record.emotionsAfter.map((e) => {
                    const before = record.emotionsBefore.find((b) => b.name === e.name);
                    return (
                      <span key={e.name} className="text-sm font-bold text-sage-700">
                        {e.name} {before ? `${before.intensity * 10}%` : ''} → {e.intensity * 10}%
                      </span>
                    );
                  })}
                </div>
                {record.isCompleted && record.userReframe && (
                  <button
                    onClick={async () => {
                      try {
                        await createCard({
                          thoughtRecordId: record.id,
                          content: record.userReframe!,
                          distortionType: record.distortions[0]?.type || 'overgeneralization',
                          effectScore: avgBefore - (avgAfter ?? avgBefore),
                        });
                        alert('반복 카드로 저장했어요! 🎉');
                      } catch (err) {
                        console.error(err);
                        alert('저장에 실패했습니다.');
                      }
                    }}
                    className="btn-primary text-xs mt-3 w-full"
                  >
                    <Star size={14} /> 반복 카드로 저장
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 향후 행동 지침 */}
          <div className="card bg-calm-50 border border-calm-100">
            <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              📋 향후 행동 지침
            </h3>
            <ul className="space-y-2">
              {[
                '과제 요구사항을 아주 작은 단위로 쪼개서 리스트업 하기',
                '막힐 때마다 이걸 배우는 과정이라고 소리 내어 말하기',
                '25분 집중 후 반드시 5분 쉬기 (뽀모도로)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle size={16} className="text-sage-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/thought-records/new')}
              className="btn-primary w-full mt-4 text-sm"
            >
              <MessageCircle size={14} /> 이 기록으로 다시 대화하기
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 mb-4">
        이 서비스는 전문 상담을 대체하지 않습니다.
      </p>
    </div>
  );
}
