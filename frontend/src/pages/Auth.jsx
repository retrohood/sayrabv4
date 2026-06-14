import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'fundraiser' ? 'fundraiser' : 'donor';
  const [tab, setTab] = useState(defaultTab);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registerDonor, registerFundraiser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (tab === 'donor') {
        await registerDonor({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      } else {
        await registerFundraiser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          cnic: form.cnic,
          address: form.address,
        });
      }
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const networkMessage = err.response
        ? 'Authentication failed'
        : 'Unable to reach the server. Please make sure the backend and MongoDB are running.';
      setError(serverMessage || networkMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-center text-slate-500 text-sm mb-6">
          Join Sayrab to donate, fundraise, and make an impact
        </p>

        {mode === 'register' && (
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab('donor')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'donor' ? 'bg-white shadow text-primary-700' : 'text-slate-600'
              }`}
            >
              Donor Account
            </button>
            <button
              type="button"
              onClick={() => setTab('fundraiser')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'fundraiser' ? 'bg-white shadow text-primary-700' : 'text-slate-600'
              }`}
            >
              Fundraiser Account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              name="fullName"
              placeholder="Full Name *"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password *"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />

          {mode === 'register' && (
            <>
              <input
                name="phone"
                placeholder={tab === 'fundraiser' ? 'Phone Number *' : 'Phone Number (optional)'}
                value={form.phone}
                onChange={handleChange}
                required={tab === 'fundraiser'}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              {tab === 'fundraiser' && (
                <>
                  <input
                    name="cnic"
                    placeholder="CNIC *"
                    value={form.cnic}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    name="address"
                    placeholder="Address *"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <p className="text-xs text-slate-500">
                    Identity verification documents may be required for high-value campaigns.
                  </p>
                </>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('register')} className="text-primary-600 font-medium">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary-600 font-medium">
                Login
              </button>
            </>
          )}
        </p>

        <p className="text-center text-sm mt-4">
          <Link to="/" className="text-slate-500 hover:text-primary-600">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
