import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-90">
              <img src="/sayrab.png" alt="Sayrab" className="h-16 w-auto" />
              <span className="font-extrabold text-white text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Sayrab
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting compassionate donors with verified fundraisers to create lasting social
              impact through transparent crowdfunding and verified merchandise split allocations.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3 tracking-wide uppercase text-xs text-cyan-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/store" className="hover:text-cyan-400 transition-colors">Merchandise Store</Link></li>
              <li><Link to="/reviews" className="hover:text-cyan-400 transition-colors">Reviews</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3 tracking-wide uppercase text-xs text-cyan-400">Core Values</h3>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Transparency & Live Tracking</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> 50% Verified Merch Fund Allocation</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Direct Community Support</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Safe Verified Manufacturer Network</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/80 mt-8 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Sayrab Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
