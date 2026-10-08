import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  HeartHandshake,
  Factory,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
} from 'lucide-react';

const ROLES = [
  {
    id: 'donor',
    label: 'Buyer / Donor',
    icon: HeartHandshake,
    description: 'Support verified causes, shop merchandise, or donate.',
    color: 'from-blue-600 to-cyan-500',
    demoEmail: 'demo@sayrab.local',
    demoPass: 'password123',
  },
  {
    id: 'fundraiser',
    label: 'Fundraiser',
    icon: ShieldCheck,
    description: 'Launch fundraising campaigns and create charity merch.',
    color: 'from-cyan-600 to-teal-500',
    demoEmail: 'ahmed@example.com',
    demoPass: 'password123',
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    icon: Factory,
    description: 'Produce merchandise, review techpacks, and fulfill orders.',
    color: 'from-amber-600 to-orange-500',
    demoEmail: 'manufacturer@sayrab.com',
    demoPass: 'password123',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldAlert,
    description: 'Manage platform operations, payouts, campaigns & users.',
    color: 'from-purple-600 to-indigo-500',
    demoEmail: 'admin@sayrab.com',
    demoPass: 'password123',
  },
];

const SPECIALTY_OPTIONS = [
  'Apparel',
  'Drinkware',
  'Stationery',
  'Accessories',
  'Event Merchandise',
  'Embroidery & Print',
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type');
  const defaultTab = ROLES.some((r) => r.id === rawType)
    ? rawType
    : rawType === 'buyer'
    ? 'donor'
    : 'donor';

  const [tab, setTab] = useState(defaultTab);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    address: '',
    specialties: ['Apparel', 'Accessories'],
    adminSecretKey: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    login,
    registerDonor,
    registerFundraiser,
    registerManufacturer,
    registerAdmin,
    completeOAuthLogin,
  } = useAuth();
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
      .then((profile) => {
        const explicitRedirect = searchParams.get('redirect');
        if (explicitRedirect) {
          navigate(explicitRedirect, { replace: true });
        } else if (profile?.role === 'manufacturer') {
          navigate('/manufacturer', { replace: true });
        } else if (profile?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(redirect, { replace: true });
        }
      })
      .catch(() =>
        setError('Google login succeeded, but we could not load your profile. Please try again.')
      )
      .finally(() => setLoading(false));
  }, [completeOAuthLogin, navigate, searchParams]);

  const handleGoogleLogin = () => {
    const defaultRedirect = tab === 'manufacturer' ? '/manufacturer' : tab === 'admin' ? '/admin' : '/dashboard';
    const redirect = searchParams.get('redirect') || defaultRedirect;
    let role = 'customer';
    if (tab === 'fundraiser') role = 'fundraiser';
    else if (tab === 'manufacturer') role = 'manufacturer';
    else if (tab === 'admin') role = 'admin';

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

  const toggleSpecialty = (spec) => {
    const current = form.specialties || [];
    if (current.includes(spec)) {
      setForm({ ...form, specialties: current.filter((s) => s !== spec) });
    } else {
      setForm({ ...form, specialties: [...current, spec] });
    }
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

  const handleFillDemo = (roleId) => {
    const roleConfig = ROLES.find((r) => r.id === roleId);
    if (!roleConfig) return;
    setTab(roleId);
    setForm((prev) => ({
      ...prev,
      email: roleConfig.demoEmail,
      password: roleConfig.demoPass,
    }));
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
          setError('Please fill in all required personal details');
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

      if (tab === 'manufacturer') {
        if (!form.fullName || !form.companyName || !form.email || !form.password || !form.phone || !form.address) {
          setError('Please fill in all required company and contact fields');
          return;
        }
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(form.email, form.password);
        const loggedUser = res?.user;
        const explicitRedirect = searchParams.get('redirect');

        if (explicitRedirect) {
          navigate(explicitRedirect);
        } else if (loggedUser?.role === 'admin') {
          navigate('/admin');
        } else if (loggedUser?.role === 'manufacturer') {
          navigate('/manufacturer');
        } else {
          navigate('/dashboard');
        }
      } else if (tab === 'donor') {
        await registerDonor({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } else if (tab === 'fundraiser') {
        await registerFundraiser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          cnic: form.cnic,
          address: form.address,
        });
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } else if (tab === 'manufacturer') {
        await registerManufacturer({
          fullName: form.fullName,
          companyName: form.companyName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
          specialties: form.specialties,
        });
        const redirect = searchParams.get('redirect') || '/manufacturer';
        navigate(redirect);
      } else if (tab === 'admin') {
        await registerAdmin({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          adminSecretKey: form.adminSecretKey || undefined,
        });
        const redirect = searchParams.get('redirect') || '/admin';
        navigate(redirect);
      }
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

  const currentRole = ROLES.find((r) => r.id === tab) || ROLES[0];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full relative overflow-hidden">
        {/* Glow backdrop decoration */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img src="/sayrab.png" alt="Sayrab" className="h-16 w-auto mx-auto mb-3" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to Sayrab' : 'Create an Account'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login'
              ? 'Select your role or sign in with your credentials'
              : currentRole.description}
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="mb-6 relative z-10">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = tab === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleTabChange(role.id)}
                  className={`py-2.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                    isActive
                      ? `bg-gradient-to-r ${role.color} text-white shadow-md shadow-cyan-500/20`
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate w-full">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Demo Credentials Autofill Banner in Login Mode */}
        {mode === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs relative z-10">
            <div className="flex items-center gap-2 text-slate-300">
              <CurrentIcon size={15} className="text-cyan-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-white block">{currentRole.label} Portal</span>
                <span className="text-[10px] text-slate-400">{currentRole.demoEmail}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo(tab)}
              className="px-2.5 py-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/30 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Sparkles size={11} /> Fill Demo
            </button>
          </div>
        )}

        {/* Fundraiser multi-step progress in Register mode */}
        {mode === 'register' && tab === 'fundraiser' && (
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div
              className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-bold ${
                step === 1 ? 'border-cyan-400 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              1. Personal Details
            </div>
            <div className="w-8 h-0.5 bg-slate-800 mb-2"></div>
            <div
              className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-bold ${
                step === 2 ? 'border-cyan-400 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              2. Verification & Address
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'login' ? (
            /* Login Form */
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
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
            /* Registration Form per Role */
            <>
              {/* Common Base Fields (Step 1 for Fundraiser, Single step for others) */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      {tab === 'manufacturer' ? 'Contact Person Name *' : 'Full Name *'}
                    </label>
                    <input
                      name="fullName"
                      placeholder={tab === 'manufacturer' ? 'e.g. Tariq Mehmood' : 'e.g. John Doe'}
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  {tab === 'manufacturer' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Company / Factory Name *
                      </label>
                      <div className="relative">
                        <input
                          name="companyName"
                          placeholder="e.g. Apex Apparel & Stitching Mills"
                          value={form.companyName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      {tab === 'manufacturer'
                        ? 'Business Email Address *'
                        : tab === 'admin'
                        ? 'Admin Email Address *'
                        : 'Email Address *'}
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder={tab === 'manufacturer' ? 'contact@factory.com' : 'name@example.com'}
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
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
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all pr-10"
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
                      {tab === 'donor' || tab === 'admin'
                        ? 'Phone Number (Optional)'
                        : 'Phone Number *'}
                    </label>
                    <input
                      name="phone"
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={handleChange}
                      required={tab === 'fundraiser' || tab === 'manufacturer'}
                      className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  {tab === 'manufacturer' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Factory / Business Address *
                        </label>
                        <input
                          name="address"
                          placeholder="Industrial Area, City, Province"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                          Production Specialties
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {SPECIALTY_OPTIONS.map((spec) => {
                            const isSelected = form.specialties?.includes(spec);
                            return (
                              <button
                                key={spec}
                                type="button"
                                onClick={() => toggleSpecialty(spec)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {spec}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {tab === 'admin' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Admin Security Passkey (Optional)
                      </label>
                      <input
                        name="adminSecretKey"
                        type="password"
                        placeholder="sayrab-admin-2025"
                        value={form.adminSecretKey}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Default demo passcode is <code className="text-cyan-400 font-mono">sayrab-admin-2025</code> or <code className="text-cyan-400 font-mono">admin123</code>.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Fundraiser Step 2 */}
              {step === 2 && tab === 'fundraiser' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      CNIC (National ID) *
                    </label>
                    <input
                      name="cnic"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={form.cnic}
                      onChange={handleChange}
                      required
                      maxLength={15}
                      className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Residential / Organization Address *
                    </label>
                    <input
                      name="address"
                      placeholder="Street, City, Province"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    🔒 Identity verification documents may be reviewed prior to high-value payout disbursements.
                  </p>
                </>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold rounded-xl">
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
              className={`py-3 bg-gradient-to-r ${currentRole.color} hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                mode === 'register' && tab === 'fundraiser' && step === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading ? (
                'Please wait...'
              ) : mode === 'login' ? (
                <>
                  Sign In as {currentRole.label} <ArrowRight size={14} />
                </>
              ) : tab === 'fundraiser' && step === 1 ? (
                'Proceed to Step 2 →'
              ) : (
                <>
                  Create {currentRole.label} Account <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3 relative z-10">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            or continue with
          </span>
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

        <div className="text-center text-xs text-slate-400 mt-5 relative z-10">
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
                Log In
              </button>
            </>
          )}
        </div>

        <div className="text-center text-xs mt-3 relative z-10">
          <Link to="/" className="text-slate-500 hover:text-cyan-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
