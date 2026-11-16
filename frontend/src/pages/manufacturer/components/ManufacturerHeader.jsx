import { Search, Factory, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ManufacturerHeader({
  activeTab,
  user,
  onSwitchManufacturer,
  search,
  setSearch,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-[#e5e9e3] sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xs">
      {/* Title & Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-black text-[#10182b] tracking-tight flex items-center gap-2.5 capitalize">
            {activeTab.replace('_', ' ')}
            <span className="text-[10px] font-bold bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#89ca2e] animate-pulse"></span>
              Live Production
            </span>
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            {user?.companyName
              ? `${user.companyName} • Production Facility`
              : 'Apex TexCraft Mills • Karachi Facility'}
          </p>
        </div>

        {/* Global Filter Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, techpacks, items..."
            className="w-full bg-[#f5f7fb] border border-[#e5e9e3] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#10182b] placeholder-[#64748b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher if logged in as admin */}
        {user?.role === 'admin' && (
          <button
            onClick={onSwitchManufacturer}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0ea5c6]/10 border border-[#0ea5c6]/30 text-[#0ea5c6] hover:bg-[#0ea5c6]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Factory className="w-3.5 h-3.5 text-[#0ea5c6]" />
            <span>Switch to Demo Mfg</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#e5e9e3]">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#10182b] flex items-center gap-1 justify-end">
              {user?.fullName || user?.name || 'Manufacturer Admin'}
              <ShieldCheck className="w-3.5 h-3.5 text-[#367c35]" />
            </div>
            <div className="text-[10px] text-[#0ea5c6] font-semibold">
              Verified Partner (45% Share)
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0ea5c6] to-[#367c35] border border-[#0ea5c6]/30 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.companyName
              ? user.companyName[0].toUpperCase()
              : user?.fullName
              ? user.fullName[0].toUpperCase()
              : 'M'}
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="w-8 h-8 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] hover:bg-rose-50 hover:text-rose-600 text-[#64748b] flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
