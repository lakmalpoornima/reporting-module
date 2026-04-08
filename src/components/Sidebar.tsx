import { LayoutDashboard, FilePlus, History, UserCircle, LogOut } from 'lucide-react';
import { AppState } from '../types';

interface SidebarProps {
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  onLogout: () => void;
  consultantName: string;
}

export default function Sidebar({ activeState, onNavigate, onLogout, consultantName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'New Report', icon: FilePlus },
    { id: 'history', label: 'Report History', icon: History },
    { id: 'profile', label: 'Doctor Profile', icon: UserCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col no-print shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <UserCircle size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MedReport AI</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium truncate">{consultantName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeState === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
