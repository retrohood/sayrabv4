import { useEffect, useState } from 'react';
import CampaignCard from '../components/CampaignCard';
import SearchFilters from '../components/SearchFilters';
import api from '../api/client';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/constants')
      .then((res) => setCategories(res.data?.campaignCategories || []))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/campaigns', {
        params: {
          search: search || undefined,
          category: category === 'All' ? undefined : category,
          sort,
          limit: 24,
        },
      })
      .then((res) => setCampaigns(res.data?.campaigns || []))
      .catch((err) => {
        console.error('Failed to fetch campaigns:', err);
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Browse Campaigns</h1>
        <p className="text-slate-400 text-xs mt-1">Explore verified fundraisers and active community appeals.</p>
      </div>

      <SearchFilters
        categories={categories}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 rounded-2xl border border-slate-800 bg-slate-900 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">No campaigns match your selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
