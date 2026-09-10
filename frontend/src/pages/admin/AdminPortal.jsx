import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardView from './views/DashboardView';
import OrganizationsView from './views/OrganizationsView';
import UsersView from './views/UsersView';
import CampaignsView from './views/CampaignsView';
import PayoutsView from './views/PayoutsView';
import ManufacturersView from './views/ManufacturersView';
import OrdersView from './views/OrdersView';
import TransactionsView from './views/TransactionsView';
import ReportsView from './views/ReportsView';
import NotificationsView from './views/NotificationsView';
import SettingsView from './views/SettingsView';
import { ShieldCheck, Lock, AlertCircle, RefreshCw, LogIn } from 'lucide-react';

export default function AdminPortal() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subFilter, setSubFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data Store
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [techpacks, setTechpacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);

  // Quick Demo Admin Login state
  const [switchingAdmin, setSwitchingAdmin] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
        orgsRes,
        usersRes,
        campsRes,
        payoutsRes,
        mansRes,
        techsRes,
        ordersRes,
        txnsRes,
        reportsRes,
        notifsRes,
        settingsRes,
      ] = await Promise.all([
        api.get('/admin/overview').catch(() => ({ data: null })),
        api.get('/admin/organizations').catch(() => ({ data: [] })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/campaigns').catch(() => ({ data: [] })),
        api.get('/admin/payouts').catch(() => ({ data: [] })),
        api.get('/admin/manufacturers').catch(() => ({ data: [] })),
        api.get('/admin/techpacks').catch(() => ({ data: [] })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/admin/transactions').catch(() => ({ data: [] })),
        api.get('/admin/reports').catch(() => ({ data: null })),
        api.get('/admin/notifications').catch(() => ({ data: [] })),
        api.get('/admin/settings').catch(() => ({ data: null })),
      ]);

      if (overviewRes.data) setOverview(overviewRes.data);
      if (orgsRes.data) setOrganizations(orgsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (campsRes.data) setCampaigns(campsRes.data);
      if (payoutsRes.data) setPayouts(payoutsRes.data);
      if (mansRes.data) setManufacturers(mansRes.data);
      if (techsRes.data) setTechpacks(techsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (txnsRes.data) setTransactions(txnsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (notifsRes.data) setNotifications(notifsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to connect to Admin API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Quick Demo Admin Login
  const handleQuickAdminLogin = async () => {
    try {
      setSwitchingAdmin(true);
      await login('admin@sayrab.com', 'password123');
    } catch (err) {
      alert('Login as admin failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSwitchingAdmin(false);
    }
  };

  // Action Handlers
  const handleReviewOrganization = async (orgId, status, rejectionReason) => {
    const res = await api.put(`/admin/organizations/${orgId}/verify`, { status, rejectionReason });
    setOrganizations((prev) => prev.map((o) => (o._id === orgId ? res.data : o)));
    fetchAdminData();
    return res.data;
  };

  const handleUpdateUserStatus = async (userId, status) => {
    const res = await api.put(`/admin/users/${userId}/status`, { status });
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status } : u)));
    return res.data;
  };

  const handleResetUserPassword = async (userId) => {
    const res = await api.post(`/admin/users/${userId}/reset-password`);
    return res.data;
  };

  const handleDeleteUser = async (userId) => {
    await api.delete(`/admin/users/${userId}`);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleUpdateCampaignStatus = async (campaignId, payload) => {
    const res = await api.put(`/admin/campaigns/${campaignId}/status`, payload);
    setCampaigns((prev) => prev.map((c) => (c._id === campaignId ? { ...c, ...payload } : c)));
    return res.data;
  };

  const handleReviewPayout = async (payoutId, payload) => {
    const res = await api.put(`/admin/payouts/${payoutId}`, payload);
    setPayouts((prev) => prev.map((p) => (p._id === payoutId ? { ...p, ...payload } : p)));
    fetchAdminData();
    return res.data;
  };

  const handleCreateManufacturer = async (payload) => {
    const res = await api.post('/admin/manufacturers', payload);
    setManufacturers((prev) => [res.data, ...prev]);
    return res.data;
  };

  const handleReviewTechpack = async (techpackId, payload) => {
    const res = await api.put(`/admin/techpacks/${techpackId}`, payload);
    setTechpacks((prev) => prev.map((t) => (t._id === techpackId ? { ...t, ...payload } : t)));
    return res.data;
  };

  const handleUpdateOrderStatus = async (orderId, payload) => {
    const res = await api.put(`/admin/orders/${orderId}/status`, payload);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...payload } : o)));
    return res.data;
  };

  const handleRefundOrder = async (orderId, reason) => {
    const res = await api.post(`/admin/orders/${orderId}/refund`, { reason });
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'refunded', paymentStatus: 'refunded' } : o))
    );
    return res.data;
  };

  const handleFlagTransaction = async (txnId, isSuspicious, reason) => {
    const res = await api.put(`/admin/transactions/${txnId}/flag`, { isSuspicious, reason });
    setTransactions((prev) => prev.map((t) => (t._id === txnId ? res.data : t)));
    return res.data;
  };

  const handleMarkNotificationRead = async (notifId) => {
    await api.put(`/admin/notifications/${notifId}/read`);
    if (notifId === 'all') {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } else {
      setNotifications((prev) => prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)));
    }
  };

  const handleUpdateSettings = async (payload) => {
    const res = await api.put('/admin/settings', payload);
    setSettings(res.data);
    return res.data;
  };

  // If user is not admin, show dedicated Admin Gate screen with 1-click login
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <Lock size={30} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Sayrab Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This area requires <strong>Admin Privileges</strong> to access organization verification, payout disbursement, and system configuration.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-left space-y-2">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Platform Admin Credentials:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <strong className="text-white font-mono">admin@sayrab.com</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Password:</span>
              <strong className="text-white font-mono">password123</strong>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleQuickAdminLogin}
              disabled={switchingAdmin}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
            >
              <ShieldCheck size={18} />
              <span>{switchingAdmin ? 'Signing In as Admin...' : 'Sign In as Admin (One Click)'}</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subFilter={subFilter}
        setSubFilter={setSubFilter}
        kpis={overview?.kpis}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          subFilter={subFilter}
          onOpenSidebar={() => setSidebarOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Dynamic Views Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              <p className="text-xs text-slate-400 font-semibold">Loading platform management data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  overview={overview}
                  onNavigate={(tab, sub) => {
                    setActiveTab(tab);
                    if (sub) setSubFilter(sub);
                  }}
                />
              )}

              {activeTab === 'organizations' && (
                <OrganizationsView
                  organizations={organizations}
                  subFilter={subFilter}
                  setSubFilter={setSubFilter}
                  onReviewOrganization={handleReviewOrganization}
                />
              )}

              {activeTab === 'users' && (
                <UsersView
                  users={users}
                  onUpdateStatus={handleUpdateUserStatus}
                  onResetPassword={handleResetUserPassword}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'campaigns' && (
                <CampaignsView
                  campaigns={campaigns}
                  onUpdateStatus={handleUpdateCampaignStatus}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onRefundOrder={handleRefundOrder}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  onFlagTransaction={handleFlagTransaction}
                />
              )}

              {activeTab === 'payouts' && (
                <PayoutsView
                  payouts={payouts}
                  onReviewPayout={handleReviewPayout}
                />
              )}

              {activeTab === 'manufacturers' && (
                <ManufacturersView
                  subFilter={subFilter}
                  setSubFilter={setSubFilter}
                  manufacturers={manufacturers}
                  techpacks={techpacks}
                  orders={orders}
                  onReviewTechpack={handleReviewTechpack}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onCreateManufacturer={handleCreateManufacturer}
                />
              )}

              {activeTab === 'reports' && <ReportsView reports={reports} />}

              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onNavigate={(tab, sub) => {
                    setActiveTab(tab);
                    if (sub) setSubFilter(sub);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
