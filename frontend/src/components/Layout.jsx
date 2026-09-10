import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const location = useLocation();
  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardOrAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isDashboardOrAdmin && <Footer />}
    </div>
  );
}

