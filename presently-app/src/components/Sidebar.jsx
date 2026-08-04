import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PieChart, MessageCircle, TrendingUp, History,
  Settings, CreditCard, LogOut, Menu, X
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/polls', icon: PieChart, label: 'Polls' },
    { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/dashboard/history', icon: History, label: 'History' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-primary text-white p-2 rounded-lg hover:bg-blue-700"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } fixed md:static w-60 bg-white border-r border-slate-200 flex flex-col h-screen z-30 transition-transform`}>
        <div className="p-6 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Presently</h1>
              <p className="text-xs text-slate-600">Pro</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                  active
                    ? 'bg-secondary text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">John Doe</p>
              <p className="text-xs text-slate-600 truncate">john@email.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-900">Online</span>
          </div>
          <button className="w-full mt-4 flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
