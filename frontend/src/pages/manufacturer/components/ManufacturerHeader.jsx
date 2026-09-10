import { Search, Bell, Factory, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ManufacturerHeader({ activeTab, user, onSwitchManufacturer, search, setSearch }) {
  const { logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
      {/* Title & Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2 capitalize">
            {activeTab.replace('_', ' ')}
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Live Production
            </span>
          </h1>
          <p className="text-xs text-slate-400">Apex TexCraft Mills • Karachi Facility</p>
        </div>

        {/* Global Filter Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, techpacks, items..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher if logged in as admin */}
        {user?.role === 'admin' && (
          <button
            onClick={onSwitchManufacturer}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Switch to Demo Mfg</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
              {user?.name || 'Manufacturer Admin'}
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-[10px] text-indigo-400 font-medium">Verified Partner (45% Share)</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name ? user.name[0] : 'M'}
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
