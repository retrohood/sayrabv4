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
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
  MapPin,
  Building,
  CheckCircle2,
} from 'lucide-react';

const ROLES = [
  {
    id: 'donor',
    label: 'Buyer / Donor',
    icon: HeartHandshake,
    description: 'Support verified causes, shop merchandise, and track donations.',
    color: 'bg-[#89ca2e] text-white',
    badgeColor: 'bg-[#89ca2e]/15 text-[#367c35]',
    demoEmail: 'demo@sayrab.local',
    demoPass: 'password123',
  },
  {
    id: 'fundraiser',
    label: 'Fundraiser',
    icon: ShieldCheck,
    description: 'Launch fundraising campaigns, create custom merch, and receive payouts.',
    color: 'bg-[#367c35] text-white',
    badgeColor: 'bg-[#367c35]/15 text-[#367c35]',
    demoEmail: 'ahmed@example.com',
    demoPass: 'password123',
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    icon: Factory,
    description: 'Produce merchandise, review tech packs, and fulfill quotation orders.',
    color: 'bg-[#10182b] text-white',
    badgeColor: 'bg-[#10182b]/10 text-[#10182b]',
    demoEmail: 'manufacturer@sayrab.com',
    demoPass: 'password123',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldAlert,
    description: 'Manage platform operations, payouts, campaigns, and approvals.',
    color: 'bg-[#10182b] text-white',
    badgeColor: 'bg-purple-100 text-purple-700',
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
  const [rememberMe, setRememberMe] = useState(false);

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    // Step 2 Address components for Fundraiser
    streetAddress: '',
    aptSuite: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    // Generic address for manufacturer
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
      // Numerical characters only
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setForm((prev) => ({ ...prev, phone: digits }));
      return;
    }
    if (name === 'cnic') {
      // Auto formatting XXXXX-XXXXXXX-X with max 13 raw digits
      const digits = value.replace(/\D/g, '').slice(0, 13);
      let formatted;
      if (digits.length <= 5) {
        formatted = digits;
      } else if (digits.length <= 12) {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
      }
      setForm((prev) => ({ ...prev, cnic: formatted }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSpecialty = (spec) => {
    const current = form.specialties || [];
    if (current.includes(spec)) {
      setForm((prev) => ({ ...prev, specialties: current.filter((s) => s !== spec) }));
    } else {
      setForm((prev) => ({ ...prev, specialties: [...current, spec] }));
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
      // Password match check
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match. Please ensure both password fields match.');
        return;
      }

      // Fundraiser Step 1 Validation
      if (tab === 'fundraiser' && step === 1) {
        if (!form.fullName || !form.email || !form.password || !form.phone || !form.cnic) {
          setError('Please fill in all personal details including Full Name, Email, Phone, and CNIC.');
          return;
        }
        if (form.cnic.length !== 15) {
          setError('Please enter a valid 13-digit CNIC in the format XXXXX-XXXXXXX-X.');
          return;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        setStep(2);
        return;
      }

      // Fundraiser Step 2 Validation
      if (tab === 'fundraiser' && step === 2) {
        if (!form.streetAddress || !form.city || !form.stateProvince) {
          setError('Please provide your complete address details (Street Address, City, and State/Province).');
          return;
        }
      }

      if (tab === 'manufacturer') {
        if (!form.fullName || !form.companyName || !form.email || !form.password || !form.phone || !form.address) {
          setError('Please fill in all required company and contact fields.');
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
        const combinedAddress = [
          form.streetAddress,
          form.aptSuite,
          form.city,
          form.stateProvince,
          form.postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        await registerFundraiser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          cnic: form.cnic,
          address: combinedAddress,
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
    <div className="min-h-[90vh] bg-[#f7f9f5] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-[#e5e9e3] p-6 sm:p-8 max-w-lg w-full relative overflow-hidden">
        {/* Top Header & Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto object-contain mx-auto mb-2" />
          </Link>
          <h1 className="text-2xl font-black text-[#10182b] tracking-tight">
            {mode === 'login' ? 'Welcome Back to Sayrab' : 'Create an Account'}
          </h1>
          <p className="text-[#64748b] text-xs mt-1">
            {mode === 'login'
              ? 'Select your role or enter credentials to access your dashboard'
              : currentRole.description}
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3]">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = tab === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleTabChange(role.id)}
                  className={`py-2 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                    isActive
                      ? 'bg-[#89ca2e] text-white shadow-sm'
                      : 'text-[#64748b] hover:text-[#10182b] hover:bg-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate w-full">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Demo Autofill in Login Mode */}
        {mode === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#10182b]">
              <CurrentIcon size={16} className="text-[#367c35] shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-[#10182b] block">{currentRole.label} Portal</span>
                <span className="text-[10px] text-[#64748b]">{currentRole.demoEmail}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo(tab)}
              className="px-2.5 py-1 text-[11px] font-bold text-[#367c35] bg-[#89ca2e]/20 hover:bg-[#89ca2e]/30 border border-[#89ca2e]/40 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Sparkles size={12} /> Fill Demo
            </button>
          </div>
        )}

        {/* Fundraiser multi-step progress in Register mode */}
        {mode === 'register' && tab === 'fundraiser' && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className={step === 1 ? 'text-[#367c35]' : 'text-[#64748b]'}>
                1. Personal Details
              </span>
              <span className={step === 2 ? 'text-[#367c35]' : 'text-[#64748b]'}>
                2. Address Information
              </span>
            </div>
            <div className="w-full bg-[#e5e9e3] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#89ca2e] h-full transition-all duration-300"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            /* Login Form */
            <>
              <div>
                <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                  Email Address or Phone
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="text"
                    placeholder="name@example.com or phone"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                  />
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact support@sayrab.com or use the demo credentials to access your account.');
                    }}
                    className="text-[11px] font-semibold text-[#367c35] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9 pr-10"
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10182b] cursor-pointer"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#64748b] cursor-pointer">
                  Remember me on this browser
                </label>
              </div>
            </>
          ) : (
            /* Registration Form per Role */
            <>
              {/* Step 1 for Fundraiser OR Single Step for Donor/Manufacturer/Admin */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      {tab === 'manufacturer' ? 'Contact Person Name *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <input
                        name="fullName"
                        placeholder={tab === 'manufacturer' ? 'e.g. Tariq Mehmood' : 'e.g. Ahmed Khan'}
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                      />
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    </div>
                  </div>

                  {tab === 'manufacturer' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                        Company / Factory Name *
                      </label>
                      <div className="relative">
                        <input
                          name="companyName"
                          placeholder="e.g. Apex Apparel & Stitching Mills"
                          value={form.companyName}
                          onChange={handleChange}
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                        />
                        <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      {tab === 'manufacturer'
                        ? 'Business Email Address *'
                        : tab === 'admin'
                        ? 'Admin Email Address *'
                        : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        placeholder={tab === 'manufacturer' ? 'contact@factory.com' : 'name@example.com'}
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                      />
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      {tab === 'donor' || tab === 'admin'
                        ? 'Phone Number (Optional - Numbers Only)'
                        : 'Phone Number (Numbers Only) *'}
                    </label>
                    <div className="relative">
                      <input
                        name="phone"
                        type="tel"
                        placeholder="03001234567"
                        value={form.phone}
                        onChange={handleChange}
                        required={tab === 'fundraiser' || tab === 'manufacturer'}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                      />
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    </div>
                  </div>

                  {/* CNIC in Step 1 for Fundraiser */}
                  {tab === 'fundraiser' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                        CNIC (National ID - Auto Formatted) *
                      </label>
                      <div className="relative">
                        <input
                          name="cnic"
                          placeholder="35201-1234567-1"
                          value={form.cnic}
                          onChange={handleChange}
                          required
                          maxLength={15}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                        />
                        <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-1">
                        Format: 13 digits formatted automatically as XXXXX-XXXXXXX-X
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
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
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9 pr-10"
                      />
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10182b] cursor-pointer"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9 pr-10"
                      />
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10182b] cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {tab === 'manufacturer' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                          Factory / Business Address *
                        </label>
                        <input
                          name="address"
                          placeholder="Industrial Area, City, Province"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1.5">
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
                                    ? 'bg-[#89ca2e] text-white border-[#89ca2e]'
                                    : 'bg-[#f7f9f5] text-[#64748b] border-[#e5e9e3] hover:text-[#10182b]'
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
                      <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                        Admin Security Passkey (Optional)
                      </label>
                      <input
                        name="adminSecretKey"
                        type="password"
                        placeholder="sayrab-admin-2025"
                        value={form.adminSecretKey}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                      />
                      <p className="text-[10px] text-[#64748b] mt-1">
                        Default demo passcode is <code className="text-[#367c35] font-mono">sayrab-admin-2025</code> or <code className="text-[#367c35] font-mono">admin123</code>.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Fundraiser Step 2: Address Information */}
              {step === 2 && tab === 'fundraiser' && (
                <>
                  <div className="p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3] text-xs text-[#64748b] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                    <span>Personal details verified. Now specify your address for official documentation.</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      Street Address *
                    </label>
                    <div className="relative">
                      <input
                        name="streetAddress"
                        placeholder="e.g. House #14, Street 5, Block B"
                        value={form.streetAddress}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all pl-9"
                      />
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      Apartment / Suite / Floor (Optional)
                    </label>
                    <input
                      name="aptSuite"
                      placeholder="e.g. Suite 402, 4th Floor"
                      value={form.aptSuite}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                        City *
                      </label>
                      <input
                        name="city"
                        placeholder="e.g. Lahore"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                        State / Province *
                      </label>
                      <input
                        name="stateProvince"
                        placeholder="e.g. Punjab"
                        value={form.stateProvince}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      name="postalCode"
                      placeholder="e.g. 54000"
                      value={form.postalCode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e] focus:border-[#89ca2e] transition-all"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {mode === 'register' && tab === 'fundraiser' && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-[#f7f9f5] hover:bg-[#e5e9e3] text-[#10182b] text-xs font-bold rounded-xl border border-[#e5e9e3] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`py-3 bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                mode === 'register' && tab === 'fundraiser' && step === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  Sign In as {currentRole.label} <ArrowRight size={14} />
                </>
              ) : tab === 'fundraiser' && step === 1 ? (
                <>
                  Proceed to Step 2 (Address) <ArrowRight size={14} />
                </>
              ) : (
                <>
                  Create {currentRole.label} Account <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e5e9e3]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
            or continue with
          </span>
          <div className="h-px flex-1 bg-[#e5e9e3]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#e5e9e3] bg-white hover:bg-[#f7f9f5] px-4 py-2.5 text-xs font-bold text-[#10182b] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f7f9f5] border border-[#e5e9e3] text-[11px] font-black text-[#367c35]">
            G
          </span>
          Continue with Google
        </button>

        <div className="text-center text-xs text-[#64748b] mt-5">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="text-[#367c35] hover:underline font-bold cursor-pointer ml-1"
              >
                Sign Up Now
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-[#367c35] hover:underline font-bold cursor-pointer ml-1"
              >
                Log In
              </button>
            </>
          )}
        </div>

        <div className="text-center text-xs mt-3">
          <Link to="/" className="text-[#64748b] hover:text-[#10182b] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
