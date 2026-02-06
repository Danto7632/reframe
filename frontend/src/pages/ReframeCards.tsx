import { useEffect, useState } from 'react';
import { Star, Trash2, Repeat, BookmarkCheck, Filter } from 'lucide-react';
import { useReframeCardStore } from '@/stores';
import { cn, formatDate } from '@/lib/utils';
import { DISTORTION_TYPES } from '@/types';

export default function ReframeCards() {
  const { cards, toggleBookmarkApi, deleteCard } = useReframeCardStore();
  const fetchAll = useReframeCardStore((s) => s.fetchAll);
  const [filterBookmarked, setFilterBookmarked] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = filterBookmarked ? cards.filter((c) => c.isBookmarked) : cards;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">반복 카드 보관함</h1>
        <p className="mt-1 text-sm text-slate-400">위기 때 다시 꺼내보는 생각 카드</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterBookmarked(false)}
          className={cn(
            'btn-ghost text-sm',
            !filterBookmarked && 'bg-gray-100 text-slate-700',
          )}
        >
          전체 ({cards.length})
        </button>
        <button
          onClick={() => setFilterBookmarked(true)}
          className={cn(
            'btn-ghost text-sm',
            filterBookmarked && 'bg-amber-50 text-amber-600',
          )}
        >
          <Star size={14} /> 즐겨찾기 ({cards.filter((c) => c.isBookmarked).length})
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((card) => {
          const distInfo = DISTORTION_TYPES.find((d) => d.key === card.distortionType);
          return (
            <div key={card.id} className="card relative overflow-hidden">
              {/* Accent bar */}
              <div className="absolute left-0 top-0 h-full w-1 bg-calm-400 rounded-l-2xl" />

              <div className="pl-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-purple-100 text-purple-600">
                      {distInfo?.emoji} {distInfo?.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(card.createdAt)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleBookmarkApi(card.id)}
                      className={cn(
                        'btn-ghost !p-1.5',
                        card.isBookmarked ? 'text-amber-400' : 'text-gray-300',
                      )}
                    >
                      <Star size={16} fill={card.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('이 카드를 삭제하시겠습니까?')) {
                          deleteCard(card.id);
                        }
                      }}
                      className="btn-ghost !p-1.5 text-gray-300 hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mb-3">{card.content}</p>

                {/* Effect Score */}
                <div className="flex items-center gap-2 rounded-lg bg-sage-50 px-3 py-2">
                  <BookmarkCheck size={14} className="text-sage-500" />
                  <span className="text-xs text-sage-600 font-medium">
                    효과 점수: -{card.effectScore.toFixed(1)} (감정 개선)
                  </span>
                </div>

                {/* Related thought preview */}
                {card.thoughtRecord && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-1">
                    원래 사고: "{card.thoughtRecord.automaticThought}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <Repeat size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-slate-400 mb-2">
            {filterBookmarked ? '즐겨찾기한 카드가 없어요' : '아직 반복 카드가 없어요'}
          </p>
          <p className="text-xs text-gray-300">
            사고 기록을 완료하면 효과적인 반박을 카드로 저장할 수 있어요
          </p>
        </div>
      )}
    </div>
  );
}
