import { Search, Factory, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ManufacturerHeader({ activeTab, user, onSwitchManufacturer, search, setSearch }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xl shadow-cyan-950/10">
      {/* Title & Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2.5 capitalize">
            {activeTab.replace('_', ' ')}
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Production
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.companyName ? `${user.companyName} • Production Facility` : 'Apex TexCraft Mills • Karachi Facility'}
          </p>
        </div>

        {/* Global Filter Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, techpacks, items..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher if logged in as admin */}
        {user?.role === 'admin' && (
          <button
            onClick={onSwitchManufacturer}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Factory className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch to Demo Mfg</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
              {user?.fullName || user?.name || 'Manufacturer Admin'}
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold">Verified Partner (45% Share)</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/30 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/10">
            {user?.companyName ? user.companyName[0].toUpperCase() : user?.fullName ? user.fullName[0].toUpperCase() : 'M'}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
