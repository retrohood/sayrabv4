import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Search,
  Plus,
  ExternalLink,
  Edit3,
  MessageSquare,
  Wallet,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';
import api from '../../../api/client';

export default function FundraiserCampaignsView({
  campaigns = [],
  setCampaigns,
  setActiveTab,
  onInitiateWithdrawal,
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Post Update Modal state
  const [updateModalCampaign, setUpdateModalCampaign] = useState(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

  const filtered = campaigns.filter((camp) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? camp.status === 'active' || camp.status === 'approved'
        : camp.status === filterStatus;

    const matchesSearch =
      !searchQuery ||
      camp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle || !updateContent) {
      setUpdateMessage({ text: 'Please fill in both title and update details', type: 'error' });
      return;
    }

    setPostingUpdate(true);
    setUpdateMessage({ text: '', type: '' });
    try {
      await api.post(`/campaigns/${updateModalCampaign._id}/updates`, {
        title: updateTitle,
        content: updateContent,
      });
      setUpdateMessage({ text: 'Update published successfully to all donors!', type: 'success' });
      setTimeout(() => {
        setUpdateModalCampaign(null);
        setUpdateTitle('');
        setUpdateContent('');
        setUpdateMessage({ text: '', type: '' });
      }, 1500);
    } catch (err) {
      setUpdateMessage({
        text: err.response?.data?.message || 'Failed to post update. Please try again.',
        type: 'error',
      });
    } finally {
      setPostingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">My Campaigns</h2>
          <p className="text-xs text-[#64748b]">
            Manage, edit, post backer updates, and monitor all initiated causes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('fundraising')}
          className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e9e3] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'pending', label: 'Under Review' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#89ca2e] text-white'
                  : 'bg-[#f7f9f5] text-[#64748b] hover:text-[#10182b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
        </div>
      </div>

      {/* Campaigns Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <Megaphone size={36} className="mx-auto text-[#64748b] mb-3" />
          <h3 className="text-sm font-bold text-[#10182b]">No campaigns match your filters</h3>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            Try adjusting your search criteria or create a brand new campaign.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('fundraising')}
            className="px-4 py-2 rounded-xl bg-[#89ca2e] text-white text-xs font-bold hover:bg-[#78b327] transition-colors cursor-pointer"
          >
            Launch Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((camp) => {
            const percent = Math.min(100, Math.round(((camp.raisedAmount || 0) / (camp.targetAmount || 1)) * 100));
            const isApproved = camp.status === 'active' || camp.status === 'approved';

            return (
              <div
                key={camp._id}
                className="bg-white rounded-2xl border border-[#e5e9e3] overflow-hidden shadow-xs hover:border-[#89ca2e]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Header with Status */}
                  <div className="h-44 w-full bg-[#f7f9f5] relative overflow-hidden">
                    {camp.image || camp.coverImage ? (
                      <img
                        src={camp.image || camp.coverImage}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748b]">
                        <Megaphone size={36} />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                        isApproved
                          ? 'bg-[#89ca2e] text-white'
                          : camp.status === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#10182b] text-white'
                      }`}
                    >
                      {camp.status || 'Active'}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-[#10182b]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {camp.category || 'General'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-sm text-[#10182b] line-clamp-1 mb-1">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-[#64748b] line-clamp-2 mb-4 leading-relaxed">
                      {camp.story || camp.description || 'Verified fundraising campaign.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#e5e9e3] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#89ca2e] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748b] mb-4">
                      <div>
                        <strong className="text-[#10182b] font-black text-sm block">
                          {formatCurrency(camp.raisedAmount || 0)}
                        </strong>
                        <span className="text-[10px]">of {formatCurrency(camp.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-[#367c35] font-black text-sm block">
                          {percent}%
                        </strong>
                        <span className="text-[10px] flex items-center gap-0.5 justify-end">
                          <Clock size={11} /> {camp.daysLeft ? `${camp.daysLeft}d left` : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-[#f7f9f5] border-t border-[#e5e9e3] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUpdateModalCampaign(camp)}
                      className="p-2 rounded-lg bg-white border border-[#e5e9e3] text-[#10182b] hover:text-[#367c35] hover:border-[#89ca2e] transition-all cursor-pointer"
                      title="Post Backer Update"
                    >
                      <MessageSquare size={14} />
                    </button>
                    <Link
                      to={`/campaigns/${camp._id}`}
                      className="p-2 rounded-lg bg-white border border-[#e5e9e3] text-[#10182b] hover:text-[#367c35] hover:border-[#89ca2e] transition-all"
                      title="View Public Page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>

                  {(camp.raisedAmount || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onInitiateWithdrawal) {
                          onInitiateWithdrawal(camp);
                        } else {
                          setActiveTab('payouts');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#367c35] hover:bg-[#2e682d] text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Wallet size={13} />
                      <span>Disburse Funds</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Update Modal */}
      {updateModalCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e9e3] animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e9e3] mb-4">
              <div>
                <h3 className="text-base font-black text-[#10182b]">Post Campaign Update</h3>
                <p className="text-xs text-[#64748b] truncate max-w-sm">
                  {updateModalCampaign.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUpdateModalCampaign(null)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f7f9f5] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Milestone Reached: Equipment Purchased!"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  Update Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Share progress, receipts, photos or thank-you notes with donors..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>

              {updateMessage.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    updateMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {updateMessage.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalCampaign(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f7f9f5] border border-[#e5e9e3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingUpdate}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] hover:bg-[#78b327] text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{postingUpdate ? 'Publishing...' : 'Publish Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
