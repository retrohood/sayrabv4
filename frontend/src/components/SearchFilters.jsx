import { Search, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'least_funded', label: 'Least Funded' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_urgent', label: 'Most Urgent' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

export default function SearchFilters({
  search = '',
  setSearch = () => {},
  category,
  setCategory,
  sort,
  setSort,
  categories = [],
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e5e9e3] p-5 sm:p-6 space-y-4">
      {/* Top Row: Search Input & Sort Select */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search by Title, Keywords, Organizer */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, keywords, or organizer name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs sm:text-sm text-[#172033] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-transparent transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto shrink-0">
          <label className="text-xs font-bold text-[#64748b] whitespace-nowrap flex items-center gap-1">
            <Filter size={14} className="text-[#367c35]" /> Sort By:
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full md:w-48 px-3 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs sm:text-sm text-[#172033] font-semibold focus:outline-none focus:ring-2 focus:ring-[#89ca2e]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Row */}
      <div className="pt-2 border-t border-[#e5e9e3]">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#64748b] mb-2.5">
          Campaign Categories
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              category === 'All'
                ? 'bg-[#89ca2e] text-[#10182b] shadow-sm'
                : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
            }`}
          >
            All Causes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === cat
                  ? 'bg-[#89ca2e] text-[#10182b] shadow-sm'
                  : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
