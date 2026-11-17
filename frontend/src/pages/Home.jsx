import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { isFundraiserUser, formatCurrency } from '../utils/format';
import CampaignCarousel from '../components/CampaignCarousel';
import SearchFilters from '../components/SearchFilters';
import CampaignCard from '../components/CampaignCard';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Heart,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Users,
  Award,
  ChevronRight,
  Coins,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const campaignsRef = useRef(null);

  const [featured, setFeatured] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [categories, setCategories] = useState([]);
  const [merchProducts, setMerchProducts] = useState([]);
  const [stats, setStats] = useState({
    totalFundsRaised: 0,
    totalCampaignsSupported: 0,
    totalDonors: 0,
    emergencyCampaignsFunded: 0,
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category: category === 'All' ? undefined : category,
        sort,
        page,
        limit: 15, // 5 columns x 3 rows
      };
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
    // Featured campaigns for carousel
    api
      .get('/campaigns/featured')
      .then((res) => setFeatured(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch featured campaigns:', err);
        setFeatured([]);
      });

    // Emergency relief campaigns
    api
      .get('/campaigns/emergency')
      .then((res) => setEmergency(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch emergency campaigns:', err);
        setEmergency([]);
      });

    // Categories
    api
      .get('/constants')
      .then((res) => setCategories(res.data?.campaignCategories || []))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      });

    // Platform Statistics (live from backend)
    api
      .get('/platform/about')
      .then((res) => {
        if (res.data?.impactStatistics) {
          setStats(res.data.impactStatistics);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch platform stats:', err);
      });

    // Featured merchandise products for Home showcase (4-5 products)
    api
      .get('/products', { params: { limit: 5 } })
      .then((res) => {
        setMerchProducts(res.data?.products?.slice(0, 5) || []);
      })
      .catch((err) => {
        console.error('Failed to fetch store products:', err);
        setMerchProducts([]);
      });
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  const scrollToCampaigns = () => {
    campaignsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* A. Hero Section */}
      <section className="relative bg-gradient-to-b from-[#89ca2e]/15 via-[#f7f9f5] to-[#f7f9f5] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#e5e9e3]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
              <Sparkles size={14} /> Community Crowdfunding & Purpose-Driven Merch
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#10182b] tracking-tight leading-[1.15]">
              Together, We Can <br className="hidden sm:inline" />
              <span className="text-[#367c35] underline decoration-[#89ca2e] decoration-4 underline-offset-6">
                Make a Difference.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748b] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Support meaningful causes, help people in need, and create lasting change through direct donations and
              purpose-driven merchandise.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={scrollToCampaigns}
                className="px-6 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Explore Campaigns <ArrowRight size={16} />
              </button>

              <Link
                to="/start-campaign"
                className="px-6 py-3.5 bg-[#10182b] hover:bg-[#172033] text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                Start a Campaign <Heart size={16} className="text-[#89ca2e]" />
              </Link>

              {/* Merch Store CTA - Clearly Visible */}
              <Link
                to="/store"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 border-2 border-[#89ca2e] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <ShoppingBag size={16} className="text-[#367c35]" />
                Explore Merch Store
              </Link>
            </div>

            <div className="pt-3 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#64748b] font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#367c35]" /> 100% Verified Needs
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Coins size={16} className="text-[#367c35]" /> Direct Donation Routing
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Award size={16} className="text-[#367c35]" /> Transparent Payouts
              </span>
            </div>
          </div>

          {/* Hero Right Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="/sayrab.png"
                alt="Sayrab Community"
                className="w-full h-full object-contain p-8 bg-gradient-to-br from-[#f7f9f5] to-white"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#10182b] via-[#10182b]/80 to-transparent p-5 text-white">
                <p className="text-xs uppercase font-extrabold tracking-wider text-[#89ca2e]">Sayrab Platform</p>
                <p className="text-sm font-bold mt-0.5">Where Community Kindness Translates Into Tangible Aid</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. Platform Statistics (Live from Backend) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Funds Raised',
              value: formatCurrency(stats.totalFundsRaised || 0),
              icon: TrendingUp,
              color: 'text-[#367c35]',
            },
            {
              label: 'Total Campaigns',
              value: (stats.totalCampaignsSupported || 0).toLocaleString(),
              icon: Award,
              color: 'text-[#367c35]',
            },
            {
              label: 'Total Donors',
              value: (stats.totalDonors || 0).toLocaleString(),
              icon: Users,
              color: 'text-[#367c35]',
            },
            {
              label: 'Successful Campaigns',
              value: (stats.emergencyCampaignsFunded || 0).toLocaleString(),
              icon: ShieldCheck,
              color: 'text-[#367c35]',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e5e9e3] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="p-3 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] shrink-0">
                  <Icon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-black text-[#10182b] truncate">{stat.value}</p>
                  <p className="text-xs text-[#64748b] font-semibold mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* C. Latest Campaigns Carousel */}
      <CampaignCarousel campaigns={featured} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* D. Search, Filters and Categories */}
        <div ref={campaignsRef}>
          <SearchFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            categories={categories}
          />
        </div>

        {/* E. 5-Column Campaign Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e9e3] pb-3">
            <div>
              <h2 className="text-2xl font-black text-[#10182b] tracking-tight">Active Campaigns</h2>
              <p className="text-xs text-[#64748b]">Verified community and emergency fundraising appeals</p>
            </div>
            <span className="text-xs font-bold text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full self-start sm:self-auto">
              Page {page} of {pagination.pages || 1}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#e5e9e3]" />
              ))}
            </div>
          ) : campaigns.filter((c) => !c.isEmergency).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e9e3] p-8 shadow-xs">
              <p className="text-[#10182b] font-bold text-base">No campaigns found matching your criteria.</p>
              <p className="text-[#64748b] text-xs mt-1">Try adjusting your search terms or category filter.</p>
            </div>
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
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-white border border-[#e5e9e3] text-[#172033] text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-[#f7f9f5] transition-colors cursor-pointer shadow-xs"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-[#64748b]">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-white border border-[#e5e9e3] text-[#172033] text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-[#f7f9f5] transition-colors cursor-pointer shadow-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* F. Emergency Campaigns Section (Below Regular Grid) */}
        <section className="bg-red-50/70 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600 text-white rounded-xl shadow-sm">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-red-900 tracking-wide uppercase">
                  Emergency Relief Campaigns
                </h2>
                <p className="text-xs text-red-700">Urgent verified life-saving and disaster relief appeals</p>
              </div>
            </div>
            {emergency.length > 0 && (
              <span className="hidden sm:inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                {emergency.length} Urgent Appeal{emergency.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {emergency.length === 0 ? (
            <div className="text-center py-10 bg-white/70 rounded-2xl border border-red-200 text-red-800">
              <p className="font-extrabold text-sm">No Emergency Campaigns Available.</p>
              <p className="text-xs text-red-600 mt-1">All current urgent relief targets are currently satisfied.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {emergency.map((c) => (
                <CampaignCard key={c._id} campaign={c} />
              ))}
            </div>
          )}
        </section>

        {/* G. Merchandise Showcase (Dedicated Home Section) */}
        <section className="bg-white border border-[#e5e9e3] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e9e3] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-bold uppercase tracking-wider">
                <ShoppingBag size={13} /> Shop with a Purpose
              </div>
              <h2 className="text-2xl font-black text-[#10182b] tracking-tight">Featured Merchandise</h2>
              <p className="text-xs text-[#64748b]">
                Every purchase directly funds active causes: 50% to Organization • 45% to Manufacturer • 5% to Sayrab
              </p>
            </div>
            <Link
              to="/store"
              className="px-5 py-2.5 bg-[#10182b] hover:bg-[#172033] text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
            >
              Explore All Merchandise <ChevronRight size={16} />
            </Link>
          </div>

          {merchProducts.length === 0 ? (
            <div className="text-center py-12 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
              <p className="text-xs text-[#64748b]">Merchandise products are currently being updated.</p>
              <Link to="/store" className="mt-2 inline-block text-xs font-bold text-[#367c35] hover:underline">
                Visit Merchandise Store
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {merchProducts.map((product) => {
                const img = product.image || product.images?.[0] || '/placeholder-merch.jpg';
                return (
                  <div
                    key={product._id}
                    className="group bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] hover:border-[#89ca2e] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-white overflow-hidden p-2">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#367c35] uppercase tracking-wider">
                          {product.category || 'Merchandise'}
                        </span>
                        <h4 className="font-extrabold text-[#10182b] text-xs line-clamp-1 mt-0.5">{product.name}</h4>
                        <p className="font-black text-[#10182b] text-sm mt-1">{formatCurrency(product.price)}</p>
                      </div>

                      <div className="pt-2 flex flex-col gap-1.5 border-t border-[#e5e9e3]">
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full py-1.5 text-center bg-white hover:bg-slate-50 border border-[#e5e9e3] rounded-lg text-[11px] font-bold text-[#10182b] transition-colors"
                        >
                          View Product
                        </Link>
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full py-1.5 text-center bg-[#89ca2e] hover:bg-[#7bb926] rounded-lg text-[11px] font-extrabold text-[#10182b] transition-colors shadow-xs"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
