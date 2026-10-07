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
  ShoppingBag,
  Calculator,
  AlertTriangle,
  FileText,
  PackageCheck,
  MessageSquare,
  Send,
  Upload,
  RotateCcw,
  ClipboardCheck,
  GitBranch,
  Download,
  CreditCard
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import InstantQuotation from './InstantQuotation';

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

  // Instant Quotation States
  const [quotationMode, setQuotationMode] = useState('quick');
  const [quotationStep, setQuotationStep] = useState(1);
  const [selectedSample, setSelectedSample] = useState('rugby_polo_100');
  const [quotationSamples, setQuotationSamples] = useState({});
  const [quotationDraft, setQuotationDraft] = useState(null);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationAnalyzing, setQuotationAnalyzing] = useState(false);
  const [quotationError, setQuotationError] = useState('');
  const [aiDesignSpec, setAiDesignSpec] = useState(null);
  const [aiTechPackFile, setAiTechPackFile] = useState(null);
  const [quotationForm, setQuotationForm] = useState({
    projectName: 'Campaign merchandise quote',
    clientName: '',
    techPackName: '',
    techPackText: '',
    quotationNotes: '',
    garmentType: 'tshirt',
    style: 'Campaign Event Tee',
    quantity: '100',
    fabricName: 'Single Jersey',
    consumptionKg: '0.25',
    embellishmentType: 'printing',
    embellishmentPlacement: 'front',
    widthIn: '10',
    heightIn: '8',
    pieceCount: '',
    trimType: 'label',
    trimQty: '1',
  });
  const [quotationWorkspace, setQuotationWorkspace] = useState('home');
  const [quoteContext, setQuoteContext] = useState(null);
  const [quoteVersions, setQuoteVersions] = useState([]);
  const [quoteConversation, setQuoteConversation] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! Tell me what you would like to quote. I will keep the requirements visible while the pricing engine handles the math.",
      time: 'Now',
    },
  ]);
  const [quoteChatInput, setQuoteChatInput] = useState('');
  const [quoteAssistantState, setQuoteAssistantState] = useState('Ready');
  const [quoteScenario, setQuoteScenario] = useState(null);
  const [quoteApprovalChecks, setQuoteApprovalChecks] = useState({
    details: false,
    terms: false,
  });
  const [quotePaymentState, setQuotePaymentState] = useState('pending');

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

      api.get('/quotations/samples')
        .then((res) => setQuotationSamples(res.data || {}))
        .catch(() => setQuotationSamples({}));

      api.get('/quotations/my')
        .then((res) => setRecentQuotations(Array.isArray(res.data) ? res.data : []))
        .catch(() => setRecentQuotations([]));
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

  const buildQuickQuotationSpec = () => ({
    id: 'MANUAL-TECHPACK',
    quantity: Number(quotationForm.quantity) || null,
    garment: {
      type: quotationForm.garmentType,
      style: quotationForm.style,
      quantity: Number(quotationForm.quantity) || null,
      size_reference: 'M',
    },
    source: {
      type: quotationForm.techPackName ? 'uploaded_reference' : 'manual_entry',
      fileName: quotationForm.techPackName,
    },
    fabrics: [
      {
        role: 'main',
        name: quotationForm.fabricName,
        consumption_kg: quotationForm.consumptionKg === '' ? null : Number(quotationForm.consumptionKg),
        confidence: quotationForm.consumptionKg === '' ? 'LOW' : 'HIGH',
      },
    ],
    decorations: quotationForm.embellishmentType === 'none' ? [] : [
      {
        type: quotationForm.embellishmentType,
        placement: quotationForm.embellishmentPlacement,
        width_in: quotationForm.widthIn === '' ? null : Number(quotationForm.widthIn),
        height_in: quotationForm.heightIn === '' ? null : Number(quotationForm.heightIn),
        piece_count: quotationForm.pieceCount === '' ? null : Number(quotationForm.pieceCount),
        quantity: 1,
        confidence: quotationForm.widthIn && quotationForm.heightIn ? 'HIGH' : 'LOW',
        source: 'operator_review',
      },
    ],
    trims: quotationForm.trimType === 'none' ? [] : [
      {
        type: quotationForm.trimType,
        quantity_per_garment: Number(quotationForm.trimQty) || 0,
        confidence: 'HIGH',
      },
    ],
  });

  const getActiveQuotationSpec = () => {
    if (quotationMode === 'ai' && aiDesignSpec) {
      return aiDesignSpec;
    }
    if (quotationMode === 'sample' && quotationSamples[selectedSample]) {
      return quotationSamples[selectedSample];
    }
    return buildQuickQuotationSpec();
  };

  const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const makeQuoteValue = (value, source = 'USER_MESSAGE', confidence = 'CONFIRMED', status = 'CONFIRMED') => ({
    value,
    source,
    confidence,
    status,
    lastChanged: `v${Math.max(1, quoteVersions.length + 1)}`,
  });

  const createQuoteContextFromSpec = (designSpec, source = 'USER_MESSAGE') => {
    const garment = designSpec.garment || {};
    const fabric = (designSpec.fabrics || designSpec.fabric || [])[0] || {};
    const decoration = (designSpec.decorations || designSpec.embellishments || [])[0] || {};
    const trim = (designSpec.trims || [])[0] || {};

    return {
      quoteId: quotationDraft?._id || `Q-${Date.now().toString().slice(-5)}`,
      customer: quotationForm.clientName || 'Walk-in customer',
      requirements: {
        product: makeQuoteValue(garment.style || quotationForm.style || 'Campaign merchandise', source, source === 'AI_EXTRACTION' ? 'MEDIUM' : 'CONFIRMED', source === 'AI_EXTRACTION' ? 'AWAITING_USER_CONFIRMATION' : 'CONFIRMED'),
        garmentType: makeQuoteValue(garment.type || quotationForm.garmentType || 'tshirt', source),
        quantity: makeQuoteValue(Number(garment.quantity || designSpec.quantity || quotationForm.quantity) || 1, source),
        material: makeQuoteValue(fabric.name || quotationForm.fabricName || 'Single Jersey', source, fabric.confidence || 'CONFIRMED', fabric.confidence === 'LOW' ? 'AWAITING_USER_CONFIRMATION' : 'CONFIRMED'),
        consumptionKg: makeQuoteValue(fabric.consumption_kg ?? fabric.consumptionKg ?? quotationForm.consumptionKg, source, fabric.confidence || 'CONFIRMED', fabric.confidence === 'LOW' ? 'AWAITING_USER_CONFIRMATION' : 'CONFIRMED'),
        finish: makeQuoteValue(decoration.type || quotationForm.embellishmentType || 'printing', source, decoration.confidence || 'CONFIRMED', decoration.confidence === 'LOW' ? 'AWAITING_USER_CONFIRMATION' : 'CONFIRMED'),
        placement: makeQuoteValue(decoration.placement || decoration.location || quotationForm.embellishmentPlacement || 'front', source),
        dimensions: makeQuoteValue(`${decoration.width_in ?? decoration.widthIn ?? (quotationForm.widthIn || 0)} x ${decoration.height_in ?? decoration.heightIn ?? (quotationForm.heightIn || 0)} in`, source, decoration.confidence || 'CONFIRMED', decoration.confidence === 'LOW' ? 'AWAITING_USER_CONFIRMATION' : 'CONFIRMED'),
        trim: makeQuoteValue(trim.type || quotationForm.trimType || 'label', source),
        delivery: makeQuoteValue('Standard', 'BUSINESS_RULE', 'MEDIUM', 'AWAITING_USER_CONFIRMATION'),
      },
      documents: aiTechPackFile ? [{ name: aiTechPackFile.name, status: aiDesignSpec ? 'Processed' : 'Uploaded' }] : [],
      userDecisions: source === 'USER_MESSAGE' ? ['Initial requirements started by user'] : [],
      aiAssumptions: source === 'AI_EXTRACTION' ? ['Extracted values require user review before approval'] : ['Delivery defaults to Standard until confirmed'],
      unresolvedQuestions: [],
      pricingInputs: {},
      pricingResult: quotationDraft?.calculation || null,
      availability: { status: 'Not checked' },
      delivery: { method: 'Standard', days: 10 },
      version: Math.max(1, quoteVersions.length + 1),
      status: 'REQUIREMENTS_READY',
      conversation: quoteConversation,
    };
  };

  const buildDesignSpecFromContext = (context = quoteContext) => {
    if (!context) return getActiveQuotationSpec();
    const req = context.requirements || {};
    const [widthRaw, heightRaw] = String(req.dimensions?.value || '').split('x').map((part) => Number(String(part).replace(/[^\d.]/g, '')));

    return {
      id: context.quoteId || 'CHAT-QUOTE',
      quantity: Number(req.quantity?.value) || 1,
      garment: {
        type: req.garmentType?.value || quotationForm.garmentType,
        style: req.product?.value || quotationForm.style,
        quantity: Number(req.quantity?.value) || 1,
        size_reference: 'M',
      },
      source: {
        type: context.documents?.length ? 'uploaded_reference' : 'chat_context',
        fileName: context.documents?.[0]?.name || quotationForm.techPackName,
      },
      fabrics: [
        {
          role: 'main',
          name: req.material?.value || quotationForm.fabricName,
          consumption_kg: req.consumptionKg?.value === '' ? null : Number(req.consumptionKg?.value),
          confidence: req.consumptionKg?.confidence === 'LOW' ? 'LOW' : 'HIGH',
        },
      ],
      decorations: req.finish?.value === 'none' ? [] : [
        {
          type: req.finish?.value || quotationForm.embellishmentType,
          placement: req.placement?.value || quotationForm.embellishmentPlacement,
          width_in: widthRaw || Number(quotationForm.widthIn) || null,
          height_in: heightRaw || Number(quotationForm.heightIn) || null,
          piece_count: quotationForm.pieceCount === '' ? null : Number(quotationForm.pieceCount),
          quantity: 1,
          confidence: req.dimensions?.confidence === 'LOW' ? 'LOW' : 'HIGH',
          source: req.finish?.source || 'quote_context',
        },
      ],
      trims: req.trim?.value === 'none' ? [] : [
        {
          type: req.trim?.value || quotationForm.trimType,
          quantity_per_garment: Number(quotationForm.trimQty) || 1,
          confidence: 'HIGH',
        },
      ],
    };
  };

  const pushQuoteVersion = (context, calculation, changeSummary) => {
    const version = {
      id: `v${quoteVersions.length + 1}`,
      changedBy: 'User',
      changeSummary,
      context: JSON.parse(JSON.stringify(context)),
      calculation,
      createdAt: new Date().toISOString(),
    };
    setQuoteVersions(prev => [version, ...prev].slice(0, 8));
    return version;
  };

  const startQuotationWorkspace = () => {
    const initialContext = createQuoteContextFromSpec(getActiveQuotationSpec(), quotationMode === 'ai' ? 'AI_EXTRACTION' : 'USER_MESSAGE');
    setQuoteContext(initialContext);
    setQuotationWorkspace('workspace');
    setQuoteAssistantState('Understanding');
    setQuoteConversation(prev => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: 'I created a structured quote context. Review the requirements on the right, then calculate when you are ready.',
        time: nowLabel(),
      },
    ]);
    setTimeout(() => setQuoteAssistantState('Ready'), 500);
  };

  const openQuotationWorkspace = (quote) => {
    const restoredContext = quote.quoteContext || createQuoteContextFromSpec(quote.designSpec || buildQuickQuotationSpec(), 'USER_MESSAGE');
    setQuotationDraft(quote);
    setQuoteContext({ ...restoredContext, pricingResult: quote.calculation || restoredContext.pricingResult });
    setQuoteVersions(quote.versions || []);
    setQuotationWorkspace('workspace');
    setQuoteAssistantState('Ready');
  };

  const updateQuoteRequirement = (field, value, source = 'USER_MESSAGE', confidence = 'CONFIRMED', status = 'CONFIRMED') => {
    setQuoteContext(prev => {
      const base = prev || createQuoteContextFromSpec(getActiveQuotationSpec());
      return {
        ...base,
        requirements: {
          ...base.requirements,
          [field]: makeQuoteValue(value, source, confidence, status),
        },
        status: 'CONFIGURED',
      };
    });
  };

  const applyChatCommand = (message) => {
    const lower = message.toLowerCase();
    const quantityMatch = message.match(/(?:make it|use|quantity|qty|need|order)?\s*([0-9][0-9,]*)\s*(?:units|pcs|pieces|shirts|hoodies|tees)?/i);
    const dimensionMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)/i);
    const updates = [];

    if (quantityMatch && (lower.includes('make') || lower.includes('quantity') || lower.includes('qty') || lower.includes('need') || lower.includes('order') || lower.includes('unit'))) {
      const quantity = Number(quantityMatch[1].replace(/,/g, ''));
      updateQuoteRequirement('quantity', quantity);
      updates.push(`quantity to ${quantity}`);
    }
    if (lower.includes('standard material') || lower.includes('standard fabric')) {
      updateQuoteRequirement('material', 'Single Jersey');
      updates.push('material to standard Single Jersey');
    }
    if (lower.includes('premium')) {
      updateQuoteRequirement('material', 'Double Knit');
      updateQuoteRequirement('finish', 'embroidery');
      updates.push('premium material and finish');
    }
    if (lower.includes('hoodie')) {
      updateQuoteRequirement('garmentType', 'hoodie');
      updateQuoteRequirement('product', 'Custom Hoodie');
      updates.push('product to hoodie');
    }
    if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('tee')) {
      updateQuoteRequirement('garmentType', 'tshirt');
      updateQuoteRequirement('product', 'Custom T-Shirt');
      updates.push('product to t-shirt');
    }
    if (dimensionMatch) {
      updateQuoteRequirement('dimensions', `${dimensionMatch[1]} x ${dimensionMatch[2]} in`);
      updates.push(`dimensions to ${dimensionMatch[1]} x ${dimensionMatch[2]} in`);
    }
    if (lower.includes('express') || lower.includes('7 days') || lower.includes('seven days')) {
      updateQuoteRequirement('delivery', 'Express', 'USER_MESSAGE', 'CONFIRMED', 'CONFIRMED');
      updates.push('delivery to Express');
    }
    if (lower.includes('what if') || lower.includes('scenario')) {
      const scenarioQuantity = quantityMatch ? Number(quantityMatch[1].replace(/,/g, '')) : null;
      setQuoteScenario({
        label: scenarioQuantity ? `${scenarioQuantity} unit scenario` : 'Alternative scenario',
        note: 'Scenario saved for comparison without changing confirmed requirements.',
      });
      return 'I saved that as a scenario so it does not overwrite the confirmed quote.';
    }
    if (lower.includes('why') && (lower.includes('price') || lower.includes('cost'))) {
      return quoteCalculation
        ? `The current total is ${formatCurrency(quoteCalculation.totals.finalTotal)}: manufacturing ${formatCurrency(quoteCalculation.totals.manufacturingCost)}, margin ${formatCurrency(quoteCalculation.totals.margin)}, and shipping ${formatCurrency(quoteCalculation.totals.shipping)}.`
        : 'Calculate the quote first and I will explain each pricing line from the engine.';
    }

    return updates.length
      ? `Updated ${updates.join(', ')}. The context changed; recalculate to get the authoritative price.`
      : 'I captured that note. Please update any exact requirement in the context panel if I missed the field.';
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAnalyzeTechPack = async () => {
    setQuotationError('');
    setQuotationAnalyzing(true);
    try {
      const fileData = aiTechPackFile ? await readFileAsBase64(aiTechPackFile) : null;
      const res = await api.post('/quotations/analyze', {
        projectName: quotationForm.projectName,
        quantity: quotationForm.quantity,
        notes: quotationForm.quotationNotes,
        text: quotationForm.techPackText,
        fileData,
        mimeType: aiTechPackFile?.type,
      });
      setAiDesignSpec(res.data.designSpec);
      setQuotationMode('ai');
      setQuoteContext(createQuoteContextFromSpec(res.data.designSpec, 'AI_EXTRACTION'));
      setQuotationWorkspace('workspace');
      setQuotationStep(2);
      setQuoteConversation(prev => [
        ...prev,
        {
          id: `assistant-analysis-${Date.now()}`,
          role: 'assistant',
          text: 'I extracted a draft quote context from the tech pack. Please confirm any AI-inferred fields before final approval.',
          time: nowLabel(),
        },
      ]);
    } catch (err) {
      setQuotationError(err.response?.data?.message || 'AI analysis failed');
    } finally {
      setQuotationAnalyzing(false);
    }
  };

  const handleCalculateQuotation = async (changeSummary = 'Pricing calculated from current context') => {
    setQuotationError('');
    setQuotationLoading(true);
    try {
      const contextForCalculation = quoteContext || createQuoteContextFromSpec(getActiveQuotationSpec());
      const designSpec = buildDesignSpecFromContext(contextForCalculation);
      const res = await api.post('/quotations/calculate', {
        projectName: quotationForm.projectName || contextForCalculation.requirements?.product?.value || designSpec.garment?.style || 'Untitled quotation',
        clientName: quotationForm.clientName,
        designSpec,
        quoteContext: contextForCalculation,
        versions: quoteVersions,
      });
      const pricedContext = {
        ...contextForCalculation,
        quoteId: res.data._id,
        pricingResult: res.data.calculation,
        pricingInputs: designSpec,
        status: res.data.calculation?.warnings?.length ? 'REVIEW' : 'PRICE_CALCULATED',
      };
      const version = pushQuoteVersion(pricedContext, res.data.calculation, changeSummary);
      const savedQuote = { ...res.data, quoteContext: pricedContext, versions: [version, ...quoteVersions] };
      try {
        const persisted = await api.patch(`/quotations/${res.data._id}`, {
          projectName: savedQuote.projectName,
          clientName: savedQuote.clientName,
          designSpec,
          quoteContext: pricedContext,
          versions: savedQuote.versions,
          recalculate: false,
          status: res.data.status,
        });
        setQuotationDraft(persisted.data);
        setRecentQuotations(prev => [persisted.data, ...prev.filter(q => q._id !== persisted.data._id)].slice(0, 5));
      } catch (persistErr) {
        setQuotationDraft(savedQuote);
        setRecentQuotations(prev => [savedQuote, ...prev.filter(q => q._id !== savedQuote._id)].slice(0, 5));
      }
      setQuoteContext(pricedContext);
      setQuotationStep(3);
      setQuoteAssistantState(res.data.calculation?.warnings?.length ? 'Needs review' : 'Price calculated');
      setQuoteConversation(prev => [
        ...prev,
        {
          id: `assistant-price-${Date.now()}`,
          role: 'assistant',
          text: `The pricing engine calculated ${formatCurrency(res.data.calculation.totals.finalTotal)}. Review warnings and assumptions before approval.`,
          time: nowLabel(),
        },
      ]);
    } catch (err) {
      setQuotationError(err.response?.data?.message || 'Failed to calculate quotation');
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleApproveQuotation = async () => {
    if (!quotationDraft?._id) return;
    if (!quoteApprovalChecks.details || !quoteApprovalChecks.terms) {
      setQuotationError('Please confirm the quotation details and terms before approval.');
      return;
    }
    setQuotationError('');
    setQuotationLoading(true);
    try {
      const res = await api.post(`/quotations/${quotationDraft._id}/approve`);
      setQuotationDraft(res.data);
      setRecentQuotations(prev => prev.map(q => q._id === res.data._id ? res.data : q));
      setQuotationStep(4);
      setQuotePaymentState('payment_pending');
      setQuoteContext(prev => prev ? { ...prev, status: 'USER_APPROVED' } : prev);
    } catch (err) {
      setQuotationError(err.response?.data?.message || 'Failed to approve quotation');
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleQuoteChatSubmit = (e) => {
    e.preventDefault();
    const message = quoteChatInput.trim();
    if (!message) return;
    setQuoteChatInput('');
    setQuoteAssistantState('Extracting requirements');
    setQuoteConversation(prev => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: message, time: nowLabel() },
    ]);
    const reply = applyChatCommand(message);
    setTimeout(() => {
      setQuoteConversation(prev => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: reply, time: nowLabel() },
      ]);
      setQuoteAssistantState('Ready');
    }, 350);
  };

  const handleRestoreQuoteVersion = (version) => {
    setQuoteContext(version.context);
    setQuotationDraft(prev => prev ? { ...prev, calculation: version.calculation, quoteContext: version.context } : prev);
    setQuoteConversation(prev => [
      ...prev,
      {
        id: `assistant-restore-${Date.now()}`,
        role: 'assistant',
        text: `Restored ${version.id}. Recalculate if you want to save it as the current price.`,
        time: nowLabel(),
      },
    ]);
  };

  const confirmRequirement = (field) => {
    setQuoteContext(prev => {
      if (!prev?.requirements?.[field]) return prev;
      return {
        ...prev,
        requirements: {
          ...prev.requirements,
          [field]: {
            ...prev.requirements[field],
            confidence: 'CONFIRMED',
            status: 'CONFIRMED',
            source: prev.requirements[field].source || 'USER_MESSAGE',
          },
        },
      };
    });
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
  const quotationSampleOptions = Object.keys(quotationSamples);
  const activeQuotationSpec = getActiveQuotationSpec();
  const quoteCalculation = quotationDraft?.calculation;
  const quoteReviewCount = quoteCalculation?.lines?.filter(line => line.needsReview).length || 0;
  const quoteRequirementRows = quoteContext ? [
    ['product', 'Product'],
    ['quantity', 'Quantity'],
    ['garmentType', 'Garment'],
    ['material', 'Material'],
    ['consumptionKg', 'Kg / garment'],
    ['finish', 'Finish'],
    ['dimensions', 'Dimensions'],
    ['delivery', 'Delivery'],
  ].map(([key, label]) => ({ key, label, ...(quoteContext.requirements?.[key] || {}) })) : [];
  const quoteTotal = quoteCalculation?.totals?.finalTotal || 0;
  const quoteDeposit = quoteTotal / 2;

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
                  onClick={() => { setActiveTab('instant_quotation'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'instant_quotation' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Calculator size={18} /> Instant Quotation
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
        {/* INSTANT QUOTATION TAB     */}
        {/* ------------------------- */}
        {activeTab === 'instant_quotation' && isFundraiser && (
          <InstantQuotation inDashboard={true} />
        )}

        {false && activeTab === 'instant_quotation' && isFundraiser && (
          <div className="space-y-6 animate-fade-in">
            {quotationError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold">
                {quotationError}
              </div>
            )}

            {quotationWorkspace === 'home' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                  <p className="text-xs font-extrabold text-primary-700 uppercase tracking-wide">Instant Quotation</p>
                  <h2 className="text-3xl font-extrabold text-slate-950 mt-2 max-w-2xl">
                    Build the quotation with chat. Let the pricing engine do the math.
                  </h2>
                  <p className="text-sm text-slate-500 mt-3 max-w-2xl leading-relaxed">
                    The assistant updates a structured quote context, every value keeps provenance, and the final price is calculated by the backend rate engine.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-100 rounded-xl p-1 mt-8 max-w-2xl">
                    {[
                      ['quick', 'Manual'],
                      ['ai', 'AI Extract'],
                      ['sample', 'Sample'],
                    ].map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setQuotationMode(mode)}
                        className={`py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          quotationMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-3xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Name</label>
                      <input
                        type="text"
                        value={quotationForm.projectName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, projectName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Client Name</label>
                      <input
                        type="text"
                        value={quotationForm.clientName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, clientName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {quotationMode === 'ai' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5 max-w-4xl">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tech Pack File</label>
                        <input
                          type="file"
                          accept=".pdf,image/*,.txt"
                          onChange={(e) => setAiTechPackFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Paste Tech Pack Text</label>
                        <textarea
                          rows={4}
                          value={quotationForm.techPackText}
                          onChange={(e) => setQuotationForm({ ...quotationForm, techPackText: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Measurements, fabric notes, decoration callouts..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAnalyzeTechPack}
                        disabled={quotationAnalyzing || (!aiTechPackFile && !quotationForm.techPackText.trim())}
                        className="lg:col-span-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles size={16} /> {quotationAnalyzing ? 'Analyzing...' : 'Analyze and Open Workspace'}
                      </button>
                    </div>
                  ) : quotationMode === 'sample' ? (
                    <div className="mt-5 max-w-md">
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sample Extraction</label>
                      <select
                        value={selectedSample}
                        onChange={(e) => setSelectedSample(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {quotationSampleOptions.map((key) => (
                          <option key={key} value={key}>{quotationSamples[key].garment.style}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Garment</label>
                        <select
                          value={quotationForm.garmentType}
                          onChange={(e) => setQuotationForm({ ...quotationForm, garmentType: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="tshirt">T-Shirt</option>
                          <option value="hoodie">Hoodie</option>
                          <option value="rugby_polo">Rugby Polo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={quotationForm.quantity}
                          onChange={(e) => setQuotationForm({ ...quotationForm, quantity: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fabric</label>
                        <select
                          value={quotationForm.fabricName}
                          onChange={(e) => setQuotationForm({ ...quotationForm, fabricName: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Single Jersey">Single Jersey</option>
                          <option value="Double Knit">Double Knit</option>
                          <option value="Brushed Fleece">Brushed Fleece</option>
                          <option value="Sherpa Fleece">Sherpa Fleece</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Finish</label>
                        <select
                          value={quotationForm.embellishmentType}
                          onChange={(e) => setQuotationForm({ ...quotationForm, embellishmentType: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="printing">Printing</option>
                          <option value="embroidery">Embroidery</option>
                          <option value="applique">Applique</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {quotationMode !== 'ai' && (
                    <button
                      type="button"
                      onClick={startQuotationWorkspace}
                      disabled={quotationMode === 'sample' && quotationSampleOptions.length === 0}
                      className="mt-8 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-extrabold rounded-xl cursor-pointer flex items-center gap-2"
                    >
                      <Plus size={18} /> Start New Quotation
                    </button>
                  )}
                </div>

                <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4">Recent quotations</h3>
                  {recentQuotations.length === 0 ? (
                    <div className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl p-5">No quotation history yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {recentQuotations.slice(0, 6).map((quote) => (
                        <button
                          key={quote._id}
                          type="button"
                          onClick={() => openQuotationWorkspace(quote)}
                          className="w-full text-left border border-slate-100 rounded-xl p-3 hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-800 truncate">{quote.projectName}</p>
                            <span className="text-xs font-extrabold text-slate-900">{formatCurrency(quote.calculation?.totals?.finalTotal || 0)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{quote.status}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuotationWorkspace('home')} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Back to quotations">
                      <ArrowRight size={18} className="rotate-180 text-slate-600" />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Quote {quoteContext?.quoteId || quotationDraft?._id || 'Draft'}</p>
                      <h2 className="text-lg font-extrabold text-slate-900">{quotationForm.projectName || quoteContext?.requirements?.product?.value}</h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{quoteAssistantState}</span>
                    <button
                      type="button"
                      onClick={() => handleCalculateQuotation('Recalculated from workspace')}
                      disabled={quotationLoading || !quoteContext}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg text-sm font-bold cursor-pointer flex items-center gap-2"
                    >
                      <Calculator size={16} /> {quotationLoading ? 'Calculating...' : 'Calculate'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[680px]">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2"><MessageSquare size={17} /> Quotation Chat</h3>
                        <p className="text-xs text-slate-500 mt-1">Commands update the structured quote context.</p>
                      </div>
                      <button type="button" onClick={() => document.getElementById('quote-file-input')?.click()} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Upload document">
                        <Upload size={18} className="text-slate-600" />
                      </button>
                      <input id="quote-file-input" type="file" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setAiTechPackFile(file);
                        setQuoteContext(prev => prev ? { ...prev, documents: [...(prev.documents || []), { name: file.name, status: 'Uploaded' }] } : prev);
                      }} />
                    </div>

                    <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-slate-50/60">
                      {quoteConversation.map((message) => (
                        <div key={message.id} className={`max-w-[82%] ${message.role === 'user' ? 'ml-auto text-right' : ''}`}>
                          <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                            message.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                          }`}>
                            {message.text}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{message.role === 'user' ? 'You' : 'AI'} · {message.time}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleQuoteChatSubmit} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                      <input
                        type="text"
                        value={quoteChatInput}
                        onChange={(e) => setQuoteChatInput(e.target.value)}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Type: Make it 1,000, use premium, why is the price..."
                      />
                      <button type="submit" className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer" title="Send">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>

                  <div className="xl:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2"><ClipboardCheck size={17} /> Quotation Context</h3>
                        <button type="button" onClick={() => quoteRequirementRows.forEach(row => confirmRequirement(row.key))} className="text-xs font-bold text-primary-700 hover:text-primary-800">Confirm all</button>
                      </div>
                      <div className="space-y-3">
                        {quoteRequirementRows.map((row) => (
                          <div key={row.key} className="border border-slate-100 rounded-xl p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase">{row.label}</p>
                                <input
                                  type={row.key === 'quantity' || row.key === 'consumptionKg' ? 'number' : 'text'}
                                  value={row.value ?? ''}
                                  onChange={(e) => updateQuoteRequirement(row.key, row.key === 'quantity' ? Number(e.target.value) : e.target.value)}
                                  className="w-full mt-1 text-sm font-extrabold text-slate-900 border-none outline-none bg-transparent"
                                />
                              </div>
                              {row.status !== 'CONFIRMED' ? (
                                <button type="button" onClick={() => confirmRequirement(row.key)} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-bold">Confirm</button>
                              ) : (
                                <CheckCircle size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{row.source || 'UNKNOWN'} · {row.confidence || 'MISSING'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4"><FileText size={17} /> Documents</h3>
                      {quoteContext?.documents?.length ? (
                        <div className="space-y-2">
                          {quoteContext.documents.map((doc, index) => (
                            <div key={`${doc.name}-${index}`} className="flex items-center justify-between gap-3 text-sm border border-slate-100 rounded-lg p-3">
                              <span className="font-semibold text-slate-700 truncate">{doc.name}</span>
                              <span className="text-xs font-bold text-emerald-700">{doc.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl p-4">No supporting documents attached.</p>
                      )}
                    </div>
                  </div>
                </div>

                {quoteScenario && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-900">
                    <span className="font-extrabold">{quoteScenario.label}:</span> {quoteScenario.note}
                  </div>
                )}

                {quoteCalculation && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Pricing Engine Result</h3>
                          <p className="text-xs text-slate-500 mt-1">Quote {quotationDraft?._id} · Qty {quoteCalculation.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(quoteCalculation.totals.finalTotal)}</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                              <th className="py-3 px-4">Line Item</th>
                              <th className="py-3 px-4">Rate</th>
                              <th className="py-3 px-4">Basis</th>
                              <th className="py-3 px-4 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {quoteCalculation.lines.map((line, index) => (
                              <tr key={`${line.description}-${index}`} className={line.needsReview ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-800">{line.description}</div>
                                  <div className="text-[11px] text-slate-500 capitalize">{line.category} · {line.confidence.toLowerCase()} confidence</div>
                                  {line.warnings.length > 0 && <div className="text-[11px] text-amber-700 font-semibold mt-1">{line.warnings.join('; ')}</div>}
                                </td>
                                <td className="py-3 px-4 font-mono text-xs text-slate-600">{line.rateCode || 'Missing'}</td>
                                <td className="py-3 px-4 text-slate-600">{line.basisQty}</td>
                                <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatCurrency(line.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-4">Review</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500 font-bold">Per unit</p>
                            <p className="font-extrabold text-slate-900 mt-1">{formatCurrency(quoteCalculation.totals.mfgCostPerGarment)}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500 font-bold">Review items</p>
                            <p className={`font-extrabold mt-1 ${quoteReviewCount ? 'text-amber-600' : 'text-emerald-600'}`}>{quoteReviewCount}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {quoteCalculation.warnings.map((warning, index) => (
                            <p key={`${warning}-${index}`} className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2">{warning}</p>
                          ))}
                          {quoteCalculation.assumptions.map((assumption, index) => (
                            <p key={`${assumption}-${index}`} className="text-xs text-blue-800 bg-blue-50 rounded-lg p-2">{assumption}</p>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4"><GitBranch size={17} /> Version History</h3>
                        <div className="space-y-2">
                          {quoteVersions.length === 0 ? (
                            <p className="text-sm text-slate-500">No saved versions yet.</p>
                          ) : quoteVersions.map((version) => (
                            <div key={version.id} className="border border-slate-100 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{version.id}</p>
                                  <p className="text-xs text-slate-500">{version.changeSummary}</p>
                                </div>
                                <button type="button" onClick={() => handleRestoreQuoteVersion(version)} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Restore">
                                  <RotateCcw size={15} />
                                </button>
                              </div>
                              <p className="text-xs font-extrabold text-slate-900 mt-2">{formatCurrency(version.calculation?.totals?.finalTotal || 0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {quoteCalculation && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                      <h3 className="text-lg font-extrabold text-slate-900">Final Quotation</h3>
                      <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Quote</span><span className="font-bold text-slate-900">{quotationDraft?._id}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Customer</span><span className="font-bold text-slate-900">{quoteContext?.customer}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Product</span><span className="font-bold text-slate-900">{quoteContext?.requirements?.product?.value}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-900">{formatCurrency(quoteCalculation.totals.fob)}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500">Delivery</span><span className="font-bold text-slate-900">{formatCurrency(quoteCalculation.totals.shipping)}</span></div>
                        <div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><span className="text-slate-900 font-extrabold">Total</span><span className="font-extrabold text-slate-900">{formatCurrency(quoteCalculation.totals.finalTotal)}</span></div>
                      </div>
                      <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle size={16} /> User confirmation is required before this quote can be accepted.
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2"><Download size={15} /> PDF</button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                      <h3 className="text-lg font-extrabold text-slate-900">Final Approval</h3>
                      <p className="text-sm text-slate-500 mt-2">Deposit due: <span className="font-extrabold text-slate-900">{formatCurrency(quoteDeposit)}</span></p>
                      <div className="mt-5 space-y-3">
                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={quoteApprovalChecks.details} onChange={() => setQuoteApprovalChecks(prev => ({ ...prev, details: !prev.details }))} className="w-4 h-4 accent-primary-600" />
                          I confirm these quotation details
                        </label>
                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" checked={quoteApprovalChecks.terms} onChange={() => setQuoteApprovalChecks(prev => ({ ...prev, terms: !prev.terms }))} className="w-4 h-4 accent-primary-600" />
                          I agree to the quotation terms
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleApproveQuotation}
                        disabled={quotationLoading || quotationDraft?.status === 'approved'}
                        className="mt-6 w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CreditCard size={17} /> {quotationDraft?.status === 'approved' ? 'Quote Approved' : `Accept & Pay ${formatCurrency(quoteDeposit)}`}
                      </button>
                      {quotePaymentState !== 'pending' && (
                        <p className="mt-3 text-xs font-bold text-emerald-700">Status: {quotePaymentState.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {false && activeTab === 'instant_quotation' && isFundraiser && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                {['Upload', 'Review', 'Cost', 'Generate'].map((label, index) => {
                  const step = index + 1;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setQuotationStep(step)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        quotationStep === step ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">{step}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {quotationError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold">
                {quotationError}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Tech-Pack Intake</h3>
                      <p className="text-xs text-slate-500 mt-1">Use Gemini to extract a design spec, or enter the spec manually for costing.</p>
                    </div>
                    <FileText className="text-primary-600 flex-shrink-0" size={22} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-100 rounded-xl p-1 mb-5">
                    <button
                      type="button"
                      onClick={() => setQuotationMode('ai')}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        quotationMode === 'ai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      AI Analyze
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuotationMode('quick')}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        quotationMode === 'quick' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Manual Spec
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuotationMode('sample')}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        quotationMode === 'sample' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sample Tech Pack
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Name</label>
                      <input
                        type="text"
                        value={quotationForm.projectName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, projectName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Client Name</label>
                      <input
                        type="text"
                        value={quotationForm.clientName}
                        onChange={(e) => setQuotationForm({ ...quotationForm, clientName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Optional"
                      />
                    </div>

                    {quotationMode === 'ai' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tech Pack File</label>
                          <input
                            type="file"
                            accept=".pdf,image/*,.txt"
                            onChange={(e) => setAiTechPackFile(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Paste Tech Pack Text</label>
                          <textarea
                            rows={5}
                            value={quotationForm.techPackText}
                            onChange={(e) => setQuotationForm({ ...quotationForm, techPackText: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Paste visible text, measurements, fabric notes, decoration callouts..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes for AI</label>
                          <textarea
                            rows={3}
                            value={quotationForm.quotationNotes}
                            onChange={(e) => setQuotationForm({ ...quotationForm, quotationNotes: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Anything the operator knows: placement, fabric assumption, desired size reference..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAnalyzeTechPack}
                          disabled={quotationAnalyzing || (!aiTechPackFile && !quotationForm.techPackText.trim())}
                          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold cursor-pointer"
                        >
                          {quotationAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Tech Pack'}
                        </button>
                        {aiDesignSpec && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-semibold text-emerald-800">
                            AI design specification is ready for review.
                          </div>
                        )}
                      </div>
                    ) : quotationMode === 'sample' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sample Extraction</label>
                        <select
                          value={selectedSample}
                          onChange={(e) => setSelectedSample(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {quotationSampleOptions.map((key) => (
                            <option key={key} value={key}>{quotationSamples[key].garment.style}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tech Pack File Name</label>
                          <input
                            type="text"
                            value={quotationForm.techPackName}
                            onChange={(e) => setQuotationForm({ ...quotationForm, techPackName: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Example: hoodie-techpack.pdf"
                          />
                        </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Garment</label>
                          <select
                            value={quotationForm.garmentType}
                            onChange={(e) => setQuotationForm({ ...quotationForm, garmentType: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="tshirt">T-Shirt</option>
                            <option value="hoodie">Hoodie</option>
                            <option value="rugby_polo">Rugby Polo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={quotationForm.quantity}
                            onChange={(e) => setQuotationForm({ ...quotationForm, quantity: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Style Name</label>
                        <input
                          type="text"
                          value={quotationForm.style}
                          onChange={(e) => setQuotationForm({ ...quotationForm, style: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fabric</label>
                          <select
                            value={quotationForm.fabricName}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fabricName: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="Single Jersey">Single Jersey</option>
                            <option value="Double Knit">Double Knit</option>
                            <option value="Brushed Fleece">Brushed Fleece</option>
                            <option value="Sherpa Fleece">Sherpa Fleece</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kg / Garment</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quotationForm.consumptionKg}
                            onChange={(e) => setQuotationForm({ ...quotationForm, consumptionKg: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Use default"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Embellishment</label>
                          <select
                            value={quotationForm.embellishmentType}
                            onChange={(e) => setQuotationForm({ ...quotationForm, embellishmentType: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="printing">Printing</option>
                            <option value="embroidery">Embroidery</option>
                            <option value="applique">Applique</option>
                            <option value="chenille">Chenille</option>
                            <option value="sublimation">Sublimation</option>
                            <option value="rhinestones">Rhinestones</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Placement</label>
                          <input
                            type="text"
                            value={quotationForm.embellishmentPlacement}
                            onChange={(e) => setQuotationForm({ ...quotationForm, embellishmentPlacement: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Width</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quotationForm.widthIn}
                            onChange={(e) => setQuotationForm({ ...quotationForm, widthIn: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Height</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quotationForm.heightIn}
                            onChange={(e) => setQuotationForm({ ...quotationForm, heightIn: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pieces</label>
                          <input
                            type="number"
                            min="0"
                            value={quotationForm.pieceCount}
                            onChange={(e) => setQuotationForm({ ...quotationForm, pieceCount: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Auto"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trim</label>
                          <select
                            value={quotationForm.trimType}
                            onChange={(e) => setQuotationForm({ ...quotationForm, trimType: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="label">Label</option>
                            <option value="button">Button</option>
                            <option value="zipper">Zipper</option>
                            <option value="rib">Rib</option>
                            <option value="drawcord">Drawcord</option>
                            <option value="size_tag">Size Tag</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trim Qty</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quotationForm.trimQty}
                            onChange={(e) => setQuotationForm({ ...quotationForm, trimQty: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      </>
                    )}
                  </div>
                </div>

                {recentQuotations.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-4">Recent Drafts</h3>
                    <div className="space-y-3">
                      {recentQuotations.slice(0, 4).map((quote) => (
                        <button
                          key={quote._id}
                          type="button"
                          onClick={() => { setQuotationDraft(quote); setQuotationStep(3); }}
                          className="w-full text-left border border-slate-100 rounded-xl p-3 hover:bg-slate-50 cursor-pointer"
                        >
                          <p className="text-sm font-bold text-slate-800 truncate">{quote.projectName}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatCurrency(quote.calculation?.totals?.finalTotal || 0)} · {quote.status}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-8 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {quotationStep === 1 && 'Step 1: Upload / Input'}
                        {quotationStep === 2 && 'Step 2: Review Extracted Details'}
                        {quotationStep === 3 && 'Step 3: Cost Review'}
                        {quotationStep === 4 && 'Step 4: Generate Quotation'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {quotationStep < 3 ? 'Review the design specification before sending it to the backend costing engine.' : 'Costs are generated by the backend rate engine from approved rates.'}
                      </p>
                    </div>
                    {quotationStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleCalculateQuotation}
                        disabled={quotationLoading || (quotationMode === 'sample' && quotationSampleOptions.length === 0) || (quotationMode === 'ai' && !aiDesignSpec)}
                        className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold cursor-pointer"
                      >
                        {quotationLoading ? 'Calculating...' : 'Calculate Quote'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApproveQuotation}
                        disabled={quotationLoading || !quotationDraft || quotationDraft.status === 'approved'}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold cursor-pointer"
                      >
                        {quotationDraft?.status === 'approved' ? 'Approved' : 'Approve Quote'}
                      </button>
                    )}
                  </div>
                </div>

                {quotationStep <= 2 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Canonical Design Specification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold">Garment</p>
                        <p className="font-extrabold text-slate-900 mt-1">{activeQuotationSpec.garment?.style || quotationForm.style}</p>
                        <p className="text-xs text-slate-500 mt-1">{activeQuotationSpec.garment?.type || quotationForm.garmentType}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold">Quantity</p>
                        <p className="font-extrabold text-slate-900 mt-1">{activeQuotationSpec.garment?.quantity || activeQuotationSpec.quantity || quotationForm.quantity}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold">Decorations</p>
                        <p className="font-extrabold text-slate-900 mt-1">{(activeQuotationSpec.decorations || activeQuotationSpec.embellishments || []).length}</p>
                      </div>
                    </div>
                    <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto max-h-[360px]">
                      {JSON.stringify(activeQuotationSpec, null, 2)}
                    </pre>
                  </div>
                )}

                {quoteCalculation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase">Final Total</p>
                      <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(quoteCalculation.totals.finalTotal)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase">Per Garment</p>
                      <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(quoteCalculation.totals.mfgCostPerGarment)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase">Margin</p>
                      <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(quoteCalculation.totals.margin)}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{quoteCalculation.pricing.marginPct}% {quoteCalculation.pricing.marginMode}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase">Review Items</p>
                      <p className={`text-2xl font-extrabold mt-2 ${quoteReviewCount ? 'text-amber-600' : 'text-emerald-600'}`}>{quoteReviewCount}</p>
                    </div>
                  </div>
                )}

                {quoteCalculation && (quoteCalculation.warnings.length > 0 || quoteCalculation.assumptions.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} /> Review Warnings
                      </h3>
                      {quoteCalculation.warnings.length === 0 ? (
                        <p className="text-xs text-amber-800">No warnings for this quotation.</p>
                      ) : (
                        <ul className="space-y-2">
                          {quoteCalculation.warnings.map((warning, index) => (
                            <li key={`${warning}-${index}`} className="text-xs text-amber-900 leading-relaxed">{warning}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                      <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-2 mb-3">
                        <PackageCheck size={18} /> Assumptions
                      </h3>
                      {quoteCalculation.assumptions.length === 0 ? (
                        <p className="text-xs text-blue-800">No assumptions were needed.</p>
                      ) : (
                        <ul className="space-y-2">
                          {quoteCalculation.assumptions.map((assumption, index) => (
                            <li key={`${assumption}-${index}`} className="text-xs text-blue-900 leading-relaxed">{assumption}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {quoteCalculation && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Cost Breakdown</h3>
                      <p className="text-xs text-slate-500 mt-1">Draft quotation {quotationDraft?._id} · Qty {quoteCalculation.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">FOB + Shipping</p>
                      <p className="font-extrabold text-slate-900">{formatCurrency(quoteCalculation.totals.fob)} + {formatCurrency(quoteCalculation.totals.shipping)}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                          <th className="py-3 px-4">Line Item</th>
                          <th className="py-3 px-4">Rate</th>
                          <th className="py-3 px-4">Basis</th>
                          <th className="py-3 px-4">Unit</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {quoteCalculation.lines.map((line, index) => (
                          <tr key={`${line.description}-${index}`} className={line.needsReview ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">{line.description}</div>
                              <div className="text-[11px] text-slate-500 capitalize">{line.category} · {line.confidence.toLowerCase()} confidence</div>
                              {line.warnings.length > 0 && (
                                <div className="text-[11px] text-amber-700 font-semibold mt-1">{line.warnings.join('; ')}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">{line.rateCode || 'Missing'}</td>
                            <td className="py-3 px-4 text-slate-600">{line.basisQty}</td>
                            <td className="py-3 px-4 text-slate-600">{formatCurrency(line.unitPrice)}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatCurrency(line.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}
              </div>
            </div>
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
