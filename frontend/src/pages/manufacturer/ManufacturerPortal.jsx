import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { Factory, Lock, RefreshCw, LogIn } from 'lucide-react';

export default function ManufacturerPortal() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');

  // Data Store
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
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

  const fetchManufacturerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
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
    fetchManufacturerData();
  }, []);

  // 1-Click Manufacturer Login Handler
  const handleManufacturerDemoLogin = async () => {
    try {
      setSwitching(true);
      await login('manufacturer@sayrab.com', 'password123');
      await fetchManufacturerData();
    } catch (err) {
      alert('Manufacturer login failed: ' + (err.message || 'Server offline'));
    } finally {
      setSwitching(false);
    }
  };

  const isManufacturerAuthorized =
    user && (user.role === 'manufacturer' || user.role === 'admin' || user.email === 'manufacturer@sayrab.com');

  if (!isManufacturerAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Manufacturer Portal Access Required</h2>
            <p className="text-xs text-slate-400 mt-2">
              Sign in with a verified Manufacturer Partner account to view assigned production orders, techpacks, and 45% revenue payouts.
            </p>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-left text-xs space-y-1">
            <div className="text-slate-300 font-semibold">Demo Credentials:</div>
            <div className="text-slate-400">Email: <strong className="text-white">manufacturer@sayrab.com</strong></div>
            <div className="text-slate-400">Password: <strong className="text-white">password123</strong></div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleManufacturerDemoLogin}
              disabled={switching}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {switching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>1-Click Manufacturer Login</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    activeOrders: orders.filter((o) => ['pending', 'accepted', 'in_production', 'quality_check'].includes(o.status)).length,
    pendingTechpacks: techpacks.filter((t) => ['pending_review', 'approved'].includes(t.status)).length,
    readyToShip: shippingQueue.filter((s) => s.shippingStatus === 'ready_to_ship').length,
    unreadAlerts: notifications.filter((n) => !n.read).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <ManufacturerSidebar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <ManufacturerHeader
          activeTab={activeTab}
          user={user}
          onSwitchManufacturer={handleManufacturerDemoLogin}
          search={search}
          setSearch={setSearch}
        />

        <main className="p-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Fetching live MongoDB manufacturer records...</span>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
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
