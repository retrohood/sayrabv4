import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import Auth from './pages/Auth';
import StartCampaign from './pages/StartCampaign';
import CreateCampaign from './pages/CreateCampaign';
import Store from './pages/Store';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns/:slug" element={<CampaignDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/start-campaign" element={<StartCampaign />} />
            <Route
              path="/create-campaign"
              element={
                <ProtectedRoute roles={['fundraiser']}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route path="/store" element={<Store />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
