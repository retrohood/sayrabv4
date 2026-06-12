import { Search } from 'lucide-react';

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
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  categories,
  onSearch,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch?.();
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by title, keywords, or organizer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </form>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
        <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === 'All'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
