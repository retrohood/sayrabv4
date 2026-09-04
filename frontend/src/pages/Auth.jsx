import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'fundraiser' ? 'fundraiser' : 'donor';
  const [tab, setTab] = useState(defaultTab);
  const [mode, setMode] = useState('login');
  const [oauthUser, setOauthUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnic: '',
    address: '',
    fundraiserType: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, registerDonor, registerFundraiser, completeOAuthLogin, completeProfile, logout } = useAuth();
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
      .then(async (userData) => {
        // Check if there was pending info in sessionStorage
        const savedDataRaw = sessionStorage.getItem('sayrab_oauth_pending_profile');
        let pending = null;
        if (savedDataRaw) {
          try {
            pending = JSON.parse(savedDataRaw);
          } catch {
            pending = null;
          }
        }

        const targetRole =
          pending?.role ||
          (userData.role === 'manager' || userData.role === 'fundraiser' ? 'fundraiser' : 'donor');
        const isFundraiser = targetRole === 'fundraiser';
        const hasRequiredFundraiserInfo =
          pending?.phone && pending?.cnic && pending.cnic.length === 15 && pending?.address && pending?.fundraiserType;
        const hasRequiredDonorInfo = Boolean(pending?.phone || userData.phone);

        // If user already typed all required details into the form before clicking Google, auto-complete
        if (
          pending &&
          ((isFundraiser && hasRequiredFundraiserInfo) || (!isFundraiser && hasRequiredDonorInfo))
        ) {
          try {
            await completeProfile({
              role: isFundraiser ? 'fundraiser' : 'donor',
              fullName: pending.fullName || userData.fullName || userData.name,
              phone: pending.phone || userData.phone || '',
              cnic: isFundraiser ? pending.cnic : undefined,
              address: isFundraiser ? pending.address : undefined,
              fundraiserType: isFundraiser ? pending.fundraiserType : undefined,
            });
            sessionStorage.removeItem('sayrab_oauth_pending_profile');
            navigate(redirect, { replace: true });
            return;
          } catch {
            // Fall through to UI if auto-complete encounters validation error
          }
        }

        // Determine if profile has all required details
        const isUserFundraiser = userData.role === 'manager' || userData.role === 'fundraiser';
        const isComplete =
          userData.isProfileComplete &&
          (!isUserFundraiser || (userData.phone && userData.cnic && userData.address));

        if (isComplete) {
          sessionStorage.removeItem('sayrab_oauth_pending_profile');
          navigate(redirect, { replace: true });
        } else {
          // Switch to complete profile mode
          setOauthUser(userData);
          setMode('complete-profile');
          setTab(targetRole);
          setForm((prev) => ({
            ...prev,
            fullName: pending?.fullName || userData.fullName || userData.name || '',
            email: userData.email || '',
            phone: pending?.phone || userData.phone || '',
            cnic: pending?.cnic || userData.cnic || '',
            address: pending?.address || userData.address || '',
            fundraiserType: pending?.fundraiserType || userData.fundraiserType || '',
          }));
        }
      })
      .catch(() => setError('Google login succeeded, but we could not load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [completeOAuthLogin, completeProfile, navigate, searchParams]);

  const handleGoogleLogin = () => {
    const redirect = searchParams.get('redirect') || '/dashboard';
    const role = tab === 'fundraiser' ? 'fundraiser' : 'customer';

    // Store pre-filled details to sessionStorage so they are preserved
    const pendingOAuthData = {
      role: tab === 'fundraiser' ? 'fundraiser' : 'donor',
      fullName: form.fullName || '',
      phone: form.phone || '',
      cnic: form.cnic || '',
      address: form.address || '',
      fundraiserType: form.fundraiserType || '',
    };
    sessionStorage.setItem('sayrab_oauth_pending_profile', JSON.stringify(pendingOAuthData));

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

    // Flow 1: Google OAuth Profile Completion
    if (mode === 'complete-profile') {
      if (!form.fullName.trim()) {
        setError('Full Name is required');
        return;
      }

      if (tab === 'fundraiser') {
        if (!form.phone.trim()) {
          setError('Phone number is required for Fundraiser accounts');
          return;
        }
        if (!form.cnic || form.cnic.length !== 15) {
          setError('Invalid CNIC format. Expected: XXXXX-XXXXXXX-X');
          return;
        }
        if (!form.address.trim()) {
          setError('Address is required for Fundraiser accounts');
          return;
        }
        if (!form.fundraiserType) {
          setError('Please select whether you represent an organization or are personal');
          return;
        }
      }

      setLoading(true);
      try {
        await completeProfile({
          fullName: form.fullName.trim(),
          role: tab === 'fundraiser' ? 'fundraiser' : 'donor',
          phone: form.phone.trim() || undefined,
          cnic: tab === 'fundraiser' ? form.cnic.trim() : undefined,
          address: tab === 'fundraiser' ? form.address.trim() : undefined,
          fundraiserType: tab === 'fundraiser' ? form.fundraiserType : undefined,
        });
        sessionStorage.removeItem('sayrab_oauth_pending_profile');
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect, { replace: true });
      } catch (err) {
        const serverMessage = err.response?.data?.message;
        setError(serverMessage || 'Failed to complete profile. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Flow 2: Normal Register Validation
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
        if (!form.cnic || !form.address || !form.fundraiserType) {
          setError('Please fill in CNIC, Address, and Fundraiser Type');
          return;
        }
        if (form.cnic.length !== 15) {
          setError('Invalid CNIC format. Expected: XXXXX-XXXXXXX-X');
          return;
        }
      }
    }

    // Flow 3: Normal Login or Normal Register
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
          fundraiserType: form.fundraiserType,
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

  const handleCancelOAuth = () => {
    logout();
    sessionStorage.removeItem('sayrab_oauth_pending_profile');
    setOauthUser(null);
    setMode('login');
    navigate('/auth', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto mx-auto mb-4" />

        {mode === 'complete-profile' ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Complete Your Profile</h1>
              <p className="text-slate-500 text-sm">
                Provide your details to finish setting up your account
              </p>
            </div>

            {/* Google Profile Card */}
            <div className="mb-6 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {oauthUser?.profilePicture ? (
                <img
                  src={oauthUser.profilePicture}
                  alt={oauthUser?.fullName || 'User'}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-lg">
                  {(oauthUser?.fullName || oauthUser?.name || 'G')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Google Verified
                  </span>
                </div>
                <p className="font-semibold text-slate-800 text-sm truncate mt-1">
                  {oauthUser?.fullName || oauthUser?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{oauthUser?.email}</p>
              </div>
            </div>

            {/* Role Selection Tabs */}
            <label className="block text-xs font-semibold text-slate-700 mb-2">Account Type *</label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('donor')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tab === 'donor'
                    ? 'border-primary-600 bg-primary-50/50 shadow-xs ring-1 ring-primary-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-semibold text-sm text-slate-800">Donor</div>
                <div className="text-xs text-slate-500 mt-0.5">Support causes & donate</div>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('fundraiser')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tab === 'fundraiser'
                    ? 'border-primary-600 bg-primary-50/50 shadow-xs ring-1 ring-primary-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-semibold text-sm text-slate-800">Fundraiser</div>
                <div className="text-xs text-slate-500 mt-0.5">Start campaigns & raise funds</div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {tab === 'fundraiser' ? 'Phone Number *' : 'Phone Number (optional)'}
                </label>
                <input
                  name="phone"
                  placeholder="03XXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  required={tab === 'fundraiser'}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {tab === 'fundraiser' && (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <span>
                      Identity details are required for verified fundraisers to launch campaigns and receive payouts.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      CNIC Number * (13 digits)
                    </label>
                    <input
                      name="cnic"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={form.cnic}
                      onChange={handleChange}
                      required
                      maxLength={15}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Address *
                    </label>
                    <input
                      name="address"
                      placeholder="Street, City, Province"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Fundraiser Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.fundraiserType === 'personal' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input type="radio" name="fundraiserType" value="personal" checked={form.fundraiserType === 'personal'} onChange={handleChange} className="hidden" />
                        <span className="text-sm font-medium">Personal</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.fundraiserType === 'organization' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input type="radio" name="fundraiserType" value="organization" checked={form.fundraiserType === 'organization'} onChange={handleChange} className="hidden" />
                        <span className="text-sm font-medium">Organization</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
              >
                {loading ? 'Saving details...' : 'Complete Setup & Continue →'}
              </button>

              <button
                type="button"
                onClick={handleCancelOAuth}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Cancel & Sign in with different account
              </button>
            </form>
          </>
        ) : (
          <>
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
                <div
                  className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
                    step === 1 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  1. Personal Info
                </div>
                <div className="w-8 h-0.5 bg-slate-200 mb-2"></div>
                <div
                  className={`flex-1 text-center border-b-2 pb-2 transition-colors duration-300 text-xs font-semibold ${
                    step === 2 ? 'border-primary-500 text-primary-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
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
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                      />
                      <input
                        name="address"
                        placeholder="Address *"
                        value={form.address}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Fundraiser Type *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.fundraiserType === 'personal' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <input type="radio" name="fundraiserType" value="personal" checked={form.fundraiserType === 'personal'} onChange={handleChange} className="hidden" />
                            <span className="text-sm font-medium">Personal</span>
                          </label>
                          <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.fundraiserType === 'organization' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <input type="radio" name="fundraiserType" value="organization" checked={form.fundraiserType === 'organization'} onChange={handleChange} className="hidden" />
                            <span className="text-sm font-medium">Organization</span>
                          </label>
                        </div>
                      </div>
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

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
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
                  <button
                    onClick={() => handleModeChange('register')}
                    className="text-primary-600 font-medium cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeChange('login')}
                    className="text-primary-600 font-medium cursor-pointer"
                  >
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
          </>
        )}
      </div>
    </div>
  );
}
