import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const defaultTab = typeParam === 'fundraiser' ? 'fundraiser' : typeParam === 'manufacturer' ? 'manufacturer' : 'customer';
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
  const { login, registerDonor, registerFundraiser, registerManufacturer, completeOAuthLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');
    const redirect = searchParams.get('redirect') || '/dashboard';

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!token) return;

    setLoading(true);
    completeOAuthLogin(token)
      .then(() => navigate(redirect, { replace: true }))
      .catch(() => setError('Google login succeeded, but we could not load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [completeOAuthLogin, navigate, searchParams]);

  const handleGoogleLogin = () => {
    const redirect = searchParams.get('redirect') || '/dashboard';
    const role = mode === 'register' && tab === 'fundraiser' 
      ? 'fundraiser' 
      : mode === 'register' && tab === 'manufacturer' 
      ? 'manufacturer' 
      : 'customer';
    const params = new URLSearchParams({ redirect, role });
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBase}/auth/google?${params.toString()}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      setForm({ ...form, phone: digits });
      return;
    }
    if (name === 'cnic') {
      const digits = value.replace(/\D/g, '').slice(0, 13);
      let formatted;
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
      if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.confirmPassword || !form.phone.trim()) {
        setError('Please fill in all required fields');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (form.phone.length < 10) {
        setError('Please enter a valid phone number (at least 10 digits)');
        return;
      }
      if ((tab === 'fundraiser' || tab === 'manufacturer') && step === 1) {
        setStep(2);
        return;
      }
      if ((tab === 'fundraiser' || tab === 'manufacturer') && step === 2) {
        if (!form.cnic.trim() || !form.address.trim()) {
          setError(tab === 'manufacturer' ? 'Please fill in Tax / NTN / CNIC ID and Factory Address' : 'Please fill in CNIC and Address');
          return;
        }
        if (tab === 'fundraiser' && form.cnic.length !== 15) {
          setError('Invalid CNIC format. Expected: XXXXX-XXXXXXX-X');
          return;
        }
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (tab === 'customer' || tab === 'donor') {
        await registerDonor({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        });
      } else if (tab === 'manufacturer') {
        await registerManufacturer({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          cnic: form.cnic.trim(),
          address: form.address.trim(),
        });
      } else {
        await registerFundraiser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          cnic: form.cnic.trim(),
          address: form.address.trim(),
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
          Join Sayrab to donate, fundraise, and manufacture merchandise
        </p>

        {mode === 'register' && (
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                tab === 'customer' || tab === 'donor' ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('fundraiser')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                tab === 'fundraiser' ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fundraiser
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('manufacturer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                tab === 'manufacturer' ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manufacturer
            </button>
          </div>
        )}

        {mode === 'register' && (tab === 'fundraiser' || tab === 'manufacturer') && (
          <div className="flex items-center justify-between mb-6">
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
              step === 1 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
            }`}>
              1. Contact Info
            </div>
            <div className="w-8 h-0.5 bg-slate-200 mb-2"></div>
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
              step === 2 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
            }`}>
              {tab === 'manufacturer' ? '2. Facility & Tax Info' : '2. Address & CNIC'}
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
                    placeholder={tab === 'manufacturer' ? 'Company / Factory Name *' : 'Full Name *'}
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder={tab === 'manufacturer' ? 'Business Email Address *' : 'Email Address *'}
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
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={handleChange}
                    required
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

              {step === 2 && tab === 'manufacturer' && (
                <>
                  <input
                    name="cnic"
                    placeholder="Tax Reg / NTN / CNIC Number *"
                    value={form.cnic}
                    onChange={handleChange}
                    required
                    maxLength={15}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    name="address"
                    placeholder="Factory / Production Facility Address *"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <p className="text-xs text-slate-500">
                    Manufacturer accounts enable Techpack sync, sample production queues, and bulk order requests.
                  </p>
                </>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            {mode === 'register' && (tab === 'fundraiser' || tab === 'manufacturer') && step === 2 && (
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
                mode === 'register' && (tab === 'fundraiser' || tab === 'manufacturer') && step === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Login'
                : (tab === 'fundraiser' || tab === 'manufacturer') && step === 1
                ? 'Next Step'
                : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-xs font-bold text-primary-700">
            G
          </span>
          Continue with Google
        </button>

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
