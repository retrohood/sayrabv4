import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { isFundraiserUser } from '../utils/format';
import CampaignCarousel from '../components/CampaignCarousel';
import SearchFilters from '../components/SearchFilters';
import CampaignCard from '../components/CampaignCard';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const [featured, setFeatured] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, category: category === 'All' ? undefined : category, sort, page, limit: 15 };
      const res = await api.get('/campaigns', { params });
      setCampaigns(res.data?.campaigns || []);
      setPagination(res.data?.pagination || {});
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setCampaigns([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    api.get('/campaigns/featured')
      .then((res) => setFeatured(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch featured campaigns:', err);
        setFeatured([]);
      });

    api.get('/campaigns/emergency')
      .then((res) => setEmergency(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch emergency campaigns:', err);
        setEmergency([]);
      });

    api.get('/constants')
      .then((res) => setCategories(res.data?.campaignCategories || []))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  return (
    <div>
      <CampaignCarousel campaigns={featured} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isFundraiser && (
          <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 border border-zinc-700 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                  Fundraiser Account Notice <span>•</span> Action Policy
                </h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  You are currently logged in as a <strong>Fundraiser</strong>. In accordance with platform policy, fundraiser accounts <strong>cannot donate to campaigns or purchase merchandise</strong>. Please manage your campaigns from your portal.
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-black rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
            >
              Open Fundraiser Portal <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <SearchFilters
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          categories={categories}
        />

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Active Campaigns</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : campaigns.filter((c) => !c.isEmergency).length === 0 ? (
            <p className="text-center text-slate-500 py-12">No campaigns found matching your criteria.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {campaigns
                  .filter((c) => !c.isEmergency)
                  .map((c) => (
                    <CampaignCard key={c._id} campaign={c} />
                  ))}
              </div>
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-2xl font-bold text-red-800">Emergency Campaigns</h2>
          </div>
          {emergency.length === 0 ? (
            <p className="text-red-700 text-center py-8 font-medium">
              No Emergency Campaigns Available
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergency.map((c) => (
                <CampaignCard key={c._id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
