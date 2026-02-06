import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useUIStore } from '@/stores';

export default function Layout() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } ml-0`}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-100 bg-white/80 backdrop-blur px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-calm-500 text-white font-bold text-sm">
              R
            </div>
            <span className="font-semibold text-slate-800 text-sm">리프레임</span>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
