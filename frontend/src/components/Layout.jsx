import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStandalonePortal =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/manufacturer');

  // Dedicated Manufacturer Account Guard:
  // Manufacturer accounts cannot access home page, campaigns, store, or other buyer/fundraiser pages.
  useEffect(() => {
    if (user?.role === 'manufacturer') {
      const isAllowedPath = location.pathname.startsWith('/manufacturer') || location.pathname === '/auth';
      if (!isAllowedPath) {
        navigate('/manufacturer', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isStandalonePortal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isStandalonePortal && <Footer />}
    </div>
  );
}

