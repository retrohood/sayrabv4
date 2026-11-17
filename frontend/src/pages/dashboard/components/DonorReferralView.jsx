import { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function DonorReferralView({ user }) {
  const [copied, setCopied] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false);
  const [savedNotice, setSavedNotice] = useState(false);

  const referralCode = user?.referralCode || user?._id?.slice(-6) || 'SAYRAB-HERO';
  const referralLink = `${window.location.origin}/campaigns?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAnonymity = (checked) => {
    setIsAnonymous(checked);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const leaderboard = [
    { rank: 1, name: 'Fatima Al-Mansoor', amount: 150000, badge: 'Hero of Humanity', isMe: false },
    { rank: 2, name: 'Anonymous Supporter', amount: 120000, badge: 'Silent Guardian', isMe: false },
    { rank: 3, name: isAnonymous ? 'Anonymous Supporter (You)' : (user?.fullName || 'You'), amount: 85000, badge: 'Golden Benefactor', isMe: true },
    { rank: 4, name: 'Hamza Tariq', amount: 62000, badge: 'Community Champion', isMe: false },
    { rank: 5, name: 'Anonymous Supporter', amount: 48000, badge: 'Faithful Giver', isMe: false },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <h2 className="text-xl font-black text-[#10182b]">Referral & Community Impact</h2>
        <p className="text-xs text-[#64748b]">
          Multiply your impact by rallying friends and family to support verified causes on Sayrab
        </p>
      </div>

      {/* Referral Link & Share Banner */}
      <div className="bg-gradient-to-r from-[#367c35] to-[#89ca2e] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="max-w-xl">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
            Your Unique Supporter Link
          </span>
          <h3 className="text-xl font-black mb-1">
            Share Causes and Inspire Others
          </h3>
          <p className="text-white/90 text-xs">
            Every friend who donates through your referral link increases community support and boosts your leaderboard standing.
          </p>
        </div>

        {/* Copy Box */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent px-3 py-2 text-xs font-mono text-white outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#10182b] font-bold text-xs hover:bg-white/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {copied ? <Check size={14} className="text-[#367c35]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Friends Joined
          </span>
          <p className="text-2xl font-black text-[#10182b]">8</p>
          <p className="text-[11px] text-[#367c35] mt-1 flex items-center gap-1">
            <Users size={12} /> Inspired by your shares
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Funds Raised via Referral
          </span>
          <p className="text-2xl font-black text-[#367c35]">
            {formatCurrency(85000)}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1">
            Combined impact of friends
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Global Rank
          </span>
          <p className="text-2xl font-black text-amber-600">#3</p>
          <p className="text-[11px] text-[#64748b] mt-1">
            Top 5% of community supporters
          </p>
        </div>
      </div>

      {/* Donor Anonymity Setting Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-[#367c35]" />
            <h3 className="text-sm font-bold text-[#10182b]">
              Donor Privacy & Leaderboard Anonymity
            </h3>
          </div>
          <p className="text-xs text-[#64748b] leading-relaxed">
            Choose whether to show your full name on the community donor leaderboard, or remain completely anonymous as an &quot;Anonymous Supporter&quot;.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => handleToggleAnonymity(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e5e9e3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#89ca2e]"></div>
          </label>
          <span className="text-xs font-bold text-[#10182b]">
            {isAnonymous ? 'Display as Anonymous' : 'Display Full Name'}
          </span>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check size={14} />
          <span>Anonymity preference updated successfully!</span>
        </div>
      )}

      {/* Community Leaderboard */}
      <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#10182b]">Community Impact Leaderboard</h3>
            <p className="text-xs text-[#64748b]">Recognizing extraordinary humanitarian champions</p>
          </div>
          <Award size={20} className="text-amber-500" />
        </div>

        <div className="divide-y divide-[#e5e9e3]">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`py-3.5 flex items-center justify-between gap-3 text-xs rounded-xl px-3 transition-colors ${
                item.isMe ? 'bg-[#89ca2e]/10 border border-[#89ca2e]/30' : 'hover:bg-[#f7f9f5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                    item.rank === 1
                      ? 'bg-amber-100 text-amber-700'
                      : item.rank === 2
                      ? 'bg-slate-200 text-slate-700'
                      : item.rank === 3
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-[#64748b]'
                  }`}
                >
                  {item.rank}
                </span>
                <div>
                  <p className="font-bold text-[#10182b] flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isMe && (
                      <span className="text-[10px] bg-[#367c35] text-white px-1.5 py-0.2 rounded font-black">
                        YOU
                      </span>
                    )}
                  </p>
                  <span className="text-[10px] text-[#64748b]">{item.badge}</span>
                </div>
              </div>

              <span className="font-black text-[#367c35] text-sm">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
