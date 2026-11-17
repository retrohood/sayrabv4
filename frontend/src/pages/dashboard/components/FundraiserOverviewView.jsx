import {
  TrendingUp,
  Megaphone,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function FundraiserOverviewView({
  stats,
  campaigns = [],
  donations = [],
  setActiveTab,
}) {
  const activeCampaignsList = campaigns.filter((c) => c.status === 'active' || c.status === 'approved');
  const availableBalance = stats?.availableBalance || Math.max(0, (stats?.totalRaised || 0) * 0.95);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#367c35] to-[#89ca2e] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <Sparkles size={14} />
            <span>Fundraiser Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Empower Your Causes, Track Impact
          </h2>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-6">
            Launch verified campaigns, monetize through high-quality custom merchandise, and disburse donations transparently.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('fundraising')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#10182b] font-bold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle size={15} className="text-[#367c35]" />
              Start New Campaign
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('online_store')}
              className="px-4 py-2.5 rounded-xl bg-[#10182b]/30 hover:bg-[#10182b]/40 backdrop-blur-md text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag size={15} />
              Customize Merch
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raised */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Total Raised
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#89ca2e]/10 text-[#367c35] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {formatCurrency(stats?.totalRaised || 0)}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1">
            <span className="text-[#367c35] font-bold">100% Verified</span> to your campaigns
          </p>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Active Campaigns
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#367c35]/10 text-[#367c35] flex items-center justify-center">
              <Megaphone size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {stats?.activeCampaigns || activeCampaignsList.length}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1">
            {campaigns.length} total initiated
          </p>
        </div>

        {/* Products Sold */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Merch Units Sold
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {stats?.productsSold || 0}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1">
            50% profit share enabled
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Available Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {formatCurrency(availableBalance)}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className="text-[11px] font-bold text-[#367c35] hover:underline mt-1 inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>Request Withdrawal</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Campaigns Progress & Recent Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Campaigns Highlights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5e9e3] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#10182b]">Active Campaigns</h3>
              <p className="text-xs text-[#64748b]">Real-time fundraising goal progression</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('campaigns')}
              className="text-xs font-bold text-[#367c35] hover:underline cursor-pointer"
            >
              View All ({campaigns.length})
            </button>
          </div>

          {activeCampaignsList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#e5e9e3] rounded-xl">
              <Megaphone size={32} className="mx-auto text-[#64748b] mb-2" />
              <p className="text-xs font-bold text-[#10182b]">No active campaigns found</p>
              <p className="text-[11px] text-[#64748b] mt-1 mb-4">
                Launch your first cause to begin receiving donations and producing merchandise.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('fundraising')}
                className="px-4 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Create Campaign Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCampaignsList.slice(0, 3).map((camp) => {
                const percent = Math.min(100, Math.round(((camp.raisedAmount || 0) / (camp.targetAmount || 1)) * 100));
                return (
                  <div
                    key={camp._id}
                    className="p-4 rounded-xl border border-[#e5e9e3] hover:border-[#89ca2e]/50 transition-colors bg-[#f7f9f5]/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/15 px-2 py-0.5 rounded-md mb-1">
                          {camp.category || 'General'}
                        </span>
                        <h4 className="text-sm font-bold text-[#10182b] truncate">{camp.title}</h4>
                      </div>
                      <span className="text-xs font-black text-[#10182b] shrink-0">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#e5e9e3] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#89ca2e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748b]">
                      <span>
                        <strong className="text-[#10182b]">{formatCurrency(camp.raisedAmount || 0)}</strong> raised of {formatCurrency(camp.targetAmount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{camp.daysLeft ? `${camp.daysLeft} days left` : 'Active'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Backer Stream */}
        <div className="bg-white rounded-2xl border border-[#e5e9e3] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#10182b]">Recent Donations</h3>
              <p className="text-xs text-[#64748b]">Live supporter contributions</p>
            </div>
            <Users size={18} className="text-[#64748b]" />
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-10 text-[#64748b]">
              <p className="text-xs">No recent donations yet.</p>
              <p className="text-[11px] mt-1">Donations will appear here as supporters contribute.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e9e3]">
              {donations.slice(0, 5).map((don, idx) => (
                <div key={don._id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#10182b]">
                      {don.isAnonymous ? 'Anonymous Donor' : don.donorName || don.donor?.fullName || 'Kind Supporter'}
                    </p>
                    <p className="text-[10px] text-[#64748b]">
                      {don.campaign?.title || don.campaignTitle || 'General Campaign'} • {formatDate(don.createdAt)}
                    </p>
                  </div>
                  <span className="font-black text-[#367c35]">
                    +{formatCurrency(don.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
