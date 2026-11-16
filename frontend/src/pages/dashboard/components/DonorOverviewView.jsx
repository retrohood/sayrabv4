import {
  HeartHandshake,
  Receipt,
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function DonorOverviewView({
  donations = [],
  setActiveTab,
  onOpenReceipt,
}) {
  const totalContributed = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const campaignsSupportedCount = new Set(
    donations.map((d) => d.campaign?._id || d.campaignTitle || d.campaign).filter(Boolean)
  ).size;

  const impactTier =
    totalContributed >= 50000
      ? 'Platinum Benefactor'
      : totalContributed >= 10000
      ? 'Golden Champion'
      : totalContributed >= 1000
      ? 'Verified Supporter'
      : 'Kind Supporter';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#10182b] to-[#367c35] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <Award size={14} className="text-[#89ca2e]" />
            <span>Giving Impact Tier: {impactTier}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Your Giving Brings Hope
          </h2>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6">
            Track all your contributions in real-time, download verifiable donation tax receipts, and witness the tangible lives transformed by your kindness.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/campaigns"
              className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <HeartHandshake size={15} />
              Explore Active Causes
            </Link>
            <Link
              to="/store"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag size={15} />
              Purpose-Driven Merch
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Contributed */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Total Donated
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#89ca2e]/10 text-[#367c35] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {formatCurrency(totalContributed)}
          </p>
          <p className="text-[11px] text-[#367c35] font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck size={12} /> 100% direct beneficiary allocation
          </p>
        </div>

        {/* Causes Supported */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Causes Supported
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#367c35]/10 text-[#367c35] flex items-center justify-center">
              <HeartHandshake size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {campaignsSupportedCount}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('donor_supported')}
            className="text-[11px] font-bold text-[#367c35] hover:underline mt-1 block cursor-pointer"
          >
            View Supported Campaigns →
          </button>
        </div>

        {/* Official Receipts */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              Official Receipts
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Receipt size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#10182b]">
            {donations.length}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('donor_donations')}
            className="text-[11px] font-bold text-[#367c35] hover:underline mt-1 block cursor-pointer"
          >
            Download Receipts →
          </button>
        </div>
      </div>

      {/* Recent Giving Stream */}
      <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#10182b]">Recent Contributions</h3>
            <p className="text-xs text-[#64748b]">Your latest philanthropic impacts on Sayrab</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('donor_donations')}
            className="text-xs font-bold text-[#367c35] hover:underline cursor-pointer"
          >
            View Complete History ({donations.length})
          </button>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12 text-[#64748b] border border-dashed border-[#e5e9e3] rounded-2xl">
            <HeartHandshake size={36} className="mx-auto text-[#64748b] mb-2" />
            <p className="text-xs font-bold text-[#10182b]">No donations recorded yet</p>
            <p className="text-[11px] mt-1 mb-4">
              Explore ongoing urgent community campaigns to create your first meaningful impact.
            </p>
            <Link
              to="/campaigns"
              className="px-4 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-colors inline-block"
            >
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#e5e9e3]">
            {donations.slice(0, 5).map((don, idx) => (
              <div key={don._id || idx} className="py-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#10182b]">
                    {don.campaign?.title || don.campaignTitle || 'Verified Campaign Aid'}
                  </h4>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Contributed on {formatDate(don.createdAt)} • Via {don.paymentMethod || 'Online'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-[#367c35]">
                    {formatCurrency(don.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenReceipt && onOpenReceipt(don)}
                    className="p-2 rounded-xl bg-[#f7f9f5] hover:bg-[#e5e9e3] text-[#10182b] transition-colors cursor-pointer border border-[#e5e9e3]"
                    title="View Official Receipt"
                  >
                    <Receipt size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
