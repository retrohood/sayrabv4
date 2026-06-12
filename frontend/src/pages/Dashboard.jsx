import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getVerificationLabel } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [privacy, setPrivacy] = useState(user?.referralPrivacy || 'public');

  useEffect(() => {
    if (user?.role === 'donor' || user?.role === 'admin') {
      api.get('/donations/my').then((res) => setDonations(res.data));
    }
    if (user?.role === 'fundraiser' || user?.role === 'admin') {
      api.get('/campaigns/my').then((res) => setCampaigns(res.data));
    }
  }, [user]);

  const updatePrivacy = async (value) => {
    setPrivacy(value);
    await api.put('/auth/referral-privacy', { referralPrivacy: value });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">My Dashboard</h1>
      <p className="text-slate-600 mb-8">
        Welcome, {user.fullName}! ({user.role})
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-3">Referral Privacy</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={privacy === 'public'}
              onChange={() => updatePrivacy('public')}
            />
            Public Ranking
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={privacy === 'anonymous'}
              onChange={() => updatePrivacy('anonymous')}
            />
            Anonymous Participation
          </label>
        </div>
      </div>

      {(user.role === 'donor' || user.role === 'admin') && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Donation History</h2>
          {donations.length === 0 ? (
            <p className="text-slate-500">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <div
                  key={d._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap justify-between gap-2"
                >
                  <div>
                    <Link
                      to={`/campaigns/${d.campaign?.slug}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {d.campaign?.title}
                    </Link>
                    <p className="text-sm text-slate-500">{formatDate(d.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(d.amount)}</p>
                    <p className="text-xs text-slate-500">Receipt: {d.receiptNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(user.role === 'fundraiser' || user.role === 'admin') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">My Campaigns</h2>
            <Link
              to="/create-campaign"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"
            >
              New Campaign
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-slate-500">No campaigns yet.</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap justify-between gap-2"
                >
                  <div>
                    <Link
                      to={`/campaigns/${c.slug}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {getVerificationLabel(c.verificationStatus)} · {c.lifecycleStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(c.amountRaised)} / {formatCurrency(c.fundingGoal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
