import { useState } from 'react';
import { X, ArrowRight, ChevronRight } from 'lucide-react';
import type { Application } from '@/types';
import { useApplicationStore } from '@/stores';
import { cn, getStageColor } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onCelebrate: (message: string) => void;
}

export default function StageChangeModal({ isOpen, onClose, application, onCelebrate }: Props) {
  const { stages, updateStageApi, rejectApi } = useApplicationStore();
  const [selectedStageId, setSelectedStageId] = useState(application.currentStageId || '');
  const [isReject, setIsReject] = useState(false);
  const [memo, setMemo] = useState('');
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const currentIdx = stages.findIndex((s) => s.id === application.currentStageId);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isReject) {
        await rejectApi(application.id, memo || undefined);
      } else {
        await updateStageApi(application.id, selectedStageId, memo || undefined);
      }

      const newStage = stages.find((s) => s.id === selectedStageId);
      onClose();

      if (isReject) {
        // 탈락 → 사고 기록 유도
      } else if (newStage?.label === '오퍼') {
        onCelebrate('🎉 해냈어요! 축하합니다!');
      } else if (newStage && stages.findIndex((s) => s.id === selectedStageId) > currentIdx) {
        onCelebrate(`${newStage.encouragement || '한 걸음 더 나아갔어요!'}`);
      }
    } catch (err) {
      console.error('Failed to change stage:', err);
      // API 실패 시 로컬 fallback
      const { updateApplication } = useApplicationStore.getState();
      const newStage = stages.find((s) => s.id === selectedStageId);
      updateApplication(application.id, {
        currentStageId: isReject ? application.currentStageId : selectedStageId,
        currentStage: isReject ? application.currentStage : newStage,
        isRejected: isReject,
        memo: memo || application.memo,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">상태 변경</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Current State */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="text-sm text-slate-400">현재:</span>
            <span className={cn('badge', getStageColor(application.currentStage?.label || '', application.isRejected))}>
              {application.isRejected ? '탈락' : application.currentStage?.label}
            </span>
            <span className="text-sm font-medium text-slate-700">{application.company}</span>
          </div>

          {/* Stage Selection */}
          <div>
            <label className="label">변경할 상태</label>
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => { setSelectedStageId(stage.id); setIsReject(false); }}
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all',
                    selectedStageId === stage.id && !isReject
                      ? 'border-calm-300 bg-calm-50'
                      : 'border-gray-100 hover:border-gray-200',
                    i <= currentIdx && 'opacity-50',
                  )}
                  disabled={i <= currentIdx && !application.isRejected}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      selectedStageId === stage.id && !isReject ? 'bg-calm-500 text-white' : 'bg-gray-100 text-slate-400',
                    )}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>
                  {stage.encouragement && (
                    <span className="text-xs text-slate-400">{stage.encouragement}</span>
                  )}
                </button>
              ))}

              {/* Reject Option */}
              <button
                type="button"
                onClick={() => { setIsReject(true); setSelectedStageId(''); }}
                className={cn(
                  'w-full flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all',
                  isReject
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-100 hover:border-rose-200',
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                  isReject ? 'bg-rose-500 text-white' : 'bg-gray-100 text-slate-400',
                )}>
                  ✕
                </span>
                <span className="text-sm font-medium text-rose-600">탈락</span>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">변경 날짜</label>
            <input
              type="date"
              value={changeDate}
              onChange={(e) => setChangeDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Memo */}
          <div>
            <label className="label">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="변경 사유나 느낀 점을 기록해보세요"
              className="input min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">취소</button>
            <button
              onClick={handleSubmit}
              className={cn('flex-1', isReject ? 'btn-danger' : 'btn-primary')}
              disabled={(!isReject && !selectedStageId) || saving}
            >
              {saving ? '처리 중…' : isReject ? '탈락 처리' : '상태 변경'}
            </button>
          </div>

          {isReject && (
            <p className="text-center text-xs text-slate-400">
              💜 탈락 후 사고 기록을 남겨보시겠어요? 감정을 정리하는 데 도움이 돼요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
