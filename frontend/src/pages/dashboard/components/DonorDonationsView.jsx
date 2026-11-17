import { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  Printer,
  X,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function DonorDonationsView({
  donations = [],
  activeReceipt,
  setActiveReceipt,
  user,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = donations.filter((don) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const title = (don.campaign?.title || don.campaignTitle || '').toLowerCase();
    const transId = (don.transactionId || don._id || '').toLowerCase();
    return title.includes(q) || transId.includes(q);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">My Donation History</h2>
          <p className="text-xs text-[#64748b]">
            View and download verifiable donation receipts for all your supported initiatives
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by campaign or receipt #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
        </div>
      </div>

      {/* Donations Table / Card List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <Receipt size={36} className="mx-auto text-[#64748b] mb-3" />
          <h3 className="text-sm font-bold text-[#10182b]">No donations found</h3>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            You haven’t made any donations matching this filter yet.
          </p>
          <Link
            to="/campaigns"
            className="px-4 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-colors inline-block"
          >
            Explore Causes
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Receipt / Trans ID</th>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9e3]">
                {filtered.map((don, idx) => (
                  <tr key={don._id || idx} className="hover:bg-[#f7f9f5]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-[#10182b] font-semibold">
                      {don.transactionId ? `#${don.transactionId.slice(-8)}` : `#RCP-${(don._id || '').slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#10182b] block truncate max-w-xs">
                        {don.campaign?.title || don.campaignTitle || 'Direct Campaign Aid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {formatDate(don.createdAt)}
                    </td>
                    <td className="px-6 py-4 capitalize text-[#64748b]">
                      {don.paymentMethod || 'Online Payment'}
                    </td>
                    <td className="px-6 py-4 font-black text-[#367c35] text-sm">
                      {formatCurrency(don.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(don)}
                        className="px-3 py-1.5 rounded-lg bg-[#89ca2e]/15 hover:bg-[#89ca2e]/25 text-[#367c35] font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Receipt size={13} />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e5e9e3] animate-in fade-in duration-150 my-8">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e9e3] mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-[#64748b]">
                Verified Digital Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-[#f7f9f5] hover:bg-[#e5e9e3] text-[#10182b] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 rounded-xl text-[#64748b] hover:bg-[#f7f9f5] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div id="printable-receipt" className="border border-[#e5e9e3] rounded-2xl p-6 bg-[#f7f9f5]/30 space-y-5">
              {/* Sayrab Brand Header */}
              <div className="text-center pb-4 border-b border-[#e5e9e3]">
                <img
                  src="/sayrab.png"
                  alt="Sayrab"
                  className="h-20 w-auto object-contain mx-auto mb-2"
                />
                <h3 className="text-base font-black text-[#10182b] uppercase tracking-wider">
                  Official Donation Receipt
                </h3>
                <p className="text-[10px] text-[#64748b] mt-0.5">
                  Sayrab Fundraising & Philanthropic Platform • NTN / Reg #SYR-2025-01
                </p>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                    Receipt Number
                  </span>
                  <span className="font-mono font-bold text-[#10182b]">
                    {activeReceipt.transactionId
                      ? `RCP-${activeReceipt.transactionId.slice(-8).toUpperCase()}`
                      : `RCP-${(activeReceipt._id || '').slice(-8).toUpperCase()}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                    Donation Date
                  </span>
                  <span className="font-semibold text-[#10182b]">
                    {formatDate(activeReceipt.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                    Donor Name
                  </span>
                  <span className="font-bold text-[#10182b]">
                    {activeReceipt.isAnonymous
                      ? 'Anonymous Supporter'
                      : user?.fullName || activeReceipt.donorName || 'Generous Benefactor'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                    Payment Method
                  </span>
                  <span className="font-semibold text-[#10182b] capitalize">
                    {activeReceipt.paymentMethod || 'Online Verification'}
                  </span>
                </div>
              </div>

              {/* Campaign Item Box */}
              <div className="p-4 bg-white rounded-xl border border-[#e5e9e3] space-y-2">
                <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                  Designated Beneficiary Cause
                </span>
                <p className="text-xs font-bold text-[#10182b]">
                  {activeReceipt.campaign?.title || activeReceipt.campaignTitle || 'Direct Humanitarian Support'}
                </p>
                <div className="pt-2 border-t border-[#e5e9e3] flex justify-between items-center text-xs">
                  <span className="font-bold text-[#10182b]">Total Donated Amount:</span>
                  <span className="text-base font-black text-[#367c35]">
                    {formatCurrency(activeReceipt.amount)}
                  </span>
                </div>
              </div>

              {/* Official Seal & Legal Notice */}
              <div className="text-[10px] text-[#64748b] text-center pt-2 border-t border-[#e5e9e3] space-y-1">
                <div className="flex items-center justify-center gap-1 text-[#367c35] font-bold">
                  <ShieldCheck size={14} />
                  <span>100% Direct Allocation Certified</span>
                </div>
                <p>
                  This computer-generated receipt serves as authentic acknowledgment of your charitable contribution. Thank you for making a positive impact.
                </p>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-[#10182b] hover:bg-[#10182b]/90 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
