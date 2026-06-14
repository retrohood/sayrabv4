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
    api.get('/constants').then((res) => setCategories(res.data.campaignCategories));
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
      .then((res) => setCampaigns(res.data.campaigns || []))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Campaigns</h1>
        <p className="text-slate-600 mt-1">Browse verified fundraisers and active emergency appeals.</p>
      </div>

      <SearchFilters
        categories={categories}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
