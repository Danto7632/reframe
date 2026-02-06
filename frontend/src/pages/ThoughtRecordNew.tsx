import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, AlertTriangle, Phone,
  Loader2, MessageCircle, Check, Sparkles,
} from 'lucide-react';
import { cn, checkCrisisKeywords } from '@/lib/utils';
import {
  EMOTION_LIST, DISTORTION_TYPES, SITUATION_LABELS,
  type EmotionEntry, type SituationType, type DistortionResult,
} from '@/types';
import { useApplicationStore, useThoughtRecordStore } from '@/stores';
import {
  getGeminiApiKey, sendToGemini, resetConversation,
  parseDistortionResponse, parseReframeResponse,
} from '@/lib/gemini';
import { thoughtRecordsApi } from '@/lib/api';

/* ─── Chat message types ─── */
type ChatRole = 'ai' | 'user' | 'system';
type MsgWidgetType =
  | 'text'
  | 'situation-type'
  | 'emotion-picker'
  | 'emotion-intensity'
  | 'distortion-result'
  | 'reframe-suggestions'
  | 'emotion-after-picker'
  | 'emotion-after-intensity'
  | 'change-summary'
  | 'completed';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text?: string;
  widget?: MsgWidgetType;
  timestamp: Date;
}

/* ─── Conversation flow phases ─── */
type Phase =
  | 'greeting'
  | 'ask-situation-type'
  | 'ask-situation-detail'
  | 'ask-emotions'
  | 'ask-emotion-intensity'
  | 'ask-thought'
  | 'analyzing'
  | 'show-distortion'
  | 'ask-reframe'
  | 'suggest-reframe'
  | 'ask-user-reframe'
  | 'ask-emotions-after'
  | 'ask-emotion-after-intensity'
  | 'summary'
  | 'done';

export default function ThoughtRecordNew() {
  const navigate = useNavigate();
  const { applications, stages } = useApplicationStore();
  const fetchAll = useApplicationStore((s) => s.fetchAll);
  const { addRecord, updateRecord } = useThoughtRecordStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const msgSeqRef = useRef(0);
  const mid = () => `msg-${++msgSeqRef.current}`;
  const composingRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('greeting');
  const [typing, setTyping] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);

  /* ─ collected data ─ */
  const [situationType, setSituationType] = useState<SituationType>('rejection');
  const [situationDetail, setSituationDetail] = useState('');
  const [emotionsBefore, setEmotionsBefore] = useState<EmotionEntry[]>([]);
  const [automaticThought, setAutomaticThought] = useState('');
  const [distortions, setDistortions] = useState<DistortionResult[]>([]);
  const [aiReframes, setAiReframes] = useState<string[]>([]);
  const [userReframe, setUserReframe] = useState('');
  const [emotionsAfter, setEmotionsAfter] = useState<EmotionEntry[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recordIdRef = useRef<string | null>(null);

  /* ── auto-save helper ── */
  const autoSave = useCallback(async (overrides: Record<string, unknown> = {}) => {
    const data = {
      situationType,
      situationDetail,
      emotionsBefore,
      automaticThought,
      distortions,
      aiReframe: aiReframes.join('\n\n'),
      userReframe: userReframe || null,
      emotionsAfter: emotionsAfter.length > 0 ? emotionsAfter : null,
      isCompleted: false,
      updatedAt: new Date().toISOString(),
      ...overrides,
    };

    if (!recordIdRef.current) {
      // 서버에 새로 생성
      try {
        const res = await thoughtRecordsApi.create(data);
        recordIdRef.current = res.data.id;
        addRecord(res.data);
      } catch {
        // API 실패 시 로컬 생성 fallback
        const id = `t${Date.now()}`;
        recordIdRef.current = id;
        addRecord({
          id,
          userId: 'u1',
          applicationId: null,
          createdAt: new Date().toISOString(),
          ...data,
        } as Parameters<typeof addRecord>[0]);
      }
    } else {
      // 서버에 업데이트
      try {
        await thoughtRecordsApi.update(recordIdRef.current, data);
      } catch {
        // 로컬만 업데이트
      }
      updateRecord(recordIdRef.current, data);
    }
  }, [situationType, situationDetail, emotionsBefore, automaticThought, distortions, aiReframes, userReframe, emotionsAfter, addRecord, updateRecord]);

  /* ── helpers ── */
  const pushMsg = useCallback((role: ChatRole, text?: string, widget?: MsgWidgetType) => {
    setMessages((prev) => [...prev, { id: mid(), role, text, widget, timestamp: new Date() }]);
  }, []);

  const aiSay = useCallback(
    (text: string, widget?: MsgWidgetType, delay = 800) =>
      new Promise<void>((resolve) => {
        setTyping(true);
        setTimeout(() => {
          pushMsg('ai', text, widget);
          setTyping(false);
          resolve();
        }, delay);
      }),
    [pushMsg],
  );

  /* scroll to bottom */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /* ── greeting on mount ── */
  useEffect(() => {
    resetConversation(); // Gemini 대화 히스토리 초기화
    let cancelled = false;
    const greet = async () => {
      const say = (text: string, widget?: MsgWidgetType, delay = 800) =>
        new Promise<void>((resolve) => {
          if (cancelled) return resolve();
          setTyping(true);
          setTimeout(() => {
            if (cancelled) { setTyping(false); return resolve(); }
            setMessages((prev) => [...prev, { id: mid(), role: 'ai', text, widget, timestamp: new Date() }]);
            setTyping(false);
            resolve();
          }, delay);
        });
      await say('안녕하세요! 리프레임 상담사예요 😊');
      await say('오늘 어떤 일이 있었는지 함께 이야기해볼까요?', undefined, 1000);
      await say('먼저, 어떤 상황과 관련된 감정인지 골라주세요.', 'situation-type', 800);
      if (!cancelled) setPhase('ask-situation-type');
    };
    greet();
    return () => {
      cancelled = true;
      setMessages([]);
      setTyping(false);
      setPhase('greeting');
      msgSeqRef.current = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── toggle emotion ── */
  const toggleEmotion = (name: string, isAfter: boolean) => {
    const setter = isAfter ? setEmotionsAfter : setEmotionsBefore;
    const current = isAfter ? emotionsAfter : emotionsBefore;
    const existing = current.find((e) => e.name === name);
    if (existing) setter(current.filter((e) => e.name !== name));
    else setter([...current, { name, intensity: 5 }]);
  };

  const setIntensity = (name: string, val: number, isAfter: boolean) => {
    const setter = isAfter ? setEmotionsAfter : setEmotionsBefore;
    const current = isAfter ? emotionsAfter : emotionsBefore;
    setter(current.map((e) => (e.name === name ? { ...e, intensity: val } : e)));
  };

  /* ── situation type select ── */
  const handleSituationType = async (key: SituationType) => {
    setSituationType(key);
    pushMsg('user', SITUATION_LABELS[key]);
    // 첫 자동저장 — 레코드 생성
    setTimeout(() => autoSave({ situationType: key }), 0);
    await aiSay(
      `'${SITUATION_LABELS[key]}' 상황이군요. 조금 더 자세히 어떤 상황이었는지 이야기해주세요.`,
      undefined,
      600,
    );
    setPhase('ask-situation-detail');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /* ── send text message ── */
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    pushMsg('user', text);

    switch (phase) {
      case 'ask-situation-detail': {
        setSituationDetail(text);
        if (checkCrisisKeywords(text)) {
          setCrisisDetected(true);
          return;
        }
        autoSave({ situationDetail: text });
        await aiSay(
          '상황을 잘 정리해주셨어요. 그 상황에서 어떤 감정을 느꼈는지 선택해주세요.',
          'emotion-picker',
          800,
        );
        setPhase('ask-emotions');
        break;
      }
      case 'ask-thought': {
        setAutomaticThought(text);
        if (checkCrisisKeywords(text)) {
          setCrisisDetected(true);
          return;
        }
        await aiSay('입력해주신 사고를 분석하고 있어요…', undefined, 400);
        setPhase('analyzing');
        setTyping(true);

        let analysisDistortions: DistortionResult[];
        let suggestions: string[];

        const hasApiKey = !!getGeminiApiKey();

        if (hasApiKey) {
          /* ── Gemini API 호출 ── */
          try {
            // 1) 대화 컨텍스트 전달
            const contextMsg = `사용자 상황: ${SITUATION_LABELS[situationType]}
상세 내용: ${situationDetail}
감정: ${emotionsBefore.map(e => `${e.name}(강도${e.intensity})`).join(', ')}
자동적 사고: ${text}

위 내용을 바탕으로 인지 왜곡을 분석해주세요. 반드시 JSON 형식으로 응답해주세요.`;
            const distortionRaw = await sendToGemini(contextMsg, true);
            const parsed = parseDistortionResponse(distortionRaw);
            if (parsed?.distortions && parsed.distortions.length > 0) {
              analysisDistortions = parsed.distortions.map((d: { type: string; label: string; reason: string }) => ({
                type: d.type,
                label: d.label,
                reason: d.reason,
              }));
            } else {
              // 파싱 실패 시 fallback
              analysisDistortions = [
                { type: 'overgeneralization', label: '과잉일반화', reason: '하나의 결과를 전체 능력으로 확장하는 패턴이 관찰됩니다.' },
                { type: 'all_or_nothing', label: '흑백논리', reason: '"능력이 없다"는 전부 아니면 전무의 이분법적 사고입니다.' },
              ];
            }
          } catch {
            // API 에러 시 fallback
            analysisDistortions = [
              { type: 'overgeneralization', label: '과잉일반화', reason: '하나의 결과를 전체 능력으로 확장하는 패턴이 관찰됩니다.' },
              { type: 'all_or_nothing', label: '흑백논리', reason: '"능력이 없다"는 전부 아니면 전무의 이분법적 사고입니다.' },
            ];
          }
        } else {
          /* ── 프리셋 응답 (API 키 없음) ── */
          await new Promise((r) => setTimeout(r, 2500));
          analysisDistortions = [
            { type: 'overgeneralization', label: '과잉일반화', reason: '하나의 결과를 전체 능력으로 확장하는 패턴이 관찰됩니다.' },
            { type: 'all_or_nothing', label: '흑백논리', reason: '"능력이 없다"는 전부 아니면 전무의 이분법적 사고입니다.' },
          ];
        }

        setDistortions(analysisDistortions);
        setTyping(false);
        await aiSay('분석 결과 다음과 같은 인지 왜곡이 탐지되었어요.', 'distortion-result', 400);
        await aiSay('이제 다른 관점에서 생각해볼까요? AI가 몇 가지 대안 사고를 제안해드릴게요.', undefined, 1000);
        setPhase('suggest-reframe');
        setTyping(true);

        if (hasApiKey) {
          /* ── Gemini 리프레이밍 제안 ── */
          try {
            const reframeMsg = `발견된 인지 왜곡: ${analysisDistortions.map(d => d.label).join(', ')}
자동적 사고: ${text}

이 사고에 대한 건강한 대안 사고(리프레이밍)를 3가지 제안해주세요. 반드시 JSON 형식으로 응답해주세요.`;
            const reframeRaw = await sendToGemini(reframeMsg, true);
            const parsedReframe = parseReframeResponse(reframeRaw);
            if (parsedReframe?.suggestions && parsedReframe.suggestions.length > 0) {
              suggestions = parsedReframe.suggestions;
            } else {
              suggestions = [
                '한 번의 탈락이 전체 능력을 정의하지 않아요. 채용은 타이밍과 포지션 적합도 등 다양한 요소가 작용합니다.',
                '서류를 쓰고 면접을 준비한 경험 자체가 성장입니다. 결과와 무관하게 그 과정에서 배운 것이 있어요.',
                '이 회사에서 안 됐다는 건, 다른 곳에서 더 잘 맞는 기회가 있을 수 있다는 뜻이기도 해요.',
              ];
            }
          } catch {
            suggestions = [
              '한 번의 탈락이 전체 능력을 정의하지 않아요. 채용은 타이밍과 포지션 적합도 등 다양한 요소가 작용합니다.',
              '서류를 쓰고 면접을 준비한 경험 자체가 성장입니다. 결과와 무관하게 그 과정에서 배운 것이 있어요.',
              '이 회사에서 안 됐다는 건, 다른 곳에서 더 잘 맞는 기회가 있을 수 있다는 뜻이기도 해요.',
            ];
          }
        } else {
          /* ── 프리셋 리프레이밍 ── */
          await new Promise((r) => setTimeout(r, 2000));
          suggestions = [
            '한 번의 탈락이 전체 능력을 정의하지 않아요. 채용은 타이밍과 포지션 적합도 등 다양한 요소가 작용합니다.',
            '서류를 쓰고 면접을 준비한 경험 자체가 성장입니다. 결과와 무관하게 그 과정에서 배운 것이 있어요.',
            '이 회사에서 안 됐다는 건, 다른 곳에서 더 잘 맞는 기회가 있을 수 있다는 뜻이기도 해요.',
          ];
        }

        setAiReframes(suggestions);
        setTyping(false);
        autoSave({ distortions: analysisDistortions, aiReframe: suggestions.join('\n\n') });
        await aiSay('아래 제안을 참고해서, 나만의 표현으로 다시 정리해보세요.', 'reframe-suggestions', 400);
        setPhase('ask-user-reframe');
        setTimeout(() => inputRef.current?.focus(), 100);
        break;
      }
      case 'ask-user-reframe': {
        setUserReframe(text);
        autoSave({ userReframe: text });
        await aiSay(
          '정말 좋은 대안 사고예요! 👏 마지막으로 지금 감정이 어떻게 변했는지 확인해볼까요?',
          'emotion-after-picker',
          800,
        );
        setPhase('ask-emotions-after');
        break;
      }
      default:
        break;
    }
  };

  /* ── emotion confirm ── */
  const confirmEmotions = async () => {
    const names = emotionsBefore.map((e) => e.name).join(', ');
    pushMsg('user', names);
    autoSave();
    await aiSay(
      '감정의 강도를 조절해주세요. 1(약함)~10(매우 강함)으로 설정할 수 있어요.',
      'emotion-intensity',
      600,
    );
    setPhase('ask-emotion-intensity');
  };

  const confirmIntensity = async () => {
    const summary = emotionsBefore.map((e) => `${e.name}(${e.intensity})`).join(', ');
    pushMsg('user', summary);
    autoSave();
    await aiSay(
      '감정을 잘 정리해주셨어요. 그 상황에서 자동으로 떠오른 생각이 있나요? 판단하지 말고 있는 그대로 적어보세요.',
      undefined,
      800,
    );
    setPhase('ask-thought');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /* ── emotion after ── */
  const confirmEmotionsAfter = async () => {
    const names = emotionsAfter.map((e) => e.name).join(', ');
    pushMsg('user', names);
    autoSave();
    await aiSay(
      '강도도 조절해주세요.',
      'emotion-after-intensity',
      600,
    );
    setPhase('ask-emotion-after-intensity');
  };

  const confirmIntensityAfter = async () => {
    const summary = emotionsAfter.map((e) => `${e.name}(${e.intensity})`).join(', ');
    pushMsg('user', summary);
    autoSave({ isCompleted: true });
    await aiSay('수고하셨어요! 오늘의 기록을 정리했어요. 📋', 'change-summary', 600);
    await aiSay(
      '기록을 저장할까요? 아래 버튼을 눌러주세요.',
      'completed',
      800,
    );
    setPhase('done');
  };

  /* ── submit (최종 완료 후 이동) ── */
  const handleSubmit = async () => {
    // 최종 완료 표시
    if (recordIdRef.current) {
      try {
        await thoughtRecordsApi.update(recordIdRef.current, { isCompleted: true });
      } catch {
        // fallback
      }
      updateRecord(recordIdRef.current, { isCompleted: true });
    }
    navigate('/thought-records');
  };

  /* ── Crisis Screen ── */
  if (crisisDetected) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center animate-fade-in">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">지금 힘든 상황이시군요</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            전문 상담사와 이야기해보세요.<br />당신은 혼자가 아닙니다.
          </p>
          <div className="space-y-3 mb-8">
            {[
              { name: '자살예방상담전화', number: '1393', desc: '24시간 운영' },
              { name: '정신건강위기상담전화', number: '1577-0199', desc: '24시간 운영' },
              { name: '생명의전화', number: '1588-9191', desc: '24시간 운영' },
            ].map((line) => (
              <a key={line.number} href={`tel:${line.number}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <Phone size={20} className="text-calm-500" />
                <div className="text-left">
                  <p className="font-medium text-slate-800">{line.name}</p>
                  <p className="text-sm text-slate-400">{line.number} · {line.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <button onClick={() => { setCrisisDetected(false); setAutomaticThought(''); }}
            className="btn-secondary w-full">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  /* ── Render helpers ── */
  const isInputEnabled = ['ask-situation-detail', 'ask-thought', 'ask-user-reframe'].includes(phase);

  const placeholders: Record<string, string> = {
    'ask-situation-detail': '어떤 상황이었는지 자세히 적어보세요…',
    'ask-thought': '머릿속에 자동으로 떠오른 생각을 적어보세요…',
    'ask-user-reframe': '나만의 대안 사고를 적어보세요…',
  };

  /* ── Widget renderers ── */
  const renderWidget = (msg: ChatMessage) => {
    switch (msg.widget) {
      case 'situation-type':
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {(Object.entries(SITUATION_LABELS) as [SituationType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => phase === 'ask-situation-type' && handleSituationType(key)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  situationType === key && phase !== 'ask-situation-type'
                    ? 'border-calm-400 bg-calm-50 text-calm-600'
                    : 'border-gray-200 text-slate-500 hover:border-calm-300 hover:bg-calm-50',
                  phase !== 'ask-situation-type' && situationType !== key && 'opacity-40 pointer-events-none',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        );

      case 'emotion-picker':
        return (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {EMOTION_LIST.map((em) => {
                const selected = emotionsBefore.find((e) => e.name === em);
                return (
                  <button key={em}
                    onClick={() => phase === 'ask-emotions' && toggleEmotion(em, false)}
                    disabled={phase !== 'ask-emotions'}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                      selected
                        ? 'border-calm-400 bg-calm-50 text-calm-600 ring-1 ring-calm-200'
                        : 'border-gray-200 text-slate-400 hover:border-calm-300',
                      phase !== 'ask-emotions' && !selected && 'opacity-40',
                    )}
                  >
                    {em}
                  </button>
                );
              })}
            </div>
            {phase === 'ask-emotions' && emotionsBefore.length > 0 && (
              <button onClick={confirmEmotions}
                className="btn-primary text-sm py-2 px-5">
                선택 완료 ({emotionsBefore.length}개)
              </button>
            )}
          </div>
        );

      case 'emotion-intensity':
        return (
          <div className="mt-3 space-y-3">
            {emotionsBefore.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <span className="w-14 text-sm font-medium text-slate-700">{entry.name}</span>
                <input type="range" min={1} max={10} value={entry.intensity}
                  disabled={phase !== 'ask-emotion-intensity'}
                  onChange={(e) => setIntensity(entry.name, Number(e.target.value), false)}
                  className="flex-1 h-2 rounded-full appearance-none bg-gradient-to-r from-green-200 via-yellow-200 to-red-300"
                />
                <span className={cn('w-6 text-center text-sm font-bold',
                  entry.intensity <= 3 ? 'text-sage-500' : entry.intensity <= 6 ? 'text-amber-500' : 'text-rose-500',
                )}>
                  {entry.intensity}
                </span>
              </div>
            ))}
            {phase === 'ask-emotion-intensity' && (
              <button onClick={confirmIntensity} className="btn-primary text-sm py-2 px-5">
                확인
              </button>
            )}
          </div>
        );

      case 'distortion-result':
        return (
          <div className="mt-3 space-y-2">
            {distortions.map((d) => {
              const info = DISTORTION_TYPES.find((dt) => dt.key === d.type);
              return (
                <div key={d.type} className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{info?.emoji}</span>
                    <span className="font-semibold text-purple-700 text-sm">{d.label}</span>
                  </div>
                  <p className="text-xs text-purple-600 leading-relaxed">{d.reason}</p>
                </div>
              );
            })}
          </div>
        );

      case 'reframe-suggestions':
        return (
          <div className="mt-3 space-y-2">
            {aiReframes.map((text, i) => (
              <div key={i}
                onClick={() => { if (phase === 'ask-user-reframe') { setInput(text); inputRef.current?.focus(); } }}
                className="rounded-xl border border-sage-100 bg-sage-50 p-3 cursor-pointer hover:border-sage-300 transition-all"
              >
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                <span className="text-[11px] text-calm-400 mt-1 block">탭하여 사용</span>
              </div>
            ))}
          </div>
        );

      case 'emotion-after-picker':
        return (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {EMOTION_LIST.map((em) => {
                const selected = emotionsAfter.find((e) => e.name === em);
                const wasBefore = emotionsBefore.find((e) => e.name === em);
                return (
                  <button key={em}
                    onClick={() => phase === 'ask-emotions-after' && toggleEmotion(em, true)}
                    disabled={phase !== 'ask-emotions-after'}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-all relative',
                      selected
                        ? 'border-sage-400 bg-sage-50 text-sage-600 ring-1 ring-sage-200'
                        : wasBefore
                          ? 'border-warm-200 text-warm-600'
                          : 'border-gray-200 text-slate-400 hover:border-sage-300',
                      phase !== 'ask-emotions-after' && !selected && 'opacity-40',
                    )}
                  >
                    {em}
                    {wasBefore && (
                      <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-warm-200 text-warm-700 rounded-full w-4 h-4 flex items-center justify-center">
                        {wasBefore.intensity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {phase === 'ask-emotions-after' && emotionsAfter.length > 0 && (
              <button onClick={confirmEmotionsAfter}
                className="btn-primary text-sm py-2 px-5">
                선택 완료 ({emotionsAfter.length}개)
              </button>
            )}
          </div>
        );

      case 'emotion-after-intensity':
        return (
          <div className="mt-3 space-y-3">
            {emotionsAfter.map((entry) => {
              const before = emotionsBefore.find((e) => e.name === entry.name);
              return (
                <div key={entry.name} className="flex items-center gap-3">
                  <span className="w-14 text-sm font-medium text-slate-700">{entry.name}</span>
                  <input type="range" min={1} max={10} value={entry.intensity}
                    disabled={phase !== 'ask-emotion-after-intensity'}
                    onChange={(e) => setIntensity(entry.name, Number(e.target.value), true)}
                    className="flex-1 h-2 rounded-full appearance-none bg-gradient-to-r from-green-200 via-yellow-200 to-red-300"
                  />
                  <span className="w-6 text-center text-sm font-bold text-sage-500">{entry.intensity}</span>
                  {before && (
                    <span className="text-[11px] text-slate-400">({before.intensity}→{entry.intensity})</span>
                  )}
                </div>
              );
            })}
            {phase === 'ask-emotion-after-intensity' && (
              <button onClick={confirmIntensityAfter}
                className="btn-primary text-sm py-2 px-5">
                확인
              </button>
            )}
          </div>
        );

      case 'change-summary':
        return (
          <div className="mt-3 rounded-xl bg-sage-50 border border-sage-100 p-4">
            <span className="text-xs font-medium text-sage-600 mb-2 block">감정 변화 요약</span>
            <div className="flex flex-wrap gap-2">
              {emotionsAfter.map((after) => {
                const before = emotionsBefore.find((e) => e.name === after.name);
                if (!before) return null;
                const diff = before.intensity - after.intensity;
                return (
                  <span key={after.name} className={cn(
                    'badge text-xs',
                    diff > 0 ? 'bg-sage-100 text-sage-700' : diff < 0 ? 'bg-rose-100 text-rose-700' : 'badge-gray',
                  )}>
                    {after.name} {before.intensity}→{after.intensity}
                    {diff > 0 && ` ↓${diff}`}
                    {diff < 0 && ` ↑${Math.abs(diff)}`}
                  </span>
                );
              })}
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="mt-3">
            <button onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4C3AED 0%, #6C5CE7 100%)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <Check size={16} /> 기록 저장하기
              </span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-2">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-calm-100 flex items-center justify-center">
          <MessageCircle size={18} className="text-calm-500" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-900">리프레임 상담사</h1>
          <p className="text-[11px] text-sage-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 inline-block" /> 온라인
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          if (msg.role === 'ai') {
            return (
              <div key={msg.id} className="flex gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center mt-0.5">
                  <MessageCircle size={14} className="text-calm-500" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  {msg.text && (
                    <div className="rounded-2xl rounded-tl-md bg-slate-50 border border-gray-100 p-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )}
                  {msg.widget && renderWidget(msg)}
                  <span className="text-[10px] text-slate-300 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[75%]">
                  <div className="rounded-2xl rounded-tr-md bg-calm-500 p-4">
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1 block text-right">
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
              <MessageCircle size={14} className="text-calm-500" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-slate-50 border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 pt-3 pb-2">
        <div className={cn(
          'flex items-end gap-2 rounded-2xl border bg-white px-4 py-2 transition-colors',
          isInputEnabled ? 'border-gray-200 focus-within:border-calm-300' : 'border-gray-100 bg-gray-50',
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !composingRef.current && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isInputEnabled ? placeholders[phase] || '메시지를 입력하세요…' : '위의 선택지를 이용해주세요'}
            disabled={!isInputEnabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-300 outline-none max-h-24 min-h-[36px] py-1"
          />
          <button
            onClick={handleSend}
            disabled={!isInputEnabled || !input.trim()}
            className={cn(
              'flex-shrink-0 rounded-xl p-2 transition-all',
              isInputEnabled && input.trim()
                ? 'bg-calm-500 text-white hover:bg-calm-600'
                : 'bg-gray-100 text-slate-300',
            )}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">
          이 서비스는 전문 상담을 대체하지 않습니다
        </p>
      </div>
    </div>
  );
}
