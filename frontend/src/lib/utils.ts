import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    '불안': '#f59e0b',
    '우울': '#6366f1',
    '분노': '#ef4444',
    '자괴감': '#8b5cf6',
    '무력감': '#6b7280',
    '좌절': '#f97316',
    '두려움': '#3b82f6',
    '슬픔': '#06b6d4',
    '초조': '#eab308',
    '혼란': '#a855f7',
  };
  return colors[emotion] || '#9ca3af';
}

export function getStageColor(stage: string, isRejected: boolean): string {
  if (isRejected) return 'bg-rose-100 text-rose-700';
  const colors: Record<string, string> = {
    '지원': 'bg-gray-100 text-gray-700',
    '서류': 'bg-calm-100 text-calm-700',
    '코딩테스트': 'bg-purple-100 text-purple-700',
    '과제': 'bg-indigo-100 text-indigo-700',
    '면접': 'bg-amber-100 text-amber-700',
    '1차면접': 'bg-amber-100 text-amber-700',
    '2차면접': 'bg-orange-100 text-orange-700',
    '오퍼': 'bg-sage-100 text-sage-700',
  };
  return colors[stage] || 'bg-gray-100 text-gray-700';
}

export function getEncouragement(stage: string, isRejected: boolean): { emoji: string; message: string } {
  if (isRejected) return { emoji: '🌱', message: '괜찮아요, 다음 여정이 기다리고 있어요' };
  const messages: Record<string, { emoji: string; message: string }> = {
    '지원': { emoji: '👣', message: '첫 발을 내딛었어요!' },
    '서류': { emoji: '📄', message: '한 걸음 더 나아갔어요!' },
    '코딩테스트': { emoji: '💻', message: '실력을 보여줄 차례에요!' },
    '과제': { emoji: '📝', message: '열심히 해봐요!' },
    '면접': { emoji: '🎯', message: '거의 다 왔어요, 힘내세요!' },
    '1차면접': { emoji: '🎯', message: '거의 다 왔어요, 힘내세요!' },
    '2차면접': { emoji: '🔥', message: '끝이 보여요! 파이팅!' },
    '오퍼': { emoji: '🎉', message: '해냈어요! 축하합니다!' },
  };
  return messages[stage] || { emoji: '💪', message: '잘 하고 있어요!' };
}

export const CRISIS_KEYWORDS = ['자해', '자살', '죽고 싶', '살기 싫', '끝내고 싶', '포기하고 싶'];

export function checkCrisisKeywords(text: string): boolean {
  return CRISIS_KEYWORDS.some((keyword) => text.includes(keyword));
}
