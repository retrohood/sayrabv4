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
  Cpu,
  Layers,
  Factory,
  Palette,
  CheckCircle2,
  Scissors,
  FileCheck2,
  Truck,
  ArrowUpRight,
} from 'lucide-react';

// Category-accurate high-resolution product imagery mapper
const getAccurateProductImage = (product) => {
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const rawImg = product.image || product.images?.[0] || '';

  // Use raw image if it's an uploaded asset and not a random picsum seed
  if (rawImg && !rawImg.includes('picsum.photos') && !rawImg.includes('placeholder')) {
    return rawImg;
  }

  // 1. Hoodies / Sweatshirts / Fleece
  if (name.includes('hoodie') || category.includes('hoodie')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
  }
  // 2. T-Shirts / Tees / Cotton Shirts
  if (name.includes('tee') || name.includes('t-shirt') || name.includes('shirt')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
  }
  // 3. Sweaters / Knitwear / Polo / Varsity
  if (name.includes('polo') || name.includes('rugby') || name.includes('sweater') || name.includes('varsity')) {
    return 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80';
  }
  // 4. Mugs / Ceramic drinkware
  if (name.includes('mug') || category.includes('mug') || category.includes('drinkware')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  }
  // 5. Water Bottles / Thermos / Flask
  if (name.includes('bottle') || category.includes('bottle') || name.includes('flask')) {
    return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80';
  }
  // 6. Bags / Totes / Backpacks
  if (name.includes('bag') || name.includes('tote') || category.includes('bag')) {
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
  }
  // 7. Stationery / Notebooks / Diaries
  if (name.includes('notebook') || name.includes('diary') || category.includes('stationery')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  }
  // 8. Caps / Hats
  if (name.includes('cap') || name.includes('hat')) {
    return 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80';
  }

  // Clean apparel merchandise product flatlay fallback
  return 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80';
};

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
        limit: 12, // 4 columns x 3 rows for clean desktop grid
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

    // Featured merchandise products for Home showcase
    api
      .get('/products', { params: { limit: 8 } })
      .then((res) => {
        setMerchProducts(res.data?.products?.slice(0, 8) || []);
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
    <div className="space-y-16 pb-20 bg-[#f7f9f5]">
      {/* 1. HERO SECTION (Apparel Technology & Purpose-Driven Commerce) */}
      <section className="relative bg-gradient-to-b from-[#89ca2e]/12 via-[#f7f9f5] to-[#f7f9f5] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#e5e9e3]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Description, and 3 CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-[10px] sm:text-xs font-black uppercase tracking-wider border border-[#89ca2e]/40 shadow-2xs max-w-full">
              <Sparkles size={14} className="text-[#367c35] shrink-0" />
              <span className="truncate sm:whitespace-normal">APPAREL TECHNOLOGY • INTELLIGENT DESIGN • PURPOSE-DRIVEN COMMERCE</span>
            </div>

            <h1 className="text-[26px] sm:text-4xl lg:text-6xl font-black text-[#10182b] tracking-tight leading-[1.18] sm:leading-[1.12]">
              Design with Intelligence.{' '}
              <span className="text-[#367c35] underline decoration-[#89ca2e] decoration-4 underline-offset-8">
                Create with Purpose.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-[#64748b] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Sayrab brings apparel customization, intelligent design workflows, fundraising, and manufacturing
              coordination together in one connected platform.
            </p>

            {/* Three CTA Buttons with Strict Hierarchy */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
              {/* Primary CTA */}
              <button
                onClick={scrollToCampaigns}
                className="w-full sm:w-auto justify-center px-6 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Explore Campaigns <ArrowRight size={16} />
              </button>

              {/* Secondary CTA */}
              <Link
                to="/start-campaign"
                className="w-full sm:w-auto justify-center px-6 py-3.5 bg-[#10182b] hover:bg-[#172033] text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-98"
              >
                Start a Campaign <Heart size={16} className="text-[#89ca2e]" />
              </Link>

              {/* Tertiary CTA */}
              <Link
                to="/store"
                className="w-full sm:w-auto justify-center px-6 py-3.5 bg-white hover:bg-slate-50 border-2 border-[#89ca2e] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 active:scale-98"
              >
                <ShoppingBag size={16} className="text-[#367c35]" />
                Explore Merch Store
              </Link>
            </div>
          </div>

          {/* Right Column: High-Quality Apparel-Design & Manufacturing Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#e5e9e3] shadow-2xl p-5 overflow-hidden">
              {/* Top Tech Pack Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e5e9e3] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#89ca2e] animate-pulse" />
                  <span className="font-extrabold text-[#10182b] tracking-wide">Sayrab Apparel Tech Spec</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#89ca2e]/20 text-[#367c35] text-[10px] font-black uppercase">
                  Production Ready
                </span>
              </div>

              {/* Garment Mockup & Tech CAD Overlay */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gradient-to-br from-[#10182b] via-[#172033] to-[#10182b] p-4 flex items-center justify-center group">
                {/* Background CAD grid */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#89ca2e 1px, transparent 1px), radial-gradient(#89ca2e 1px, #10182b 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Garment Mockup Image */}
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80"
                  alt="Sayrab Purpose-Driven Apparel Design"
                  className="w-full h-full object-cover rounded-xl shadow-lg brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-500"
                />

                {/* Floating Technical Badges */}
                <div className="absolute top-3 left-3 bg-[#10182b]/90 backdrop-blur-md border border-[#89ca2e]/40 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1.5">
                  <Cpu size={12} className="text-[#89ca2e]" />
                  <span>AI Tech Pack Extracted</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-[#10182b]/90 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1.5">
                  <Factory size={12} className="text-[#89ca2e]" />
                  <span>Sialkot Factory Ready • MOQ 50</span>
                </div>
              </div>

              {/* Spec Attributes Strip */}
              <div className="pt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                  <span className="block text-[10px] text-[#64748b] font-medium">Fabric Density</span>
                  <span className="font-extrabold text-[#10182b]">320 GSM Fleece</span>
                </div>
                <div className="p-2 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                  <span className="block text-[10px] text-[#64748b] font-medium">Customization</span>
                  <span className="font-extrabold text-[#10182b]">Precision Screen</span>
                </div>
                <div className="p-2 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                  <span className="block text-[10px] text-[#64748b] font-medium">Revenue Split</span>
                  <span className="font-extrabold text-[#367c35]">50% Cause Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST AND PLATFORM VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl border border-[#e5e9e3] shadow-md p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">AI-Assisted Apparel Design</h4>
              <p className="text-[11px] text-[#64748b]">Multi-modal garment spec extraction</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Connected Design Workflows</h4>
              <p className="text-[11px] text-[#64748b]">From sketch to verified tech pack</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] shrink-0">
              <Factory size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Manufacturing Coordination</h4>
              <p className="text-[11px] text-[#64748b]">Direct Sialkot industrial bidding</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Fundraising & Merchandise</h4>
              <p className="text-[11px] text-[#64748b]">100% direct gift + 50% merch share</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM STATISTICS (Live from Backend) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: 'Total Funds Raised',
              value: formatCurrency(stats.totalFundsRaised || 0),
              icon: TrendingUp,
              sub: 'Direct donations & merch sales',
            },
            {
              label: 'Total Campaigns Supported',
              value: (stats.totalCampaignsSupported || 0).toLocaleString(),
              icon: Award,
              sub: 'Community & verified causes',
            },
            {
              label: 'Verified Community Donors',
              value: (stats.totalDonors || 0).toLocaleString(),
              icon: Users,
              sub: 'Global supporters & buyers',
            },
            {
              label: 'Successful Campaigns',
              value: (stats.emergencyCampaignsFunded || 0).toLocaleString(),
              icon: ShieldCheck,
              sub: 'Completed funding milestones',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e5e9e3] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="p-3 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] shrink-0">
                  <Icon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight truncate">{stat.value}</p>
                  <p className="text-xs font-bold text-[#10182b] mt-1">{stat.label}</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5 truncate">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED COMMUNITY CAMPAIGNS CAROUSEL */}
      <CampaignCarousel campaigns={featured} />

      {/* 5. MAIN CONTAINER: DISCOVERY, CAMPAIGNS & EMERGENCY APPEALS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Search, Filters and Category Selection */}
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

        {/* Active Campaigns Grid (4-Column Desktop) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e9e3] pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">Active Campaigns</h2>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Verified community appeals and purpose-driven initiatives
              </p>
            </div>
            <span className="text-xs font-bold text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full self-start sm:self-auto border border-[#89ca2e]/30">
              Page {page} of {pagination.pages || 1}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-88 animate-pulse border border-[#e5e9e3]" />
              ))}
            </div>
          ) : campaigns.filter((c) => !c.isEmergency).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e9e3] p-8 shadow-xs">
              <p className="text-[#10182b] font-bold text-base">No campaigns found matching your criteria.</p>
              <p className="text-[#64748b] text-xs mt-1">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaigns
                  .filter((c) => !c.isEmergency)
                  .map((c) => (
                    <CampaignCard key={c._id} campaign={c} />
                  ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
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

        {/* Emergency Relief Campaigns Section */}
        <section className="space-y-6">
          {emergency.length > 0 ? (
            <div className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-sm">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-red-950 tracking-tight uppercase">
                      Emergency Relief Campaigns
                    </h2>
                    <p className="text-xs text-red-700">Urgent verified life-saving and disaster relief appeals</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  {emergency.length} Urgent Appeal{emergency.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {emergency.map((c) => (
                  <CampaignCard key={c._id} campaign={c} />
                ))}
              </div>
            </div>
          ) : (
            /* Compact, professional, non-alarmist empty state */
            <div className="bg-white rounded-2xl border border-[#e5e9e3] p-6 text-center shadow-xs">
              <div className="inline-flex p-2 rounded-xl bg-[#89ca2e]/20 text-[#367c35] mb-2">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-extrabold text-[#10182b] text-sm">No Emergency Campaigns Available</h3>
              <p className="text-xs text-[#64748b] mt-1 max-w-md mx-auto">
                All current urgent relief targets are currently satisfied or awaiting verification. Explore ongoing
                community campaigns below.
              </p>
            </div>
          )}
        </section>

        {/* 6. HOW SAYRAB WORKS (Compact 4-Step Visual Corporate Explainer) */}
        <section className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
              <Layers size={13} /> The Sayrab Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">How Sayrab Works</h2>
            <p className="text-xs sm:text-sm text-[#64748b]">
              A connected platform uniting community causes with intelligent apparel customization and verified
              manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create or Explore a Cause',
                desc: 'Fundraisers launch campaigns with transparent goals; donors give directly with 100% passthrough.',
                icon: Heart,
              },
              {
                step: '02',
                title: 'Design Custom Apparel',
                desc: 'Generate apparel tech packs, customize garments, and compile digital production specifications.',
                icon: Scissors,
              },
              {
                step: '03',
                title: 'Engage Donors & Buyers',
                desc: 'Community members buy purpose-driven merchandise, with 50% revenue directly funding the cause.',
                icon: ShoppingBag,
              },
              {
                step: '04',
                title: 'Coordinate Manufacturing',
                desc: 'Verified Sialkot factories fulfill batch orders with milestone tracking and transparent payouts.',
                icon: Factory,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] p-6 flex flex-col justify-between hover:border-[#89ca2e] hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#89ca2e] tracking-widest">{item.step}</span>
                      <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3] text-[#367c35] group-hover:bg-[#89ca2e] group-hover:text-[#10182b] transition-colors">
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="font-black text-[#10182b] text-base">{item.title}</h3>
                    <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. FEATURED MERCHANDISE SECTION (Accurate Category Images & 50/45/5 Split) */}
        <section className="bg-white border border-[#e5e9e3] rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e9e3] pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-bold uppercase tracking-wider">
                <ShoppingBag size={13} /> Purpose-Driven Commerce
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">Featured Merchandise</h2>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Explore thoughtfully customized products and discover another way to support the Sayrab community.
              </p>
            </div>
            <Link
              to="/store"
              className="px-6 py-3 bg-[#10182b] hover:bg-[#172033] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm hover:shadow-md"
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {merchProducts.map((product) => {
                const img = getAccurateProductImage(product);
                return (
                  <div
                    key={product._id}
                    className="group bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] hover:border-[#89ca2e] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="aspect-square bg-white overflow-hidden p-3 relative flex items-center justify-center">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-5 left-5 px-2 py-0.5 rounded-md bg-[#10182b]/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {product.category || 'Apparel'}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#f7f9f5]">
                      <div>
                        <h4 className="font-extrabold text-[#10182b] text-sm line-clamp-1 group-hover:text-[#367c35] transition-colors">
                          {product.name}
                        </h4>
                        <p className="font-black text-[#10182b] text-base mt-1">{formatCurrency(product.price)}</p>
                      </div>

                      <div className="pt-2 flex flex-col gap-2 border-t border-[#e5e9e3]">
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full py-2 text-center bg-white hover:bg-slate-100 border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] transition-colors"
                        >
                          View Product
                        </Link>
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full py-2 text-center bg-[#89ca2e] hover:bg-[#7bb926] rounded-xl text-xs font-black text-[#10182b] transition-colors shadow-xs"
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

          {/* Revenue Split Transparency Strip */}
          <div className="p-4 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#172033] gap-2">
            <span className="font-bold flex items-center gap-1.5 text-[#367c35]">
              <Coins size={16} /> Transparent Merchandise Revenue Split:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-[#10182b]">50% Fundraiser Beneficiary</span>
              <span>•</span>
              <span className="text-[#10182b]">45% Manufacturer</span>
              <span>•</span>
              <span className="text-[#10182b]">5% Sayrab Platform</span>
            </div>
          </div>
        </section>

        {/* 8. PRE-FOOTER CALL TO ACTION (Turn Ideas Into Impact) */}
        <section className="bg-gradient-to-br from-[#10182b] via-[#172033] to-[#10182b] rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-[#89ca2e]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
              <Sparkles size={14} /> Join the Movement
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Turn Ideas Into Impact.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Explore meaningful campaigns, discover customized merchandise, and become part of the Sayrab ecosystem.
              Whether donating directly or launching purpose-driven apparel, every action creates change.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToCampaigns}
                className="px-7 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Explore Campaigns <ArrowRight size={16} />
              </button>

              <Link
                to="/store"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                Visit Merch Store <ShoppingBag size={16} className="text-[#89ca2e]" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
