import { useState, useEffect } from 'react';
import { X, Key, Trash2, Eye, EyeOff, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '@/lib/gemini';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeminiKeyModal({ isOpen, onClose }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existing = getGeminiApiKey();
      setHasExisting(!!existing);
      setApiKey('');
      setSaved(false);
      setTestError('');
      setShowKey(false);
    }
  }, [isOpen]);

  const testApiKey = async (key: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        },
      );
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestError('');

    const isValid = await testApiKey(apiKey.trim());
    setTesting(false);

    if (!isValid) {
      setTestError('API 키가 유효하지 않습니다. 다시 확인해주세요.');
      return;
    }

    setGeminiApiKey(apiKey.trim());
    setHasExisting(true);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    removeGeminiApiKey();
    setHasExisting(false);
    setApiKey('');
    setSaved(false);
  };

  if (!isOpen) return null;

  const maskedKey = hasExisting ? `AIza${'•'.repeat(20)}` : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-500/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-slide-up mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-calm-100">
              <Sparkles size={16} className="text-calm-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">AI 설정</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Description */}
          <div className="rounded-xl bg-calm-50 border border-calm-100 p-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Google Gemini API 키를 입력하면 AI가 실제로 인지 왜곡을 분석하고 맞춤형 리프레이밍을 제안합니다.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              키가 없어도 기본 분석 기능을 사용할 수 있어요.
            </p>
          </div>

          {/* Existing key status */}
          {hasExisting && !saved && (
            <div className="flex items-center justify-between rounded-xl border border-sage-200 bg-sage-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-sage-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">API 키 등록됨</p>
                  <p className="text-xs text-slate-400 font-mono">{maskedKey}</p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="rounded-lg p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="키 삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Saved confirmation */}
          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-sage-200 bg-sage-50 p-4 animate-fade-in">
              <CheckCircle2 size={20} className="text-sage-500" />
              <p className="text-sm font-medium text-sage-700">API 키가 저장되었습니다!</p>
            </div>
          )}

          {/* Input */}
          {!saved && (
            <>
              <div>
                <label className="label">{hasExisting ? '새 API 키로 변경' : 'Gemini API 키'}</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setTestError(''); }}
                    placeholder="AIza..."
                    className="input pl-9 pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {testError && (
                  <p className="mt-1.5 text-xs text-rose-500">{testError}</p>
                )}
              </div>

              {/* Get API key link */}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-calm-500 hover:text-calm-600 transition-colors"
              >
                <ExternalLink size={12} />
                Google AI Studio에서 API 키 발급받기
              </a>
            </>
          )}

          {/* Actions */}
          {!saved && (
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="btn-secondary flex-1">
                {hasExisting ? '닫기' : '나중에'}
              </button>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || testing}
                className={cn('btn-primary flex-1', testing && 'opacity-70')}
              >
                {testing ? '확인 중...' : '저장'}
              </button>
            </div>
          )}

          {/* Privacy note */}
          <p className="text-[11px] text-slate-300 text-center leading-relaxed">
            🔒 API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다
          </p>
        </div>
      </div>
    </div>
  );
}
