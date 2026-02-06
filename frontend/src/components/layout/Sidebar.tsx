import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  Repeat,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
} from 'lucide-react';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import GeminiKeyModal from '@/components/GeminiKeyModal';

const navItems = [
  { path: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { path: '/applications', label: '지원 이력', icon: Briefcase },
  { path: '/thought-records', label: '사고 기록지', icon: Brain },
  { path: '/reframe-cards', label: '반복 카드', icon: Repeat },
  { path: '/statistics', label: '통계 분석', icon: BarChart3 },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const [showGeminiModal, setShowGeminiModal] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300',
        // Desktop
        sidebarOpen ? 'lg:w-64' : 'lg:w-20',
        // Mobile: hidden by default, slide in when open
        sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-calm-500 text-white font-bold text-lg">
              R
            </div>
            <span className="text-lg font-bold text-slate-900">리프레임</span>
          </div>
        )}
        {!sidebarOpen && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-calm-500 text-white font-bold text-lg">
            R
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-gray-100 hover:text-slate-600 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Quick Action */}
      <div className="px-3 pt-4 pb-2">
        <NavLink
          to="/thought-records/new"
          className={cn(
            'flex items-center gap-2 rounded-xl bg-calm-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-calm-600 transition-colors',
            !sidebarOpen && 'justify-center px-0',
          )}
        >
          <Plus size={18} />
          {sidebarOpen && <span>새 사고 기록</span>}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive =
            location.pathname === path ||
            location.pathname.startsWith(path + '/');
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-calm-100 text-calm-600'
                  : 'text-slate-400 hover:bg-gray-50 hover:text-slate-700',
                !sidebarOpen && 'justify-center px-0',
              )}
            >
              {isActive && sidebarOpen && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-calm-600" />
              )}
              <Icon size={20} className={isActive ? 'text-calm-500' : ''} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* AI Settings */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setShowGeminiModal(true)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all w-full text-slate-400 hover:bg-gray-50 hover:text-slate-700',
            !sidebarOpen && 'justify-center px-0',
          )}
        >
          <Settings size={20} />
          {sidebarOpen && <span>AI 설정</span>}
        </button>
      </div>

      {/* Footer */}
      {sidebarOpen && (
        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              💛 이 서비스는 전문 상담을 대체하지 않습니다. 심각한 어려움이 있다면 전문기관에 연락해주세요.
            </p>
          </div>
        </div>
      )}

      {/* Gemini API Key Modal */}
      <GeminiKeyModal isOpen={showGeminiModal} onClose={() => setShowGeminiModal(false)} />
    </aside>
  );
}
