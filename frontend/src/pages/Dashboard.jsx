<<<<<<< Updated upstream
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Percent,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

const demoOrders = [
  {
    id: 'ORD-7842',
    supporter: 'Michael Chen',
    product: '70th Anniversary Hoodie',
    total: 65,
    earnings: 32.5,
    status: 'Delivered',
  },
  {
    id: 'ORD-7841',
    supporter: 'Sarah Williams',
    product: 'Chapter Tee (Navy)',
    total: 28,
    earnings: 14,
    status: 'Shipped',
  },
  {
    id: 'ORD-7840',
    supporter: 'James Rodriguez',
    product: 'Vintage Crewneck',
    total: 55,
    earnings: 27.5,
    status: 'Processing',
  },
  {
    id: 'ORD-7839',
    supporter: 'Emily Taylor',
    product: 'Alumni Cap',
    total: 24,
    earnings: 12,
    status: 'Delivered',
  },
];

const demoProducts = [
  { name: '70th Anniversary Hoodie', price: 65, sold: 87, raised: 2827.5, color: 'bg-emerald-600' },
  { name: 'Chapter Tee (Navy)', price: 28, sold: 156, raised: 2184, color: 'bg-sky-600' },
  { name: 'Vintage Crewneck', price: 55, sold: 64, raised: 1760, color: 'bg-amber-500' },
  { name: 'Alumni Cap', price: 24, sold: 92, raised: 1104, color: 'bg-primary-600' },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Campaigns', icon: Megaphone, to: '/dashboard/campaigns' },
  { label: 'Design Studio', icon: Package, to: '/dashboard/design-studio' },
  { label: 'Orders', icon: ShoppingCart, to: '/dashboard/orders' },
  { label: 'Products', icon: Package, to: '/dashboard/products' },
  { label: 'Analytics', icon: BarChart3, to: '/dashboard/analytics' },
  { label: 'Payouts', icon: CreditCard, to: '/dashboard/payouts' },
  { label: 'Admin', icon: ShieldCheck, to: '/dashboard/admin', adminOnly: true },
];

const statusClasses = {
  Processing: 'bg-amber-50 text-amber-700',
  Shipped: 'bg-sky-50 text-sky-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
};

function DataPanel({ title, subtitle, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function DashboardModule({ path, campaigns, user }) {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [designs, setDesigns] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    image: '',
  });
  const selectedCampaign = campaigns[0];
=======
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  UploadCloud,
  Store as StoreIcon,
  Settings,
  Coins,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Shield,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const isFundraiser = user?.role === 'fundraiser' || user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isFundraiser ? 'overview' : 'donor_donations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Common/Overview State
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    productsSold: 12, // Mocked
    uploadsCount: 0,
  });
  const [activities, setActivities] = useState([]);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [store, setStore] = useState(null);
>>>>>>> Stashed changes

  // My Campaigns States
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCampaign, setWithdrawCampaign] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    easypaisaNumber: '',
    jazzcashNumber: '',
  });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Uploads States
  const [uploadCategory, setUploadCategory] = useState('campaign_asset');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    url: '',
    type: 'image/jpeg',
  });
  const [uploadError, setUploadError] = useState('');

  // Fundraising Form States
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    category: 'Medical Assistance',
    fundingGoal: '',
    location: '',
    shortDescription: '',
    storyBackground: '',
    storyCurrentSituation: '',
    storyFundingNeed: '',
    storyExpectedImpact: '',
    purposeOfFunds: '',
    startDate: '',
    endDate: '',
    thumbnail: '',
    keywords: '',
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState('');
  const [campaignError, setCampaignError] = useState('');
  const [campaignSuccess, setCampaignSuccess] = useState('');

  // Online Store States
  const [storeProducts, setStoreProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Apparel',
    price: '',
    stock: '',
    description: '',
    image: '',
  });
  const [customizerBase, setCustomizerBase] = useState('tshirt');
  const [customizerColor, setCustomizerColor] = useState('#ffffff');
  const [customizerAsset, setCustomizerAsset] = useState('');
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');

  // Settings States
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    donationUpdates: user?.notificationPreferences?.donationUpdates ?? true,
    campaignUpdates: user?.notificationPreferences?.campaignUpdates ?? true,
    verificationNotifications: user?.notificationPreferences?.verificationNotifications ?? true,
    storeNotifications: user?.notificationPreferences?.storeNotifications ?? true,
  });
  const [referralPrivacy, setReferralPrivacy] = useState(user?.referralPrivacy || 'public');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Load Initial Data
  useEffect(() => {
<<<<<<< Updated upstream
    let mounted = true;

    const load = async () => {
      if (path === '/dashboard/orders') {
        const res = await api.get('/manufacturing/queue').catch(() => ({ data: [] }));
        if (mounted) setData(res.data);
      }

      if (path === '/dashboard/products' && selectedCampaign?._id) {
        const res = await api.get(`/products/campaign/${selectedCampaign._id}`).catch(() => ({ data: [] }));
        if (mounted) setData(res.data);
      }

      if (path === '/dashboard/analytics' && selectedCampaign?._id) {
        const res = await api.get(`/analytics/${selectedCampaign._id}`).catch(() => ({ data: null }));
        if (mounted) setAnalytics(res.data);
      }

      if (path === '/dashboard/payouts' && user?._id) {
        const res = await api.get(`/payouts/${user._id}`).catch(() => ({ data: null }));
        if (mounted) setAnalytics(res.data);
      }

      if (path === '/dashboard/admin' && user?.role === 'admin') {
        const res = await api.get('/admin/overview').catch(() => ({ data: null }));
        if (mounted) setAnalytics(res.data);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [path, selectedCampaign?._id, user?._id, user?.role]);

  const generateDesign = async (event) => {
    event.preventDefault();
    if (!selectedCampaign?._id || !prompt.trim()) return;
    const res = await api.post('/designs/generate', {
      campaignId: selectedCampaign._id,
      prompt,
    });
    setDesigns((prev) => [res.data, ...prev]);
    setPrompt('');
  };

  const createProduct = async (event) => {
    event.preventDefault();
    if (!selectedCampaign?._id) return;
    const res = await api.post('/products', {
      ...productForm,
      price: Number(productForm.price),
      campaignId: selectedCampaign._id,
      stock: 100,
    });
    setData((prev) => [res.data, ...prev]);
    setProductForm({ name: '', description: '', category: 'Apparel', price: '', image: '' });
  };

  if (path === '/dashboard/campaigns') {
    return (
      <DataPanel title="Campaigns" subtitle="Manage your campaign lifecycle and storefront links.">
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{campaign.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{campaign.shortDescription}</p>
                </div>
                <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700">
                  {campaign.status || campaign.lifecycleStatus}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{
                    width: `${Math.min(100, ((campaign.amountRaised || 0) / (campaign.fundingGoal || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/design-studio') {
    return (
      <DataPanel title="Design Studio" subtitle="Generate product design mockups for your active campaign.">
        <form onSubmit={generateDesign} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Black hoodie with minimalist charity logo"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            Generate
          </button>
        </form>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {designs.flatMap((design) =>
            design.generatedImages.map((image) => (
              <img key={image} src={image} alt={design.prompt} className="aspect-square rounded-lg border border-slate-200 object-cover" />
            ))
          )}
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/products') {
    return (
      <DataPanel title="Products" subtitle="Create campaign-linked merchandise products.">
        <form onSubmit={createProduct} className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-5">
          {[
            ['name', 'Name'],
            ['price', 'Price'],
            ['image', 'Image URL'],
          ].map(([key, label]) => (
            <input
              key={key}
              required
              value={productForm[key]}
              onChange={(event) => setProductForm((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={label}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            />
          ))}
          <select
            value={productForm.category}
            onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Apparel</option>
            <option>Drinkware</option>
            <option>Stationery</option>
            <option>Accessories</option>
            <option>Event Merchandise</option>
          </select>
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Add Product</button>
          <textarea
            required
            value={productForm.description}
            onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            className="md:col-span-5 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((product) => (
            <div key={product._id} className="rounded-lg border border-slate-200 p-4">
              <img src={product.image} alt={product.name} className="h-32 w-full rounded-md object-cover bg-slate-100" />
              <h3 className="mt-3 font-semibold text-slate-950">{product.name}</h3>
              <p className="text-sm text-slate-500">{formatCurrency(product.price)}</p>
            </div>
          ))}
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/orders') {
    return (
      <DataPanel title="Orders" subtitle="Paid orders currently in the manufacturing queue.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Order</th>
                <th>Campaign</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((order) => (
                <tr key={order._id}>
                  <td className="py-3 font-mono">{order._id.slice(-8).toUpperCase()}</td>
                  <td>{order.campaignId?.title || 'Campaign'}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td className="capitalize">{order.paymentStatus}</td>
                  <td className="capitalize">{order.productionStatus?.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/analytics') {
    return (
      <DataPanel title="Analytics" subtitle="Campaign sales, traffic, conversion, and revenue.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Revenue" value={formatCurrency(analytics?.revenue || 0)} note="Paid orders plus donations" icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
          <StatCard title="Orders" value={analytics?.orders || 0} note="Paid merchandise orders" icon={ShoppingBag} tone="bg-amber-50 text-amber-600" />
          <StatCard title="Traffic" value={analytics?.traffic || 0} note="Campaign views" icon={Users} tone="bg-sky-50 text-sky-600" />
          <StatCard title="Conversion" value={`${analytics?.conversionRate || 0}%`} note="Orders and donations per view" icon={Percent} tone="bg-primary-50 text-primary-600" />
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/payouts') {
    return (
      <DataPanel title="Payouts" subtitle="Revenue split and withdrawal status.">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Raised" value={formatCurrency(analytics?.totalRaised || 0)} note="All managed campaigns" icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
          <StatCard title="Available" value={formatCurrency(analytics?.available || 0)} note="Unrequested balance" icon={Wallet} tone="bg-primary-50 text-primary-600" />
          <StatCard title="Requested" value={formatCurrency(analytics?.requested || 0)} note="Pending or reviewed payouts" icon={CreditCard} tone="bg-sky-50 text-sky-600" />
        </div>
      </DataPanel>
    );
  }

  if (path === '/dashboard/admin' && user?.role === 'admin') {
    return (
      <DataPanel title="Admin" subtitle="Platform review queue overview.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Object.entries(analytics || {}).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">{key}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </DataPanel>
    );
  }

  return null;
}

function StatCard({ title, value, note, icon: Icon, tone, trend }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function DashboardSidebar({ open, onClose, user }) {
  const location = useLocation();
  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:absolute lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-lg font-semibold text-slate-950">Sayrab</span>
          </Link>
          <button type="button" className="rounded-md p-1 text-slate-500 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Fundraising
          </p>
          {navItems
            .filter((item) => !item.adminOnly || user.role === 'admin')
            .map((item) => {
            const active = location.pathname === item.to;
            return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          )})}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      const requests = [];
      if (user?.role === 'customer' || user?.role === 'donor' || user?.role === 'admin') {
        requests.push(api.get('/donations/my').catch(() => ({ data: [] })));
      } else {
        requests.push(Promise.resolve({ data: [] }));
      }

      if (user?.role === 'manager' || user?.role === 'fundraiser' || user?.role === 'admin') {
        requests.push(api.get('/campaigns/my').catch(() => ({ data: [] })));
      } else {
        requests.push(Promise.resolve({ data: [] }));
      }

      const [donationResult, campaignResult] = await Promise.all(requests);
      if (mounted) {
        setDonations(donationResult.data);
        setCampaigns(campaignResult.data);
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const activeCampaign = campaigns[0] || {
    title: 'Beta Tau - 70 for 70 Scholarship Campaign',
    description: 'Supporting scholarship funds through campaign donations and merchandise.',
    amountRaised: 17500,
    fundingGoal: 25000,
    donorsCount: 143,
    slug: '',
  };

  const totals = useMemo(() => {
    const donated = donations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const raised = campaigns.reduce((sum, item) => sum + (Number(item.amountRaised) || 0), 0);
    const goal = campaigns.reduce((sum, item) => sum + (Number(item.fundingGoal) || 0), 0);

    return {
      raised: raised || 17500,
      goal: goal || 25000,
      donated,
      activeCampaigns: campaigns.length || 2,
      orders: demoOrders.length + 139,
      payouts: Math.round((raised || 17500) * 0.5),
    };
  }, [campaigns, donations]);

  const progress = Math.min((activeCampaign.amountRaised / activeCampaign.fundingGoal) * 100, 100);
  const isOverview = location.pathname === '/dashboard';

  return (
    <div className="relative min-h-[calc(100vh-6rem)] bg-slate-50">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <div className="lg:pl-64">
        <header className="sticky top-24 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="rounded-md p-1 text-slate-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open dashboard menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden w-72 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search campaigns, orders, supporters...</span>
              </div>
            </div>
            <button type="button" className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-600" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-8 p-4 lg:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {isOverview ? 'Dashboard' : navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
            <p className="text-slate-500">Track your fundraising campaigns and earnings.</p>
          </div>

          {!isOverview && (
            <DashboardModule path={location.pathname} campaigns={campaigns} user={user} />
          )}

          {isOverview && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Raised"
              value={formatCurrency(totals.raised)}
              note={totals.donated ? `${formatCurrency(totals.donated)} donated by you` : 'Demo campaign activity'}
              icon={DollarSign}
              tone="bg-emerald-50 text-emerald-600"
              trend="+12%"
            />
            <StatCard
              title="Active Campaigns"
              value={totals.activeCampaigns}
              note="1 ending in 12 days"
              icon={Target}
              tone="bg-primary-50 text-primary-600"
            />
            <StatCard
              title="Orders Placed"
              value={totals.orders}
              note="+8 this week"
              icon={ShoppingBag}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Funds Paid Out"
              value={formatCurrency(totals.payouts)}
              note="Next payout in 5 days"
              icon={Wallet}
              tone="bg-sky-50 text-sky-600"
            />
          </div>}

          {isOverview && <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-950">Active Campaign</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-semibold leading-tight text-slate-950">{activeCampaign.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{activeCampaign.description}</p>
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-slate-950">
                    {formatCurrency(activeCampaign.amountRaised)}
                  </span>
                  <span className="text-sm text-slate-500">
                    of {formatCurrency(activeCampaign.fundingGoal)} goal
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">{progress.toFixed(0)}%</span>
                  of goal reached
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Time Left', value: '12 days', icon: Clock },
                  { label: 'Your Share', value: '50%', icon: Percent },
                  { label: 'Supporters', value: activeCampaign.donorsCount || 143, icon: Users },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={activeCampaign.slug ? `/campaigns/${activeCampaign.slug}` : '/start-campaign'}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Campaign
                </Link>
                <button
                  type="button"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">Payouts</h2>
              <div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary-600">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-500">Available Balance</p>
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                      {formatCurrency(totals.payouts / 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 divide-y divide-slate-200">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-950">Next Payout</p>
                      <p className="text-xs text-slate-500">Auto transfer</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">Jan 15</p>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-950">Lifetime Paid</p>
                      <p className="text-xs text-slate-500">Demo estimate</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">{formatCurrency(totals.payouts)}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 h-10 w-full rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Request Payout
              </button>
            </section>
          </div>}

          {isOverview && <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-950">Recent Orders</h2>
              <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-4 py-3">Supporter</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Earnings</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demoOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-950">{order.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-950">{order.supporter}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{order.product}</td>
                      <td className="px-4 py-4 text-right text-sm text-slate-950">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-600">
                        {formatCurrency(order.earnings)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>}

          {isOverview && <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Top Products</h2>
              <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                All Products
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {demoProducts.map((product) => (
                <div key={product.name} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <span className={`h-8 w-8 rounded-md ${product.color}`} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-tight text-slate-950">{product.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-3">
                    <div>
                      <p className="text-xs text-slate-500">Sold</p>
                      <p className="text-lg font-semibold text-slate-950">{product.sold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Raised</p>
                      <p className="flex items-center justify-end gap-1 text-sm font-semibold text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        {formatCurrency(product.raised)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>}
        </main>
      </div>
=======
    if (!user) return;

    if (user.role === 'donor' || user.role === 'admin') {
      api.get('/donations/my').then((res) => setDonations(res.data)).catch(() => {});
    }

    if (isFundraiser) {
      // Fetch Campaigns
      api.get('/campaigns/my').then((res) => {
        setCampaigns(res.data);
        // Calculate stats
        const total = res.data.reduce((sum, c) => sum + c.amountRaised, 0);
        const active = res.data.filter(c => c.lifecycleStatus === 'active').length;
        setStats(prev => ({ ...prev, totalRaised: total, activeCampaigns: active }));
        
        // Generate activity feed
        const acts = [];
        res.data.forEach(c => {
          acts.push({
            id: c._id + '_created',
            title: `Campaign created: "${c.title}"`,
            date: c.createdAt,
            type: 'campaign',
          });
          if (c.amountRaised > 0) {
            acts.push({
              id: c._id + '_donations',
              title: `Funds accumulated: ${formatCurrency(c.amountRaised)} raised for "${c.title}"`,
              date: c.updatedAt,
              type: 'donation',
            });
          }
        });
        setActivities(acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
      }).catch(() => {});

      // Fetch Withdrawals
      api.get('/withdrawals/my').then((res) => setWithdrawals(res.data)).catch(() => {});

      // Fetch Uploads
      api.get('/uploads').then((res) => {
        setUploads(res.data);
        setStats(prev => ({ ...prev, uploadsCount: res.data.length }));
      }).catch(() => {});

      // Fetch Store
      api.get('/stores/my').then((res) => {
        setStore(res.data);
        if (res.data) {
          // Fetch products for this creator
          api.get(`/products?creator=${user._id}`).then((prodRes) => {
            setStoreProducts(prodRes.data.products);
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [user]);

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // -------------------------
  // Campaigns & Withdrawals
  // -------------------------
  const handleWithdrawRequest = (campaign) => {
    setWithdrawCampaign(campaign);
    setWithdrawForm({
      bankName: '',
      accountHolderName: user.fullName || '',
      accountNumber: '',
      iban: '',
      easypaisaNumber: '',
      jazzcashNumber: '',
    });
    setWithdrawError('');
    setWithdrawSuccess('');
    setShowWithdrawModal(true);
  };

  const submitWithdrawalForm = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    try {
      const res = await api.post('/withdrawals', {
        campaignId: withdrawCampaign._id,
        ...withdrawForm,
      });
      setWithdrawals([res.data, ...withdrawals]);
      setWithdrawSuccess('Withdrawal request submitted successfully! Pending approval.');
      setTimeout(() => {
        setShowWithdrawModal(false);
      }, 2000);
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Submission failed');
    }
  };

  // -------------------------
  // Uploads Management
  // -------------------------
  const handleMockUpload = (e) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadForm.name || !uploadForm.url) {
      setUploadError('Please provide both asset name and a URL');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 300);

    setTimeout(async () => {
      try {
        const res = await api.post('/uploads', {
          name: uploadForm.name,
          url: uploadForm.url,
          type: uploadForm.type,
          size: Math.floor(Math.random() * 5000000) + 500000,
          category: uploadCategory,
        });
        setUploads([res.data, ...uploads]);
        setStats(prev => ({ ...prev, uploadsCount: prev.uploadsCount + 1 }));
        setUploadForm({ name: '', url: '', type: 'image/jpeg' });
        setIsUploading(false);
      } catch (err) {
        setUploadError(err.response?.data?.message || 'Upload registration failed');
        setIsUploading(false);
      }
    }, 1200);
  };

  const handleDeleteUpload = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/uploads/${id}`);
      setUploads(uploads.filter(u => u._id !== id));
      setStats(prev => ({ ...prev, uploadsCount: Math.max(0, prev.uploadsCount - 1) }));
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  // -------------------------
  // Campaign Form & AI Simulation
  // -------------------------
  const handleAISimulation = () => {
    if (!campaignForm.title) {
      setCampaignError('Please enter a campaign title first to generate AI content');
      return;
    }
    setAiGenerating(true);
    setCampaignError('');
    setCampaignSuccess('');

    const steps = [
      'Analyzing title intent...',
      'Structuring background story...',
      'Crafting impact statement...',
      'Selecting optimal keywords & thumbnail...',
      'Finalizing simulated generation...'
    ];

    let current = 0;
    setAiStep(steps[current]);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setAiStep(steps[current]);
      } else {
        clearInterval(interval);
        
        // Auto-fill values
        const title = campaignForm.title;
        setCampaignForm(prev => ({
          ...prev,
          keywords: `${prev.category.toLowerCase().split(' / ')[0]}, urgent help, community support, ${title.toLowerCase().split(' ').slice(0, 2).join(' ')}`,
          shortDescription: `Urgent appeal: ${title}. Support us to create a meaningful, transparent social impact in our community. Every contribution matters.`,
          storyBackground: `This project is initiated to address key community issues. ${title} represents a vital necessity that will improve the local living conditions.`,
          storyCurrentSituation: `Currently, families are suffering due to critical lacks in this area. Prompt intervention is crucial to prevent further escalation of health and social difficulties.`,
          storyFundingNeed: `We require immediate funding of ${prev.fundingGoal ? formatCurrency(prev.fundingGoal) : 'funds'} to purchase machinery, construct facilities, and cover installation charges.`,
          storyExpectedImpact: `Our projection includes providing direct support to hundreds of community members. Health indexes will improve, and local resources will be secured.`,
          purposeOfFunds: `Equipment sourcing, civil constructions, logistics, and monitoring.`,
          thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
        }));
        setAiGenerating(false);
        setCampaignSuccess('AI generation successfully filled description, story, keywords and thumbnail!');
      }
    }, 800);
  };

  const handleCampaignSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setCampaignError('');
    setCampaignSuccess('');

    if (isDraft) {
      localStorage.setItem('sayrab_campaign_draft', JSON.stringify(campaignForm));
      setCampaignSuccess('Campaign saved as draft in browser local storage!');
      return;
    }

    try {
      const res = await api.post('/campaigns', {
        title: campaignForm.title,
        category: campaignForm.category,
        thumbnail: campaignForm.thumbnail,
        location: campaignForm.location,
        shortDescription: campaignForm.shortDescription,
        story: {
          background: campaignForm.storyBackground,
          currentSituation: campaignForm.storyCurrentSituation,
          fundingNeed: campaignForm.storyFundingNeed,
          expectedImpact: campaignForm.storyExpectedImpact,
        },
        fundingGoal: parseFloat(campaignForm.fundingGoal),
        purposeOfFunds: campaignForm.purposeOfFunds,
        startDate: campaignForm.startDate || new Date().toISOString(),
        endDate: campaignForm.endDate,
        keywords: campaignForm.keywords.split(',').map(k => k.trim()),
      });

      setCampaigns([res.data, ...campaigns]);
      setCampaignSuccess('Campaign submitted successfully! Pending verification by admin.');
      
      // Clear form
      setCampaignForm({
        title: '',
        category: 'Medical Assistance',
        fundingGoal: '',
        location: '',
        shortDescription: '',
        storyBackground: '',
        storyCurrentSituation: '',
        storyFundingNeed: '',
        storyExpectedImpact: '',
        purposeOfFunds: '',
        startDate: '',
        endDate: '',
        thumbnail: '',
        keywords: '',
      });
      localStorage.removeItem('sayrab_campaign_draft');
    } catch (err) {
      setCampaignError(err.response?.data?.message || 'Failed to create campaign. Ensure duration is 7-90 days.');
    }
  };

  const loadDraftCampaign = () => {
    const draft = localStorage.getItem('sayrab_campaign_draft');
    if (draft) {
      setCampaignForm(JSON.parse(draft));
      setCampaignSuccess('Loaded campaign draft from local storage.');
    } else {
      setCampaignError('No saved draft found.');
    }
  };

  // -------------------------
  // Online Store & Mockup Customizer
  // -------------------------
  const handleCustomizerCreate = async (e) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');

    if (!productForm.name || !productForm.price || !productForm.stock) {
      setProductError('Please fill in all product details');
      return;
    }

    // Generate a mockup image URL using customizer parameters
    const mockImage = `https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400&blend=${customizerColor.replace('#', '')}&blend-mode=color`;

    try {
      const res = await api.post('/products', {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        description: productForm.description || `Custom branded ${customizerBase} with custom color and emblem.`,
        image: mockImage,
        branding: 'campaign',
      });

      setStoreProducts([res.data, ...storeProducts]);
      setProductSuccess('Product customized and listed successfully!');
      setProductForm({ name: '', category: 'Apparel', price: '', stock: '', description: '', image: '' });
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setStoreProducts(storeProducts.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // -------------------------
  // Settings Update
  // -------------------------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    try {
      const res = await api.put('/auth/profile', profileForm);
      setUser(res.data);
      setSettingsSuccess('Profile details updated successfully!');
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Profile update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setSettingsError('New passwords do not match');
      return;
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSettingsSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Password update failed');
    }
  };

  const handleNotificationToggle = async (key) => {
    setSettingsError('');
    setSettingsSuccess('');
    const updated = { ...notificationPreferences, [key]: !notificationPreferences[key] };
    setNotificationPreferences(updated);

    try {
      const res = await api.put('/auth/notifications', updated);
      setUser(res.data);
    } catch (err) {
      setSettingsError('Failed to save notification preferences');
    }
  };

  const handleReferralPrivacyChange = async (val) => {
    setReferralPrivacy(val);
    try {
      const res = await api.put('/auth/referral-privacy', { referralPrivacy: val });
      setUser(res.data);
    } catch (err) {
      setSettingsError('Failed to update referral privacy');
    }
  };

  const upgradeAccountDirectly = async () => {
    try {
      const res = await api.put('/auth/upgrade', {
        address: 'Main St, City Center',
        cnic: '12345-1234567-1',
        phone: user.phone || '03001234567',
      });
      setUser(res.data);
      setActiveTab('overview');
    } catch (err) {
      alert('Upgrade failed');
    }
  };

  // Helper to filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (campaignFilter === 'all') return true;
    if (campaignFilter === 'active') return c.lifecycleStatus === 'active';
    if (campaignFilter === 'completed') return c.lifecycleStatus === 'completed' || c.lifecycleStatus === 'goal_achieved';
    if (campaignFilter === 'drafts') return false; // drafted campaigns are local only
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <img src="/sayrab.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
          <span className="font-bold">Sayrab Hub</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded bg-slate-800 text-white">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-transform md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full absolute md:relative'
      } flex flex-col justify-between shadow-2xl md:shadow-none min-h-screen md:min-h-0`}>
        <div>
          {/* Sidebar Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <img src="/sayrab.png" alt="Logo" className="h-10 w-auto brightness-0 invert" />
            <div>
              <p className="font-bold text-white leading-tight">Sayrab</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {isFundraiser ? (
              <>
                <button
                  onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'overview' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => { setActiveTab('campaigns'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'campaigns' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Megaphone size={18} /> My Campaigns
                </button>
                <button
                  onClick={() => { setActiveTab('uploads'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'uploads' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <UploadCloud size={18} /> My Uploads
                </button>
                <button
                  onClick={() => { setActiveTab('fundraising'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'fundraising' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Plus size={18} /> Start Fundraising
                </button>
                <button
                  onClick={() => { setActiveTab('store'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'store' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <StoreIcon size={18} /> Online Store
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('donor_donations'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'donor_donations' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Coins size={18} /> My Donations
                </button>
                <button
                  onClick={() => { setActiveTab('donor_upgrade'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'donor_upgrade' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <StoreIcon size={18} /> Become a Fundraiser
                </button>
              </>
            )}
            <button
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings size={18} /> Account Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-red-900 hover:text-white text-xs font-semibold rounded-lg text-slate-300 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.fullName}. Here is your account snapshot.</p>
          </div>
          {isFundraiser && (
            <button
              onClick={() => setActiveTab('fundraising')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> New Campaign
            </button>
          )}
        </div>

        {/* ------------------------- */}
        {/* OVERVIEW TAB (Fundraiser) */}
        {/* ------------------------- */}
        {activeTab === 'overview' && isFundraiser && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Raised</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalRaised)}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                  <Megaphone size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Campaigns</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeCampaigns}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <StoreIcon size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Products Sold</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.productsSold} units</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Uploads</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.uploadsCount} files</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Feed */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" /> Recent Activities
                </h3>
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No recent activity. Launch a campaign or upload assets to start.</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map(act => (
                      <div key={act.id} className="flex gap-4 border-l-2 border-slate-100 pl-4 py-1 relative">
                        <div className="absolute w-2 h-2 rounded-full bg-primary-600 left-[-5px] top-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatDate(act.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Running Campaigns Widget */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award size={18} className="text-primary-600" /> Running Campaigns
                </h3>
                {campaigns.filter(c => c.lifecycleStatus === 'active').length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No active campaigns.</p>
                ) : (
                  <div className="space-y-4">
                    {campaigns.filter(c => c.lifecycleStatus === 'active').slice(0, 3).map(c => {
                      const percent = Math.min(100, Math.round((c.amountRaised / c.fundingGoal) * 100));
                      return (
                        <div key={c._id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]">{c.title}</span>
                            <span className="text-slate-500 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">{formatCurrency(c.amountRaised)} / {formatCurrency(c.fundingGoal)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* MY CAMPAIGNS TAB          */}
        {/* ------------------------- */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Tabs */}
            <div className="flex border-b border-slate-200 gap-4">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setCampaignFilter(f)}
                  className={`pb-3 text-sm font-semibold capitalize transition-colors cursor-pointer border-b-2 ${
                    campaignFilter === f ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f} Campaigns
                </button>
              ))}
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center">
                <Megaphone size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No campaigns found</h3>
                <p className="text-slate-500 text-sm mt-1">Try launching a new fundraising campaign to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaigns.map(c => {
                  const percent = Math.min(100, Math.round((c.amountRaised / c.fundingGoal) * 100));
                  const currentWithdraw = withdrawals.find(w => w.campaign?._id === c._id);

                  return (
                    <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                            {c.category}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                            c.lifecycleStatus === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {c.lifecycleStatus}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{c.title}</h3>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{c.shortDescription}</p>

                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Progress</span>
                            <span>{percent}% ({formatCurrency(c.amountRaised)})</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-primary-600 h-2.5 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                            <span>Goal: {formatCurrency(c.fundingGoal)}</span>
                            <span>{c.donorCount} Donors</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <Link to={`/campaigns/${c.slug}`} className="text-xs font-bold text-primary-700 hover:underline">
                          View Public Page →
                        </Link>

                        {currentWithdraw ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            currentWithdraw.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            currentWithdraw.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Withdrawal: {currentWithdraw.status} ({formatCurrency(currentWithdraw.amount)})
                          </span>
                        ) : (
                          c.amountRaised > 0 && (
                            <button
                              onClick={() => handleWithdrawRequest(c)}
                              className="px-3.5 py-1.5 bg-primary-600 text-white font-semibold text-xs rounded-lg hover:bg-primary-700 cursor-pointer shadow-sm"
                            >
                              Request Withdrawal
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8 shadow-2xl border border-slate-100 animate-scale-up">
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Request Campaign Withdrawal</h3>
                    <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">
                    Campaign: <strong className="text-slate-800">{withdrawCampaign?.title}</strong><br />
                    Amount available: <strong className="text-primary-700">{formatCurrency(withdrawCampaign?.amountRaised)}</strong>
                  </p>

                  <form onSubmit={submitWithdrawalForm} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={withdrawForm.accountHolderName}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolderName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={withdrawForm.bankName}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          placeholder="E.g., HBL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Number *</label>
                        <input
                          type="text"
                          required
                          value={withdrawForm.accountNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">IBAN *</label>
                      <input
                        type="text"
                        required
                        value={withdrawForm.iban}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, iban: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        placeholder="PK20HABB00..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Easypaisa (optional)</label>
                        <input
                          type="text"
                          value={withdrawForm.easypaisaNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, easypaisaNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          placeholder="03*********"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jazzcash (optional)</label>
                        <input
                          type="text"
                          value={withdrawForm.jazzcashNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, jazzcashNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          placeholder="03*********"
                        />
                      </div>
                    </div>

                    {withdrawError && <p className="text-xs text-red-600 font-semibold">{withdrawError}</p>}
                    {withdrawSuccess && <p className="text-xs text-emerald-600 font-semibold">{withdrawSuccess}</p>}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowWithdrawModal(false)}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 cursor-pointer text-sm shadow-sm"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* MY UPLOADS TAB            */}
        {/* ------------------------- */}
        {activeTab === 'uploads' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Asset Uploader */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Platform Asset</h3>
                <form onSubmit={handleMockUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Category</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadCategory('campaign_asset')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          uploadCategory === 'campaign_asset' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Campaign File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadCategory('merchandise_asset')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          uploadCategory === 'merchandise_asset' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Store Asset
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Asset Name *</label>
                    <input
                      type="text"
                      required
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="E.g., Medical Prescription"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mock File Image URL *</label>
                    <input
                      type="url"
                      required
                      value={uploadForm.url}
                      onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="E.g., https://picsum.photos/600/400"
                    />
                  </div>

                  {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

                  {isUploading && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary-600 h-2 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isUploading ? 'Registering...' : 'Register Asset'}
                  </button>
                </form>
              </div>

              {/* Assets List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-4">My Uploaded Assets</h3>
                {uploads.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No uploaded assets found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uploads.map(u => (
                      <div key={u._id} className="border border-slate-200 rounded-xl p-3 flex gap-3 items-center relative hover:shadow-sm transition-shadow">
                        <img src={u.url} alt={u.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{u.category.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Size: {Math.round(u.size / 1024)} KB</p>
                        </div>
                        <button
                          onClick={() => handleDeleteUpload(u._id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 absolute top-2 right-2 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* START FUNDRAISING TAB     */}
        {/* ------------------------- */}
        {activeTab === 'fundraising' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Launch New Campaign</h3>
                <p className="text-slate-500 text-xs mt-1">Tell your story, define goals, and reach supportive donors.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadDraftCampaign}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Load Draft
                </button>
                <button
                  type="button"
                  onClick={handleAISimulation}
                  disabled={aiGenerating}
                  className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Sparkles size={14} className={aiGenerating ? 'animate-spin' : ''} />
                  {aiGenerating ? 'AI Writing...' : 'Write with AI'}
                </button>
              </div>
            </div>

            {aiGenerating && (
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-indigo-700 animate-pulse text-sm">
                <Sparkles size={20} className="animate-spin" />
                <span>{aiStep}</span>
              </div>
            )}

            {campaignError && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">{campaignError}</div>}
            {campaignSuccess && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold">{campaignSuccess}</div>}

            <form onSubmit={handleCampaignSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="E.g., Flood Relief Camps in Sindh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category *</label>
                  <select
                    value={campaignForm.category}
                    onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  >
                    <option value="Medical Assistance">Medical Assistance</option>
                    <option value="Education / Student Fees">Education / Student Fees</option>
                    <option value="Small Business Support">Small Business Support</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Food Distribution">Food Distribution</option>
                    <option value="Community Welfare">Community Welfare</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Emergency Assistance">Emergency Assistance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Funding Goal (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={campaignForm.fundingGoal}
                    onChange={(e) => setCampaignForm({ ...campaignForm, fundingGoal: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.location}
                    onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="E.g., Karachi, Pakistan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Duration Days (7-90) *</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Short Summary * (Max 300 chars)</label>
                <textarea
                  required
                  rows={2}
                  maxLength={300}
                  value={campaignForm.shortDescription}
                  onChange={(e) => setCampaignForm({ ...campaignForm, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                  placeholder="Provide a brief, compelling summary for the campaign lists page..."
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b pb-2">Campaign Detailed Story</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Background *</label>
                    <textarea
                      required
                      rows={3}
                      value={campaignForm.storyBackground}
                      onChange={(e) => setCampaignForm({ ...campaignForm, storyBackground: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Current Situation *</label>
                    <textarea
                      required
                      rows={3}
                      value={campaignForm.storyCurrentSituation}
                      onChange={(e) => setCampaignForm({ ...campaignForm, storyCurrentSituation: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Funding Need Details *</label>
                    <textarea
                      required
                      rows={3}
                      value={campaignForm.storyFundingNeed}
                      onChange={(e) => setCampaignForm({ ...campaignForm, storyFundingNeed: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Impact *</label>
                    <textarea
                      required
                      rows={3}
                      value={campaignForm.storyExpectedImpact}
                      onChange={(e) => setCampaignForm({ ...campaignForm, storyExpectedImpact: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Purpose of Funds *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.purposeOfFunds}
                    onChange={(e) => setCampaignForm({ ...campaignForm, purposeOfFunds: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="E.g., Medical purchase (50%), Logistics (30%), Installation (20%)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={campaignForm.keywords}
                    onChange={(e) => setCampaignForm({ ...campaignForm, keywords: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="medical, surgery, health"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={campaignForm.thumbnail}
                  onChange={(e) => setCampaignForm({ ...campaignForm, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  placeholder="E.g., https://picsum.photos/600/400"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={(e) => handleCampaignSubmit(e, true)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl transition-all cursor-pointer text-sm shadow-md"
                >
                  Submit Campaign
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------- */}
        {/* ONLINE STORE TAB          */}
        {/* ------------------------- */}
        {activeTab === 'store' && (
          <div className="space-y-8 animate-fade-in">
            {!store ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto">
                <StoreIcon size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Open Store first</h3>
                <p className="text-slate-500 text-sm mt-1">To sell products, customize merchandise and manage lists, open a merchandise store.</p>
                <button
                  onClick={() => navigate('/store')}
                  className="mt-6 px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 cursor-pointer"
                >
                  Go to Store Page
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual customizer / Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Mockup Visual Customizer</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Design apparel, drinkware or stationery with brand logo & color configurations.</p>
                  </div>

                  {/* Mockup Canvas */}
                  <div className="bg-slate-100 rounded-2xl p-8 flex items-center justify-center relative min-h-[260px] border border-slate-200">
                    {/* Visual Composite Base */}
                    <div className="relative w-44 h-44 transition-all duration-300 flex items-center justify-center rounded-xl bg-white shadow-md p-4" style={{ backgroundColor: customizerColor }}>
                      <div className="w-full h-full flex flex-col justify-center items-center select-none text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/70 px-1.5 py-0.5 rounded shadow-sm mb-1">{customizerBase}</span>
                        {customizerAsset ? (
                          <img src={customizerAsset} alt="Emblem" className="w-16 h-16 rounded object-cover shadow border border-white/50" />
                        ) : (
                          <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs">Logo</div>
                        )}
                        <span className="text-[9px] font-extrabold text-slate-800 tracking-wider mt-2">SAYRAB CORE</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCustomizerCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Base Product</label>
                        <select
                          value={customizerBase}
                          onChange={(e) => setCustomizerBase(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        >
                          <option value="tshirt">T-Shirt</option>
                          <option value="mug">Branded Mug</option>
                          <option value="notebook">Notebook</option>
                          <option value="hoodie">Hoodie Jacket</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Color Palette</label>
                        <div className="flex gap-1.5 items-center mt-1">
                          {['#ffffff', '#000000', '#ecfdf5', '#89ca2e', '#f59e0b', '#ef4444'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setCustomizerColor(color)}
                              className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                                customizerColor === color ? 'ring-2 ring-primary-500 border-white scale-110' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Choose Asset</label>
                        <select
                          value={customizerAsset}
                          onChange={(e) => setCustomizerAsset(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        >
                          <option value="">None (Text Only)</option>
                          {uploads.map(u => (
                            <option key={u._id} value={u.url}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                          placeholder="E.g., Thar Campaign Classic Mug"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        >
                          <option value="Apparel">Apparel</option>
                          <option value="Drinkware">Drinkware</option>
                          <option value="Stationery">Stationery</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Event Merchandise">Event Merchandise</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Price (PKR) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                          placeholder="950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Stock *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    {productError && <p className="text-xs text-red-600 font-semibold">{productError}</p>}
                    {productSuccess && <p className="text-xs text-emerald-600 font-semibold">{productSuccess}</p>}

                    <button
                      type="submit"
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                    >
                      Save and Publish Custom Product
                    </button>
                  </form>
                </div>

                {/* List Management */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-5 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">List Management</h3>
                  {storeProducts.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">No products in your store yet. Create one with the mockup builder.</p>
                  ) : (
                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {storeProducts.map(p => (
                        <div key={p._id} className="flex gap-3 items-center border border-slate-100 rounded-xl p-3 relative shadow-sm hover:shadow-md transition-all">
                          <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                            <p className="text-[10px] text-primary-700 font-bold mt-0.5">{p.category}</p>
                            <p className="text-xs font-bold text-slate-800 mt-1">{formatCurrency(p.price)} · Stock: {p.stock}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 absolute top-2 right-2 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* DONOR DONATIONS TAB       */}
        {/* ------------------------- */}
        {activeTab === 'donor_donations' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800">Donation History</h3>
            {donations.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto">
                <Coins size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No donations yet</h3>
                <p className="text-slate-500 text-sm mt-1">Support an active campaign to see your contribution record listed here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.map((d) => (
                  <div
                    key={d._id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap justify-between items-center gap-4 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <Link
                        to={`/campaigns/${d.campaign?.slug}`}
                        className="font-bold text-primary-700 hover:underline text-base"
                      >
                        {d.campaign?.title}
                      </Link>
                      <p className="text-xs text-slate-400 font-medium mt-1">Donated on {formatDate(d.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900 text-lg">{formatCurrency(d.amount)}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Receipt: {d.receiptNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* DONOR UPGRADE TAB         */}
        {/* ------------------------- */}
        {activeTab === 'donor_upgrade' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto shadow-sm animate-fade-in">
            <Megaphone className="text-primary-600 mx-auto mb-4" size={54} />
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Upgrade Account to Fundraiser</h3>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Launch your own active charitable campaigns, request transparent bank withdrawals, and configure online merchandise store customization mockups. Maximize your community outreach now.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 text-left border mb-6 flex items-start gap-3">
              <Info className="text-primary-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-slate-600 leading-normal">
                By upgrading, your profile role switches immediately to **Fundraiser**. CNIC validation rules apply to campaign withdrawals.
              </p>
            </div>
            <button
              onClick={upgradeAccountDirectly}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              Confirm Account Upgrade <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ------------------------- */}
        {/* ACCOUNT SETTINGS TAB      */}
        {/* ------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {settingsSuccess && <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold">{settingsSuccess}</div>}
            {settingsError && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold">{settingsError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                  <User size={18} className="text-slate-400" /> Profile Information
                </h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Home/Office Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Profile Picture URL</label>
                    <input
                      type="url"
                      value={profileForm.profilePicture}
                      onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
                  >
                    Save Profile Details
                  </button>
                </form>
              </div>

              {/* Password security & settings */}
              <div className="space-y-8">
                {/* Change Password */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-slate-400" /> Password & Security
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Notifications & referral privacy */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4">Referral Privacy Settings</h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={referralPrivacy === 'public'}
                          onChange={() => handleReferralPrivacyChange('public')}
                          className="accent-primary-600"
                        />
                        Public Leaderboard
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={referralPrivacy === 'anonymous'}
                          onChange={() => handleReferralPrivacyChange('anonymous')}
                          className="accent-primary-600"
                        />
                        Anonymous Profile
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-700 cursor-pointer">
                        <span>Donation updates & reports</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.donationUpdates}
                          onChange={() => handleNotificationToggle('donationUpdates')}
                          className="w-4 h-4 accent-primary-600"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-700 cursor-pointer">
                        <span>Campaign launch success logs</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.campaignUpdates}
                          onChange={() => handleNotificationToggle('campaignUpdates')}
                          className="w-4 h-4 accent-primary-600"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-700 cursor-pointer">
                        <span>Identity verification requests</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.verificationNotifications}
                          onChange={() => handleNotificationToggle('verificationNotifications')}
                          className="w-4 h-4 accent-primary-600"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-700 cursor-pointer">
                        <span>Merchandise order logs</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.storeNotifications}
                          onChange={() => handleNotificationToggle('storeNotifications')}
                          className="w-4 h-4 accent-primary-600"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
>>>>>>> Stashed changes
    </div>
  );
}
