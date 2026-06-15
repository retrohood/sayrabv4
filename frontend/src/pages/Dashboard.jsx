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
  Info,
  ShoppingBag
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const isFundraiser = user?.role === 'fundraiser' || user?.role === 'manager' || user?.role === 'admin';
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
    campaignId: '',
  });
  const [customizerBase, setCustomizerBase] = useState('tshirt');
  const [customizerColor, setCustomizerColor] = useState('#ffffff');
  const [customizerAsset, setCustomizerAsset] = useState('');
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');

  // Campaign Orders States
  const [campaignOrders, setCampaignOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
    if (!user) return;

    if (user.role === 'donor' || user.role === 'admin') {
      api.get('/donations/my')
        .then((res) => setDonations(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDonations([]));
    }

    if (isFundraiser) {
      // Fetch Campaigns
      api.get('/campaigns/my').then(async (res) => {
        const campaignsData = Array.isArray(res.data) ? res.data : [];
        setCampaigns(campaignsData);
        // Calculate stats
        const total = campaignsData.reduce((sum, c) => sum + (c.amountRaised || 0), 0);
        const active = campaignsData.filter(c => c.lifecycleStatus === 'active').length;
        setStats(prev => ({ ...prev, totalRaised: total, activeCampaigns: active }));
        
        // Generate activity feed
        const acts = [];
        campaignsData.forEach(c => {
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

        // Fetch Orders for campaigns
        if (campaignsData.length > 0) {
          setOrdersLoading(true);
          try {
            const orderPromises = campaignsData.map(c => 
              api.get(`/orders/campaign/${c._id}`).catch(err => {
                console.error(`Failed to fetch orders for campaign ${c._id}:`, err);
                return { data: [] };
              })
            );
            const orderResponses = await Promise.all(orderPromises);
            const allOrders = [];
            orderResponses.forEach(orderRes => {
              if (Array.isArray(orderRes.data)) {
                allOrders.push(...orderRes.data);
              }
            });
            setCampaignOrders(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          } catch (err) {
            console.error('Failed to fetch campaign orders:', err);
            setCampaignOrders([]);
          } finally {
            setOrdersLoading(false);
          }
        }
      }).catch((err) => {
        console.error('Failed to fetch my campaigns:', err);
        setCampaigns([]);
        setActivities([]);
      });

      // Fetch Withdrawals
      api.get('/withdrawals/my')
        .then((res) => setWithdrawals(Array.isArray(res.data) ? res.data : []))
        .catch(() => setWithdrawals([]));

      // Fetch Uploads
      api.get('/uploads').then((res) => {
        const uploadsData = Array.isArray(res.data) ? res.data : [];
        setUploads(uploadsData);
        setStats(prev => ({ ...prev, uploadsCount: uploadsData.length }));
      }).catch((err) => {
        console.error('Failed to fetch uploads:', err);
        setUploads([]);
      });

      // Fetch Store
      api.get('/stores/my').then((res) => {
        setStore(res.data || null);
        if (res.data && res.data._id) {
          // Fetch products for this creator
          api.get(`/products?creator=${user._id}`).then((prodRes) => {
            setStoreProducts(prodRes.data?.products || []);
          }).catch(() => setStoreProducts([]));
        }
      }).catch((err) => {
        console.error('Failed to fetch store:', err);
        setStore(null);
        setStoreProducts([]);
      });
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

    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.campaignId) {
      setProductError('Please fill in all product details and select a campaign to link');
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
        campaignId: productForm.campaignId,
        campaign: productForm.campaignId,
      });

      setStoreProducts([res.data, ...storeProducts]);
      setProductSuccess('Product customized and listed successfully!');
      setProductForm({ name: '', category: 'Apparel', price: '', stock: '', description: '', image: '', campaignId: '' });
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/manufacturing/orders/${orderId}/status`, { productionStatus: newStatus });
      setCampaignOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, productionStatus: res.data.productionStatus, orderStatus: res.data.orderStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
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

  // Calculate analytics
  const totalRaisedValue = campaigns.reduce((sum, c) => sum + (c.amountRaised || 0), 0);
  const merchRevenueValue = campaignOrders.reduce((sum, o) => sum + (o.total || 0), 0) * 0.5;
  const directDonationsValue = Math.max(0, totalRaisedValue - merchRevenueValue);
  const productsSoldValue = campaignOrders.reduce((sum, o) => sum + (o.products ? o.products.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) : 0), 0);
  const activeCampaignsValue = campaigns.filter(c => c.lifecycleStatus === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <img src="/sayrab.png" alt="Logo" className="h-12 w-auto" />
          <span className="font-bold text-white">Sayrab Hub</span>
        </Link>
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
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90">
              <img src="/sayrab.png" alt="Logo" className="h-16 w-auto" />
              <div>
                <p className="font-bold text-white leading-tight">Sayrab</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
              </div>
            </Link>
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
                  onClick={() => { navigate('/create-campaign'); setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-slate-800 hover:text-white"
                >
                  <Plus size={18} /> Start Fundraising
                </button>
                <button
                  onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'products' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <StoreIcon size={18} /> My Products
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'orders' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShoppingBag size={18} /> My Orders
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
              onClick={() => navigate('/create-campaign')}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Total Raised</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(totalRaisedValue)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Direct Donations</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(directDonationsValue)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Merch Share (50%)</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(merchRevenueValue)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <StoreIcon size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Products Sold</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{productsSoldValue} units</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                  <Megaphone size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Active Campaigns</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{activeCampaignsValue}</p>
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
        {/* MY PRODUCTS TAB           */}
        {/* ------------------------- */}
        {activeTab === 'products' && (
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

                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Link to Campaign *</label>
                        <select
                          required
                          value={productForm.campaignId}
                          onChange={(e) => setProductForm({ ...productForm, campaignId: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                        >
                          <option value="">-- Select Campaign --</option>
                          {campaigns.map(c => (
                            <option key={c._id} value={c._id}>{c.title}</option>
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
        {/* MY ORDERS TAB             */}
        {/* ------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Merchandise Orders</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Manage fulfillment and track manufacturing status for merchandise sold.
                  </p>
                </div>
              </div>

              {ordersLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : campaignOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
                  <p className="text-slate-500 text-sm mt-1">Once donators purchase products, their orders will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto animate-fade-in">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Products</th>
                        <th className="py-3 px-4">Revenue Split</th>
                        <th className="py-3 px-4 text-right">Production Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {campaignOrders.map((order) => {
                        const orgShare = (order.total || 0) * 0.5;
                        return (
                          <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-medium">
                              <span className="font-mono text-xs text-slate-700 font-bold block">{order._id.substring(0, 10)}...</span>
                              <span className="text-xs text-slate-400 mt-0.5 block">{formatDate(order.createdAt)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-800">{order.shippingAddress?.fullName || 'Anonymous Buyer'}</div>
                              <div className="text-xs text-slate-500">{order.customerId?.email || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700">
                              {order.campaignId?.title || 'Unknown Campaign'}
                            </td>
                            <td className="py-4 px-4 space-y-1">
                              {order.products?.map((item, idx) => (
                                <div key={idx} className="text-xs text-slate-600">
                                  <span className="font-semibold text-slate-800">{item.name}</span>{' '}
                                  {item.size && <span className="bg-slate-100 text-slate-600 px-1 rounded mx-0.5 text-[10px]">{item.size}</span>}
                                  {item.color && (
                                    <span
                                      className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 align-middle mx-0.5"
                                      style={{ backgroundColor: item.color }}
                                      title={item.color}
                                    />
                                  )}
                                  <span className="text-slate-400"> x{item.quantity}</span>
                                </div>
                              ))}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{formatCurrency(order.total)}</div>
                              <div className="text-xs text-emerald-600 font-bold">Split: {formatCurrency(orgShare)}</div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <select
                                value={order.productionStatus || 'queued'}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer ${
                                  order.productionStatus === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  order.productionStatus === 'shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                  order.productionStatus === 'quality_check' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                  order.productionStatus === 'in_production' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                  'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <option value="queued">Queued</option>
                                <option value="in_production">In Production</option>
                                <option value="quality_check">Quality Check</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
    </div>
  );
}
