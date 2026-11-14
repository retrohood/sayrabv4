import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Phone, MapPin, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { user } = useAuth();
  const homeTarget = user?.role === 'manufacturer' ? '/manufacturer' : user?.role === 'admin' ? '/admin' : '/';

  return (
    <footer className="bg-[#10182b] text-[#64748b] border-t border-[#172033] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to={homeTarget} className="flex items-center gap-2.5">
              <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto object-contain" />
              <span className="font-black text-2xl text-white tracking-tight">
                Sayrab<span className="text-[#89ca2e]">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sayrab is an integrated fundraising and merchandise platform connecting compassionate donors with verified causes through direct donations and transparent purpose-driven merchandise.
            </p>
            <div className="pt-2 text-xs text-[#89ca2e] font-semibold flex items-center gap-1.5">
              <ShieldCheck size={16} /> 100% Verified Community Causes
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider text-[#89ca2e]">
              Platform Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/start-campaign" className="hover:text-white transition-colors">Start a Campaign</Link>
              </li>
              <li>
                <Link to="/store" className="hover:text-white transition-colors">Merchandise Store</Link>
              </li>
              <li>
                <Link to="/campaigns" className="hover:text-white transition-colors">Browse Campaigns</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">Community Reviews</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Causes & Transparency */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider text-[#89ca2e]">
              Causes & Transparency
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/campaigns?category=Medical+Assistance" className="hover:text-white transition-colors">
                  Medical Assistance
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Education+%2F+Student+Fees" className="hover:text-white transition-colors">
                  Education & Student Fees
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Disaster+Relief" className="hover:text-white transition-colors">
                  Disaster Relief
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Food+Distribution" className="hover:text-white transition-colors">
                  Food Distribution
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Small+Business+Support" className="hover:text-white transition-colors">
                  Small Business Support
                </Link>
              </li>
              <li className="pt-1 text-[11px] text-[#89ca2e] font-medium">
                Merchandise Split: 50% Org / 45% Manufacturer / 5% Sayrab
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider text-[#89ca2e]">
              Contact & Support
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-[#89ca2e] shrink-0" />
                <span>support@sayrab.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-[#89ca2e] shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-[#89ca2e] shrink-0" />
                <span>Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={15} className="text-[#89ca2e] shrink-0" />
                <span>www.sayrab.com</span>
              </li>
            </ul>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#64748b]">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#172033] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] gap-3">
          <p>© {new Date().getFullYear()} Sayrab Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={13} className="text-rose-500 fill-rose-500" /> for community impact
          </p>
        </div>
      </div>
    </footer>
  );
}
