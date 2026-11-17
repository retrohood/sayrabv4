import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../../api/client';
import ManufacturerSidebar from './components/ManufacturerSidebar';
import ManufacturerHeader from './components/ManufacturerHeader';
import DashboardView from './views/DashboardView';
import ProductionOrdersView from './views/ProductionOrdersView';
import TechpacksView from './views/TechpacksView';
import SampleProductionView from './views/SampleProductionView';
import BulkProductionView from './views/BulkProductionView';
import ShippingView from './views/ShippingView';
import PaymentsView from './views/PaymentsView';
import NotificationsView from './views/NotificationsView';
import ReportsView from './views/ReportsView';
import ProfileView from './views/ProfileView';
import QuotationsView from './views/QuotationsView';
import {
  Factory,
  Lock,
  RefreshCw,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ManufacturerPortal() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Store
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [techpacks, setTechpacks] = useState([]);
  const [samples, setSamples] = useState([]);
  const [shippingQueue, setShippingQueue] = useState([]);
  const [paymentsData, setPaymentsData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Quick Demo Login State
  const [switching, setSwitching] = useState(false);
  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');

  const fetchManufacturerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
        quotesRes,
        ordersRes,
        techpacksRes,
        samplesRes,
        shippingRes,
        paymentsRes,
        notificationsRes,
        reportsRes,
        profileRes,
      ] = await Promise.all([
        api.get('/api/manufacturer/overview').catch(() => ({ data: { success: false } })),
        api.get('/quotations/manufacturer-review').catch(() => ({ data: [] })),
        api.get('/api/manufacturer/orders').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/techpacks').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/samples').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/shipping').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/payments').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/notifications').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/reports').catch(() => ({ data: { success: false } })),
        api.get('/api/manufacturer/profile').catch(() => ({ data: { success: false } })),
      ]);

      if (overviewRes.data?.success) setOverview(overviewRes.data.data);
      if (Array.isArray(quotesRes.data)) setQuotations(quotesRes.data);
      if (ordersRes.data?.success) setOrders(ordersRes.data.data);
      if (techpacksRes.data?.success) setTechpacks(techpacksRes.data.data);
      if (samplesRes.data?.success) setSamples(samplesRes.data.data);
      if (shippingRes.data?.success) setShippingQueue(shippingRes.data.data);
      if (paymentsRes.data?.success) setPaymentsData(paymentsRes.data.data);
      if (notificationsRes.data?.success) setNotifications(notificationsRes.data.data);
      if (reportsRes.data?.success) setReportsData(reportsRes.data.data);
      if (profileRes.data?.success) setProfileData(profileRes.data.data);
    } catch (err) {
      console.error('Failed to load manufacturer portal data:', err);
      setError('Unable to connect to live MongoDB manufacturer APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'manufacturer' || user.role === 'admin' || user.email === 'manufacturer@sayrab.com')) {
      fetchManufacturerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // 1-Click Manufacturer Login Handler
  const handleManufacturerDemoLogin = async () => {
    try {
      setSwitching(true);
      setGateError('');
      await login('manufacturer@sayrab.com', 'password123');
      await fetchManufacturerData();
    } catch (err) {
      setGateError('Manufacturer demo login failed: ' + (err.message || 'Server offline'));
    } finally {
      setSwitching(false);
    }
  };

  const handleGateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSwitching(true);
      setGateError('');
      await login(gateEmail, gatePassword);
      await fetchManufacturerData();
    } catch (err) {
      setGateError(err.message || 'Invalid manufacturer credentials.');
    } finally {
      setSwitching(false);
    }
  };

  const isManufacturerAuthorized =
    user && (user.role === 'manufacturer' || user.role === 'admin' || user.email === 'manufacturer@sayrab.com');

  // Gatekeeper Screen if user is not authorized or logged in
  if (!isManufacturerAuthorized) {
    return (
      <div className="min-h-screen bg-[#f7f9f5] flex flex-col justify-center items-center p-4 selection:bg-[#89ca2e] selection:text-[#10182b]">
        <div className="max-w-md w-full bg-white border border-[#e5e9e3] rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <img
              src="/sayrab.png"
              alt="Sayrab"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0ea5c6]/10 border border-[#0ea5c6]/30 text-[#0ea5c6] text-xs font-bold mb-2">
              <Factory size={13} />
              <span>Manufacturer Portal</span>
            </div>
            <h2 className="text-xl font-black text-[#10182b]">Manufacturing Plant Access</h2>
            <p className="text-xs text-[#64748b] mt-1">
              Authorized manufacturing facilities only. Review quotations, oversee production orders, and manage 45% revenue settlements.
            </p>
          </div>

          {gateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {gateError}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#10182b]">Quick Testing Access</span>
              <span className="px-2 py-0.5 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-[10px] font-bold">
                Verified 45% Partner
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Use standard demo credentials: <code className="font-mono text-[#10182b] font-bold">manufacturer@sayrab.com</code> / <code className="font-mono text-[#10182b] font-bold">password123</code>
            </p>
            <button
              onClick={handleManufacturerDemoLogin}
              disabled={switching}
              className="w-full py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {switching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{switching ? 'Authenticating...' : '1-Click Manufacturer Login'}</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#e5e9e3]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-[#64748b] tracking-wider">
              Or Sign In
            </span>
            <div className="flex-grow border-t border-[#e5e9e3]"></div>
          </div>

          <form onSubmit={handleGateSubmit} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-semibold text-[#10182b] block mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="manufacturer@sayrab.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-xs text-[#10182b] placeholder-[#64748b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#10182b] block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-xs text-[#10182b] placeholder-[#64748b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={switching}
              className="w-full py-2.5 rounded-xl bg-[#10182b] hover:bg-[#1e2a42] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#0ea5c6]" />
              <span>Sign In to Facility Portal</span>
            </button>
          </form>

          <div className="pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-[#64748b] hover:text-[#10182b] transition-colors"
            >
              &larr; Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    pendingQuotations: quotations.filter((q) => ['assigned_to_manufacturer', 'manufacturer_reviewing'].includes(q.status)).length,
    activeOrders: orders.filter((o) => ['pending', 'accepted', 'in_production', 'quality_check'].includes(o.status)).length,
    pendingTechpacks: techpacks.filter((t) => ['pending_review', 'approved'].includes(t.status)).length,
    readyToShip: shippingQueue.filter((s) => s.shippingStatus === 'ready_to_ship').length,
    unreadAlerts: notifications.filter((n) => !n.read).length,
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#10182b] flex flex-col md:flex-row font-sans antialiased selection:bg-[#89ca2e] selection:text-[#10182b]">
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex items-center justify-between bg-[#10182b] border-b border-[#10182b] text-white shadow-xl">
        <Link to="/manufacturer" className="flex items-center gap-3 hover:opacity-90">
          <img src="/sayrab.png" alt="Sayrab" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-bold text-white block leading-tight">Sayrab</span>
            <span className="text-[10px] block font-bold text-[#0ea5c6]">
              Manufacturer Portal
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-xl text-[#0ea5c6] border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation (Dark Navy #10182b) */}
      <ManufacturerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (Light Theme #f5f7fb) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f5f7fb]">
        <ManufacturerHeader
          activeTab={activeTab}
          user={user}
          onSwitchManufacturer={handleManufacturerDemoLogin}
          search={search}
          setSearch={setSearch}
        />

        <main className="p-6 flex-1 bg-[#f5f7fb]">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-[#64748b] gap-3 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-[#0ea5c6]" />
              <span>Fetching live MongoDB manufacturer records...</span>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between shadow-xs">
              <span>{error}</span>
              <button
                onClick={fetchManufacturerData}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView overview={overview} onNavigate={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === 'quotations' && (
                <QuotationsView quotations={quotations} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'orders' && (
                <ProductionOrdersView orders={orders} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'techpacks' && (
                <TechpacksView techpacks={techpacks} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'samples' && (
                <SampleProductionView samples={samples} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'bulk' && (
                <BulkProductionView orders={orders} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'shipping' && (
                <ShippingView queue={shippingQueue} onRefresh={fetchManufacturerData} />
              )}
              {activeTab === 'payments' && <PaymentsView paymentsData={paymentsData} />}
              {activeTab === 'notifications' && (
                <NotificationsView notifications={notifications} />
              )}
              {activeTab === 'reports' && <ReportsView reportsData={reportsData} />}
              {activeTab === 'profile' && (
                <ProfileView profileData={profileData} onRefresh={fetchManufacturerData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
