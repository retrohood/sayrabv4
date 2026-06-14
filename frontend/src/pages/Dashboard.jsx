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

  useEffect(() => {
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
    </div>
  );
}
