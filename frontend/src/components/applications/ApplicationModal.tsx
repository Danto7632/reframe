import { useState } from 'react';
import { X, Calendar, Link as LinkIcon, FileText, Smile, Meh, Frown } from 'lucide-react';
import type { Application, ResumeType } from '@/types';
import { useApplicationStore } from '@/stores';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: Application;
}

const moodOptions = [
  { key: 'excited', label: '설렘 & 기대', emoji: '✨', icon: Smile, color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { key: 'calm', label: '담담함', emoji: '😌', icon: Meh, color: 'border-gray-300 bg-gray-50 text-slate-700' },
  { key: 'anxious', label: '불안 & 걱정', emoji: '😟', icon: Frown, color: 'border-purple-300 bg-purple-50 text-purple-700' },
];

export default function ApplicationModal({ isOpen, onClose, editData }: Props) {
  const { stages, createApplication, updateApplicationApi } = useApplicationStore();
  const isEdit = !!editData;

  const [company, setCompany] = useState(editData?.company || '');
  const [position, setPosition] = useState(editData?.position || '');
  const [appliedAt, setAppliedAt] = useState(editData?.appliedAt || new Date().toISOString().split('T')[0]);
  const [stageId, setStageId] = useState(editData?.currentStageId || stages[0]?.id || '');
  const [resumeType, setResumeType] = useState<ResumeType | ''>(editData?.resumeType || '');
  const [resumeValue, setResumeValue] = useState(editData?.resumeValue || '');
  const [memo, setMemo] = useState(editData?.memo || '');
  const [mood, setMood] = useState<string>('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data: Record<string, unknown> = {
      company,
      position,
      appliedAt,
      currentStageId: stageId,
    };
    if (resumeType) data.resumeType = resumeType;
    if (resumeValue) data.resumeValue = resumeValue;
    if (memo) data.memo = memo;

    try {
      if (isEdit && editData) {
        await updateApplicationApi(editData.id, data);
      } else {
        await createApplication(data);
      }
    } catch (err) {
      console.error('Failed to save application:', err);
    } finally {
      setSaving(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isEdit ? '지원 이력 수정' : '새 지원 이력 추가'}
            </h2>
            {!isEdit && (
              <p className="text-xs text-slate-400 mt-0.5">도전의 기록을 남기고 마음의 상태를 체크하세요</p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* 기업명 & 직무 - 가로 배치 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">기업명 <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="예: 네이버"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">지원 직무 <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="예: 프론트엔드 개발자"
                className="input"
                required
              />
            </div>
          </div>

          {/* 지원일 & 상태 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">지원일 <span className="text-rose-400">*</span></label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                  className="input pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">현재 상태</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="input"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 공고 링크 또는 첨부 파일 */}
          <div>
            <label className="label">공고 링크 또는 첨부 파일 (선택)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url || resumeValue}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setResumeValue(e.target.value);
                  setResumeType('link');
                }}
                placeholder="https://..."
                className="input flex-1"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-500 hover:bg-gray-50 transition-all whitespace-nowrap"
              >
                <FileText size={14} /> 📎 파일
              </button>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="label">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="면접 후기, 느낀 점 등"
              className="input min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* 마음 상태 체크 */}
          {!isEdit && (
            <div className="rounded-xl border border-calm-200 bg-calm-50/30 p-4">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                💜 마음 상태 체크
              </label>
              <p className="text-xs text-slate-400 mb-3">
                지원하면서 느끼는 감정을 기록해보세요.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setMood(mood === opt.key ? '' : opt.key)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all',
                      mood === opt.key
                        ? 'border-calm-400 bg-calm-50 text-calm-700 shadow-sm'
                        : 'border-gray-100 hover:border-calm-200 bg-white',
                    )}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              취소
            </button>
            <button type="submit" className="btn-primary flex-1">
              {isEdit ? '수정하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
