import { Injectable } from '@nestjs/common';

export interface DistortionResult {
  type: string;
  confidence: number;
  explanation: string;
  relatedThought: string;
}

export interface ReframeSuggestion {
  originalThought: string;
  reframedThought: string;
  technique: string;
  explanation: string;
}

@Injectable()
export class AiService {
  // ──────────────────────────────────────────
  //  인지 왜곡 분석 (Mock)
  // ──────────────────────────────────────────
  async analyzeDistortions(
    thought: string,
    situationType: string,
    situationDetail?: string,
  ): Promise<{ distortions: DistortionResult[]; summary: string }> {
    // 키워드 기반 Mock 분석
    const distortions: DistortionResult[] = [];

    const lower = thought.toLowerCase();

    if (lower.includes('항상') || lower.includes('절대') || lower.includes('매번') || lower.includes('언제나')) {
      distortions.push({
        type: '흑백논리',
        confidence: 0.85,
        explanation: '"항상", "절대"와 같은 극단적 표현이 발견되었습니다. 상황을 이분법적으로 바라보고 있을 수 있어요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('다 끝') || lower.includes('망했') || lower.includes('실패') || lower.includes('안 될')) {
      distortions.push({
        type: '과잉일반화',
        confidence: 0.8,
        explanation: '한 번의 경험을 모든 상황에 적용하고 있을 수 있어요. 이번 결과가 앞으로의 모든 결과를 결정하지는 않아요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('내 탓') || lower.includes('내가 부족') || lower.includes('내가 못')) {
      distortions.push({
        type: '개인화',
        confidence: 0.75,
        explanation: '결과의 원인을 자신에게만 돌리고 있을 수 있어요. 채용 결과에는 여러 외부 요인도 작용해요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('될 리') || lower.includes('불가능') || lower.includes('소용없')) {
      distortions.push({
        type: '부정적 예측',
        confidence: 0.78,
        explanation: '아직 일어나지 않은 일에 대해 부정적으로 예측하고 있을 수 있어요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('바보') || lower.includes('쓸모없') || lower.includes('가치가 없')) {
      distortions.push({
        type: '명명하기',
        confidence: 0.82,
        explanation: '자신에게 부정적인 이름표를 붙이고 있을 수 있어요. 행동과 자기 자체를 구분해보세요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('해야') || lower.includes('~해야 한다') || lower.includes('반드시') || lower.includes('꼭')) {
      distortions.push({
        type: '당위적 사고',
        confidence: 0.72,
        explanation: '"~해야 한다"는 생각이 과도한 압박이 될 수 있어요. 유연한 기대를 가져보세요.',
        relatedThought: thought,
      });
    }

    if (lower.includes('감정') || lower.includes('느끼') || lower.includes('기분이')) {
      distortions.push({
        type: '감정적 추론',
        confidence: 0.7,
        explanation: '현재 느끼는 감정을 사실로 받아들이고 있을 수 있어요. 감정은 사실을 반영하지 않을 수 있어요.',
        relatedThought: thought,
      });
    }

    // 기본 왜곡이 없으면 하나 추가
    if (distortions.length === 0) {
      distortions.push({
        type: '과잉일반화',
        confidence: 0.6,
        explanation: '상황을 보다 균형 잡힌 시각으로 바라보면 어떨까요? 하나의 사건이 전부를 의미하지는 않아요.',
        relatedThought: thought,
      });
    }

    const summary =
      distortions.length === 1
        ? `"${distortions[0].type}" 패턴이 발견되었어요. 이런 생각 패턴을 인식하는 것만으로도 큰 첫걸음이에요.`
        : `${distortions.length}가지 사고 패턴이 발견되었어요: ${distortions.map((d) => d.type).join(', ')}. 함께 하나씩 살펴볼까요?`;

    return { distortions, summary };
  }

  // ──────────────────────────────────────────
  //  재구조화 제안 (Mock)
  // ──────────────────────────────────────────
  async getReframeSuggestions(
    thought: string,
    distortions: string[],
    situationType: string,
    company?: string,
    position?: string,
  ): Promise<{ suggestions: ReframeSuggestion[] }> {
    const suggestions: ReframeSuggestion[] = [];

    const companyStr = company || '이 회사';
    const posStr = position || '이 포지션';

    for (const distortion of distortions.slice(0, 3)) {
      switch (distortion) {
        case '흑백논리':
          suggestions.push({
            originalThought: thought,
            reframedThought: `${companyStr}에서의 결과가 좋지 않았지만, 이것이 내 모든 능력을 평가하는 것은 아니에요. 다른 회사에서는 다른 결과가 나올 수 있어요.`,
            technique: '회색 영역 찾기',
            explanation: '모든 것을 성공/실패로 나누기보다, 그 사이의 다양한 가능성을 인식해보세요.',
          });
          break;

        case '과잉일반화':
          suggestions.push({
            originalThought: thought,
            reframedThought: `이번 ${companyStr} ${posStr} 경험은 아쉽지만, 지금까지의 모든 지원이 같은 결과는 아니었어요. 각각의 지원은 독립적인 기회예요.`,
            technique: '예외 찾기',
            explanation: '비슷한 상황에서 다른 결과가 나왔던 경험을 떠올려보세요.',
          });
          break;

        case '개인화':
          suggestions.push({
            originalThought: thought,
            reframedThought: `채용 결과에는 팀 구성, 예산, 타이밍 등 나와 관계없는 요인들도 많이 작용해요. 나의 노력과 역량은 여전히 가치있어요.`,
            technique: '원인 재평가',
            explanation: '결과에 영향을 미치는 다양한 외부 요인들을 함께 고려해보세요.',
          });
          break;

        case '부정적 예측':
          suggestions.push({
            originalThought: thought,
            reframedThought: `미래를 100% 확실하게 알 수는 없어요. 지금 준비하는 과정 자체가 다음 기회를 만들어가고 있어요.`,
            technique: '증거 검토',
            explanation: '과거에 예상과 다르게 좋은 결과가 나왔던 경험을 떠올려보세요.',
          });
          break;

        case '명명하기':
          suggestions.push({
            originalThought: thought,
            reframedThought: `나는 "실패자"가 아니라, 도전하고 있는 구직자예요. 이 과정에서 배우고 성장하고 있어요.`,
            technique: '자기 대화 전환',
            explanation: '자신에게 부정적 이름표 대신, 상황을 구체적으로 묘사해보세요.',
          });
          break;

        case '당위적 사고':
          suggestions.push({
            originalThought: thought,
            reframedThought: `"~하면 좋겠다"로 바꿔 생각해볼게요. 완벽하지 않아도 괜찮고, 내 페이스대로 나아가도 돼요.`,
            technique: '유연한 기대로 전환',
            explanation: '"~해야 한다"를 "~하면 좋겠다"로 바꾸면 스스로에게 여유를 줄 수 있어요.',
          });
          break;

        case '감정적 추론':
          suggestions.push({
            originalThought: thought,
            reframedThought: `지금 불안한 감정을 느끼고 있지만, 이 감정이 현실을 정확히 반영하는 것은 아니에요. 객관적인 사실과 감정을 구분해볼게요.`,
            technique: '감정과 사실 분리',
            explanation: '느끼는 감정과 실제 상황을 분리해서 생각해보세요.',
          });
          break;

        default:
          suggestions.push({
            originalThought: thought,
            reframedThought: `이 상황을 다른 친한 친구에게 조언한다면 뭐라고 말해줄까요? 아마 따뜻하고 격려하는 말을 해줄 거예요. 나에게도 같은 말을 해주세요.`,
            technique: '친구 관점 취하기',
            explanation: '자신에게 하는 말을 친구에게 하듯 바꿔보면, 더 균형 잡힌 시각을 가질 수 있어요.',
          });
      }
    }

    return { suggestions };
  }

  // ──────────────────────────────────────────
  //  위기 상황 키워드 감지
  // ──────────────────────────────────────────
  checkCrisisKeywords(text: string): { isCrisis: boolean; matchedKeywords: string[] } {
    const crisisKeywords = [
      '죽고 싶', '자살', '자해', '죽을', '살고 싶지 않',
      '목숨', '끝내고 싶', '사라지고 싶', '없어지고 싶',
    ];
    const matched = crisisKeywords.filter((kw) => text.includes(kw));
    return { isCrisis: matched.length > 0, matchedKeywords: matched };
  }
}
