import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'fundraiser' ? 'fundraiser' : 'donor';
  const [tab, setTab] = useState(defaultTab);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    address: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registerDonor, registerFundraiser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      setForm({ ...form, phone: digits });
      return;
    }
    if (name === 'cnic') {
      const digits = value.replace(/\D/g, '').slice(0, 13);
      let formatted = '';
      if (digits.length <= 5) {
        formatted = digits;
      } else if (digits.length <= 12) {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
      }
      setForm({ ...form, cnic: formatted });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setStep(1);
    setError('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (tab === 'fundraiser' && step === 1) {
        if (!form.fullName || !form.email || !form.password || !form.phone) {
          setError('Please fill in all required fields');
          return;
        }
        setStep(2);
        return;
      }
      if (tab === 'fundraiser' && step === 2) {
        if (!form.cnic || !form.address) {
          setError('Please fill in CNIC and Address');
          return;
        }
        if (form.cnic.length !== 15) {
          setError('Invalid CNIC format. Expected: XXXXX-XXXXXXX-X');
          return;
        }
      }
    }

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
        <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto mx-auto mb-4" />
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
              onClick={() => handleTabChange('donor')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'donor' ? 'bg-white shadow text-primary-700' : 'text-slate-600'
              }`}
            >
              Donor Account
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('fundraiser')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'fundraiser' ? 'bg-white shadow text-primary-700' : 'text-slate-600'
              }`}
            >
              Fundraiser Account
            </button>
          </div>
        )}

        {mode === 'register' && tab === 'fundraiser' && (
          <div className="flex items-center justify-between mb-6">
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
              step === 1 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
            }`}>
              1. Personal Info
            </div>
            <div className="w-8 h-0.5 bg-slate-200 mb-2"></div>
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
              step === 2 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
            }`}>
              2. Address Info
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <>
              <input
                name="email"
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password *"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </>
          ) : (
            <>
              {step === 1 && (
                <>
                  <input
                    name="fullName"
                    placeholder="Full Name *"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address *"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Password *"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Confirm Password *"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <input
                    name="phone"
                    placeholder={tab === 'fundraiser' ? 'Phone Number *' : 'Phone Number (optional)'}
                    value={form.phone}
                    onChange={handleChange}
                    required={tab === 'fundraiser'}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </>
              )}

              {step === 2 && tab === 'fundraiser' && (
                <>
                  <input
                    name="cnic"
                    placeholder="CNIC * (XXXXX-XXXXXXX-X)"
                    value={form.cnic}
                    onChange={handleChange}
                    required
                    maxLength={15}
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

          <div className="flex gap-3">
            {mode === 'register' && tab === 'fundraiser' && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 cursor-pointer ${
                mode === 'register' && tab === 'fundraiser' && step === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Login'
                : tab === 'fundraiser' && step === 1
                ? 'Next Step'
                : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => handleModeChange('register')} className="text-primary-600 font-medium cursor-pointer">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => handleModeChange('login')} className="text-primary-600 font-medium cursor-pointer">
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
