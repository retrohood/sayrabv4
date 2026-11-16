import {
  LayoutDashboard,
  Megaphone,
  UploadCloud,
  Settings,
  Coins,
  LogOut,
  ShoppingBag,
  Calculator,
  FileText,
  PackageCheck,
  Receipt,
  HeartHandshake,
  Share2,
  Bell,
  ShoppingCart,
  Truck,
  PlusCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  isFundraiser,
  logout,
  cartCount = 0,
}) {
  const fundraiserItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', label: 'My Campaigns', icon: Megaphone },
    { id: 'uploads', label: 'My Uploads', icon: UploadCloud },
    { id: 'fundraising', label: 'Fundraising', icon: PlusCircle, badge: 'Create' },
    { id: 'online_store', label: 'Online Store', icon: ShoppingBag, badge: 'Customizer' },
    { id: 'payouts', label: 'Withdrawals', icon: Wallet },
    { section: 'Manufacturing & Orders' },
    { id: 'bulk_quotation_orders', label: 'Bulk & Sample Orders', icon: FileText },
    { id: 'fundraiser_orders', label: 'Orders Received', icon: PackageCheck },
    { id: 'instant_quotation', label: 'Instant Quotation', icon: Calculator },
    { section: 'Preferences' },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const donorItems = [
    { id: 'donor_overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'donor_donations', label: 'My Donations', icon: Receipt },
    { id: 'donor_supported', label: 'Supported Causes', icon: HeartHandshake },
    { id: 'donor_referral', label: 'Referral & Sharing', icon: Share2 },
    { id: 'donor_notifications', label: 'Notifications', icon: Bell },
    { section: 'Store & Fulfillment' },
    { id: 'buyer_cart', label: 'My Cart', icon: ShoppingCart, count: cartCount },
    { id: 'buyer_tracking', label: 'Order Tracking', icon: Truck },
    { section: 'Preferences' },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const menuItems = isFundraiser ? fundraiserItems : donorItems;

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-20 left-0 z-40 h-[calc(100vh-5rem)] w-64 bg-white border-r border-[#e5e9e3] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {menuItems.map((item, index) => {
            if (item.section) {
              return (
                <div
                  key={`sec-${index}`}
                  className="pt-4 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-[#64748b]"
                >
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            // Map legacy aliases
            const isTabActive =
              activeTab === item.id ||
              (item.id === 'fundraising' && activeTab === 'new_campaign') ||
              (item.id === 'donor_overview' && activeTab === 'overview' && !isFundraiser);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-[#89ca2e]/10 text-[#367c35] border-r-4 border-[#89ca2e] shadow-xs'
                    : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isTabActive ? 'text-[#367c35]' : 'text-[#64748b]'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#89ca2e]/20 text-[#367c35]">
                    {item.badge}
                  </span>
                )}

                {item.count > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#367c35] text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User / Logout Box */}
        <div className="p-4 border-t border-[#e5e9e3]">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
