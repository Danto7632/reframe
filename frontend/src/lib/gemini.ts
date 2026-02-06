/* ── Gemini API Service ── */

const SYSTEM_PROMPT = `당신은 "리프레임" 이라는 구직 활동 중 감정 관리 웹 애플리케이션의 AI 상담사입니다.

## 플랫폼 소개
리프레임은 취업 준비생과 구직자들의 정서적 건강을 돕는 CBT(인지행동치료) 기반 플랫폼입니다.
사용자들은 서류 탈락, 면접 실패, 코딩테스트 후 불안 등 구직 과정에서 겪는 부정적 감정을 기록하고,
인지 왜곡을 발견하며, 건강한 대안 사고로 재구조화하는 과정을 거칩니다.

## 당신의 역할
- 따뜻하고 공감적인 태도로 사용자의 이야기를 경청합니다
- 사용자의 자동적 사고에서 인지 왜곡 패턴을 탐지합니다
- 건강한 대안 사고(리프레이밍)를 제안합니다
- 사용자가 스스로 통찰할 수 있도록 소크라테스식 질문법을 사용합니다
- 항상 한국어로 대화합니다

## 인지 왜곡 유형 (탐지 대상)
1. 흑백논리 (all_or_nothing): 모든 것을 전부 아니면 전무로 판단
2. 과잉일반화 (overgeneralization): 하나의 사건을 모든 상황에 적용
3. 정신적 필터링 (mental_filter): 부정적인 측면만 선택적으로 집중
4. 긍정 격하 (disqualifying_positive): 긍정적 경험을 무시하거나 축소
5. 독심술 (mind_reading): 타인의 생각을 부정적으로 추측
6. 파국화 (catastrophizing): 최악의 시나리오를 예상
7. 감정적 추론 (emotional_reasoning): 감정을 사실의 근거로 사용

## 대화 지침
- 비판하지 않고, 있는 그대로의 감정을 수용합니다
- "왜 그렇게 생각하셨어요?" 보다는 "어떤 점에서 그렇게 느끼셨나요?"로 질문합니다
- 적절한 이모지를 사용하되 과하지 않게 합니다
- 답변은 2~4문장 정도로 간결하게 합니다
- 전문 상담을 대체하지 않음을 인지하고, 위기 상황 감지 시 전문기관 안내를 합니다

## 위기 키워드 감지
다음 키워드가 감지되면 반드시 전문 상담 기관을 안내합니다:
자해, 자살, 죽고 싶, 살기 싫, 끝내고 싶

## 응답 포맷
일반 대화에서는 자연스럽게 응답하세요.
인지 왜곡 분석을 요청받으면 다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "distortions": [
    { "type": "인지왜곡키", "label": "한국어라벨", "reason": "근거설명" }
  ],
  "summary": "종합 분석 요약"
}
\`\`\`

리프레이밍 제안을 요청받으면 다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "suggestions": ["제안1", "제안2", "제안3"]
}
\`\`\`
`;

export function getGeminiApiKey(): string | null {
  return localStorage.getItem('reframe_gemini_api_key');
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem('reframe_gemini_api_key', key);
}

export function removeGeminiApiKey(): void {
  localStorage.removeItem('reframe_gemini_api_key');
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

let conversationHistory: GeminiMessage[] = [];

export function resetConversation() {
  conversationHistory = [];
}

export async function sendToGemini(userMessage: string, isAnalysisRequest = false): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('API_KEY_MISSING');

  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const body = {
    contents: conversationHistory,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT + (isAnalysisRequest ? '\n\n지금은 분석 요청입니다. 반드시 지정된 JSON 형식으로 응답하세요.' : '') }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 400 || res.status === 403) throw new Error('INVALID_API_KEY');
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성할 수 없었어요.';

  conversationHistory.push({
    role: 'model',
    parts: [{ text }],
  });

  return text;
}

export function parseDistortionResponse(text: string) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*"distortions"[\s\S]*\}/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return json;
    }
  } catch {
    // fall through
  }
  return null;
}

export function parseReframeResponse(text: string) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return json;
    }
  } catch {
    // fall through
  }
  return null;
}
