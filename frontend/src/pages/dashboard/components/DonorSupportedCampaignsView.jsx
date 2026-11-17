import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  TrendingUp,
  Clock,
  ExternalLink,
  PlusCircle,
  Megaphone,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function DonorSupportedCampaignsView({ donations = [], campaigns = [] }) {
  // Extract unique campaigns that the user donated to
  const supportedCampaignIds = new Set(
    donations.map((d) => d.campaign?._id || d.campaign).filter(Boolean)
  );

  // Filter campaigns matching these IDs, or fall back to donation campaign snapshots
  const supportedCampaignsList = campaigns.filter((c) =>
    supportedCampaignIds.has(c._id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">Supported Causes</h2>
          <p className="text-xs text-[#64748b]">
            Follow the progress, real-time updates, and milestones of causes you’ve backed
          </p>
        </div>
        <Link
          to="/campaigns"
          className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle size={15} />
          <span>Discover More Causes</span>
        </Link>
      </div>

      {supportedCampaignsList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <HeartHandshake size={36} className="mx-auto text-[#64748b] mb-3" />
          <h3 className="text-sm font-bold text-[#10182b]">No supported campaigns yet</h3>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            When you donate to verified campaigns on Sayrab, their ongoing progress will be tracked here.
          </p>
          <Link
            to="/campaigns"
            className="px-4 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-colors inline-block"
          >
            Explore Active Causes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedCampaignsList.map((camp) => {
            const percent = Math.min(
              100,
              Math.round(((camp.raisedAmount || 0) / (camp.targetAmount || 1)) * 100)
            );

            // Compute total amount donor contributed to this campaign
            const myContribution = donations
              .filter((d) => (d.campaign?._id || d.campaign) === camp._id)
              .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            return (
              <div
                key={camp._id}
                className="bg-white rounded-3xl border border-[#e5e9e3] overflow-hidden shadow-xs hover:border-[#89ca2e]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Campaign Image */}
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
                    <span className="absolute top-3 left-3 bg-[#10182b]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {camp.category || 'Humanitarian'}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-[#89ca2e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {camp.status || 'Active'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-bold text-sm text-[#10182b] line-clamp-1 mb-1">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-[#64748b] line-clamp-2 mb-4 leading-relaxed">
                      {camp.shortDescription || camp.story || 'Verified cause backed by your contribution.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#e5e9e3] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#89ca2e] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748b] mb-4">
                      <span>
                        <strong className="text-[#10182b]">{formatCurrency(camp.raisedAmount || 0)}</strong> raised
                      </span>
                      <span className="font-black text-[#367c35]">{percent}%</span>
                    </div>

                    {/* Donor Contribution Highlight */}
                    <div className="p-3 bg-[#89ca2e]/10 border border-[#89ca2e]/20 rounded-xl text-xs flex items-center justify-between">
                      <span className="text-[#64748b]">Your Contribution:</span>
                      <span className="font-black text-[#367c35]">{formatCurrency(myContribution)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-[#f7f9f5] border-t border-[#e5e9e3] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b] flex items-center gap-1">
                    <Clock size={12} />
                    <span>{camp.daysLeft ? `${camp.daysLeft} days left` : 'Ongoing'}</span>
                  </span>
                  <Link
                    to={`/campaigns/${camp._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Support Again</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
