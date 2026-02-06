import { X, MessageCircle, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  userName?: string;
}

export default function CelebrationModal({ isOpen, onClose, message, userName = '지우' }: Props) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRecord = () => {
    onClose();
    navigate('/thought-records/new');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-500/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl animate-slide-up text-center p-8">
        {/* Chat bubble icon */}
        <div className="w-14 h-14 rounded-full bg-calm-100 flex items-center justify-center mx-auto mb-5">
          <MessageCircle size={28} className="text-calm-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          축하드려요, {userName} 님! 🎊
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {message}<br />
          지금의 감정과 생각을 기록해두면<br />
          나중에 큰 힘이 될 거예요.
        </p>

        {/* CTA: Purple gradient button */}
        <button
          onClick={handleRecord}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 mb-3"
          style={{ background: 'linear-gradient(135deg, #4C3AED 0%, #6C5CE7 100%)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <PenLine size={16} /> 지금 바로 기록하기
          </span>
        </button>

        <button
          onClick={onClose}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          나중에 할게요
        </button>

        <p className="text-[11px] text-slate-400 mt-5">
          기록된 내용은 '사고 기록지' 탭에서 언제든 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
