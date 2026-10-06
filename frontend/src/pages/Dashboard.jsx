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
  Share2,
  Copy,
  Check,
  Truck,
  Building2,
  QrCode,
  Tag,
  Send,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Package,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Boxes,
  FileCode,
  Layers,
  Download,
  Factory,
  FileText,
  CheckCheck,
  PackageCheck,
  ListFilter,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import { readCart, addCartItem } from '../utils/cart';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const isFundraiser = user?.role === 'fundraiser' || user?.role === 'manager';
  const isManufacturer = user?.role === 'manufacturer';
  const isManager = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => readCart(user?._id).length);

  const handleSwitchPortalRole = async (targetRole) => {
    try {
      await api.put('/auth/profile', { role: targetRole });
      setUser({ ...user, role: targetRole });
      setActiveTab('overview');
    } catch (e) {
      setUser({ ...user, role: targetRole });
      setActiveTab('overview');
    }
  };

  useEffect(() => {
    setCartCount(readCart(user?._id).length);
    const handleCartUpdate = (e) => {
      if (!e.detail?.userId || e.detail.userId === (user?._id || 'guest')) {
        setCartCount(readCart(user?._id).length);
      }
    };
    window.addEventListener('sayrab_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('sayrab_cart_updated', handleCartUpdate);
  }, [user]);

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

  // Customer & Campaign Orders States
  const [campaignOrders, setCampaignOrders] = useState([]);
  const [myPurchasedOrders, setMyPurchasedOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSubTab, setOrderSubTab] = useState('my_purchases');
  const [cancelModal, setCancelModal] = useState({
    open: false,
    order: null,
    reason: 'Changed mind before production dispatch',
    submitting: false,
    error: '',
    success: '',
  });

  // Product Catalog & Sample States
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [browseCategory, setBrowseCategory] = useState('All');
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseToast, setBrowseToast] = useState('');

  const handleBrowseAddToCart = (product) => {
    addCartItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
      campaignId: product.campaignId || product.campaign,
      selectedSize: 'M',
      selectedColor: 'Standard',
    }, 1, user?._id);
    setCartCount(readCart(user?._id).length);
    setBrowseToast(`Added "${product.name}" to cart!`);
    setTimeout(() => {
      setBrowseToast('');
    }, 3000);
  };

  const [sampleModal, setSampleModal] = useState({
    open: false,
    product: null,
    size: 'M',
    color: 'Classic Black',
    address: user?.address || '',
    notes: 'Please dispatch material sample for stitching and fabric review.',
    submitting: false,
    success: '',
    error: '',
  });

  // Store Sharing & Marketing Campaign States
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);
  const [marketingForm, setMarketingForm] = useState({
    title: 'Spring Merchandise Appeal',
    code: 'SAYRAB15',
    discount: 15,
    channel: 'Instagram & Facebook Ads',
    duration: '7 Days',
    target: 'Donors & Supporters',
  });
  const [marketingCampaignsList, setMarketingCampaignsList] = useState([
    {
      id: 'mkt-1',
      title: 'Charity T-Shirt Launch Blitz',
      code: 'CARE20',
      discount: '20%',
      channel: 'Social Media & WhatsApp',
      status: 'Active',
      impressions: 8940,
      clicks: 642,
      conversions: 32,
      revenue: 64000,
      date: '2026-10-01',
    },
    {
      id: 'mkt-2',
      title: 'Emergency Flood Relief Merch Push',
      code: 'RELIEF10',
      discount: '10%',
      channel: 'Email Newsletter Blast',
      status: 'Completed',
      impressions: 14200,
      clicks: 980,
      conversions: 55,
      revenue: 110000,
      date: '2026-09-20',
    },
  ]);
  const [adSimulator, setAdSimulator] = useState({
    running: false,
    step: 0,
    stats: null,
  });

  // Bank Details States
  const [bankForm, setBankForm] = useState({
    accountHolderName: user?.bankDetails?.accountHolderName || user?.fullName || '',
    bankName: user?.bankDetails?.bankName || 'Meezan Bank Ltd',
    accountNumber: user?.bankDetails?.accountNumber || '',
    iban: user?.bankDetails?.iban || '',
    easypaisaNumber: user?.bankDetails?.easypaisaNumber || user?.phone || '',
    jazzcashNumber: user?.bankDetails?.jazzcashNumber || '',
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

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

  // -------------------------
  // Manufacturer States
  // -------------------------
  const [mfgTechpacks, setMfgTechpacks] = useState([
    {
      id: 'tp-101',
      code: 'TP-SYR-TEE-240',
      title: 'Relief Heavy Cotton Tee 240GSM',
      organization: 'Ansaar Welfare Foundation',
      category: 'Apparel',
      fabric: '100% Combed Compact Cotton',
      gsm: 240,
      colorways: ['Jet Black', 'Off-White', 'Olive Green'],
      printTechnique: 'High-Density Screen Print (Front & Back)',
      bomItemsCount: 6,
      status: 'pending_review',
      dateReceived: '2026-10-04',
      specs: {
        chest: '22 inches (Size M)',
        length: '29 inches',
        sleeve: '8.5 inches',
        neckRib: '1x1 Lycra Rib 2.5cm',
        stitching: 'Double-needle hem and sleeves with reinforced shoulder tape',
      },
      assetUrl: '#',
    },
    {
      id: 'tp-102',
      code: 'TP-SYR-HD-320',
      title: 'Charity Pullover Heavyweight Hoodie',
      organization: 'Sayrab Relief Trust',
      category: 'Apparel',
      fabric: '80% Organic Cotton / 20% Recycled Poly Fleece',
      gsm: 320,
      colorways: ['Heather Grey', 'Midnight Navy'],
      printTechnique: 'Chenille Embroidery & Puff Screen Print',
      bomItemsCount: 8,
      status: 'accepted_by_manufacturer',
      dateReceived: '2026-10-02',
      specs: {
        chest: '24 inches (Size L)',
        length: '28.5 inches',
        hood: 'Double-layered 3-panel hood with flat braided drawcords',
        pocket: 'Front kangaroo pouch with reinforced bar-tacks',
      },
      assetUrl: '#',
    },
    {
      id: 'tp-103',
      code: 'TP-SYR-CAP-008',
      title: 'Emergency Response 6-Panel Cap',
      organization: 'Pakistan Medical Aid',
      category: 'Headwear',
      fabric: 'Heavy Brushed Cotton Twill',
      gsm: 280,
      colorways: ['Khaki', 'Charcoal Black'],
      printTechnique: '3D Front High-Relief Embroidery',
      bomItemsCount: 5,
      status: 'bom_verified',
      dateReceived: '2026-09-28',
      specs: {
        panels: '6-panel structured crown with buckram lining',
        closure: 'Antique brass buckle with tuck-in grommet',
      },
      assetUrl: '#',
    },
  ]);
  const [mfgTechpackFilter, setMfgTechpackFilter] = useState('all');
  const [mfgTechpackSearch, setMfgTechpackSearch] = useState('');

  const [mfgSamples, setMfgSamples] = useState([
    {
      id: 'smp-801',
      code: 'SMP-2026-081',
      requesterType: 'organization',
      requesterName: 'Ansaar Welfare Foundation',
      contactPerson: 'Tariq Mehmood (Org Lead)',
      phone: '0300-8849120',
      address: 'Plot 45-B, Sector G-9/4, Islamabad',
      productName: 'Relief Heavy Cotton Tee 240GSM',
      size: 'L',
      color: 'Jet Black',
      fabric: '100% Combed Cotton 240 GSM',
      units: 2,
      notes: 'Sample required for executive board review prior to 500-unit bulk campaign launch.',
      status: 'fabric_cutting',
      requestDate: '2026-10-05',
    },
    {
      id: 'smp-802',
      code: 'SMP-2026-082',
      requesterType: 'customer',
      requesterName: 'Farhan Ali',
      contactPerson: 'Farhan Ali (Customer)',
      phone: '0321-4478129',
      address: 'House 14, Street 8, DHA Phase 5, Lahore',
      productName: 'Charity Pullover Heavyweight Hoodie',
      size: 'M',
      color: 'Midnight Navy',
      fabric: '320 GSM Cotton Fleece',
      units: 1,
      notes: 'Customer requested physical sample for fabric weight and stitch inspection.',
      status: 'sampling_completed',
      requestDate: '2026-10-03',
    },
    {
      id: 'smp-803',
      code: 'SMP-2026-083',
      requesterType: 'organization',
      requesterName: 'Sayrab Relief Youth Guild',
      contactPerson: 'Ayesha Siddiqui',
      phone: '0333-5190284',
      address: 'Suite 201, Clifton Centre, Karachi',
      productName: 'Emergency Response 6-Panel Cap',
      size: 'Standard',
      color: 'Charcoal Black',
      fabric: 'Heavy Cotton Twill',
      units: 2,
      notes: 'Embroidery stitch density sample prototype check.',
      status: 'in_sampling',
      requestDate: '2026-10-01',
    },
  ]);
  const [mfgSampleFilter, setMfgSampleFilter] = useState('all');

  const [mfgTrackingSubTab, setMfgTrackingSubTab] = useState('sample_tracking');
  const [mfgSampleTracking, setMfgSampleTracking] = useState([
    {
      id: 'trk-smp-1',
      sampleId: 'SMP-2026-081',
      requesterType: 'organization',
      recipient: 'Ansaar Welfare Foundation (Islamabad)',
      item: 'Relief Heavy Cotton Tee (2 pcs)',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-SMP-998241',
      dispatchDate: '2026-10-06',
      status: 'in_transit',
      eta: '2026-10-08',
    },
    {
      id: 'trk-smp-2',
      sampleId: 'SMP-2026-079',
      requesterType: 'customer',
      recipient: 'Kamran Haider (Lahore)',
      item: 'Vintage Fleece Hoodie (1 pc)',
      carrier: 'Leopard Courier',
      trackingNumber: 'LEO-SMP-410298',
      dispatchDate: '2026-10-04',
      status: 'delivered',
      eta: '2026-10-06',
    },
  ]);

  const [mfgProductTracking, setMfgProductTracking] = useState([
    {
      id: 'trk-prd-1',
      orderId: 'ORD-89420',
      customerName: 'Zainab Qureshi',
      customerPhone: '0301-7788912',
      address: 'Apartment 4B, Askari 10, Lahore',
      items: '2x Relief Heavy Cotton Tee (Size M, L)',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-PRD-778210',
      dispatchDate: '2026-10-05',
      status: 'in_transit',
      totalAmount: 5000,
    },
    {
      id: 'trk-prd-2',
      orderId: 'ORD-89390',
      customerName: 'Bilal Khan',
      customerPhone: '0345-2233445',
      address: 'House 92, Street 3, F-11/2, Islamabad',
      items: '1x Charity Pullover Hoodie (Size XL)',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-PRD-665120',
      dispatchDate: '2026-10-03',
      status: 'delivered',
      totalAmount: 4500,
    },
  ]);

  const [mfgBulkOrders, setMfgBulkOrders] = useState([
    {
      id: 'blk-501',
      orderCode: 'BLK-SYR-00501',
      clientName: 'Pakistan Medical Aid Foundation',
      campaign: 'Emergency Hospital Drive 2026',
      item: 'Relief Heavy Cotton Tee 240GSM',
      totalUnits: 150,
      breakdown: { S: 25, M: 50, L: 50, XL: 25 },
      unitPrice: 1800,
      totalValue: 270000,
      mfgPayout: 121500,
      status: 'in_production',
      orderDate: '2026-10-01',
      targetCompletion: '2026-10-12',
      trackingNumber: 'TCS-CARGO-884102',
      notes: 'High-volume relief volunteer shirts with dual screen print on chest and sleeve.',
    },
    {
      id: 'blk-502',
      orderCode: 'BLK-SYR-00502',
      clientName: 'Sayrab Youth Community Drive',
      campaign: 'Winter Warmth Appeal 2026',
      item: 'Charity Pullover Heavyweight Hoodie',
      totalUnits: 60,
      breakdown: { M: 20, L: 30, XL: 10 },
      unitPrice: 3800,
      totalValue: 228000,
      mfgPayout: 102600,
      status: 'fabric_sourcing',
      orderDate: '2026-10-04',
      targetCompletion: '2026-10-16',
      trackingNumber: 'Pending Dispatch',
      notes: 'Fleece hoodies with heavy ribbing and kangaroo pocket.',
    },
    {
      id: 'blk-503',
      orderCode: 'BLK-SYR-00503',
      clientName: 'Al-Khidmat Flood Relief Volunteers',
      campaign: 'Sindh Flood Emergency Support',
      item: 'Emergency Response 6-Panel Cap',
      totalUnits: 300,
      breakdown: { Standard: 300 },
      unitPrice: 950,
      totalValue: 285000,
      mfgPayout: 128250,
      status: 'qc_passed',
      orderDate: '2026-09-26',
      targetCompletion: '2026-10-08',
      trackingNumber: 'TCS-CARGO-773190',
      notes: '300 high-durability brushed cotton caps for field workers.',
    },
  ]);
  const [mfgBulkFilter, setMfgBulkFilter] = useState('all');

  // Manufacturer Action Handlers
  const handleAcceptTechpack = (techpackId) => {
    setMfgTechpacks(prev => prev.map(tp => tp.id === techpackId ? { ...tp, status: 'accepted_by_manufacturer' } : tp));
    alert('Techpack accepted successfully! Bill of Materials confirmed for production scheduling.');
  };

  const handleAdvanceSampleStage = (sampleId) => {
    setMfgSamples(prev => prev.map(smp => {
      if (smp.id !== sampleId) return smp;
      const nextStage = smp.status === 'queued' ? 'fabric_cutting'
        : smp.status === 'fabric_cutting' ? 'in_sampling'
        : smp.status === 'in_sampling' ? 'sampling_completed'
        : 'sampling_completed';
      return { ...smp, status: nextStage };
    }));
  };

  const handleAdvanceBulkStage = (bulkId) => {
    setMfgBulkOrders(prev => prev.map(blk => {
      if (blk.id !== bulkId) return blk;
      const nextStatus = blk.status === 'queued' ? 'fabric_sourcing'
        : blk.status === 'fabric_sourcing' ? 'in_production'
        : blk.status === 'in_production' ? 'qc_passed'
        : blk.status === 'qc_passed' ? 'pallet_dispatched'
        : 'pallet_dispatched';
      return { ...blk, status: nextStatus };
    }));
  };

  const [trackingModal, setTrackingModal] = useState({
    open: false,
    type: 'sample', // 'sample' | 'product'
    item: null,
    carrier: 'TCS Express',
    trackingNumber: '',
    status: 'in_transit',
  });

  const handleSaveTrackingModal = (e) => {
    e.preventDefault();
    if (!trackingModal.trackingNumber.trim()) {
      alert('Please enter a tracking number.');
      return;
    }

    if (trackingModal.type === 'sample') {
      const existing = mfgSampleTracking.find(t => t.sampleId === trackingModal.item.code);
      if (existing) {
        setMfgSampleTracking(prev => prev.map(t => t.sampleId === trackingModal.item.code ? {
          ...t,
          carrier: trackingModal.carrier,
          trackingNumber: trackingModal.trackingNumber,
          status: trackingModal.status,
          dispatchDate: new Date().toISOString().split('T')[0],
        } : t));
      } else {
        setMfgSampleTracking([
          {
            id: 'trk-smp-' + Date.now(),
            sampleId: trackingModal.item.code,
            requesterType: trackingModal.item.requesterType,
            recipient: `${trackingModal.item.requesterName} (${trackingModal.item.address})`,
            item: `${trackingModal.item.productName} (${trackingModal.item.units} pcs)`,
            carrier: trackingModal.carrier,
            trackingNumber: trackingModal.trackingNumber,
            dispatchDate: new Date().toISOString().split('T')[0],
            status: trackingModal.status,
            eta: '2-3 Business Days',
          },
          ...mfgSampleTracking,
        ]);
      }
      setMfgSamples(prev => prev.map(s => s.id === trackingModal.item.id ? { ...s, status: 'dispatched' } : s));
    } else {
      setMfgProductTracking([
        {
          id: 'trk-prd-' + Date.now(),
          orderId: trackingModal.item.orderId || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          customerName: trackingModal.item.customerName || trackingModal.item.recipient,
          customerPhone: '0300-1234567',
          address: trackingModal.item.address || 'Delivered to verified customer address',
          items: trackingModal.item.items || trackingModal.item.productName || 'Merchandise Order',
          carrier: trackingModal.carrier,
          trackingNumber: trackingModal.trackingNumber,
          dispatchDate: new Date().toISOString().split('T')[0],
          status: trackingModal.status,
          totalAmount: 4800,
        },
        ...mfgProductTracking,
      ]);
    }

    setTrackingModal({ open: false, type: 'sample', item: null, carrier: 'TCS Express', trackingNumber: '', status: 'in_transit' });
    alert('Tracking information dispatched & synchronized successfully!');
  };

  // Load Initial Data
  useEffect(() => {
    if (!user) return;

    // Sync bank and profile form
    setBankForm({
      accountHolderName: user?.bankDetails?.accountHolderName || user?.fullName || '',
      bankName: user?.bankDetails?.bankName || 'Meezan Bank Ltd',
      accountNumber: user?.bankDetails?.accountNumber || '',
      iban: user?.bankDetails?.iban || '',
      easypaisaNumber: user?.bankDetails?.easypaisaNumber || user?.phone || '',
      jazzcashNumber: user?.bankDetails?.jazzcashNumber || '',
    });
    setProfileForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      profilePicture: user?.profilePicture || '',
    });

    // Fetch My Purchased Orders (Customer purchases & samples)
    setOrdersLoading(true);
    api.get('/orders/my')
      .then((res) => setMyPurchasedOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch my purchased orders:', err);
        setMyPurchasedOrders([]);
      })
      .finally(() => setOrdersLoading(false));

    // Fetch Catalog Products for Sample & Browse
    api.get('/products')
      .then((res) => setCatalogProducts(res.data?.products || (Array.isArray(res.data) ? res.data : [])))
      .catch(() => setCatalogProducts([]));

    if (user.role === 'donor' || user.role === 'customer' || user.role === 'admin') {
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
          try {
            const orderPromises = campaignsData.map(c => 
              api.get(`/orders/campaign/${c._id}`).catch(() => ({ data: [] }))
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
  // Customer Order Cancellation (within 48 Hours)
  // -------------------------
  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModal.order) return;

    setCancelModal(prev => ({ ...prev, submitting: true, error: '', success: '' }));
    try {
      const res = await api.put(`/orders/${cancelModal.order._id}/cancel`, {
        reason: cancelModal.reason,
      });

      setMyPurchasedOrders(prev =>
        prev.map(o => (o._id === cancelModal.order._id ? res.data.order || { ...o, orderStatus: 'cancelled', refundStatus: 'requested' } : o))
      );

      setCancelModal(prev => ({
        ...prev,
        submitting: false,
        success: 'Order cancelled successfully! Your refund request has been initiated.',
      }));

      setTimeout(() => {
        setCancelModal({ open: false, order: null, reason: '', submitting: false, error: '', success: '' });
      }, 1500);
    } catch (err) {
      setCancelModal(prev => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || 'Failed to cancel order. Please ensure the order is within 48 hours.',
      }));
    }
  };

  // -------------------------
  // Sample Product Request & Receipt
  // -------------------------
  const handleRequestSampleSubmit = async (e) => {
    e.preventDefault();
    if (!sampleModal.product) return;

    setSampleModal(prev => ({ ...prev, submitting: true, error: '', success: '' }));
    try {
      const res = await api.post('/orders/sample', {
        productId: sampleModal.product._id,
        campaignId: sampleModal.product.campaignId || sampleModal.product.campaign,
        size: sampleModal.size,
        color: sampleModal.color,
        notes: sampleModal.notes,
        shippingAddress: {
          fullName: user?.fullName || 'Customer',
          phone: user?.phone || '03001234567',
          line1: sampleModal.address || user?.address || 'Sample Delivery Address',
          city: 'Lahore',
          country: 'Pakistan',
        },
      });

      if (res.data?.order) {
        setMyPurchasedOrders(prev => [res.data.order, ...prev]);
      }

      setSampleModal(prev => ({
        ...prev,
        submitting: false,
        success: 'Sample request dispatched to production! Track updates in My Orders.',
      }));

      setTimeout(() => {
        setSampleModal({ open: false, product: null, size: 'M', color: 'Classic Black', address: '', notes: '', submitting: false, success: '', error: '' });
      }, 1500);
    } catch (err) {
      setSampleModal(prev => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || 'Failed to request sample.',
      }));
    }
  };

  const handleConfirmSampleReceived = (orderId) => {
    setMyPurchasedOrders(prev =>
      prev.map(o => (o._id === orderId ? { ...o, productionStatus: 'sample_approved', isSampleApproved: true, orderStatus: 'delivered' } : o))
    );
    alert('Sample receipt confirmed! You can now proceed with bulk ordering or merchandise promotion.');
  };

  // -------------------------
  // Bank Details Management
  // -------------------------
  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setBankSaving(true);
    setBankSuccess('');
    setBankError('');

    try {
      const res = await api.put('/auth/profile', {
        bankDetails: bankForm,
      });
      setUser(res.data);
      setBankSuccess('Bank and payout details updated and verified successfully!');
    } catch (err) {
      setBankError(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setBankSaving(false);
    }
  };

  // -------------------------
  // Store Sharing & Marketing Campaigns
  // -------------------------
  const storeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/store?ref=${user?.referralCode || user?._id || 'sayrab'}`;

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopied(true);
    setTimeout(() => setStoreLinkCopied(false), 2500);
  };

  const handleCreateMarketingCampaign = (e) => {
    e.preventDefault();
    const newCamp = {
      id: 'mkt-' + Date.now(),
      title: marketingForm.title,
      code: marketingForm.code.toUpperCase(),
      discount: `${marketingForm.discount}%`,
      channel: marketingForm.channel,
      status: 'Active',
      impressions: Math.floor(1200 + Math.random() * 3000),
      clicks: Math.floor(150 + Math.random() * 400),
      conversions: Math.floor(12 + Math.random() * 25),
      revenue: Math.floor(25000 + Math.random() * 50000),
      date: new Date().toISOString().split('T')[0],
    };
    setMarketingCampaignsList([newCamp, ...marketingCampaignsList]);
    alert(`Marketing Campaign "${marketingForm.title}" launched with Promo Code ${marketingForm.code.toUpperCase()}!`);
  };

  const handleLaunchAdSimulation = () => {
    setAdSimulator({ running: true, step: 1, stats: null });
    setTimeout(() => setAdSimulator(prev => ({ ...prev, step: 2 })), 1000);
    setTimeout(() => setAdSimulator(prev => ({ ...prev, step: 3 })), 2200);
    setTimeout(() => {
      setAdSimulator({
        running: false,
        step: 4,
        stats: {
          impressions: 24680,
          clicks: 1840,
          conversions: 89,
          revenue: 178000,
          roi: '4.8x',
        },
      });
    }, 3500);
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
          <div>
            <span className="font-bold text-white block leading-tight">Sayrab</span>
            <span className="text-[10px] text-primary-400 block font-semibold">
              {isManufacturer
                ? 'Manufacturer Portal'
                : isFundraiser
                ? 'Fundraiser'
                : user?.role === 'admin'
                ? 'Admin Portal'
                : 'Customer Portal'}
            </span>
          </div>
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
                <p className="text-xs text-primary-400 font-bold tracking-wide">
                  {isManufacturer
                    ? 'Manufacturer Portal'
                    : isFundraiser
                    ? 'Fundraiser'
                    : user?.role === 'admin'
                    ? 'Admin Portal'
                    : 'Customer Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {isManufacturer ? (
              /* Manufacturer Account Navigation */
              <>
                <button
                  onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'overview' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} /> Production Overview
                </button>
                <button
                  onClick={() => { setActiveTab('receive_techpack'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'receive_techpack' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileCode size={18} /> Receive Techpack
                </button>
                <button
                  onClick={() => { setActiveTab('produce_sample'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'produce_sample' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Layers size={18} /> Produce Sample
                </button>
                <button
                  onClick={() => { setActiveTab('delivery_tracking'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'delivery_tracking' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Truck size={18} /> Delivery & Tracking
                </button>
                <button
                  onClick={() => { setActiveTab('bulk_orders'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'bulk_orders' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Boxes size={18} /> Bulk Order Requests
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Settings size={18} /> Account Settings
                </button>
              </>
            ) : isFundraiser ? (
              /* Fundraiser Account Only Navigation */
              <>
                <button
                  onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'overview' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => { setActiveTab('browse_store'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'browse_store' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <StoreIcon size={18} /> Browse Store
                </button>
                <button
                  onClick={() => { setActiveTab('campaigns'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'campaigns' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Megaphone size={18} /> My Campaigns
                </button>
                <button
                  onClick={() => { setActiveTab('store_promotion'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'store_promotion' || activeTab === 'marketing' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Share2 size={18} /> Store & Promotion
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Settings size={18} /> Account Settings
                </button>
              </>
            ) : (
              /* Customer / General Account Navigation */
              <>
                <button
                  onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'overview' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={18} /> Overview & Sales
                </button>
                <button
                  onClick={() => { setActiveTab('browse_store'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'browse_store' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <StoreIcon size={18} /> Browse Store
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'orders' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShoppingBag size={18} /> My Orders & Tracking
                </button>
                <button
                  onClick={() => { setActiveTab('request_withdrawal'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'request_withdrawal' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <RefreshCw size={18} /> Request Withdrawal
                </button>
                <button
                  onClick={() => { setActiveTab('samples'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'samples' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Package size={18} /> Product Samples
                </button>
                <button
                  onClick={() => { setActiveTab('marketing'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'marketing' || activeTab === 'store_promotion' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Share2 size={18} /> Store & Marketing
                </button>
                <button
                  onClick={() => { setActiveTab('bank_details'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'bank_details' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Building2 size={18} /> Bank & Payout Info
                </button>
                <button
                  onClick={() => { setActiveTab('campaigns'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'campaigns' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Megaphone size={18} /> My Campaigns
                </button>
                {isManager && (
                  <>
                    <button
                      onClick={() => { setActiveTab('uploads'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === 'uploads' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <UploadCloud size={18} /> My Uploads
                    </button>
                    <button
                      onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === 'products' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <StoreIcon size={18} /> Make Techpacks
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-primary-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Settings size={18} /> Account Settings
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
              {user?.fullName?.charAt(0) || 'M'}
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
            <h1 className="text-3xl font-extrabold text-slate-900 capitalize">
              {activeTab === 'products'
                ? 'Make Techpacks'
                : activeTab === 'store_promotion'
                ? 'Store & Promotion'
                : activeTab === 'browse_store'
                ? 'Browse Merchandise Store'
                : activeTab === 'receive_techpack'
                ? 'Receive Techpack & Engineering Specs'
                : activeTab === 'produce_sample'
                ? 'Produce Sample Requests'
                : activeTab === 'delivery_tracking'
                ? 'Delivery of Sample & Product Tracking'
                : activeTab === 'bulk_orders'
                ? 'Bulk Order Requests (>5 Units)'
                : activeTab === 'bank_details'
                ? 'Bank & Payout Info'
                : activeTab === 'request_withdrawal'
                ? 'Request Withdrawal'
                : activeTab === 'overview' && isManufacturer
                ? 'Production Overview'
                : activeTab.replace('_', ' ')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isManufacturer
                ? 'Manufacturing & Factory Hub. Manage incoming techpacks, sample prototyping, tracking, and bulk runs.'
                : `Welcome back, ${user?.fullName}. Here is your account snapshot.`}
            </p>
          </div>
          {isFundraiser && (
            <button
              onClick={() => navigate('/create-campaign')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> New Campaign
            </button>
          )}
        </div>

        {/* ------------------------- */}
        {/* MANUFACTURER OVERVIEW     */}
        {/* ------------------------- */}
        {activeTab === 'overview' && isManufacturer && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FileCode size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Techpacks Received</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{mfgTechpacks.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Active Samples</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{mfgSamples.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Boxes size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Bulk Runs (&gt;5 Units)</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{mfgBulkOrders.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Total Units in Mfg</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {mfgBulkOrders.reduce((sum, b) => sum + b.totalUnits, 0) + mfgSamples.reduce((sum, s) => sum + s.units, 0)} pcs
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Coins size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Mfg Revenue (45%)</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatCurrency(mfgBulkOrders.reduce((sum, b) => sum + b.mfgPayout, 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Manufacturer Quick Overview Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Incoming Techpacks Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileCode size={18} className="text-blue-600" /> Incoming Techpack Specifications
                  </h3>
                  <button
                    onClick={() => setActiveTab('receive_techpack')}
                    className="text-xs font-bold text-primary-700 hover:text-primary-800"
                  >
                    View All Techpacks →
                  </button>
                </div>
                <div className="space-y-3">
                  {mfgTechpacks.map((tp) => (
                    <div key={tp.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {tp.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">{tp.organization}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{tp.title}</h4>
                        <p className="text-xs text-slate-500">{tp.fabric} · {tp.gsm} GSM · {tp.printTechnique}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          tp.status === 'accepted_by_manufacturer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tp.status === 'accepted_by_manufacturer' ? 'Accepted' : 'Pending Review'}
                        </span>
                        {tp.status !== 'accepted_by_manufacturer' && (
                          <button
                            onClick={() => handleAcceptTechpack(tp.id)}
                            className="px-3 py-1 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Prototyping Pipeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600" /> Pending Sample Runs
                  </h3>
                  <button
                    onClick={() => setActiveTab('produce_sample')}
                    className="text-xs font-bold text-primary-700 hover:text-primary-800"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {mfgSamples.slice(0, 3).map((smp) => (
                    <div key={smp.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          smp.requesterType === 'organization' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {smp.requesterType === 'organization' ? '🏢 Org Request' : '👤 Customer Request'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 capitalize">{smp.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{smp.productName} ({smp.size}, {smp.color})</p>
                      <p className="text-[11px] text-slate-500 truncate">{smp.requesterName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* CUSTOMER / FUNDRAISER OVERVIEW */}
        {/* ------------------------- */}
        {activeTab === 'overview' && !isManufacturer && (
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
        {/* BROWSE STORE TAB          */}
        {/* ------------------------- */}
        {activeTab === 'browse_store' && (
          <div className="space-y-8 animate-fade-in">
            {/* Dark Blue Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 border border-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
                  <StoreIcon size={14} /> Official Charity Merchandise Store
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  Browse & Order Verified Charity Merchandise
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  Support active welfare relief campaigns and community causes. 50% of all merchandise proceeds directly fund verified emergency relief, medical assistance, and education initiatives across Pakistan.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-400" /> 50% Direct Cause Funding
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Truck size={16} className="text-primary-300" /> TCS Express Tracked Delivery
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Award size={16} className="text-amber-400" /> Premium Fabric & Quality
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    placeholder="Search merchandise..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  />
                  {browseSearch && (
                    <button
                      onClick={() => setBrowseSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Direct Store Link & Cart status */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Link
                    to="/store"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Public Store Page <ExternalLink size={13} />
                  </Link>
                  <button
                    onClick={() => navigate('/cart')}
                    className="text-xs font-bold text-white bg-slate-900 hover:bg-primary-900 px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={14} /> My Cart ({cartCount})
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Filter:
                </span>
                {['All', 'Apparel', 'Headwear', 'Drinkware', 'Accessories', 'Special Relief'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBrowseCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      browseCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {catalogProducts.filter((p) => {
              const matchesCat = browseCategory === 'All' || (p.category && p.category.toLowerCase() === browseCategory.toLowerCase());
              const matchesSearch = !browseSearch || (
                (p.name && p.name.toLowerCase().includes(browseSearch.toLowerCase())) ||
                (p.description && p.description.toLowerCase().includes(browseSearch.toLowerCase())) ||
                (p.category && p.category.toLowerCase().includes(browseSearch.toLowerCase()))
              );
              return matchesCat && matchesSearch;
            }).length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <StoreIcon size={48} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-4">
                  No merchandise items match your selected category or search filter.
                </p>
                <button
                  onClick={() => { setBrowseCategory('All'); setBrowseSearch(''); }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalogProducts
                  .filter((p) => {
                    const matchesCat = browseCategory === 'All' || (p.category && p.category.toLowerCase() === browseCategory.toLowerCase());
                    const matchesSearch = !browseSearch || (
                      (p.name && p.name.toLowerCase().includes(browseSearch.toLowerCase())) ||
                      (p.description && p.description.toLowerCase().includes(browseSearch.toLowerCase())) ||
                      (p.category && p.category.toLowerCase().includes(browseSearch.toLowerCase()))
                    );
                    return matchesCat && matchesSearch;
                  })
                  .map((product, idx) => (
                    <div
                      key={product._id ? `${product._id}-${idx}` : idx}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:border-slate-400 transition-all duration-200 group"
                    >
                      <div>
                        {/* Image & Category Tag */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                          <img
                            src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/90 text-white backdrop-blur-xs text-[10px] font-bold rounded-md tracking-wide">
                            {product.category || 'Apparel'}
                          </span>
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md shadow-xs">
                            In Stock
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1 group-hover:text-primary-700 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {product.description || 'Official premium quality charity merchandise.'}
                        </p>
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Retail Price</span>
                            <span className="font-extrabold text-slate-900 text-base">{formatCurrency(product.price)}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            50% to Causes
                          </span>
                        </div>

                        <button
                          onClick={() => handleBrowseAddToCart(product)}
                          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Toast Notification */}
            {browseToast && (
              <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-bold">{browseToast}</span>
                <button
                  onClick={() => navigate('/cart')}
                  className="ml-2 text-xs font-bold text-primary-300 hover:text-white underline cursor-pointer"
                >
                  View Cart
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* RECEIVE TECHPACK TAB (Manufacturer) */}
        {/* ------------------------- */}
        {activeTab === 'receive_techpack' && isManufacturer && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 border border-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
                  <FileCode size={14} /> Integrated Sayrab Techpack Sync Channel
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  Receive & Inspect Techpacks
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  Incoming engineering techpacks created by fundraisers and verified organizations. Review Bill of Materials (BOM), stitch tolerance charts, vector graphic placements, and fabric composition prior to production acceptance.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Automated BOM Specs
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Sparkles size={15} className="text-primary-300" /> Ready for Sayrab System Integration
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mfgTechpackSearch}
                    onChange={(e) => setMfgTechpackSearch(e.target.value)}
                    placeholder="Search techpack code, category, org..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  />
                  {mfgTechpackSearch && (
                    <button onClick={() => setMfgTechpackSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  {['all', 'pending_review', 'bom_verified', 'accepted_by_manufacturer'].map((statusKey) => (
                    <button
                      key={statusKey}
                      onClick={() => setMfgTechpackFilter(statusKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                        mfgTechpackFilter === statusKey ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {statusKey.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Techpacks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mfgTechpacks
                .filter(tp => {
                  const matchStatus = mfgTechpackFilter === 'all' || tp.status === mfgTechpackFilter;
                  const matchSearch = !mfgTechpackSearch || (
                    tp.code.toLowerCase().includes(mfgTechpackSearch.toLowerCase()) ||
                    tp.title.toLowerCase().includes(mfgTechpackSearch.toLowerCase()) ||
                    tp.organization.toLowerCase().includes(mfgTechpackSearch.toLowerCase()) ||
                    tp.category.toLowerCase().includes(mfgTechpackSearch.toLowerCase())
                  );
                  return matchStatus && matchSearch;
                })
                .map((tp, idx) => (
                  <div key={tp.id ? `${tp.id}-${idx}` : idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
                              {tp.code}
                            </span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {tp.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base mt-2">{tp.title}</h3>
                          <p className="text-xs font-semibold text-slate-600">Client: {tp.organization} · Received {tp.dateReceived}</p>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          tp.status === 'accepted_by_manufacturer' ? 'bg-emerald-100 text-emerald-800' :
                          tp.status === 'bom_verified' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tp.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Fabric & Weight</span>
                          <span className="font-semibold text-slate-800">{tp.fabric} ({tp.gsm} GSM)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Print / Embroidery</span>
                          <span className="font-semibold text-slate-800">{tp.printTechnique}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Colorways</span>
                          <span className="font-semibold text-slate-800">{tp.colorways.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">BOM Components</span>
                          <span className="font-semibold text-slate-800">{tp.bomItemsCount} Verified Items</span>
                        </div>
                      </div>

                      {/* Techpack Measurement Tolerance Specifications */}
                      <div className="border border-slate-100 rounded-xl p-3 bg-white space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={13} className="text-primary-600" /> Measurement & Tolerance Specs:
                        </p>
                        <div className="text-xs text-slate-600 space-y-1">
                          {Object.entries(tp.specs).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-slate-50 pb-1">
                              <span className="capitalize font-medium text-slate-500">{key}:</span>
                              <span className="font-semibold text-slate-800 text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                      <button
                        onClick={() => alert(`Downloading full CAD/BOM vector spec pack for ${tp.code}...`)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} /> Download Spec Pack (ZIP)
                      </button>

                      {tp.status !== 'accepted_by_manufacturer' ? (
                        <button
                          onClick={() => handleAcceptTechpack(tp.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={14} /> Accept Techpack
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCheck size={16} /> Accepted for Production
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* PRODUCE SAMPLE TAB (Manufacturer) */}
        {/* ------------------------- */}
        {activeTab === 'produce_sample' && isManufacturer && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 border border-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
                  <Layers size={14} /> Physical Prototype Manufacturing
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  Produce Sample Requests
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  Produce and inspect 1-2 prototype sample units requested by <strong>Customers</strong> (for fabric and sizing evaluation) or <strong>Organizations</strong> (for executive campaign launch approval).
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Customer & Org Requests
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Truck size={15} className="text-primary-300" /> Direct TCS Dispatch Flow
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter size={12} /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'organization', label: '🏢 Organization Requests' },
                { id: 'customer', label: '👤 Customer Requests' },
                { id: 'fabric_cutting', label: 'Fabric Cutting' },
                { id: 'in_sampling', label: 'In Sampling' },
                { id: 'sampling_completed', label: 'Sampling Completed' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMfgSampleFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    mfgSampleFilter === f.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sample Requests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mfgSamples
                .filter(smp => {
                  if (mfgSampleFilter === 'all') return true;
                  if (mfgSampleFilter === 'organization') return smp.requesterType === 'organization';
                  if (mfgSampleFilter === 'customer') return smp.requesterType === 'customer';
                  return smp.status === mfgSampleFilter;
                })
                .map((smp, idx) => (
                  <div key={smp.id ? `${smp.id}-${idx}` : idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                            smp.requesterType === 'organization' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {smp.requesterType === 'organization' ? '🏢 Organization Request' : '👤 Customer Request'}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {smp.code}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{smp.requestDate}</span>
                      </div>

                      {/* Requester & Merchandise Info */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{smp.productName}</h3>
                        <p className="text-xs font-bold text-primary-700 mt-0.5">{smp.requesterName}</p>
                        <p className="text-xs text-slate-500 mt-1">Contact: {smp.contactPerson} · {smp.phone}</p>
                        <p className="text-xs text-slate-500">Shipping Address: {smp.address}</p>
                      </div>

                      {/* Sample Specs Box */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Size</span>
                          <span className="font-bold text-slate-800">{smp.size}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Color</span>
                          <span className="font-bold text-slate-800">{smp.color}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Sample Units</span>
                          <span className="font-bold text-slate-800">{smp.units} Prototype pc</span>
                        </div>
                      </div>

                      {/* Request Notes */}
                      <div className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                        <span className="font-bold text-amber-900 block text-[11px] mb-0.5">Requester Instructions:</span>
                        {smp.notes}
                      </div>

                      {/* Stepper Progress */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Manufacturing Phase:</span>
                          <span className="capitalize text-primary-700">{smp.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-900 h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: smp.status === 'queued' ? '25%'
                                : smp.status === 'fabric_cutting' ? '50%'
                                : smp.status === 'in_sampling' ? '75%'
                                : '100%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                      {smp.status !== 'sampling_completed' && smp.status !== 'dispatched' ? (
                        <button
                          onClick={() => handleAdvanceSampleStage(smp.id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw size={13} /> Advance Phase
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={16} /> Prototyping Finished
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setTrackingModal({
                            open: true,
                            type: 'sample',
                            item: smp,
                            carrier: 'TCS Express',
                            trackingNumber: `TCS-SMP-${Math.floor(100000 + Math.random() * 900000)}`,
                            status: 'in_transit',
                          });
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck size={14} /> Dispatch & Track Sample →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* DELIVERY OF SAMPLE & PRODUCT TRACKING TAB (Manufacturer) */}
        {/* ------------------------- */}
        {activeTab === 'delivery_tracking' && isManufacturer && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 border border-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
                  <Truck size={14} /> Courier Logistics & Dispatch Management
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  Sample & Product Delivery Tracking
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  Manage shipments, carrier logistics, and live TCS tracking codes for both <strong>Sample Requests</strong> (for Organizations & Customers) and <strong>Finished Product Deliveries</strong> (for Customers).
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Sample Tracking: Org & Customer
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Product Tracking: Customer Only
                  </span>
                </div>
              </div>
            </div>

            {/* Subtab Toggle Buttons */}
            <div className="flex border-b border-slate-200 gap-4">
              <button
                onClick={() => setMfgTrackingSubTab('sample_tracking')}
                className={`pb-3 text-sm font-bold capitalize transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                  mfgTrackingSubTab === 'sample_tracking' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers size={16} /> Sample Tracking (Org & Customer)
              </button>
              <button
                onClick={() => setMfgTrackingSubTab('product_tracking')}
                className={`pb-3 text-sm font-bold capitalize transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                  mfgTrackingSubTab === 'product_tracking' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag size={16} /> Product Delivery Tracking (Customer Only)
              </button>
            </div>

            {/* Subtab 1: Sample Tracking (Org & Customer) */}
            {mfgTrackingSubTab === 'sample_tracking' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sample Dispatches (Organization & Customer)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Dispatched physical samples under courier tracking</p>
                  </div>
                  <button
                    onClick={() => {
                      setTrackingModal({
                        open: true,
                        type: 'sample',
                        item: mfgSamples[0] || { code: 'SMP-CUSTOM', requesterName: 'New Request', requesterType: 'organization', address: 'Custom Address', productName: 'Sample Item', units: 1 },
                        carrier: 'TCS Express',
                        trackingNumber: `TCS-SMP-${Math.floor(100000 + Math.random() * 900000)}`,
                        status: 'in_transit',
                      });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} /> Add Sample Dispatch Tracking
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mfgSampleTracking.map((trk, idx) => (
                    <div key={trk.id ? `${trk.id}-${idx}` : idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                            trk.requesterType === 'organization' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {trk.requesterType === 'organization' ? '🏢 Org Sample' : '👤 Customer Sample'}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1.5">{trk.item}</h4>
                          <p className="text-xs text-slate-500">{trk.recipient}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                          trk.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {trk.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Courier</span>
                          <span className="font-bold text-slate-800">{trk.carrier}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tracking No.</span>
                          <span className="font-mono font-bold text-primary-700">{trk.trackingNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispatched Date</span>
                          <span className="font-semibold text-slate-700">{trk.dispatchDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Delivery</span>
                          <span className="font-semibold text-slate-700">{trk.eta}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setMfgSampleTracking(prev => prev.map(item => item.id === trk.id ? { ...item, status: item.status === 'delivered' ? 'in_transit' : 'delivered' } : item));
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Toggle Status ({trk.status === 'delivered' ? 'Mark In Transit' : 'Mark Delivered'})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 2: Product Delivery Tracking (Customer Only) */}
            {mfgTrackingSubTab === 'product_tracking' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Finished Product Deliveries (Customer Only)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Individual merchandise product orders dispatched to retail customer doorsteps</p>
                  </div>
                  <button
                    onClick={() => {
                      setTrackingModal({
                        open: true,
                        type: 'product',
                        item: { orderId: 'ORD-' + Math.floor(10000 + Math.random() * 90000), customerName: 'Customer Recipient', address: 'Lahore, Pakistan', items: '2x Merchandise Tees' },
                        carrier: 'TCS Express',
                        trackingNumber: `TCS-PRD-${Math.floor(100000 + Math.random() * 900000)}`,
                        status: 'in_transit',
                      });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} /> Add Customer Product Tracking
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mfgProductTracking.map((prd, idx) => (
                    <div key={prd.id ? `${prd.id}-${idx}` : idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                              {prd.orderId}
                            </span>
                            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              Customer Order
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mt-1.5">{prd.items}</h4>
                          <p className="text-xs text-slate-500">Recipient: {prd.customerName} ({prd.customerPhone})</p>
                          <p className="text-xs text-slate-500">{prd.address}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                          prd.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {prd.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Courier</span>
                          <span className="font-bold text-slate-800">{prd.carrier}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tracking No.</span>
                          <span className="font-mono font-bold text-primary-700">{prd.trackingNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispatch Date</span>
                          <span className="font-semibold text-slate-700">{prd.dispatchDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Value</span>
                          <span className="font-bold text-slate-900">{formatCurrency(prd.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setMfgProductTracking(prev => prev.map(item => item.id === prd.id ? { ...item, status: item.status === 'delivered' ? 'in_transit' : 'delivered' } : item));
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Toggle Status ({prd.status === 'delivered' ? 'Mark In Transit' : 'Mark Delivered'})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* BULK ORDER REQUESTS TAB (Manufacturer - Orders > 5 Units) */}
        {/* ------------------------- */}
        {activeTab === 'bulk_orders' && isManufacturer && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary-200 border border-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
                  <Boxes size={14} /> High-Volume Production Pipeline
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  Bulk Order Requests (5+ Units)
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  Dedicated high-volume production queue for orders exceeding 5 units. Manage industrial cutting, high-speed automated screen printing, bulk quality assurance, pallet packaging, and freight courier dispatch.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Orders &gt; 5 Units Only
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Coins size={15} className="text-amber-400" /> 45% Manufacturer Payout Share
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter size={12} /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Bulk Orders (>5)' },
                { id: 'fabric_sourcing', label: 'Fabric Sourcing' },
                { id: 'in_production', label: 'In High-Speed Production' },
                { id: 'qc_passed', label: 'QC Passed & Polybagged' },
                { id: 'pallet_dispatched', label: 'Pallet Dispatched' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMfgBulkFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    mfgBulkFilter === f.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bulk Orders List */}
            <div className="space-y-6">
              {mfgBulkOrders
                .filter(blk => mfgBulkFilter === 'all' || blk.status === mfgBulkFilter)
                .map((blk, idx) => (
                  <div key={blk.id ? `${blk.id}-${idx}` : idx} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-white bg-slate-900 px-3 py-1 rounded-md shadow-xs">
                            {blk.orderCode}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            Bulk Order ({blk.totalUnits} Units)
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mt-2">{blk.item}</h3>
                        <p className="text-xs text-slate-600">Client: <strong>{blk.clientName}</strong> · Campaign: {blk.campaign}</p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-1">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          blk.status === 'pallet_dispatched' ? 'bg-purple-100 text-purple-800' :
                          blk.status === 'qc_passed' ? 'bg-emerald-100 text-emerald-800' :
                          blk.status === 'in_production' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {blk.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Target: {blk.targetCompletion}</span>
                      </div>
                    </div>

                    {/* Breakdown & Financials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Batch Units</span>
                        <span className="font-extrabold text-slate-900 text-lg">{blk.totalUnits} pcs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Size Breakdown</span>
                        <span className="font-bold text-slate-700 text-xs">
                          {Object.entries(blk.breakdown).map(([sz, qty]) => `${sz}:${qty}`).join(' · ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch Retail Value</span>
                        <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(blk.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Mfg Payout Share (45%)</span>
                        <span className="font-black text-emerald-700 text-base">{formatCurrency(blk.mfgPayout)}</span>
                      </div>
                    </div>

                    {/* Production Stage Stepper */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Production Progress Stepper:</span>
                        <span className="text-primary-700 font-bold capitalize">{blk.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: blk.status === 'queued' ? '20%'
                              : blk.status === 'fabric_sourcing' ? '40%'
                              : blk.status === 'in_production' ? '65%'
                              : blk.status === 'qc_passed' ? '85%'
                              : '100%',
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Tracking & Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold">Freight Cargo Code:</span>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          {blk.trackingNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Generated Bulk Cargo Packing Slip & Invoice for ${blk.orderCode}`)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Download Packing Slip
                        </button>
                        {blk.status !== 'pallet_dispatched' && (
                          <button
                            onClick={() => handleAdvanceBulkStage(blk.id)}
                            className="px-4 py-2 bg-slate-900 hover:bg-primary-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw size={14} /> Advance Bulk Phase
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* TRACKING MODAL            */}
        {/* ------------------------- */}
        {trackingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" /> Dispatch & Update Tracking
                </h3>
                <button
                  onClick={() => setTrackingModal({ ...trackingModal, open: false })}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTrackingModal} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Courier Service Partner
                  </label>
                  <select
                    value={trackingModal.carrier}
                    onChange={(e) => setTrackingModal({ ...trackingModal, carrier: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="TCS Express">TCS Express Tracked</option>
                    <option value="Leopard Courier">Leopard Courier</option>
                    <option value="M&P Express">M&P Express Logistics</option>
                    <option value="PostEx">PostEx Express</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Tracking Consignment Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingModal.trackingNumber}
                    onChange={(e) => setTrackingModal({ ...trackingModal, trackingNumber: e.target.value })}
                    placeholder="e.g. TCS-SMP-998241"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Shipment Status
                  </label>
                  <select
                    value={trackingModal.status}
                    onChange={(e) => setTrackingModal({ ...trackingModal, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="dispatched">Dispatched from Factory</option>
                    <option value="in_transit">In Transit (Courier Hub)</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered & Verified</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTrackingModal({ ...trackingModal, open: false })}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-primary-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Save & Dispatch
                  </button>
                </div>
              </form>
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
        {/* MAKE TECHPACKS TAB        */}
        {/* ------------------------- */}
        {activeTab === 'products' && isManager && (
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
        {/* ------------------------- */}
        {/* MY ORDERS & TRACKING TAB  */}
        {/* ------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Sub-tab navigation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Orders & Shipment Tracking</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Track live courier status for your purchased merchandise, receive samples, or cancel orders within the 48-hour withdrawal window.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setOrderSubTab('my_purchases')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    orderSubTab === 'my_purchases'
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Purchases ({myPurchasedOrders.length})
                </button>
                <button
                  onClick={() => setOrderSubTab('campaign_fulfillment')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    orderSubTab === 'campaign_fulfillment'
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Merchandise Sales ({campaignOrders.length})
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: My Purchases & Live Tracking */}
            {orderSubTab === 'my_purchases' && (
              <div className="space-y-6">
                {ordersLoading ? (
                  <div className="py-16 flex justify-center items-center bg-white rounded-2xl border border-slate-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : myPurchasedOrders.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
                    <ShoppingBag size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">No purchased orders yet</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">
                      Browse available charity products and place your first order or sample request.
                    </p>
                    <Link
                      to="/store"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all"
                    >
                      Visit Product Store <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPurchasedOrders.map((order) => {
                      const orderDate = new Date(order.createdAt);
                      const hoursElapsed = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                      const isWithin48Hours = hoursElapsed <= 48;
                      const isCancelled = order.orderStatus === 'cancelled';
                      const isSample = order.isSample || order.notes?.includes('Sample');

                      const trackingSteps = [
                        { key: 'queued', label: 'Queued' },
                        { key: 'in_production', label: 'Production' },
                        { key: 'quality_check', label: 'QC Passed' },
                        { key: 'shipped', label: 'Shipped' },
                        { key: 'delivered', label: 'Delivered' },
                      ];

                      const currentStepIndex =
                        order.productionStatus === 'delivered' || order.isSampleApproved ? 4 :
                        order.productionStatus === 'shipped' ? 3 :
                        order.productionStatus === 'quality_check' ? 2 :
                        order.productionStatus === 'in_production' ? 1 : 0;

                      return (
                        <div
                          key={order._id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary-50 text-primary-700 rounded-xl font-mono text-xs font-bold">
                                #{order._id.substring(0, 8).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-800">
                                    Placed on {formatDate(order.createdAt)}
                                  </p>
                                  {isSample && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-extrabold uppercase">
                                      Product Sample
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">
                                  Payment: <span className="font-semibold text-slate-600 uppercase">{order.paymentMethod || 'Card / Online'}</span> · Total: <span className="font-bold text-slate-800">{formatCurrency(order.total)}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCancelled ? (
                                <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                  <AlertTriangle size={14} /> Cancelled ({order.refundStatus || 'Refund Requested'})
                                </span>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  order.productionStatus === 'delivered'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : order.productionStatus === 'shipped'
                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                    : 'bg-blue-50 border-blue-200 text-blue-700'
                                }`}>
                                  Status: {order.productionStatus?.replace('_', ' ').toUpperCase() || 'IN PROGRESS'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Items Purchased */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</p>
                              {order.products?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                                    <span className="font-semibold text-slate-800">{item.name}</span>
                                    {item.size && <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{item.size}</span>}
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {item.quantity} x {formatCurrency(item.price)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Tracking & Courier Info */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Truck size={14} className="text-primary-600" /> Courier & Delivery Tracking
                              </p>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500">Courier Partner:</span>
                                <span className="font-bold text-slate-800">{order.courier || 'TCS Express Logistics'}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500">Tracking Number:</span>
                                <span className="font-mono font-bold text-primary-700">{order.trackingNumber || `TCS-${order._id.substring(0, 10).toUpperCase()}`}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Shipping To:</span>
                                <span className="text-slate-700 font-medium truncate max-w-[200px]">
                                  {order.shippingAddress?.fullName || 'Customer'}, {order.shippingAddress?.city || 'Pakistan'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Live Visual Tracker Bar */}
                          {!isCancelled && (
                            <div className="py-3 px-4 bg-slate-50/70 rounded-xl border border-slate-100 mb-4">
                              <div className="flex justify-between items-center mb-2">
                                {trackingSteps.map((step, sIdx) => (
                                  <div key={step.key} className="flex flex-col items-center flex-1 text-center">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                                        sIdx <= currentStepIndex
                                          ? 'bg-primary-600 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {sIdx < currentStepIndex ? <Check size={12} /> : sIdx + 1}
                                    </div>
                                    <span className={`text-[10px] font-semibold ${sIdx <= currentStepIndex ? 'text-primary-900 font-bold' : 'text-slate-400'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-primary-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${((currentStepIndex + 1) / trackingSteps.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Action Bar (Sample confirmation / 48-Hour Cancellation) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              {isCancelled ? (
                                <span className="text-red-600 font-semibold">Order cancelled and refund processing.</span>
                              ) : isWithin48Hours ? (
                                <span className="text-emerald-700 font-semibold">
                                  Withdrawal window open ({Math.round(48 - hoursElapsed)}h remaining to cancel).
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  48h withdrawal window closed. Order is in production.
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Sample received confirmation */}
                              {isSample && !isCancelled && order.productionStatus !== 'sample_approved' && (
                                <button
                                  onClick={() => handleConfirmSampleReceived(order._id)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCircle size={14} /> Confirm Sample Received
                                </button>
                              )}

                              {/* 48-Hour Cancellation Request Button */}
                              {!isCancelled && order.productionStatus !== 'delivered' && (
                                <button
                                  onClick={() => isWithin48Hours && setCancelModal({ open: true, order, reason: 'Changed mind before production dispatch', submitting: false, error: '', success: '' })}
                                  disabled={!isWithin48Hours}
                                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                                    isWithin48Hours
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                  }`}
                                  title={isWithin48Hours ? 'Cancel and request full refund within 48h' : '48h Cancellation window expired'}
                                >
                                  <RefreshCw size={12} /> Withdraw / Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Fundraiser Merchandise Orders Fulfillment */}
            {orderSubTab === 'campaign_fulfillment' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Merchandise Sales Fulfillment</h4>
                    <p className="text-slate-500 text-xs mt-1">
                      Manage fulfillment and track manufacturing status for merchandise sold via your campaigns.
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
                    <h3 className="text-lg font-bold text-slate-700">No merchandise sales found</h3>
                    <p className="text-slate-500 text-sm mt-1">Once buyers purchase your campaign products, their orders will appear here.</p>
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
            )}
          </div>
        )}

        {/* ------------------------- */}
        {/* REQUEST WITHDRAWAL TAB    */}
        {/* ------------------------- */}
        {activeTab === 'request_withdrawal' && (
          <div className="space-y-8 animate-fade-in">
            {/* 2-Day Policy Guarantee Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-primary-300 mb-3 backdrop-blur-xs border border-white/10">
                  <RefreshCw size={14} className="animate-spin-slow" /> Official 2-Day Order Withdrawal Guarantee
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2">Request Order Withdrawal & 100% Refund</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Sayrab empowers customers with a dedicated 2-day (48-hour) withdrawal guarantee. You can cancel and withdraw any placed merchandise order within 48 hours of purchase before factory dispatch. 100% full refund is credited back to your bank account or mobile wallet.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-primary-200">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> 48-Hour Withdrawal Window</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> 100% Full Refund Guarantee</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> Direct Bank & Mobile Wallet Payout</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Total Placed Orders</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">{myPurchasedOrders.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Eligible to Withdraw (Within 48h)</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                    {myPurchasedOrders.filter(o => {
                      const elapsed = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
                      return elapsed <= 48 && o.orderStatus !== 'cancelled';
                    }).length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Withdrawn / Refund Requests</p>
                  <p className="text-xl font-extrabold text-amber-600 mt-0.5">
                    {myPurchasedOrders.filter(o => o.orderStatus === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Placed Orders Withdrawal List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h4 className="text-lg font-bold text-slate-900">Your Placed Orders</h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Select any order placed within the last 2 days to initiate an immediate withdrawal and refund.
                </p>
              </div>

              {ordersLoading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : myPurchasedOrders.length === 0 ? (
                <div className="py-12 text-center max-w-md mx-auto">
                  <ShoppingBag size={48} className="text-slate-300 mx-auto mb-3" />
                  <h5 className="font-bold text-slate-700 text-base">No orders placed yet</h5>
                  <p className="text-slate-500 text-xs mt-1 mb-5">
                    When you purchase products or order samples from the store, they will be listed here with 2-day withdrawal eligibility.
                  </p>
                  <Link
                    to="/store"
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                  >
                    Visit Store <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPurchasedOrders.map((order) => {
                    const orderDate = new Date(order.createdAt);
                    const hoursElapsed = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                    const isWithin48Hours = hoursElapsed <= 48;
                    const isCancelled = order.orderStatus === 'cancelled';
                    const remainingHours = Math.max(0, Math.round(48 - hoursElapsed));

                    return (
                      <div
                        key={order._id}
                        className={`rounded-2xl border p-5 transition-all ${
                          isCancelled
                            ? 'bg-slate-50/70 border-slate-200'
                            : isWithin48Hours
                            ? 'bg-white border-emerald-200 shadow-xs hover:shadow-md'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
                              #{order._id.substring(0, 10).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">
                              Placed on {formatDate(order.createdAt)}
                            </span>
                          </div>

                          <div>
                            {isCancelled ? (
                              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <AlertTriangle size={13} /> Order Withdrawn · Refund Requested
                              </span>
                            ) : isWithin48Hours ? (
                              <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                                <Clock size={13} className="text-emerald-600" />
                                Withdrawal Window Open: {remainingHours}h remaining
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-xs font-semibold">
                                🔒 2-Day Withdrawal Window Expired
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="md:col-span-2 space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ordered Products</p>
                            {order.products?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                                  <span className="font-semibold text-slate-800">{item.name}</span>
                                  {item.size && <span className="bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-600 font-mono">{item.size}</span>}
                                  {item.color && (
                                    <span
                                      className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300 align-middle"
                                      style={{ backgroundColor: item.color }}
                                      title={item.color}
                                    />
                                  )}
                                </div>
                                <span className="text-slate-500 font-medium">
                                  {item.quantity} x {formatCurrency(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between text-xs">
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Financial & Courier Info</p>
                              <div className="flex justify-between py-0.5">
                                <span className="text-slate-500">Total Paid:</span>
                                <span className="font-extrabold text-slate-900">{formatCurrency(order.total)}</span>
                              </div>
                              <div className="flex justify-between py-0.5">
                                <span className="text-slate-500">Method:</span>
                                <span className="font-semibold text-slate-700 uppercase">{order.paymentMethod || 'Online'}</span>
                              </div>
                              <div className="flex justify-between py-0.5">
                                <span className="text-slate-500">Courier:</span>
                                <span className="font-semibold text-slate-700">{order.courier || 'TCS Express'}</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                              Tracking: <span className="font-mono font-bold text-primary-700">{order.trackingNumber || `TCS-${order._id.substring(0, 8).toUpperCase()}`}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500">
                            {isCancelled ? (
                              <span className="text-slate-600">Cancellation recorded on {formatDate(order.updatedAt || order.createdAt)}. Payout scheduled.</span>
                            ) : isWithin48Hours ? (
                              <span className="text-emerald-700 font-semibold">
                                ✓ Eligible for 100% instant refund before cutting and factory manufacturing.
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Dispatched to factory manufacturing queue. Withdrawal window has ended.
                              </span>
                            )}
                          </p>

                          <div>
                            {!isCancelled && order.productionStatus !== 'delivered' && (
                              <button
                                onClick={() => isWithin48Hours && setCancelModal({
                                  open: true,
                                  order,
                                  reason: 'Changed mind before production dispatch',
                                  submitting: false,
                                  error: '',
                                  success: '',
                                })}
                                disabled={!isWithin48Hours}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isWithin48Hours
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <RefreshCw size={13} />
                                {isWithin48Hours ? 'Request Order Withdrawal (Within 2 Days)' : '2-Day Window Expired'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* PRODUCT SAMPLES TAB       */}
        {/* ------------------------- */}
        {activeTab === 'samples' && (
          <div className="space-y-8 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-primary-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-primary-200 mb-3 backdrop-blur-xs">
                  <Package size={14} /> Official Physical Sample Program
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2">Request & Evaluate Product Samples</h3>
                <p className="text-slate-200 text-sm leading-relaxed mb-6">
                  Review fabric quality, print vibrancy, and stitching standards before launching merchandise marketing campaigns. All samples are manufactured on-demand and delivered directly to your doorstep with express TCS tracking.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-primary-200">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> Free Quality Evaluation</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> TCS Express 3-Day Shipping</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> 100% Cotton & Premium Poly</span>
                </div>
              </div>
            </div>

            {/* Active Sample Requests in Progress */}
            {myPurchasedOrders.some(o => o.isSample || o.notes?.includes('Sample')) && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" /> My Requested Samples & Verification
                </h4>
                <div className="space-y-3">
                  {myPurchasedOrders.filter(o => o.isSample || o.notes?.includes('Sample')).map(sample => (
                    <div key={sample._id} className="p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {sample.products?.[0]?.name || 'Apparel Sample'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          TCS Tracking: <span className="font-mono font-bold text-primary-700">{sample.trackingNumber || `TCS-${sample._id.substring(0, 8)}`}</span> · Status: <span className="font-semibold text-slate-700 capitalize">{sample.productionStatus || 'In Transit'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sample.productionStatus === 'sample_approved' ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1">
                            <CheckCircle size={14} /> Sample Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmSampleReceived(sample._id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} /> Confirm Sample Received
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catalog Grid for Sample Request */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Browse Products for Sample Ordering</h4>
                  <p className="text-slate-500 text-xs mt-1">Select any merchandise item to request an expedited physical sample.</p>
                </div>
                <Link
                  to="/store"
                  className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
                >
                  Visit Full Store <ExternalLink size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {catalogProducts.slice(0, 8).map((product, idx) => (
                  <div
                    key={product._id ? `${product._id}-${idx}` : idx}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-primary-800 rounded-md">
                          {product.category || 'Apparel'}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1">{product.name}</h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description || 'Premium charity collection merchandise item.'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Retail Price</span>
                        <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(product.price)}</span>
                      </div>
                      <button
                        onClick={() => setSampleModal({
                          open: true,
                          product,
                          size: 'M',
                          color: 'Classic Black',
                          address: user?.address || '',
                          notes: `Sample request for ${product.name}`,
                          submitting: false,
                          success: '',
                          error: '',
                        })}
                        className="px-3 py-2 bg-primary-50 hover:bg-primary-600 hover:text-white text-primary-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Package size={14} /> Request Sample
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* STORE & PROMOTION TAB     */}
        {/* ------------------------- */}
        {(activeTab === 'marketing' || activeTab === 'store_promotion') && (
          <div className="space-y-8 animate-fade-in">
            {/* Receive & Share Store Link Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Share2 size={20} />
                    <h3 className="text-xl font-bold text-slate-900">Receive & Share Your Store Link</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} /> Store Link Connected to Your Account
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  Receive and distribute your official merchandise store link across your donor networks and social communities. Every sale directly raises charitable funds for your verified campaigns.
                </p>

                {/* Link input with copy & refresh button */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-6">
                  <div className="flex-1 flex items-center border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 font-mono text-xs text-slate-700 overflow-hidden">
                    <span className="truncate">{storeUrl}</span>
                  </div>
                  <button
                    onClick={handleCopyStoreLink}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      storeLinkCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                    }`}
                  >
                    {storeLinkCopied ? (
                      <>
                        <Check size={14} /> Store Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Store Link
                      </>
                    )}
                  </button>
                </div>

                {/* Direct 1-Click Social Sharing */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1-Click Social Share</p>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Support our cause by purchasing official charity merchandise at Sayrab: ${storeUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={14} className="text-emerald-600" /> Share on WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Support our community cause! Browse official charity merchandise:`)}&url=${encodeURIComponent(storeUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Share2 size={14} className="text-sky-600" /> Twitter / X Blast
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink size={14} className="text-indigo-600" /> Facebook Post
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Promote Active Campaigns Section */}
            {campaigns.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-primary-700 mb-2">
                  <Megaphone size={20} />
                  <h3 className="text-xl font-bold text-slate-900">Promote Your Active Campaigns</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  Share direct campaign donation links and launch promotional outreach for your active initiatives.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaigns.map((camp) => {
                    const campUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${camp.slug || camp._id}`;
                    return (
                      <div key={camp._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary-100 text-primary-800 rounded">
                              {camp.category}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">{formatCurrency(camp.amountRaised || 0)} raised</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1">{camp.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{camp.shortDescription || 'Support this urgent cause.'}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campUrl);
                              alert('Campaign donation link copied to clipboard!');
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Copy size={12} /> Copy Link
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Please support our campaign "${camp.title}": ${campUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Send size={12} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Run Marketing Campaigns Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Campaign Creator Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Tag size={18} className="text-primary-600" /> Launch Promo Campaign
                </h4>
                <p className="text-slate-500 text-xs mb-4">
                  Create discount codes and promotional boosts for your merchandise store.
                </p>

                <form onSubmit={handleCreateMarketingCampaign} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={marketingForm.title}
                      onChange={(e) => setMarketingForm({ ...marketingForm, title: e.target.value })}
                      placeholder="e.g. Ramadan Special Merch"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promo Code</label>
                      <input
                        type="text"
                        required
                        value={marketingForm.code}
                        onChange={(e) => setMarketingForm({ ...marketingForm, code: e.target.value.toUpperCase() })}
                        placeholder="CARE15"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount %</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={marketingForm.discount}
                        onChange={(e) => setMarketingForm({ ...marketingForm, discount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marketing Channel</label>
                    <select
                      value={marketingForm.channel}
                      onChange={(e) => setMarketingForm({ ...marketingForm, channel: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Instagram & Facebook Ads">Instagram & Facebook Ads</option>
                      <option value="WhatsApp & Community Groups">WhatsApp & Community Groups</option>
                      <option value="Email Newsletter Blast">Email Newsletter Blast</option>
                      <option value="Influencer Collaboration">Influencer Collaboration</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Launch Promo Campaign
                  </button>
                </form>
              </div>

              {/* Marketing Campaigns Performance Table & Ad Simulator */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Campaigns Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-slate-900">Marketing Campaign Performance</h4>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Live Tracking
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                          <th className="pb-3">Campaign & Code</th>
                          <th className="pb-3">Channel</th>
                          <th className="pb-3 text-right">Reach</th>
                          <th className="pb-3 text-right">Orders</th>
                          <th className="pb-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marketingCampaignsList.map((camp) => (
                          <tr key={camp.id} className="hover:bg-slate-50/50">
                            <td className="py-3">
                              <p className="font-bold text-slate-800">{camp.title}</p>
                              <span className="font-mono text-primary-700 font-bold bg-primary-50 px-1.5 py-0.5 rounded text-[10px]">
                                {camp.code} ({camp.discount})
                              </span>
                            </td>
                            <td className="py-3 text-slate-600">{camp.channel}</td>
                            <td className="py-3 text-right font-medium text-slate-700">
                              {camp.impressions.toLocaleString()} views
                            </td>
                            <td className="py-3 text-right font-bold text-slate-800">{camp.conversions}</td>
                            <td className="py-3 text-right font-extrabold text-emerald-600">
                              {formatCurrency(camp.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ad Blast Simulator */}
                <div className="bg-gradient-to-r from-slate-900 to-primary-950 p-6 rounded-2xl text-white shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-base flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400" /> Interactive Social Media Ad Blast
                      </h5>
                      <p className="text-slate-300 text-xs mt-1">
                        Simulate targeted automated donor outreach and calculate conversion metrics.
                      </p>
                    </div>
                    <button
                      onClick={handleLaunchAdSimulation}
                      disabled={adSimulator.running}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                    >
                      {adSimulator.running ? 'Running Blast...' : 'Run Ad Simulation'}
                    </button>
                  </div>

                  {adSimulator.running && (
                    <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-xs text-xs space-y-2 border border-white/10 animate-fade-in">
                      {adSimulator.step >= 1 && <p className="text-amber-300 font-bold">✓ Step 1: Generating targeted audience segmentation...</p>}
                      {adSimulator.step >= 2 && <p className="text-sky-300 font-bold">✓ Step 2: Distributing sponsored merchandise ad placements...</p>}
                      {adSimulator.step >= 3 && (
                        <p className="text-emerald-400 font-extrabold">
                          ✓ Completed: Projected +3,450 Impressions and ~24 New Product Sales!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* BANK DETAILS & PAYOUT TAB */}
        {/* ------------------------- */}
        {activeTab === 'bank_details' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="p-3 bg-primary-50 text-primary-700 rounded-xl">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bank & Payout Details</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Configure your verified Pakistani bank account or mobile wallet for transparent campaign disbursements and order refunds.
                  </p>
                </div>
              </div>

              {bankSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                  <CheckCircle size={16} /> {bankSuccess}
                </div>
              )}
              {bankError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle size={16} /> {bankError}
                </div>
              )}

              <form onSubmit={handleSaveBankDetails} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Holder Full Name</label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bank Name</label>
                    <select
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                    >
                      <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                      <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                      <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                      <option value="MCB Bank Ltd">MCB Bank Ltd</option>
                      <option value="Allied Bank Limited">Allied Bank Limited</option>
                      <option value="Bank Alfalah">Bank Alfalah</option>
                      <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                      <option value="Faysal Bank">Faysal Bank</option>
                      <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      placeholder="010101020202"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">IBAN (24 Characters)</label>
                    <input
                      type="text"
                      required
                      value={bankForm.iban}
                      onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })}
                      placeholder="PK36MEZN0001010102020202"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mobile Wallets (EasyPaisa / JazzCash)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">EasyPaisa Account Number</label>
                      <input
                        type="text"
                        value={bankForm.easypaisaNumber}
                        onChange={(e) => setBankForm({ ...bankForm, easypaisaNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="03001234567"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">JazzCash Account Number</label>
                      <input
                        type="text"
                        value={bankForm.jazzcashNumber}
                        onChange={(e) => setBankForm({ ...bankForm, jazzcashNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="03007654321"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <Info size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                  <p>
                    All withdrawals and 48-hour order cancellation refunds will be remitted to this account via 1-Link IBFT / RAAST. Ensure IBAN matches the CNIC name provided during verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={bankSaving}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {bankSaving ? 'Saving & Verifying...' : 'Save & Verify Bank Details'}
                </button>
              </form>
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

        {/* ------------------------- */}
        {/* MODAL: ORDER WITHDRAWAL   */}
        {/* ------------------------- */}
        {cancelModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                  <AlertTriangle size={20} /> Withdraw / Cancel Order
                </div>
                <button
                  onClick={() => setCancelModal({ open: false, order: null, reason: '', submitting: false, error: '', success: '' })}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {cancelModal.success ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">Order Cancellation Confirmed</h4>
                  <p className="text-slate-600 text-xs">{cancelModal.success}</p>
                </div>
              ) : (
                <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
                  {cancelModal.error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">
                      {cancelModal.error}
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 space-y-1">
                    <p><span className="font-bold">Order ID:</span> #{cancelModal.order?._id}</p>
                    <p><span className="font-bold">Total Amount:</span> {formatCurrency(cancelModal.order?.total)}</p>
                    <p><span className="font-bold">Policy:</span> 100% Refund guaranteed within 48 hours before factory cutting.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Withdrawal</label>
                    <select
                      value={cancelModal.reason}
                      onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Changed mind before production dispatch">Changed mind before production dispatch</option>
                      <option value="Ordered wrong size or product variant">Ordered wrong size or product variant</option>
                      <option value="Delivery timeline or address change">Delivery timeline or address change</option>
                      <option value="Other customer request">Other customer request</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCancelModal({ open: false, order: null, reason: '', submitting: false, error: '', success: '' })}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Keep Order
                    </button>
                    <button
                      type="submit"
                      disabled={cancelModal.submitting}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {cancelModal.submitting ? 'Processing...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ------------------------- */}
        {/* MODAL: REQUEST SAMPLE     */}
        {/* ------------------------- */}
        {sampleModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-primary-700 font-bold text-lg">
                  <Package size={20} /> Request Physical Product Sample
                </div>
                <button
                  onClick={() => setSampleModal({ open: false, product: null, size: 'M', color: 'Classic Black', address: '', notes: '', submitting: false, success: '', error: '' })}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {sampleModal.success ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">Sample Dispatched to Production!</h4>
                  <p className="text-slate-600 text-xs">{sampleModal.success}</p>
                </div>
              ) : (
                <form onSubmit={handleRequestSampleSubmit} className="space-y-4">
                  {sampleModal.error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">
                      {sampleModal.error}
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <img
                      src={sampleModal.product?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200'}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-white"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{sampleModal.product?.name}</p>
                      <p className="text-xs text-primary-700 font-semibold">{sampleModal.product?.category} · Sample Order</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Size</label>
                      <select
                        value={sampleModal.size}
                        onChange={(e) => setSampleModal(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color Variant</label>
                      <select
                        value={sampleModal.color}
                        onChange={(e) => setSampleModal(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Classic Black">Classic Black</option>
                        <option value="White">White</option>
                        <option value="Navy Blue">Navy Blue</option>
                        <option value="Charcoal Grey">Charcoal Grey</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={sampleModal.address}
                      onChange={(e) => setSampleModal(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full delivery address in Pakistan"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Testing Notes / Requirements</label>
                    <textarea
                      rows={2}
                      value={sampleModal.notes}
                      onChange={(e) => setSampleModal(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSampleModal({ open: false, product: null, size: 'M', color: 'Classic Black', address: '', notes: '', submitting: false, success: '', error: '' })}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sampleModal.submitting}
                      className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {sampleModal.submitting ? 'Submitting...' : 'Dispatch Sample Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
