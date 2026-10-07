import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  UploadCloud,
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
  ShoppingBag,
  Edit3,
  Flame,
  Check,
  Wallet,
  CreditCard,
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  FileText,
  Minus,
  ShoppingCart,
  Truck,
  Package,
  PackageCheck,
  MapPin,
  Copy,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import { addCartItem, readCart, writeCart, cartTotal } from '../utils/cart';

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

  // Buyer Shopping Cart & Checkout States
  const [buyerCart, setBuyerCart] = useState(() => readCart(user?._id));
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
  });

  // Buyer Delivery Tracking States
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [buyerOrdersLoading, setBuyerOrdersLoading] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [trackingFilter, setTrackingFilter] = useState('all');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

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
  const [campaignStep, setCampaignStep] = useState(1); // 1 = Details, 2 = Linked Merchandise, 3 = Success
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    thumbnail: '',
    keywords: '',
    isEmergency: false,
  });
  const [linkedMerchForm, setLinkedMerchForm] = useState({
    name: '',
    category: 'Apparel',
    price: '',
    stock: 100,
    description: '',
    image: '',
    sizes: ['M', 'L'],
    colors: 'Black, White',
  });
  const [createdCampaignInfo, setCreatedCampaignInfo] = useState(null);
  const [createdMerchInfo, setCreatedMerchInfo] = useState(null);
  const [merchError, setMerchError] = useState('');
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState('');
  const [campaignError, setCampaignError] = useState('');
  const [campaignSuccess, setCampaignSuccess] = useState('');

  // Edit Campaign States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
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
    isEmergency: false,
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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

  // Campaign Orders / Received Orders / Payout States
  const [campaignOrders, setCampaignOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterCampaign, setOrderFilterCampaign] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('all');
  const [payoutCampaignFilter, setPayoutCampaignFilter] = useState('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

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

    if (user.role === 'donor' || user.role === 'admin' || !isFundraiser) {
      api.get('/donations/my')
        .then((res) => setDonations(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDonations([]));

      setBuyerOrdersLoading(true);
      api.get('/orders/my')
        .then((res) => {
          setBuyerOrders(Array.isArray(res.data) ? res.data : []);
          setBuyerOrdersLoading(false);
        })
        .catch(() => {
          setBuyerOrders([]);
          setBuyerOrdersLoading(false);
        });
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
        setOrdersLoading(true);
        try {
          const res = await api.get('/orders/fundraiser');
          if (Array.isArray(res.data) && res.data.length > 0) {
            setCampaignOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          } else if (campaignsData.length > 0) {
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
          } else {
            setCampaignOrders([]);
          }
        } catch (err) {
          console.error('Failed to fetch campaign orders:', err);
          setCampaignOrders([]);
        } finally {
          setOrdersLoading(false);
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


  // Sync buyer cart when user changes
  useEffect(() => {
    setBuyerCart(readCart(user?._id));
  }, [user]);

  // Buyer Cart Helper Methods
  const updateBuyerCart = (next) => {
    setBuyerCart(next);
    writeCart(next, user?._id);
  };

  const handleUpdateQty = (id, delta) => {
    updateBuyerCart(
      buyerCart
        .map((item) => (item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveCartItem = (id) => {
    updateBuyerCart(buyerCart.filter((item) => item._id !== id));
  };


  const handleBuyerCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    if (buyerCart.length === 0) return;

    setCheckoutSubmitting(true);
    try {
      const campaignId = buyerCart.find(item => item.campaignId)?.campaignId || campaigns[0]?._id;
      const orderRes = await api.post('/orders', {
        campaignId,
        products: buyerCart.map((item) => ({
          productId: item._id,
          quantity: item.qty,
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined,
        })),
        shippingAddress: checkoutForm,
        paymentStatus: 'paid',
      });

      await api.post('/payment/create-session', {
        orderId: orderRes.data._id,
        campaignId,
        items: buyerCart,
      }).catch(() => {});

      writeCart([], user?._id);
      setBuyerCart([]);
      setCheckoutSuccess(orderRes.data);
      setBuyerOrders((prev) => [orderRes.data, ...prev]);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to complete checkout.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Buyer Delivery Tracking Helpers
  const handleCopyCode = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleManualTrackingLookup = async (e) => {
    e.preventDefault();
    if (!lookupOrderId.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await api.get(`/orders/${lookupOrderId.trim()}`);
      if (res.data) {
        setSelectedTrackingOrder(res.data);
        setBuyerOrders((prev) => {
          if (!prev.some((o) => o._id === res.data._id)) {
            return [res.data, ...prev];
          }
          return prev;
        });
        setLookupOrderId('');
      }
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Order not found with provided ID. Please verify your order number.');
    } finally {
      setLookupLoading(false);
    }
  };

  const getTrackingStepIndex = (order) => {
    if (!order) return 0;
    if (order.shippingStatus === 'delivered' || order.orderStatus === 'delivered') return 4;
    if (order.shippingStatus === 'shipped' || order.shippingStatus === 'in_transit' || order.orderStatus === 'shipped') return 3;
    if (order.productionStatus === 'in_production' || order.productionStatus === 'ready_for_ship' || order.productionStatus === 'printing' || order.productionStatus === 'in_progress') return 2;
    if (order.paymentStatus === 'paid' || order.orderStatus === 'paid' || order.productionStatus === 'queued' || order.productionStatus === 'waiting') return 1;
    return 0;
  };

  const trackingSteps = [
    { label: 'Order Placed', desc: 'Order received and logged in system' },
    { label: 'Payment Confirmed', desc: 'Payment verified & 50% split credited to cause' },
    { label: 'In Production', desc: 'Product custom printing, tailoring & quality check' },
    { label: 'Dispatched / Shipped', desc: 'Handed over to courier with tracking number' },
    { label: 'Delivered', desc: 'Parcel successfully delivered to buyer' },
  ];

  const filteredBuyerOrders = buyerOrders.filter((order) => {
    const stepIdx = getTrackingStepIndex(order);
    if (trackingFilter === 'active' && stepIdx === 4) return false;
    if (trackingFilter === 'delivered' && stepIdx !== 4) return false;
    if (trackingSearch.trim()) {
      const q = trackingSearch.toLowerCase();
      const matchId = order._id?.toLowerCase().includes(q);
      const matchProd = order.products?.some((p) => p.name?.toLowerCase().includes(q));
      const matchCity = (order.shippingAddress?.city || '').toLowerCase().includes(q);
      const matchTrack = (order.trackingNumber || '').toLowerCase().includes(q);
      const matchCamp = (order.campaignId?.title || '').toLowerCase().includes(q);
      if (!matchId && !matchProd && !matchCity && !matchTrack && !matchCamp) return false;
    }
    return true;
  });

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

  const handleMerchSizeToggle = (sz) => {
    setLinkedMerchForm(prev => {
      const sizes = prev.sizes.includes(sz)
        ? prev.sizes.filter(s => s !== sz)
        : [...prev.sizes, sz];
      return { ...prev, sizes };
    });
  };

  const calculateDurationDays = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffTime = e.getTime() - s.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const setQuickDurationDays = (days) => {
    const startStr = campaignForm.startDate || new Date().toISOString().split('T')[0];
    const startDate = new Date(startStr);
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    setCampaignForm(prev => ({
      ...prev,
      startDate: startStr,
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  // Step 1: Validate campaign details and proceed to Step 2 without creating database records
  const handleNextToMerchandise = (e) => {
    e.preventDefault();
    setCampaignError('');
    setCampaignSuccess('');

    // Strict validation: every info is necessary except cover image URL
    if (!campaignForm.title?.trim()) {
      setCampaignError('Campaign Title is required.');
      return;
    }
    if (!campaignForm.category?.trim()) {
      setCampaignError('Category is required.');
      return;
    }
    if (!campaignForm.fundingGoal || Number(campaignForm.fundingGoal) <= 0) {
      setCampaignError('A valid Funding Goal in PKR (> 0) is required.');
      return;
    }
    if (!campaignForm.location?.trim()) {
      setCampaignError('Location is required.');
      return;
    }
    if (!campaignForm.startDate) {
      setCampaignError('Starting Date is required.');
      return;
    }
    if (!campaignForm.endDate) {
      setCampaignError('Finish Date is required.');
      return;
    }
    const days = calculateDurationDays(campaignForm.startDate, campaignForm.endDate);
    if (days === null || days < 7 || days > 90) {
      setCampaignError(`Campaign duration from Starting Date to Finish Date must be between 7 and 90 days. Currently selected: ${days ?? 0} days.`);
      return;
    }
    if (!campaignForm.shortDescription?.trim()) {
      setCampaignError('Short Summary is required.');
      return;
    }
    if (!campaignForm.storyBackground?.trim()) {
      setCampaignError('Story Background is required.');
      return;
    }
    if (!campaignForm.storyCurrentSituation?.trim()) {
      setCampaignError('Story Current Situation is required.');
      return;
    }
    if (!campaignForm.storyFundingNeed?.trim()) {
      setCampaignError('Story Funding Need is required.');
      return;
    }
    if (!campaignForm.storyExpectedImpact?.trim()) {
      setCampaignError('Story Expected Impact is required.');
      return;
    }
    if (!campaignForm.purposeOfFunds?.trim()) {
      setCampaignError('Purpose of Funds breakdown is required.');
      return;
    }
    if (!campaignForm.keywords?.trim()) {
      setCampaignError('Keywords (comma separated) are required.');
      return;
    }

    // Step 1 is valid, proceed to merchandise input without writing anything to DB
    setCampaignStep(2);
  };

  // Step 2: Validate merchandise details and create both Campaign & Product atomically
  const handleFinalCampaignWithMerch = async (e) => {
    e.preventDefault();
    setMerchError('');
    setCampaignError('');
    setCampaignSuccess('');

    if (!linkedMerchForm.name?.trim()) {
      setMerchError('Merchandise Name is required.');
      return;
    }
    if (!linkedMerchForm.price || Number(linkedMerchForm.price) <= 0) {
      setMerchError('A valid Merchandise Price in PKR (> 0) is required.');
      return;
    }
    if (!linkedMerchForm.stock || Number(linkedMerchForm.stock) < 1) {
      setMerchError('Stock quantity must be at least 1.');
      return;
    }
    if (!linkedMerchForm.description?.trim()) {
      setMerchError('Merchandise Description is required.');
      return;
    }

    setIsSubmittingCampaign(true);

    try {
      // 1. Create campaign in DB
      const resCamp = await api.post('/campaigns', {
        title: campaignForm.title.trim(),
        category: campaignForm.category.trim(),
        thumbnail: campaignForm.thumbnail?.trim() || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
        location: campaignForm.location.trim(),
        shortDescription: campaignForm.shortDescription.trim(),
        story: {
          background: campaignForm.storyBackground.trim(),
          currentSituation: campaignForm.storyCurrentSituation.trim(),
          fundingNeed: campaignForm.storyFundingNeed.trim(),
          expectedImpact: campaignForm.storyExpectedImpact.trim(),
        },
        fundingGoal: parseFloat(campaignForm.fundingGoal),
        purposeOfFunds: campaignForm.purposeOfFunds.trim(),
        startDate: campaignForm.startDate || new Date().toISOString(),
        endDate: campaignForm.endDate,
        keywords: campaignForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
        isEmergency: Boolean(campaignForm.isEmergency),
      });

      const newCampaign = resCamp.data;

      // 2. Immediately create linked product with newCampaign._id
      const resProd = await api.post('/products', {
        name: linkedMerchForm.name.trim(),
        description: linkedMerchForm.description.trim(),
        category: linkedMerchForm.category,
        price: parseFloat(linkedMerchForm.price),
        stock: parseInt(linkedMerchForm.stock),
        image: linkedMerchForm.image?.trim() || `https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400`,
        sizes: linkedMerchForm.sizes?.length > 0 ? linkedMerchForm.sizes : ['Standard'],
        colors: linkedMerchForm.colors ? linkedMerchForm.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Classic'],
        branding: 'campaign',
        campaignId: newCampaign._id,
        campaign: newCampaign._id,
      });

      setCampaigns(prev => [newCampaign, ...prev]);
      setStoreProducts(prev => [resProd.data, ...prev]);
      setCreatedCampaignInfo(newCampaign);
      setCreatedMerchInfo(resProd.data);
      setCampaignSuccess('Campaign and linked merchandise submitted successfully! Pending verification by admin.');
      setCampaignStep(3);

      // Reset forms
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
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        thumbnail: '',
        keywords: '',
        isEmergency: false,
      });
      setLinkedMerchForm({
        name: '',
        category: 'Apparel',
        price: '',
        stock: 100,
        description: '',
        image: '',
        sizes: ['M', 'L'],
        colors: 'Black, White',
      });
      localStorage.removeItem('sayrab_campaign_draft');
    } catch (err) {
      setMerchError(err.response?.data?.message || 'Failed to create campaign and linked merchandise. Please try again.');
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  // -------------------------
  // Edit Campaign Handlers
  // -------------------------
  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setEditError('');
    setEditSuccess('');
    setEditForm({
      title: camp.title || '',
      category: camp.category || 'Medical Assistance',
      fundingGoal: camp.fundingGoal || camp.goalAmount || '',
      location: camp.location || '',
      shortDescription: camp.shortDescription || camp.description || '',
      storyBackground: camp.story?.background || '',
      storyCurrentSituation: camp.story?.currentSituation || '',
      storyFundingNeed: camp.story?.fundingNeed || '',
      storyExpectedImpact: camp.story?.expectedImpact || '',
      purposeOfFunds: camp.purposeOfFunds || '',
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : camp.deadline ? new Date(camp.deadline).toISOString().split('T')[0] : '',
      thumbnail: camp.thumbnail || camp.banner || '',
      keywords: Array.isArray(camp.keywords) ? camp.keywords.join(', ') : camp.keywords || '',
      isEmergency: Boolean(camp.isEmergency),
    });
    setShowEditModal(true);
  };

  const handleSaveCampaignEdit = async (e) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setEditError('');
    setEditSuccess('');

    if (!editForm.title?.trim()) {
      setEditError('Campaign Title is required.');
      return;
    }
    if (!editForm.fundingGoal || Number(editForm.fundingGoal) <= 0) {
      setEditError('A valid Funding Goal in PKR (> 0) is required.');
      return;
    }
    if (!editForm.location?.trim()) {
      setEditError('Location is required.');
      return;
    }
    if (!editForm.startDate || !editForm.endDate) {
      setEditError('Starting Date and Finish Date are required.');
      return;
    }
    const days = calculateDurationDays(editForm.startDate, editForm.endDate);
    if (days === null || days < 7 || days > 90) {
      setEditError(`Campaign duration must be between 7 and 90 days. Currently: ${days ?? 0} days.`);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await api.put(`/campaigns/${editingCampaign._id}`, {
        title: editForm.title.trim(),
        category: editForm.category,
        thumbnail: editForm.thumbnail?.trim() || editingCampaign.thumbnail,
        banner: editForm.thumbnail?.trim() || editingCampaign.banner,
        location: editForm.location.trim(),
        shortDescription: editForm.shortDescription.trim(),
        description: editForm.shortDescription.trim(),
        story: {
          background: editForm.storyBackground?.trim() || '',
          currentSituation: editForm.storyCurrentSituation?.trim() || '',
          fundingNeed: editForm.storyFundingNeed?.trim() || '',
          expectedImpact: editForm.storyExpectedImpact?.trim() || '',
        },
        fundingGoal: parseFloat(editForm.fundingGoal),
        goalAmount: parseFloat(editForm.fundingGoal),
        purposeOfFunds: editForm.purposeOfFunds?.trim() || '',
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        deadline: editForm.endDate,
        keywords: typeof editForm.keywords === 'string' ? editForm.keywords.split(',').map(k => k.trim()).filter(Boolean) : editForm.keywords,
        isEmergency: Boolean(editForm.isEmergency),
      });

      setCampaigns(prev => prev.map(c => c._id === editingCampaign._id ? { ...c, ...res.data } : c));
      setEditSuccess('Campaign details updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditingCampaign(null);
      }, 1000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update campaign details');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleSaveDraft = (e) => {
    e?.preventDefault?.();
    localStorage.setItem('sayrab_campaign_draft', JSON.stringify({ campaignForm, linkedMerchForm }));
    setCampaignSuccess('Campaign & merchandise draft saved in browser local storage!');
  };

  const loadDraftCampaign = () => {
    const draft = localStorage.getItem('sayrab_campaign_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.campaignForm) {
          setCampaignForm(parsed.campaignForm);
          if (parsed.linkedMerchForm) setLinkedMerchForm(parsed.linkedMerchForm);
        } else {
          setCampaignForm(parsed);
        }
        setCampaignSuccess('Loaded campaign draft from local storage.');
      } catch (err) {
        setCampaignError('No saved draft found.');
      }
    } else {
      setCampaignError('No saved draft found.');
    }
  };

  const resetCampaignWizard = () => {
    setCampaignStep(1);
    setCreatedCampaignInfo(null);
    setCreatedMerchInfo(null);
    setCampaignError('');
    setMerchError('');
    setCampaignSuccess('');
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

  // Payout Tracking Metrics
  const totalBuyerGross = campaignOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalMerchSharePaid = campaignOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.revenueSplit?.organization || (o.total * 0.5)), 0);
  const totalWithdrawnApproved = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const totalWithdrawnPending = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const availableBalance = Math.max(0, totalRaisedValue - totalWithdrawnApproved - totalWithdrawnPending);

  const filteredPayoutOrders = campaignOrders.filter(order => {
    if (payoutCampaignFilter !== 'all') {
      const campId = order.campaignId?._id || order.campaignId;
      if (campId !== payoutCampaignFilter) return false;
    }
    if (payoutStatusFilter === 'settled') {
      if (order.paymentStatus !== 'paid') return false;
    } else if (payoutStatusFilter === 'pending') {
      if (order.paymentStatus === 'paid') return false;
    }
    if (payoutSearch.trim()) {
      const q = payoutSearch.toLowerCase();
      const orderIdMatch = order._id?.toLowerCase().includes(q);
      const buyerNameMatch = (order.shippingAddress?.fullName || order.customerId?.fullName || '')
        .toLowerCase()
        .includes(q);
      const buyerCityMatch = (order.shippingAddress?.city || '').toLowerCase().includes(q);
      const campTitleMatch = (order.campaignId?.title || '').toLowerCase().includes(q);
      const prodNameMatch = order.products?.some(p => p.name?.toLowerCase().includes(q));
      if (!orderIdMatch && !buyerNameMatch && !buyerCityMatch && !campTitleMatch && !prodNameMatch) {
        return false;
      }
    }
    return true;
  });

  const filteredReceivedOrders = campaignOrders.filter((order) => {
    if (orderFilterStatus !== 'all') {
      const st = (order.orderStatus || order.status || '').toLowerCase();
      if (orderFilterStatus === 'paid' && order.paymentStatus !== 'paid') return false;
      if (orderFilterStatus === 'placed' && st !== 'placed' && st !== 'queued') return false;
      if (orderFilterStatus === 'in_production' && st !== 'in_production' && st !== 'production') return false;
      if (orderFilterStatus === 'shipped' && st !== 'shipped' && st !== 'dispatched') return false;
      if (orderFilterStatus === 'delivered' && st !== 'delivered') return false;
    }
    if (orderFilterCampaign !== 'all') {
      const campId = order.campaignId?._id ? String(order.campaignId._id) : String(order.campaignId || '');
      if (campId !== String(orderFilterCampaign)) return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const idMatch = String(order._id || '').toLowerCase().includes(q);
      const buyerNameMatch = String(order.shippingAddress?.fullName || order.customerId?.fullName || '').toLowerCase().includes(q);
      const buyerEmailMatch = String(order.customerId?.email || '').toLowerCase().includes(q);
      const buyerPhoneMatch = String(order.shippingAddress?.phone || order.customerId?.phone || '').toLowerCase().includes(q);
      const cityMatch = String(order.shippingAddress?.city || '').toLowerCase().includes(q);
      const campMatch = String(order.campaignId?.title || '').toLowerCase().includes(q);
      const prodMatch = Array.isArray(order.products) && order.products.some(p =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.size || '').toLowerCase().includes(q) ||
        String(p.color || '').toLowerCase().includes(q)
      );
      if (!idMatch && !buyerNameMatch && !buyerEmailMatch && !buyerPhoneMatch && !cityMatch && !campMatch && !prodMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex items-center justify-between bg-slate-900 border-b border-slate-800 text-white shadow-xl">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <img src="/sayrab.png" alt="Sayrab" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-bold text-white block leading-tight">Sayrab</span>
            <span className="text-[10px] block font-bold text-cyan-400">
              {isFundraiser ? 'Fundraiser Portal' : user?.role === 'admin' ? 'Admin Portal' : 'Buyer Portal'}
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-xl text-cyan-400 border border-slate-700 bg-slate-800 hover:bg-slate-700"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 flex-shrink-0 transition-transform md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full absolute md:relative'
      } flex flex-col justify-between shadow-2xl md:shadow-none min-h-screen md:min-h-0 bg-slate-900 text-slate-300 border-r border-slate-800`}>
        <div>
          {/* Sidebar Brand */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/60">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90">
              <img src="/sayrab.png" alt="Sayrab" className="h-14 w-auto object-contain" />
              <div>
                <p className="font-bold text-lg leading-tight text-white">
                  Sayrab<span className="text-cyan-400">.</span>
                </p>
                <p className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider">
                  {isFundraiser ? 'Fundraiser Portal' : user?.role === 'admin' ? 'Admin Portal' : 'Buyer Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {isFundraiser ? (
              <>
                <button
                  onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => { setActiveTab('campaigns'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'campaigns'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Megaphone size={18} /> My Campaigns
                </button>
                <button
                  onClick={() => { setActiveTab('new_campaign'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'new_campaign' || activeTab === 'fundraising'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Plus size={18} /> New Campaign
                </button>
                <button
                  onClick={() => { setActiveTab('fundraiser_orders'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'fundraiser_orders'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} /> Orders Received
                  </div>
                  {campaignOrders.length > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {campaignOrders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('payouts'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'payouts'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Wallet size={18} /> Payout Tracking
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('donor_donations'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'donor_donations'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Coins size={18} /> My Donations
                </button>
                <button
                  onClick={() => { setActiveTab('buyer_cart'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'buyer_cart'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} /> My Cart
                  </div>
                  {buyerCart.length > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {buyerCart.reduce((sum, item) => sum + (item.qty || 1), 0)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('buyer_tracking'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'buyer_tracking'
                      ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={18} /> Delivery Tracking
                  </div>
                  {buyerOrders.filter(o => getTrackingStepIndex(o) < 4).length > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {buyerOrders.filter(o => getTrackingStepIndex(o) < 4).length}
                    </span>
                  )}
                </button>
              </>
            )}
            <button
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Settings size={18} /> Account Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-cyan-500/20">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate text-white">{user?.fullName}</p>
              <p className="text-xs truncate text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-800/50 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden bg-slate-950">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase rounded-full tracking-wider mb-2 border border-cyan-500/20">
              <span>{isFundraiser ? '📢 Fundraiser Workspace' : '🛍️ Buyer Workspace'}</span>
            </div>
            <h1 className="text-3xl font-black text-white capitalize">
              {activeTab === 'new_campaign' || activeTab === 'fundraising' 
                ? 'Start a New Campaign' 
                : activeTab === 'fundraiser_orders'
                ? 'Merchandise Orders Received'
                : activeTab === 'payouts'
                ? 'Buyer Payout & Revenue Tracking'
                : activeTab === 'donor_donations'
                ? 'My Donations'
                : activeTab === 'buyer_cart'
                ? 'My Cart'
                : activeTab === 'buyer_tracking'
                ? 'Delivery Tracking'
                : activeTab.replace('_', ' ')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === 'new_campaign' || activeTab === 'fundraising'
                ? 'Create and submit your fundraising campaign with story, goal, and linked merchandise.'
                : activeTab === 'fundraiser_orders'
                ? 'Review buyer orders for your campaign merchandise, customer delivery details, ordered sizes/colors, and 50% revenue proceeds.'
                : activeTab === 'payouts'
                ? 'Track gross buyer payments, 50% campaign merchandise earnings, and automated payout settlements.'
                : activeTab === 'donor_donations'
                ? 'Track all your personal donations and impact receipts in one place.'
                : activeTab === 'buyer_cart'
                ? 'Review your dedicated cart items and complete your order seamlessly.'
                : activeTab === 'buyer_tracking'
                ? 'Track live courier dispatches, production stages, delivery status, and order milestones.'
                : `Welcome back, ${user?.fullName}. Here is your account snapshot.`}
            </p>
          </div>
        </div>

        {/* ------------------------- */}
        {/* OVERVIEW TAB (Fundraiser) */}
        {/* ------------------------- */}
        {activeTab === 'overview' && isFundraiser && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Raised</p>
                  <p className="text-lg font-black text-white mt-0.5">{formatCurrency(totalRaisedValue)}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Direct Donations</p>
                  <p className="text-lg font-black text-white mt-0.5">{formatCurrency(directDonationsValue)}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Merch Share (50%)</p>
                  <p className="text-lg font-black text-cyan-300 mt-0.5">{formatCurrency(merchRevenueValue)}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Products Sold</p>
                  <p className="text-lg font-black text-white mt-0.5">{productsSoldValue} units</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Megaphone size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Campaigns</p>
                  <p className="text-lg font-black text-white mt-0.5">{activeCampaignsValue}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Feed */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-cyan-400" /> Recent Activities
                </h3>
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No recent activity. Launch a campaign to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map(act => (
                      <div key={act.id} className="flex gap-4 border-l-2 border-slate-800 pl-4 py-1 relative">
                        <div className="absolute w-2 h-2 rounded-full bg-cyan-400 left-[-5px] top-3 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{act.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(act.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Running Campaigns Widget */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={18} className="text-cyan-400" /> Running Campaigns
                </h3>
                {campaigns.filter(c => c.lifecycleStatus === 'active').length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No active campaigns.</p>
                ) : (
                  <div className="space-y-4">
                    {campaigns.filter(c => c.lifecycleStatus === 'active').slice(0, 3).map(c => {
                      const percent = Math.min(100, Math.round((c.amountRaised / c.fundingGoal) * 100));
                      return (
                        <div key={c._id} className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-white truncate max-w-[150px]">{c.title}</span>
                            <span className="text-cyan-400 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
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
            <div className="flex border-b border-slate-800 gap-4">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setCampaignFilter(f)}
                  className={`pb-3 text-sm font-bold capitalize transition-all cursor-pointer border-b-2 ${
                    campaignFilter === f ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {f} Campaigns
                </button>
              ))}
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Megaphone size={48} className="text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No campaigns found</h3>
                <p className="text-slate-400 text-sm mt-1">No campaigns matched the current filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCampaigns.map(c => {
                  const percent = Math.min(100, Math.round((c.amountRaised / c.fundingGoal) * 100));
                  const currentWithdraw = withdrawals.find(w => (
                    (w.campaign?._id && String(w.campaign._id) === String(c._id)) ||
                    (w.campaign && String(w.campaign) === String(c._id)) ||
                    (w.campaignId && String(w.campaignId) === String(c._id))
                  ));

                  return (
                    <div key={c._id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold bg-slate-950 text-cyan-400 px-2.5 py-1 rounded-lg border border-slate-800 uppercase">
                              {c.category}
                            </span>
                            {c.isEmergency && (
                              <span className="text-[11px] font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-rose-500/30">
                                <Flame size={12} /> Emergency
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase border ${
                            c.lifecycleStatus === 'active' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {c.lifecycleStatus}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-lg line-clamp-1">{c.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{c.shortDescription}</p>

                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">Progress</span>
                            <span className="font-bold text-cyan-300">{percent}% ({formatCurrency(c.amountRaised || 0)})</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2.5 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                            <span>Goal: {formatCurrency(c.fundingGoal)}</span>
                            <span>{c.donorCount || 0} Donors</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <Link to={`/campaigns/${c.slug}`} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline">
                            View Public Page →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-200 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                          >
                            <Edit3 size={13} /> Edit Campaign
                          </button>
                        </div>

                        {currentWithdraw && currentWithdraw.status !== 'rejected' ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              currentWithdraw.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}>
                              Withdrawal: {currentWithdraw.status} ({formatCurrency(currentWithdraw.amount || 0)})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {currentWithdraw && currentWithdraw.status === 'rejected' && (
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-rose-500/20 text-rose-300 border-rose-500/30">
                                Rejected
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleWithdrawRequest(c)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-lg cursor-pointer shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                            >
                              <Coins size={14} /> Request Withdrawal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 my-8 shadow-2xl border border-slate-800 animate-scale-up text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-white">Request Campaign Withdrawal</h3>
                    <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">
                    Campaign: <strong className="text-white">{withdrawCampaign?.title}</strong><br />
                    Amount available: <strong className="text-cyan-400 font-black">{formatCurrency(withdrawCampaign?.amountRaised || 0)}</strong>
                  </p>

                  <form onSubmit={submitWithdrawalForm} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={withdrawForm.accountHolderName}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolderName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={withdrawForm.bankName}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                          placeholder="E.g., HBL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Number *</label>
                        <input
                          type="text"
                          required
                          value={withdrawForm.accountNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">IBAN *</label>
                      <input
                        type="text"
                        required
                        value={withdrawForm.iban}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, iban: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        placeholder="PK20HABB00..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Easypaisa (optional)</label>
                        <input
                          type="text"
                          value={withdrawForm.easypaisaNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, easypaisaNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                          placeholder="03*********"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Jazzcash (optional)</label>
                        <input
                          type="text"
                          value={withdrawForm.jazzcashNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, jazzcashNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                          placeholder="03*********"
                        />
                      </div>
                    </div>

                    {withdrawError && <p className="text-xs text-rose-400 font-semibold">{withdrawError}</p>}
                    {withdrawSuccess && <p className="text-xs text-cyan-300 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/30 font-semibold">{withdrawSuccess}</p>}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowWithdrawModal(false)}
                        className="flex-1 py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 cursor-pointer text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl cursor-pointer text-sm shadow-lg shadow-cyan-500/20 transition-all"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Campaign Modal */}
            {showEditModal && editingCampaign && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 my-8 shadow-2xl border border-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit3 size={20} className="text-cyan-400" /> Edit Campaign Details
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Modify campaign information, story, funding goals, or urgency status.</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                      <X size={20} />
                    </button>
                  </div>

                  {editError && <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs">{editError}</div>}
                  {editSuccess && <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold">{editSuccess}</div>}

                  <form onSubmit={handleSaveCampaignEdit} className="space-y-5">
                    {/* Emergency Toggle */}
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Flame size={18} className="text-rose-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-rose-200">Emergency / Urgent Status 🚨</p>
                          <p className="text-[11px] text-rose-300/80">Display with emergency banner and prioritize in urgent feeds</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.isEmergency)}
                          onChange={(e) => setEditForm({ ...editForm, isEmergency: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Campaign Title *</label>
                        <input
                          type="text"
                          required
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category *</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Funding Goal (PKR) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editForm.fundingGoal}
                          onChange={(e) => setEditForm({ ...editForm, fundingGoal: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Location *</label>
                        <input
                          type="text"
                          required
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Schedule & Duration */}
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 uppercase">Duration & Schedule (7–90 Days)</span>
                        {(() => {
                          const days = calculateDurationDays(editForm.startDate, editForm.endDate);
                          if (days === null) return null;
                          return days >= 7 && days <= 90 ? (
                            <span className="font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded">
                              ✓ {days} Days Duration
                            </span>
                          ) : (
                            <span className="font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded">
                              ⚠ {days} Days (Must be 7–90)
                            </span>
                          );
                        })()}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Starting Date *</label>
                          <input
                            type="date"
                            required
                            value={editForm.startDate}
                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Finish Date *</label>
                          <input
                            type="date"
                            required
                            value={editForm.endDate}
                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Short Summary *</label>
                      <textarea
                        required
                        rows={2}
                        maxLength={300}
                        value={editForm.shortDescription}
                        onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Story Background</label>
                        <textarea
                          rows={2}
                          value={editForm.storyBackground}
                          onChange={(e) => setEditForm({ ...editForm, storyBackground: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-xs resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Story Situation</label>
                        <textarea
                          rows={2}
                          value={editForm.storyCurrentSituation}
                          onChange={(e) => setEditForm({ ...editForm, storyCurrentSituation: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-xs resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Purpose of Funds *</label>
                        <input
                          type="text"
                          required
                          value={editForm.purposeOfFunds}
                          onChange={(e) => setEditForm({ ...editForm, purposeOfFunds: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Keywords</label>
                        <input
                          type="text"
                          value={editForm.keywords}
                          onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                          placeholder="comma separated"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cover Image URL (optional)</label>
                      <input
                        type="url"
                        value={editForm.thumbnail}
                        onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 cursor-pointer text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingEdit}
                        className="flex-[2] py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl cursor-pointer text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        {isSubmittingEdit ? 'Saving Changes...' : 'Save Campaign Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* NEW CAMPAIGN TAB (In-portal) */}
        {/* ------------------------- */}
        {(activeTab === 'new_campaign' || activeTab === 'fundraising') && (
          <div className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl max-w-4xl mx-auto animate-fade-in text-slate-100">
            {/* Wizard Step Progress Indicator */}
            {campaignStep !== 3 && (
              <div className="mb-8 bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    campaignStep === 1 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {campaignStep > 1 ? '✓' : '1'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Step 1: Campaign Details</p>
                    <p className="text-[11px] text-slate-400">Story, goals & duration</p>
                  </div>
                </div>
                <div className="hidden sm:block text-slate-700">→</div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    campaignStep === 2 ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-4 ring-cyan-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Step 2: Linked Merchandise <span className="text-cyan-400 font-extrabold">(Required)</span></p>
                    <p className="text-[11px] text-slate-400">Campaign is created only after merchandise is set</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS VIEW */}
            {campaignStep === 3 && createdCampaignInfo && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-white flex items-start gap-4">
                  <CheckCircle size={32} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-black text-white">Campaign & Merchandise Created Successfully!</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Your campaign <strong>"{createdCampaignInfo.title}"</strong> and its linked merchandise have been safely created and submitted for admin verification.
                    </p>
                  </div>
                </div>

                {createdMerchInfo && (
                  <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShoppingBag size={18} className="text-cyan-400" /> Linked Campaign Merchandise
                    </h4>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={createdMerchInfo.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200'}
                          alt={createdMerchInfo.name}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{createdMerchInfo.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            PKR {createdMerchInfo.price?.toLocaleString()} · Stock: {createdMerchInfo.stock} units · Category: {createdMerchInfo.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-full shrink-0">
                        Linked Active
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { resetCampaignWizard(); setActiveTab('campaigns'); }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-bold rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20 text-center transition-all"
                  >
                    View in My Campaigns →
                  </button>
                  <button
                    type="button"
                    onClick={resetCampaignWizard}
                    className="flex-1 py-3 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-800 cursor-pointer text-center transition-colors"
                  >
                    Create Another Campaign
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: CAMPAIGN DETAILS FORM */}
            {campaignStep === 1 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Launch New Campaign</h3>
                    <p className="text-slate-400 text-xs mt-1">Tell your story, define goals, and reach supportive donors directly from your portal.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={loadDraftCampaign}
                      className="px-3.5 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Load Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleAISimulation}
                      disabled={aiGenerating}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
                    >
                      <Sparkles size={14} className={aiGenerating ? 'animate-spin' : ''} />
                      {aiGenerating ? 'AI Writing...' : 'Write with AI'}
                    </button>
                  </div>
                </div>

                {aiGenerating && (
                  <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-3 text-cyan-300 animate-pulse text-sm">
                    <Sparkles size={20} className="animate-spin text-cyan-400" />
                    <span>{aiStep}</span>
                  </div>
                )}

                {campaignError && (
                  <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm">
                    {campaignError}
                  </div>
                )}
                {campaignSuccess && (
                  <div className="mb-6 p-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-sm font-bold">
                    {campaignSuccess}
                  </div>
                )}

                <form onSubmit={handleNextToMerchandise} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Campaign Title *</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        placeholder="E.g., Flood Relief Camps in Sindh"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category *</label>
                      <select
                        value={campaignForm.category}
                        onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Funding Goal (PKR) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={campaignForm.fundingGoal}
                        onChange={(e) => setCampaignForm({ ...campaignForm, fundingGoal: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        placeholder="E.g., 500000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Location *</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.location}
                        onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        placeholder="E.g., Karachi, Pakistan"
                      />
                    </div>
                  </div>

                  {/* Campaign Schedule & Duration Section */}
                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <label className="block text-xs font-bold text-white uppercase flex items-center gap-1.5">
                          <Calendar size={15} className="text-cyan-400" /> Campaign Schedule & Duration *
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Set the Starting Date and Finish Date for your campaign (required duration: 7 to 90 days).
                        </p>
                      </div>
                      {/* Live duration calculation badge */}
                      {(() => {
                        const days = calculateDurationDays(campaignForm.startDate, campaignForm.endDate);
                        if (days === null) return null;
                        if (days >= 7 && days <= 90) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              <CheckCircle size={14} /> Total Duration: {days} Days (Valid)
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ⚠ Duration: {days} Days (Must be 7–90 days)
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Date *</label>
                        <input
                          type="date"
                          required
                          value={campaignForm.startDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Finish Date *</label>
                        <input
                          type="date"
                          required
                          min={campaignForm.startDate || new Date().toISOString().split('T')[0]}
                          value={campaignForm.endDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Quick Duration Shortcuts */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">Quick Duration Presets:</span>
                      {[
                        { label: '+15 Days', days: 15 },
                        { label: '+30 Days (Recommended)', days: 30 },
                        { label: '+45 Days', days: 45 },
                        { label: '+60 Days', days: 60 },
                        { label: '+90 Days (Max)', days: 90 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => setQuickDurationDays(preset.days)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Short Summary * (Max 300 chars)</label>
                    <textarea
                      required
                      rows={2}
                      maxLength={300}
                      value={campaignForm.shortDescription}
                      onChange={(e) => setCampaignForm({ ...campaignForm, shortDescription: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none text-sm"
                      placeholder="Provide a brief, compelling summary for the campaign lists page..."
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2">Campaign Detailed Story</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Background *</label>
                        <textarea
                          required
                          rows={3}
                          value={campaignForm.storyBackground}
                          onChange={(e) => setCampaignForm({ ...campaignForm, storyBackground: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm resize-none"
                          placeholder="Provide context and history of the issue..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Current Situation *</label>
                        <textarea
                          required
                          rows={3}
                          value={campaignForm.storyCurrentSituation}
                          onChange={(e) => setCampaignForm({ ...campaignForm, storyCurrentSituation: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm resize-none"
                          placeholder="What is the urgent present state?..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Funding Need Details *</label>
                        <textarea
                          required
                          rows={3}
                          value={campaignForm.storyFundingNeed}
                          onChange={(e) => setCampaignForm({ ...campaignForm, storyFundingNeed: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm resize-none"
                          placeholder="How will the money be spent?..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Expected Impact *</label>
                        <textarea
                          required
                          rows={3}
                          value={campaignForm.storyExpectedImpact}
                          onChange={(e) => setCampaignForm({ ...campaignForm, storyExpectedImpact: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm resize-none"
                          placeholder="What lasting difference will donors make?..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Purpose of Funds *</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.purposeOfFunds}
                        onChange={(e) => setCampaignForm({ ...campaignForm, purposeOfFunds: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="E.g., Medical purchase (50%), Logistics (30%), Installation (20%)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Keywords * (Comma separated)</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.keywords}
                        onChange={(e) => setCampaignForm({ ...campaignForm, keywords: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="medical, surgery, health"
                      />
                    </div>
                  </div>

                  {/* Emergency / Urgent Toggle Option */}
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
                        <Flame size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-200 uppercase">Mark as Emergency / Urgent Campaign 🚨</p>
                        <p className="text-[11px] text-rose-300/80 mt-0.5">
                          Emergency campaigns receive high priority on the homepage, urgent badge styling, and faster attention.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={Boolean(campaignForm.isEmergency)}
                        onChange={(e) => setCampaignForm({ ...campaignForm, isEmergency: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Cover Image URL <span className="text-slate-500 font-normal lowercase">(optional - defaults to verified cover image)</span>
                    </label>
                    <input
                      type="url"
                      value={campaignForm.thumbnail}
                      onChange={(e) => setCampaignForm({ ...campaignForm, thumbnail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      placeholder="E.g., https://picsum.photos/600/400"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="flex-1 py-3 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-sm"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Next: Add Linked Merchandise (Required)</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: LINKED MERCHANDISE FORM (MANDATORY) */}
            {campaignStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Add Linked Campaign Merchandise</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Every campaign must have at least one merchandise product linked to it. If merchandise is not provided, the campaign will not be created.
                  </p>
                </div>

                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-start gap-3">
                  <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white">Important:</strong> 50% of revenue generated from your linked merchandise goes directly to fund this campaign goal.
                  </div>
                </div>

                {merchError && (
                  <div className="p-4 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm">
                    {merchError}
                  </div>
                )}

                <form onSubmit={handleFinalCampaignWithMerch} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Merchandise Name *</label>
                      <input
                        type="text"
                        required
                        value={linkedMerchForm.name}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        placeholder="E.g., Hope & Support Organic T-Shirt"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Merchandise Category *</label>
                      <select
                        value={linkedMerchForm.category}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      >
                        <option value="Apparel">Apparel (T-Shirts, Hoodies, Caps)</option>
                        <option value="Drinkware">Drinkware (Mugs, Bottles)</option>
                        <option value="Accessories">Accessories (Tote Bags, Wristbands)</option>
                        <option value="Stationery">Stationery (Notebooks, Stickers)</option>
                        <option value="Posters">Posters & Art Prints</option>
                        <option value="Other">Other Merchandise</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Price in PKR *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={linkedMerchForm.price}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="E.g., 1500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Available Stock Units *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={linkedMerchForm.stock}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, stock: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="E.g., 100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Available Sizes (For Apparel / Wearables)</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleMerchSizeToggle(sz)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            linkedMerchForm.sizes.includes(sz)
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Available Colors</label>
                      <input
                        type="text"
                        value={linkedMerchForm.colors}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, colors: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="E.g., Black, White, Navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Mockup Image URL <span className="text-slate-500 font-normal lowercase">(optional - defaults automatically)</span>
                      </label>
                      <input
                        type="url"
                        value={linkedMerchForm.image}
                        onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, image: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="Optional (e.g. https://... or leave empty for auto mockup)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Merchandise Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={linkedMerchForm.description}
                      onChange={(e) => setLinkedMerchForm({ ...linkedMerchForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm"
                      placeholder="Describe the merchandise item, material quality, design purpose, and cause connection..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCampaignStep(1)}
                      className="py-3 px-6 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-sm"
                    >
                      ← Back to Campaign Details
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCampaign}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmittingCampaign ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting Campaign & Merchandise...</span>
                        </>
                      ) : (
                        <span>Submit Campaign & Linked Merchandise</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        {/* ------------------------------- */}
        {/* FUNDRAISER ORDERS RECEIVED TAB   */}
        {/* ------------------------------- */}
        {activeTab === 'fundraiser_orders' && isFundraiser && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3.5 hover:border-cyan-500/40 transition-all">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Package size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Orders Received</p>
                  <p className="text-2xl font-black text-white mt-0.5">{campaignOrders.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Linked campaign sales</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3.5 hover:border-cyan-500/40 transition-all">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Units Ordered</p>
                  <p className="text-2xl font-black text-white mt-0.5">{productsSoldValue}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Total merchandise pieces</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3.5 hover:border-emerald-500/40 transition-all">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Coins size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Your 50% Merch Share</p>
                  <p className="text-2xl font-black text-emerald-400 mt-0.5">+{formatCurrency(merchRevenueValue)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Credited to campaign goal</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3.5 hover:border-purple-500/40 transition-all">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Dispatches</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {campaignOrders.filter(o => (o.orderStatus || o.status) !== 'delivered').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">In production / in transit</p>
                </div>
              </div>
            </div>

            {/* Main Orders Table & Management */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="text-cyan-400" size={20} /> Buyer Merchandise Orders
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Complete breakdown of buyer orders, customer shipping contacts, selected apparel sizes/colors, and 50% earnings for your cause.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs font-bold text-slate-400">
                    Showing <strong className="text-white">{filteredReceivedOrders.length}</strong> of {campaignOrders.length} orders
                  </span>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                {/* Search */}
                <div className="sm:col-span-6 relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by buyer name, phone, order #, product name, size, color..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                {/* Campaign Select */}
                <div className="sm:col-span-3">
                  <select
                    value={orderFilterCampaign}
                    onChange={(e) => setOrderFilterCampaign(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="placed">Order Placed</option>
                    <option value="in_production">In Production</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div className="py-16 flex flex-col justify-center items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
                  <p className="text-xs text-slate-400 font-semibold">Loading received merchandise orders...</p>
                </div>
              ) : filteredReceivedOrders.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                    <Package size={28} />
                  </div>
                  <h4 className="text-base font-bold text-white">No Merchandise Orders Found</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {campaignOrders.length === 0
                      ? 'When buyers purchase merchandise linked to your campaigns, their order details, shipping address, sizes, colors, and 50% revenue proceeds will appear here.'
                      : 'No orders match your active search or status filters.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReceivedOrders.map((order) => {
                    const orderStatus = order.orderStatus || order.status || 'placed';
                    const isPaid = order.paymentStatus === 'paid';
                    const buyerName = order.shippingAddress?.fullName || order.customerId?.fullName || 'Buyer';
                    const buyerPhone = order.shippingAddress?.phone || order.customerId?.phone || 'N/A';
                    const buyerAddress = [
                      order.shippingAddress?.address || order.shippingAddress?.line1,
                      order.shippingAddress?.city,
                      order.shippingAddress?.state,
                      order.shippingAddress?.country,
                    ].filter(Boolean).join(', ') || 'N/A';
                    const campaignTitle = order.campaignId?.title || 'Linked Campaign';
                    const campaignSplit = order.revenueSplit?.organization || (order.total * 0.5);

                    return (
                      <div
                        key={order._id}
                        className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all space-y-4 shadow-lg"
                      >
                        {/* Order Card Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black text-white">
                                  #{order._id?.slice(-8).toUpperCase()}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                                  orderStatus === 'delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : orderStatus === 'shipped'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : orderStatus === 'in_production' || orderStatus === 'production'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                }`}>
                                  {orderStatus.replace('_', ' ')}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  isPaid
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                                }`}>
                                  {isPaid ? 'Payment Received' : 'Payment Pending'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Placed on {formatDate(order.createdAt)} • Linked Campaign: <strong className="text-cyan-300">{campaignTitle}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <FileText size={14} /> View Order Slip
                            </button>
                          </div>
                        </div>

                        {/* Order Card Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          {/* Left: Buyer & Shipping Details */}
                          <div className="lg:col-span-5 bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 space-y-2.5 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Buyer & Delivery Information
                            </span>
                            <div className="flex items-center gap-2 text-slate-200">
                              <User size={14} className="text-cyan-400 shrink-0" />
                              <span className="font-bold text-white">{buyerName}</span>
                              {order.customerId?.email && (
                                <span className="text-slate-400 truncate">({order.customerId.email})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Coins size={14} className="text-cyan-400 shrink-0" />
                              <span>Phone: <strong className="text-white">{buyerPhone}</strong></span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-300">
                              <MapPin size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">Address: <strong className="text-white">{buyerAddress}</strong></span>
                            </div>
                          </div>

                          {/* Right: Ordered Products Breakdown */}
                          <div className="lg:col-span-7 space-y-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Merchandise Items Ordered ({order.products?.length || 0})
                            </span>
                            <div className="space-y-2">
                              {order.products?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 gap-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                                      <img
                                        src={item.image || item.productId?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-white text-xs line-clamp-1">{item.name}</h5>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {item.size && (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                                            Size: {item.size}
                                          </span>
                                        )}
                                        {item.color && (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                                            <span
                                              className="w-2 h-2 rounded-full inline-block border border-white/30"
                                              style={{ backgroundColor: item.color?.startsWith('#') ? item.color : '#06b6d4' }}
                                            />
                                            {item.color}
                                          </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400">
                                          Qty: {item.quantity || 1}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-white block">
                                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                      +{formatCurrency(((item.price || 0) * (item.quantity || 1)) * 0.5)} to cause
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Order Financial Footnote */}
                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-4 text-slate-400 flex-wrap">
                            <span>Gross Buyer Total: <strong className="text-white">{formatCurrency(order.total || 0)}</strong></span>
                            <span>•</span>
                            <span>Payment: <strong className="text-white">{order.paymentMethod || 'Credit / Debit Card'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Campaign 50% Credit:</span>
                            <span className="text-sm font-black text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                              +{formatCurrency(campaignSplit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Details Modal */}
            {selectedOrderDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 shadow-2xl border border-slate-800 animate-scale-up text-white space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
                        <Package size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Order #{selectedOrderDetails._id?.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Placed on {formatDate(selectedOrderDetails.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Campaign & Delivery Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Linked Campaign
                      </span>
                      <p className="font-bold text-white text-sm">
                        {selectedOrderDetails.campaignId?.title || 'Verified Charitable Campaign'}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        50% of this purchase is directly funding this campaign goal.
                      </p>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Buyer & Shipping Contact
                      </span>
                      <p className="font-bold text-white">
                        {selectedOrderDetails.shippingAddress?.fullName || selectedOrderDetails.customerId?.fullName || 'Buyer'}
                      </p>
                      <p className="text-slate-300">
                        Phone: {selectedOrderDetails.shippingAddress?.phone || selectedOrderDetails.customerId?.phone || 'N/A'}
                      </p>
                      <p className="text-slate-400">
                        Address: {[
                          selectedOrderDetails.shippingAddress?.address || selectedOrderDetails.shippingAddress?.line1,
                          selectedOrderDetails.shippingAddress?.city,
                          selectedOrderDetails.shippingAddress?.state,
                          selectedOrderDetails.shippingAddress?.country
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Ordered Merchandise Specifications
                    </span>
                    <div className="space-y-2">
                      {selectedOrderDetails.products?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                              <img
                                src={item.image || item.productId?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-sm">{item.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[11px] border border-slate-700">
                                  Size: {item.size || 'M'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[11px] border border-slate-700">
                                  Color: {item.color || 'Standard'}
                                </span>
                                <span className="text-slate-400 font-semibold">
                                  Quantity: {item.quantity || 1}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-white text-sm block">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-bold">
                              ({formatCurrency(item.price || 0)} each)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Breakdown Slip */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Financial Revenue Split Breakdown
                    </span>
                    <div className="flex justify-between text-slate-300">
                      <span>Gross Buyer Payment:</span>
                      <span className="font-bold text-white">{formatCurrency(selectedOrderDetails.total || 0)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800/80">
                      <span>Fundraiser Campaign Share (50%):</span>
                      <span>+{formatCurrency(selectedOrderDetails.revenueSplit?.organization || ((selectedOrderDetails.total || 0) * 0.5))}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Manufacturer Production Share (45%):</span>
                      <span>{formatCurrency(selectedOrderDetails.revenueSplit?.manufacturer || ((selectedOrderDetails.total || 0) * 0.45))}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sayrab Platform Infrastructure (5%):</span>
                      <span>{formatCurrency(selectedOrderDetails.revenueSplit?.platform || ((selectedOrderDetails.total || 0) * 0.05))}</span>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetails(null)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      Close Slip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* PAYOUT TRACKING TAB       */}
        {/* ------------------------- */}
        {activeTab === 'payouts' && isFundraiser && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3 hover:border-slate-700 transition-all">
                <div className="p-3 bg-slate-800 text-cyan-400 rounded-xl border border-slate-700">
                  <CreditCard size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gross Buyer Payments</p>
                  <p className="text-xl font-black text-white mt-0.5">{formatCurrency(totalBuyerGross)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{campaignOrders.length} merchandise orders</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3 hover:border-cyan-500/40 transition-all">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
                  <Wallet size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Your Campaign Split (50%)</p>
                  <p className="text-xl font-black text-cyan-400 mt-0.5">+{formatCurrency(totalMerchSharePaid)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Directly credited to campaign funds</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3 hover:border-slate-700 transition-all">
                <div className="p-3 bg-slate-800 text-cyan-400 rounded-xl border border-slate-700">
                  <Coins size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Available for Payout</p>
                  <p className="text-xl font-black text-white mt-0.5">{formatCurrency(availableBalance)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ready for bank disbursement</p>
                </div>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3 hover:border-slate-700 transition-all">
                <div className="p-3 bg-slate-800 text-cyan-400 rounded-xl border border-slate-700">
                  <Receipt size={22} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Withdrawn</p>
                  <p className="text-xl font-black text-white mt-0.5">{formatCurrency(totalWithdrawnApproved)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{withdrawals.filter(w => w.status === 'pending').length} requests pending review</p>
                </div>
              </div>
            </div>

            {/* Main Payouts Container */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Buyer Payments & Payout Ledger</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Every product purchased by buyers generates an automatic 50% revenue split credited to your active campaign fund.
                  </p>
                </div>
                {campaigns.some(c => c.amountRaised > 0) && (
                  <button
                    onClick={() => {
                      const firstEligible = campaigns.find(c => c.amountRaised > 0);
                      if (firstEligible) handleWithdrawRequest(firstEligible);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Wallet size={16} /> Request Payout Withdrawal
                  </button>
                )}
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                {/* Search */}
                <div className="sm:col-span-6 relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by buyer name, city, transaction ID, or campaign..."
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                {/* Campaign Select */}
                <div className="sm:col-span-3">
                  <select
                    value={payoutCampaignFilter}
                    onChange={(e) => setPayoutCampaignFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="sm:col-span-3 flex rounded-xl border border-slate-700 p-1 bg-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPayoutStatusFilter('all')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      payoutStatusFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutStatusFilter('settled')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      payoutStatusFilter === 'settled' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Settled
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutStatusFilter('pending')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      payoutStatusFilter === 'pending' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              {ordersLoading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : filteredPayoutOrders.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <Receipt size={44} className="text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-300">No buyer payouts recorded</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                    When customers purchase merchandise or support your campaigns, real-time transaction records and your 50% payout allocations will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                        <th className="py-3 px-3">Transaction / Date</th>
                        <th className="py-3 px-3">Buyer Details</th>
                        <th className="py-3 px-3">Merchandise Item</th>
                        <th className="py-3 px-3">Campaign</th>
                        <th className="py-3 px-3">Buyer Paid (Gross)</th>
                        <th className="py-3 px-3">Campaign Split (50%)</th>
                        <th className="py-3 px-3">Settlement Status</th>
                        <th className="py-3 px-3 text-right">Breakdown</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredPayoutOrders.map((order) => {
                        const orgSplit = order.revenueSplit?.organization || (order.total * 0.5);
                        const isSettled = order.paymentStatus === 'paid';

                        return (
                          <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-3">
                              <span className="font-mono text-xs font-bold text-white block">
                                #{order._id.substring(0, 10)}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5 block">
                                {formatDate(order.createdAt)}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-white">
                                {order.shippingAddress?.fullName || order.customerId?.fullName || 'Anonymous Buyer'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {order.shippingAddress?.city ? `${order.shippingAddress.city} · ` : ''}
                                {order.shippingAddress?.phone || order.customerId?.email || 'Direct Checkout'}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 space-y-1">
                              {order.products?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-200">{item.name}</span>
                                  <span className="text-slate-400">×{item.quantity}</span>
                                  {item.size && (
                                    <span className="bg-slate-800 text-cyan-400 px-1 py-0.2 rounded text-[10px] font-bold border border-slate-700">
                                      {item.size}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </td>
                            <td className="py-3.5 px-3 font-medium text-slate-300 max-w-[160px] truncate">
                              {order.campaignId?.title || 'Linked Campaign'}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-white">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                +{formatCurrency(orgSplit)}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              {isSettled ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <Check size={12} /> Settled & Credited
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Clock size={12} /> Pending Verification
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-700"
                              >
                                <FileText size={12} /> Breakdown
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Split Breakdown Modal */}
            {selectedReceiptOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-scale-up space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="text-cyan-400" size={20} />
                      <h4 className="text-base font-bold text-white">Payout Breakdown Slip</h4>
                    </div>
                    <button
                      onClick={() => setSelectedReceiptOrder(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl space-y-1.5 text-xs border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-mono font-bold text-cyan-400">#{selectedReceiptOrder._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date & Time:</span>
                      <span className="font-semibold text-slate-200">{formatDate(selectedReceiptOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Buyer:</span>
                      <span className="font-semibold text-slate-200">
                        {selectedReceiptOrder.shippingAddress?.fullName || selectedReceiptOrder.customerId?.fullName || 'Buyer'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="font-bold text-emerald-400 uppercase">{selectedReceiptOrder.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Revenue Split Breakdown Visual */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-white border-b border-slate-800 pb-2">
                      <span>Gross Buyer Paid</span>
                      <span className="text-cyan-400">{formatCurrency(selectedReceiptOrder.total)}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-500/30 rounded-xl">
                        <div>
                          <p className="font-bold text-cyan-300">50% Campaign Fund (Your Payout)</p>
                          <p className="text-[10px] text-slate-400">Directly credited to campaign goal</p>
                        </div>
                        <span className="font-black text-cyan-400 text-sm">
                          +{formatCurrency(selectedReceiptOrder.revenueSplit?.organization || (selectedReceiptOrder.total * 0.5))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <div>
                          <p className="font-semibold text-slate-200">45% Production & Manufacturing</p>
                          <p className="text-[10px] text-slate-400">Material, printing & verified fulfillment</p>
                        </div>
                        <span className="font-bold text-slate-300 text-xs">
                          {formatCurrency(selectedReceiptOrder.revenueSplit?.manufacturer || (selectedReceiptOrder.total * 0.45))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <div>
                          <p className="font-semibold text-slate-200">5% Platform & Banking Gateway</p>
                          <p className="text-[10px] text-slate-400">Secure transactions & payment processing</p>
                        </div>
                        <span className="font-bold text-slate-300 text-xs">
                          {formatCurrency(selectedReceiptOrder.revenueSplit?.platform || (selectedReceiptOrder.total * 0.05))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReceiptOrder(null)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
                  >
                    Close Breakdown Slip
                  </button>
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
            <h3 className="text-xl font-bold text-white">Donation History</h3>
            {donations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl">
                <Coins size={48} className="text-cyan-500/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-200">No donations yet</h3>
                <p className="text-slate-400 text-sm mt-1">Support an active campaign to see your contribution record listed here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.map((d) => (
                  <div
                    key={d._id}
                    className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-wrap justify-between items-center gap-4 hover:border-cyan-500/40 hover:shadow-xl transition-all"
                  >
                    <div>
                      <Link
                        to={`/campaigns/${d.campaign?.slug}`}
                        className="font-bold text-white hover:text-cyan-400 hover:underline text-base"
                      >
                        {d.campaign?.title}
                      </Link>
                      <p className="text-xs text-slate-400 font-medium mt-1">Donated on {formatDate(d.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-cyan-400 text-xl">{formatCurrency(d.amount)}</p>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-bold mt-1 inline-block">
                        Receipt: {d.receiptNumber || d._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* ------------------------- */}
        {/* BUYER SHOPPING CART TAB   */}
        {/* ------------------------- */}
        {activeTab === 'buyer_cart' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Shopping Cart & Checkout</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Review your dedicated cart items and complete your order seamlessly.
                </p>
              </div>
            </div>

            {checkoutSuccess ? (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center max-w-xl mx-auto shadow-2xl space-y-4 animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-2xl font-black text-white">Order Placed Successfully!</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Thank you for your order. Order <strong className="text-cyan-400">#{checkoutSuccess._id?.slice(-8).toUpperCase()}</strong> has been recorded and 50% of the proceeds have been allocated to the campaign.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrackingOrder(checkoutSuccess);
                      setCheckoutSuccess(null);
                      setActiveTab('buyer_tracking');
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                  >
                    <Truck size={15} /> Track Delivery Now
                  </button>
                </div>
              </div>
            ) : buyerCart.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto shadow-xl">
                <ShoppingBag size={54} className="text-cyan-500/40 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white">Your Cart is Empty</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  You don't have any items in your cart.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
                      <span>Items in Cart ({buyerCart.reduce((sum, item) => sum + (item.qty || 1), 0)})</span>
                      <button
                        type="button"
                        onClick={() => updateBuyerCart([])}
                        className="text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                      >
                        Clear Cart
                      </button>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {buyerCart.map((item) => (
                        <div key={item._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-800 bg-slate-950 flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-white text-sm">{item.name}</h4>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                {formatCurrency(item.price)} each
                              </p>
                              {item.selectedSize && (
                                <span className="text-[10px] text-cyan-400 font-semibold">Size: {item.selectedSize}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                            <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item._id, -1)}
                                className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-white">{item.qty || 1}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item._id, 1)}
                                className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="font-black text-sm text-white block">
                                {formatCurrency(item.price * (item.qty || 1))}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(item._id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout Summary & Delivery Form */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <h3 className="font-black text-base text-white border-b border-slate-800 pb-3 mb-4">
                      Order Summary
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-white">{formatCurrency(cartTotal(buyerCart))}</span>
                      </div>
                      <div className="flex justify-between text-cyan-300 font-semibold bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30">
                        <span>Direct Charity Impact (50%):</span>
                        <span className="font-extrabold">{formatCurrency(cartTotal(buyerCart) * 0.5)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Estimated Shipping:</span>
                        <span className="font-bold text-emerald-400">FREE</span>
                      </div>
                      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-black text-white">
                        <span>Total Payable:</span>
                        <span className="text-lg text-cyan-400">{formatCurrency(cartTotal(buyerCart))}</span>
                      </div>
                    </div>

                    <form onSubmit={handleBuyerCheckout} className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                        Delivery Information
                      </h4>

                      {checkoutError && (
                        <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl">
                          {checkoutError}
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.fullName}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="03001234567"
                          value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Delivery Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="Street address, House #, Area"
                          value={checkoutForm.line1}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, line1: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={checkoutForm.city}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Country</label>
                          <input
                            type="text"
                            disabled
                            value="Pakistan"
                            className="w-full px-3 py-2 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={checkoutSubmitting}
                        className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {checkoutSubmitting ? 'Processing Order...' : 'Place Order & Pay'}
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* BUYER DELIVERY TRACKING   */}
        {/* ------------------------- */}
        {activeTab === 'buyer_tracking' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Quick Lookup */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Truck className="text-cyan-400" size={22} /> Delivery & Shipment Tracking
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Track live production stages, courier dispatches, tracking codes, and delivery milestones.
                  </p>
                </div>

                {/* Manual Order ID Lookup */}
                <form onSubmit={handleManualTrackingLookup} className="flex gap-2 items-center w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Lookup Order ID..."
                      value={lookupOrderId}
                      onChange={(e) => setLookupOrderId(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={lookupLoading || !lookupOrderId.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/25 disabled:opacity-50 shrink-0"
                  >
                    {lookupLoading ? 'Finding...' : 'Track'}
                  </button>
                </form>
              </div>

              {lookupError && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl">
                  {lookupError}
                </div>
              )}

              {/* Filters and search in my orders */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackingFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trackingFilter === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    All Shipments ({buyerOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trackingFilter === 'active'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    In Progress ({buyerOrders.filter((o) => getTrackingStepIndex(o) < 4).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingFilter('delivered')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trackingFilter === 'delivered'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Delivered ({buyerOrders.filter((o) => getTrackingStepIndex(o) === 4).length})
                  </button>
                </div>

                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Filter by title, city, ID..."
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Selected Order Modal / View */}
            {selectedTrackingOrder && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 animate-scale-up">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Live Tracking Details</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedTrackingOrder._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-0.5 rounded-md cursor-pointer transition-colors border border-slate-700"
                        title="Copy Order ID"
                      >
                        #{selectedTrackingOrder._id?.slice(-8).toUpperCase()}
                        <Copy size={11} />
                      </button>
                      {copiedCode === selectedTrackingOrder._id && (
                        <span className="text-[10px] text-cyan-400 font-bold">Copied!</span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {selectedTrackingOrder.campaignId?.title || 'Charity Campaign Order'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Placed on {formatDate(selectedTrackingOrder.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTrackingOrder(null)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto cursor-pointer border border-slate-700"
                  >
                    Close Tracking View ✕
                  </button>
                </div>

                {/* 5-Step Stepper Progress Bar */}
                <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                      Fulfillment & Delivery Progress
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                      getTrackingStepIndex(selectedTrackingOrder) === 4
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {trackingSteps[getTrackingStepIndex(selectedTrackingOrder)].label}
                    </span>
                  </div>

                  {/* Stepper Line and Circles */}
                  <div className="relative">
                    <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-800 -z-0">
                      <div
                        className="h-1 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                        style={{
                          width: `${(getTrackingStepIndex(selectedTrackingOrder) / 4) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {trackingSteps.map((step, idx) => {
                        const isDone = idx <= getTrackingStepIndex(selectedTrackingOrder);

                        return (
                          <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                isDone
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/20'
                                  : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                              }`}
                            >
                              {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                            </div>
                            <div>
                              <p className={`text-xs font-black ${isDone ? 'text-white' : 'text-slate-500'}`}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Logistics, Address, and Items Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Courier & Dispatch Info */}
                  <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Truck size={16} className="text-cyan-400" /> Courier & Logistics Info
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Shipping Courier:</span>
                        <span className="font-bold text-white">
                          {selectedTrackingOrder.carrier || 'TCS Express Logistics'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Tracking Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                            {selectedTrackingOrder.trackingNumber || `TCS-${selectedTrackingOrder._id?.slice(-8).toUpperCase()}`}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCode(
                                selectedTrackingOrder.trackingNumber || `TCS-${selectedTrackingOrder._id?.slice(-8).toUpperCase()}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Copy tracking number"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimated Delivery:</span>
                        <span className="font-bold text-cyan-400">
                          {selectedTrackingOrder.estimatedDelivery
                            ? formatDate(selectedTrackingOrder.estimatedDelivery)
                            : formatDate(new Date(new Date(selectedTrackingOrder.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Payment Status:</span>
                        <span className="font-bold uppercase text-emerald-400">
                          {selectedTrackingOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Destination Address */}
                  <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                      <MapPin size={16} className="text-cyan-400" /> Delivery Address
                    </h4>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p className="font-bold text-white text-sm">
                        {selectedTrackingOrder.shippingAddress?.fullName || user?.fullName || 'Valued Customer'}
                      </p>
                      <p className="text-slate-400">
                        {selectedTrackingOrder.shippingAddress?.line1 || 'Standard Postal Delivery'}
                      </p>
                      <p className="text-slate-400">
                        {selectedTrackingOrder.shippingAddress?.city || 'Lahore'}, {selectedTrackingOrder.shippingAddress?.state || 'Punjab'}, {selectedTrackingOrder.shippingAddress?.country || 'Pakistan'}
                      </p>
                      <p className="text-slate-500 text-[11px] pt-1 font-medium">
                        Contact Phone: {selectedTrackingOrder.shippingAddress?.phone || user?.phone || 'On file'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Merchandise in this Order ({selectedTrackingOrder.products?.length || 0})
                  </h4>

                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                    {selectedTrackingOrder.products?.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80'}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{item.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>• Size: {item.size}</span>}
                              {item.color && <span>• Color: {item.color}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-xs text-white block">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                            50% Cause Impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-slate-400">Total Order Value:</span>
                    <span className="font-black text-cyan-400 text-sm">
                      {formatCurrency(selectedTrackingOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            {buyerOrdersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : filteredBuyerOrders.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto shadow-xl space-y-4">
                <Truck size={54} className="text-cyan-500/40 mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white">No Delivery Shipments Found</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {buyerOrders.length === 0
                      ? 'You haven’t placed any orders yet.'
                      : 'No orders match your current search criteria.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBuyerOrders.map((order) => {
                  const stepIdx = getTrackingStepIndex(order);
                  const isDelivered = stepIdx === 4;

                  return (
                    <div
                      key={order._id}
                      className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-cyan-500/40 p-5 shadow-xl hover:shadow-cyan-500/10 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                            {isDelivered ? <PackageCheck size={20} /> : <Truck size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-white">
                                #{order._id?.slice(-8).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-400">• {formatDate(order.createdAt)}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-300 truncate max-w-xs mt-0.5">
                              {order.campaignId?.title || 'Charity Campaign Order'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                              isDelivered
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {trackingSteps[stepIdx].label}
                          </span>
                          <span className="font-black text-sm text-white">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Mini Stepper Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Stage: {trackingSteps[stepIdx].label}</span>
                          <span className="text-slate-500 font-normal">
                            Carrier: {order.carrier || 'TCS Express'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(15, (stepIdx / 4) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom action row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-slate-400">
                          Delivery to:{' '}
                          <strong className="text-white font-semibold">
                            {order.shippingAddress?.fullName || user?.fullName || 'Buyer'} ({order.shippingAddress?.city || 'Lahore'})
                          </strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
                        >
                          <Truck size={14} /> View Live Tracking Timeline →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* ACCOUNT SETTINGS TAB      */}
        {/* ------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {settingsSuccess && (
              <div className="p-4 rounded-xl text-sm font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {settingsSuccess}
              </div>
            )}
            {settingsError && <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm font-semibold">{settingsError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile details */}
              <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                  <User size={18} className="text-cyan-400" /> Profile Information
                </h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Home/Office Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Profile Picture URL</label>
                    <input
                      type="url"
                      value={profileForm.profilePicture}
                      onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white"
                  >
                    Save Profile Details
                  </button>
                </form>
              </div>

              {/* Password security & settings */}
              <div className="space-y-8">
                {/* Change Password */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-cyan-400" /> Password & Security
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Notifications & referral privacy */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl space-y-6 border border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4">Referral Privacy Settings</h3>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={referralPrivacy === 'public'}
                          onChange={() => handleReferralPrivacyChange('public')}
                          className="accent-cyan-500"
                        />
                        Public Leaderboard
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          checked={referralPrivacy === 'anonymous'}
                          onChange={() => handleReferralPrivacyChange('anonymous')}
                          className="accent-cyan-500"
                        />
                        Anonymous Profile
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-300 cursor-pointer">
                        <span>Donation updates & reports</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.donationUpdates}
                          onChange={() => handleNotificationToggle('donationUpdates')}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-300 cursor-pointer">
                        <span>Campaign launch success logs</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.campaignUpdates}
                          onChange={() => handleNotificationToggle('campaignUpdates')}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-300 cursor-pointer">
                        <span>Identity verification requests</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.verificationNotifications}
                          onChange={() => handleNotificationToggle('verificationNotifications')}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-semibold text-slate-300 cursor-pointer">
                        <span>Merchandise order logs</span>
                        <input
                          type="checkbox"
                          checked={notificationPreferences.storeNotifications}
                          onChange={() => handleNotificationToggle('storeNotifications')}
                          className="w-4 h-4 accent-cyan-500"
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
