import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

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
  const { login, registerDonor, registerFundraiser, completeOAuthLogin } = useAuth();
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
    const role = mode === 'register' && tab === 'fundraiser' ? 'fundraiser' : 'customer';
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 p-8 max-w-md w-full relative overflow-hidden">
        {/* Glow backdrop decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img src="/sayrab.png" alt="Sayrab" className="h-16 w-auto mx-auto mb-3" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Join Sayrab to support verified causes, shop merchandise, or launch fundraising campaigns.
          </p>
        </div>

        {mode === 'register' && (
          <div className="flex rounded-xl bg-slate-950 p-1.5 mb-6 border border-slate-800 relative z-10">
            <button
              type="button"
              onClick={() => handleTabChange('donor')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'donor'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake size={14} /> Buyer / Donor
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('fundraiser')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'fundraiser'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={14} /> Fundraiser
            </button>
          </div>
        )}

        {mode === 'register' && tab === 'fundraiser' && (
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-bold ${
              step === 1 ? 'border-cyan-400 text-cyan-400' : 'border-slate-800 text-slate-500'
            }`}>
              1. Personal Details
            </div>
            <div className="w-8 h-0.5 bg-slate-800 mb-2"></div>
            <div className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-bold ${
              step === 2 ? 'border-cyan-400 text-cyan-400' : 'border-slate-800 text-slate-500'
            }`}>
              2. Verification & Address
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'login' ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                    <input
                      name="fullName"
                      placeholder="e.g. John Doe"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Password *</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      {tab === 'fundraiser' ? 'Phone Number *' : 'Phone Number (Optional)'}
                    </label>
                    <input
                      name="phone"
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={handleChange}
                      required={tab === 'fundraiser'}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </>
              )}

              {step === 2 && tab === 'fundraiser' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">CNIC (National ID) *</label>
                    <input
                      name="cnic"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={form.cnic}
                      onChange={handleChange}
                      required
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Residential / Organization Address *</label>
                    <input
                      name="address"
                      placeholder="Street, City, Province"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    🔒 Identity verification documents may be reviewed prior to high-value payout disbursements.
                  </p>
                </>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {mode === 'register' && tab === 'fundraiser' && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 ${
                mode === 'register' && tab === 'fundraiser' && step === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In to Account'
                : tab === 'fundraiser' && step === 1
                ? 'Proceed to Step 2 →'
                : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center gap-3 relative z-10">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">or continue with</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50 relative z-10 shadow-sm"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-700 text-[11px] font-black text-cyan-400">
            G
          </span>
          Continue with Google
        </button>

        <div className="text-center text-xs text-slate-400 mt-6 relative z-10">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => handleModeChange('register')}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline ml-1"
              >
                Sign Up Now
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => handleModeChange('login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline ml-1"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        <div className="text-center text-xs mt-4 relative z-10">
          <Link to="/" className="text-slate-500 hover:text-cyan-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
