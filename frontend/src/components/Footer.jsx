import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/sayrab.png" alt="Sayrab" className="h-8 w-auto brightness-0 invert" />
              <span className="font-bold text-white text-lg">Sayrab</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting compassionate donors with verified fundraisers to create lasting social
              impact.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400">Home</Link></li>
              <li><Link to="/start-campaign" className="hover:text-primary-400">Start a Campaign</Link></li>
              <li><Link to="/store" className="hover:text-primary-400">Merchandise Store</Link></li>
              <li><Link to="/about" className="hover:text-primary-400">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Core Values</h3>
            <ul className="space-y-1 text-sm">
              <li>Transparency</li>
              <li>Accountability</li>
              <li>Community Support</li>
              <li>Trust</li>
              <li>Social Impact</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm">
          © {new Date().getFullYear()} Sayrab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
