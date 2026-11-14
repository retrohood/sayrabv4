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
    api
      .get('/constants')
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
          search: search.trim() || undefined,
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
      <div className="border-b border-[#e5e9e3] pb-4">
        <h1 className="text-3xl font-black text-[#10182b] tracking-tight">Explore Campaigns</h1>
        <p className="text-[#64748b] text-xs sm:text-sm mt-1">
          Discover genuine community causes and support verified appeals across Pakistan.
        </p>
      </div>

      <SearchFilters
        search={search}
        setSearch={setSearch}
        categories={categories}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 rounded-2xl border border-[#e5e9e3] bg-white animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e9e3] shadow-xs">
          <p className="text-[#10182b] font-bold text-sm">No campaigns found matching your selection.</p>
          <p className="text-[#64748b] text-xs mt-1">Try resetting search or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {campaigns.map((c) => (
            <CampaignCard key={c._id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
