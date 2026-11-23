import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { readCart, writeCart } from '../utils/cart';

// Operational Subcomponents
import InstantQuotation from './InstantQuotation';
import FundraiserProposalModal from '../components/FundraiserProposalModal';
import QuotationChatModal from '../components/QuotationChatModal';
import FundraiserBulkOrdersView from '../components/FundraiserBulkOrdersView';

// Modular Dashboard Subcomponents
import DashboardHeader from './dashboard/components/DashboardHeader';
import DashboardSidebar from './dashboard/components/DashboardSidebar';
import FundraiserOverviewView from './dashboard/components/FundraiserOverviewView';
import FundraiserCampaignsView from './dashboard/components/FundraiserCampaignsView';
import FundraiserUploadsView from './dashboard/components/FundraiserUploadsView';
import FundraiserFundraisingView from './dashboard/components/FundraiserFundraisingView';
import FundraiserStoreView from './dashboard/components/FundraiserStoreView';
import FundraiserPayoutsView from './dashboard/components/FundraiserPayoutsView';
import FundraiserOrdersView from './dashboard/components/FundraiserOrdersView';
import DonorOverviewView from './dashboard/components/DonorOverviewView';
import DonorDonationsView from './dashboard/components/DonorDonationsView';
import DonorSupportedCampaignsView from './dashboard/components/DonorSupportedCampaignsView';
import DonorReferralView from './dashboard/components/DonorReferralView';
import DonorNotificationsView from './dashboard/components/DonorNotificationsView';
import BuyerCartView from './dashboard/components/BuyerCartView';
import BuyerTrackingView from './dashboard/components/BuyerTrackingView';
import UserSettingsView from './dashboard/components/UserSettingsView';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation State & Role Isolation
  const isFundraiser =
    user?.role === 'fundraiser' || user?.role === 'manager' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    return isFundraiser ? 'overview' : 'donor_overview';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Common Data States
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    productsSold: 0,
    uploadsCount: 0,
    availableBalance: 0,
  });
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [withdrawCampaign, setWithdrawCampaign] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Bulk / Quotation Orders States
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [selectedChatQuotation, setSelectedChatQuotation] = useState(null);
  const [selectedProposalQuotation, setSelectedProposalQuotation] = useState(null);

  // Campaign Orders Received (Fundraiser)
  const [campaignOrders, setCampaignOrders] = useState([]);

  // Buyer Shopping Cart & Checkout States (Donor / Buyer)
  const [buyerCart, setBuyerCart] = useState(() => readCart(user?._id));
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '',
    country: 'Pakistan',
  });

  // Buyer Delivery Tracking States (Donor / Buyer)
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Manufacturer routing safeguard
  useEffect(() => {
    if (user?.role === 'manufacturer') {
      navigate('/manufacturer', { replace: true });
    }
  }, [user, navigate]);

  // Keep role-appropriate tab selected & respond to URL tab parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (isFundraiser && (activeTab.startsWith('donor_') || activeTab === 'buyer_cart' || activeTab === 'buyer_tracking')) {
      setActiveTab('overview');
    } else if (!isFundraiser && (activeTab === 'overview' || activeTab === 'campaigns' || activeTab === 'uploads' || activeTab === 'fundraising' || activeTab === 'online_store' || activeTab === 'payouts' || activeTab === 'bulk_quotation_orders' || activeTab === 'fundraiser_orders' || activeTab === 'instant_quotation')) {
      setActiveTab('donor_overview');
    }
  }, [isFundraiser, activeTab]);

  // Sync cart from storage in real time
  useEffect(() => {
    const handleCartSync = () => {
      setBuyerCart(readCart(user?._id));
    };
    handleCartSync();
    window.addEventListener('sayrab:cart-updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('sayrab:cart-updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, [user]);

  const updateBuyerCart = (next) => {
    setBuyerCart(next);
    writeCart(next, user?._id);
  };

  const handleUpdateQty = (id, delta) => {
    updateBuyerCart(
      buyerCart
        .map((item) =>
          item._id === id ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Fetch saved delivery addresses for donor/buyer and prefill default
  useEffect(() => {
    if (!user || isFundraiser) return;
    api.get('/users/addresses')
      .then((res) => {
        const list = res.data?.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
          setCheckoutForm((prev) => ({
            ...prev,
            fullName: def.recipientName || prev.fullName,
            phone: def.phone || prev.phone,
            line1: [def.street, def.apartment].filter(Boolean).join(', ') || prev.line1,
            city: def.city || prev.city,
            state: def.state || prev.state,
            postalCode: def.postalCode || '',
            country: def.country || 'Pakistan',
          }));
        }
      })
      .catch(() => {});
  }, [user, isFundraiser]);

  const handleSelectAddress = (addr) => {
    if (!addr) {
      setSelectedAddressId('new');
      setCheckoutForm({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        line1: user?.address || '',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '',
        country: 'Pakistan',
      });
      return;
    }
    setSelectedAddressId(addr._id);
    setCheckoutForm({
      fullName: addr.recipientName || '',
      phone: addr.phone || '',
      line1: [addr.street, addr.apartment].filter(Boolean).join(', ') || '',
      city: addr.city || 'Lahore',
      state: addr.state || 'Punjab',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Pakistan',
    });
  };

  const handleRemoveCartItem = (id) => {
    updateBuyerCart(buyerCart.filter((item) => item._id !== id));
  };

  // Buyer Checkout Handler
  const handleBuyerCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    if (buyerCart.length === 0) return;

    setCheckoutSubmitting(true);
    try {
      const campaignId = buyerCart.find((item) => item.campaignId)?.campaignId || campaigns[0]?._id;
      const orderRes = await api.post('/orders', {
        campaignId,
        products: buyerCart.map((item) => ({
          productId: item._id,
          quantity: item.qty || 1,
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined,
        })),
        shippingAddress: checkoutForm,
        paymentStatus: 'paid',
      });

      // Save delivery address to donor's address book if requested
      if (saveAddressForFuture) {
        try {
          const addrRes = await api.post('/users/addresses', {
            recipientName: checkoutForm.fullName,
            phone: checkoutForm.phone,
            street: checkoutForm.line1,
            city: checkoutForm.city,
            state: checkoutForm.state,
            postalCode: checkoutForm.postalCode || '',
            country: checkoutForm.country || 'Pakistan',
            isDefault: savedAddresses.length === 0,
          });
          if (addrRes.data?.addresses) {
            setSavedAddresses(addrRes.data.addresses);
          }
        } catch (saveErr) {
          console.warn('Could not auto-save address:', saveErr);
        }
      }

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

  // Manual Tracking Lookup Handler
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
      setLookupError('Order not found with provided ID. Please verify and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCopyCode = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Main Data Loader
  const loadInitialData = useCallback(() => {
    if (!user || user.role === 'manufacturer') return;

    // Load Donor Data
    if (!isFundraiser || user.role === 'admin') {
      api.get('/donations/my')
        .then((res) => setDonations(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDonations([]));

      api.get('/orders/my')
        .then((res) => setBuyerOrders(Array.isArray(res.data) ? res.data : []))
        .catch(() => setBuyerOrders([]));
    }

    // Load Public / All Campaigns for exploration
    api.get('/campaigns')
      .then((res) => {
        const camps = Array.isArray(res.data?.campaigns)
          ? res.data.campaigns
          : Array.isArray(res.data)
          ? res.data
          : [];
        if (!isFundraiser) setCampaigns(camps);
      })
      .catch(() => {});

    // Load Fundraiser Specific Data
    if (isFundraiser) {
      api.get('/campaigns/my').then((res) => {
        const campaignsData = Array.isArray(res.data) ? res.data : [];
        setCampaigns(campaignsData);

        const total = campaignsData.reduce(
          (sum, c) => sum + (c.raisedAmount || c.amountRaised || 0),
          0
        );
        const active = campaignsData.filter(
          (c) => c.status === 'active' || c.status === 'approved' || c.lifecycleStatus === 'active'
        ).length;

        setStats((prev) => ({
          ...prev,
          totalRaised: total,
          activeCampaigns: active,
          availableBalance: Math.max(0, total * 0.95),
        }));
      }).catch(() => setCampaigns([]));

      // Withdrawals
      api.get('/withdrawals/my')
        .then((res) => setWithdrawals(Array.isArray(res.data) ? res.data : []))
        .catch(() => setWithdrawals([]));

      // Uploads
      api.get('/uploads')
        .then((res) => {
          const uploadsData = Array.isArray(res.data) ? res.data : [];
          setUploads(uploadsData);
          setStats((prev) => ({ ...prev, uploadsCount: uploadsData.length }));
        })
        .catch(() => setUploads([]));

      // Quotations
      api.get('/quotations/my')
        .then((res) => setRecentQuotations(Array.isArray(res.data) ? res.data : []))
        .catch(() => setRecentQuotations([]));

      // Campaign Orders
      api.get('/orders/fundraiser')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setCampaignOrders(res.data);
            const totalUnits = res.data.reduce(
              (sum, o) => sum + (o.products?.reduce((pSum, p) => pSum + (p.quantity || 1), 0) || 1),
              0
            );
            setStats((prev) => ({ ...prev, productsSold: totalUnits }));
          }
        })
        .catch(() => setCampaignOrders([]));
    }
  }, [user, isFundraiser]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen bg-[#f7f9f5] flex flex-col text-[#10182b]">
      {/* Top Header */}
      <DashboardHeader
        user={user}
        logout={logout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        unreadCount={2}
        onOpenNotifications={() => setActiveTab(isFundraiser ? 'overview' : 'donor_notifications')}
        onOpenCart={() => setActiveTab('buyer_cart')}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isFundraiser={isFundraiser}
          logout={logout}
          cartCount={buyerCart.reduce((sum, item) => sum + (item.qty || 1), 0)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* ========================================================================= */}
          {/* FUNDRAISER TABS                                                           */}
          {/* ========================================================================= */}

          {activeTab === 'overview' && isFundraiser && (
            <FundraiserOverviewView
              stats={stats}
              campaigns={campaigns}
              donations={donations}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'campaigns' && isFundraiser && (
            <FundraiserCampaignsView
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              setActiveTab={setActiveTab}
              onInitiateWithdrawal={(camp) => {
                setWithdrawCampaign(camp);
                setActiveTab('payouts');
              }}
            />
          )}

          {activeTab === 'uploads' && isFundraiser && (
            <FundraiserUploadsView
              uploads={uploads}
              setUploads={setUploads}
            />
          )}

          {(activeTab === 'fundraising' || activeTab === 'new_campaign') && isFundraiser && (
            <FundraiserFundraisingView
              setActiveTab={setActiveTab}
              onCampaignCreated={loadInitialData}
            />
          )}

          {activeTab === 'online_store' && isFundraiser && (
            <FundraiserStoreView
              campaigns={campaigns}
            />
          )}

          {activeTab === 'payouts' && isFundraiser && (
            <FundraiserPayoutsView
              campaigns={campaigns}
              withdrawals={withdrawals}
              setWithdrawals={setWithdrawals}
              preselectedCampaign={withdrawCampaign}
            />
          )}

          {activeTab === 'bulk_quotation_orders' && isFundraiser && (
            <FundraiserBulkOrdersView
              quotations={recentQuotations}
              onRefresh={() => {
                api.get('/quotations/my')
                  .then((res) => setRecentQuotations(Array.isArray(res.data) ? res.data : []))
                  .catch(() => setRecentQuotations([]));
              }}
              onOpenChat={(quote) => setSelectedChatQuotation(quote)}
              onOpenProposal={(quote) => setSelectedProposalQuotation(quote)}
              onNewQuotation={() => setActiveTab('instant_quotation')}
            />
          )}

          {activeTab === 'fundraiser_orders' && isFundraiser && (
            <FundraiserOrdersView
              campaignOrders={campaignOrders}
            />
          )}

          {activeTab === 'instant_quotation' && isFundraiser && (
            <InstantQuotation inDashboard={true} />
          )}

          {/* ========================================================================= */}
          {/* DONOR / BUYER TABS                                                        */}
          {/* ========================================================================= */}

          {activeTab === 'donor_overview' && !isFundraiser && (
            <DonorOverviewView
              donations={donations}
              setActiveTab={setActiveTab}
              onOpenReceipt={(don) => {
                setActiveReceipt(don);
                setActiveTab('donor_donations');
              }}
            />
          )}

          {activeTab === 'donor_donations' && (
            <DonorDonationsView
              donations={donations}
              activeReceipt={activeReceipt}
              setActiveReceipt={setActiveReceipt}
              user={user}
            />
          )}

          {activeTab === 'donor_supported' && !isFundraiser && (
            <DonorSupportedCampaignsView
              donations={donations}
              campaigns={campaigns}
            />
          )}

          {activeTab === 'donor_referral' && !isFundraiser && (
            <DonorReferralView
              user={user}
            />
          )}

          {activeTab === 'donor_notifications' && (
            <DonorNotificationsView />
          )}

          {activeTab === 'buyer_cart' && (
            <BuyerCartView
              buyerCart={buyerCart}
              updateBuyerCart={updateBuyerCart}
              handleUpdateQty={handleUpdateQty}
              handleRemoveCartItem={handleRemoveCartItem}
              checkoutForm={checkoutForm}
              setCheckoutForm={setCheckoutForm}
              handleBuyerCheckout={handleBuyerCheckout}
              checkoutSubmitting={checkoutSubmitting}
              checkoutError={checkoutError}
              checkoutSuccess={checkoutSuccess}
              setSelectedTrackingOrder={setSelectedTrackingOrder}
              setCheckoutSuccess={setCheckoutSuccess}
              setActiveTab={setActiveTab}
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              handleSelectAddress={handleSelectAddress}
              saveAddressForFuture={saveAddressForFuture}
              setSaveAddressForFuture={setSaveAddressForFuture}
            />
          )}

          {activeTab === 'buyer_tracking' && (
            <BuyerTrackingView
              buyerOrders={buyerOrders}
              selectedTrackingOrder={selectedTrackingOrder}
              setSelectedTrackingOrder={setSelectedTrackingOrder}
              lookupOrderId={lookupOrderId}
              setLookupOrderId={setLookupOrderId}
              handleManualTrackingLookup={handleManualTrackingLookup}
              lookupLoading={lookupLoading}
              lookupError={lookupError}
              copiedCode={copiedCode}
              handleCopyCode={handleCopyCode}
            />
          )}

          {/* ========================================================================= */}
          {/* SHARED SETTINGS TAB                                                       */}
          {/* ========================================================================= */}

          {activeTab === 'settings' && (
            <UserSettingsView
              user={user}
              setUser={setUser}
            />
          )}
        </main>
      </div>

      {/* Operational Modals */}
      {selectedProposalQuotation && (
        <FundraiserProposalModal
          quotation={selectedProposalQuotation}
          onClose={() => setSelectedProposalQuotation(null)}
          onUpdated={(updated) => {
            setSelectedProposalQuotation(null);
            if (updated?._id) {
              setRecentQuotations((prev) =>
                prev.map((q) => (q._id === updated._id ? { ...q, ...updated } : q))
              );
            }
          }}
        />
      )}

      {selectedChatQuotation && (
        <QuotationChatModal
          quotation={selectedChatQuotation}
          onClose={() => setSelectedChatQuotation(null)}
        />
      )}
    </div>
  );
}
