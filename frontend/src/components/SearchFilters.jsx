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
  category,
  setCategory,
  sort,
  setSort,
  categories,
}) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Sort Campaigns
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Campaign Categories
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              category === 'All'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white'
            }`}
          >
            All Causes
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === cat
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white'
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
