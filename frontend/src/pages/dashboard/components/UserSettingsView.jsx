import { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Save,
  Plus,
  Trash2,
  Edit2,
  Star,
  X,
  Home,
  Check,
} from 'lucide-react';
import api from '../../../api/client';

export default function UserSettingsView({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cnic: user?.cnic || '',
    address: user?.address || '',
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications Form
  const [notifications, setNotifications] = useState({
    emailReceipts: true,
    campaignMilestones: true,
    merchandiseAlerts: false,
    newsletter: true,
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Saved Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/users/addresses');
      if (res.data?.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.warn('Failed to fetch addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddAddressModal = () => {
    setAddressError('');
    setEditingAddressId(null);
    setAddressForm({
      recipientName: user?.fullName || '',
      phone: user?.phone || '',
      street: '',
      apartment: '',
      city: 'Lahore',
      state: 'Punjab',
      postalCode: '',
      country: 'Pakistan',
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setAddressError('');
    setEditingAddressId(addr._id);
    setAddressForm({
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Pakistan',
      isDefault: Boolean(addr.isDefault),
    });
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    if (!addressForm.recipientName.trim() || !addressForm.phone.trim() || !addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim()) {
      setAddressError('Please fill in all required fields (Recipient, Phone, Street, City, State).');
      return;
    }

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        const res = await api.put(`/users/addresses/${editingAddressId}`, addressForm);
        setAddresses(res.data?.addresses || []);
        setStatusMessage({ text: 'Address updated successfully.', type: 'success' });
      } else {
        const res = await api.post('/users/addresses', addressForm);
        setAddresses(res.data?.addresses || []);
        setStatusMessage({ text: 'New delivery address added successfully.', type: 'success' });
      }
      setAddressModalOpen(false);
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      setAddresses(res.data?.addresses || []);
      setStatusMessage({ text: 'Delivery address deleted.', type: 'success' });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to delete address.',
        type: 'error',
      });
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await api.put(`/users/addresses/${id}/default`);
      setAddresses(res.data?.addresses || []);
      setStatusMessage({ text: 'Default delivery address updated.', type: 'success' });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to set default address.',
        type: 'error',
      });
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setProfileForm((prev) => ({ ...prev, phone: digits }));
      return;
    }
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data) {
        setUser((prev) => ({ ...prev, ...profileForm }));
      }
      setStatusMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: '', type: '' });

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setStatusMessage({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setStatusMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await api.put('/users/profile/password', {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      setStatusMessage({ text: 'Password changed successfully!', type: 'success' });
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <h2 className="text-xl font-black text-[#10182b]">Account Settings</h2>
        <p className="text-xs text-[#64748b]">
          Manage your personal details, password security, and notification preferences
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'profile', label: 'Profile Information', icon: User },
          { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
          { id: 'security', label: 'Password & Security', icon: Shield },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setStatusMessage({ text: '', type: '' });
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#89ca2e] text-white shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e5e9e3] hover:text-[#10182b]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
            Personal Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#e5e9e3]/50 border border-[#e5e9e3] rounded-xl text-xs text-[#64748b] outline-none pl-9 cursor-not-allowed"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
              <p className="text-[10px] text-[#64748b] mt-1">
                Contact administration to modify registered primary email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Phone Number (Numeric Only)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            {profileForm.cnic && (
              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  Verified CNIC Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileForm.cnic}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#e5e9e3]/50 border border-[#e5e9e3] rounded-xl text-xs text-[#64748b] outline-none pl-9 cursor-not-allowed"
                  />
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Addresses Section */}
      {activeTab === 'addresses' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e9e3] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
                Saved Delivery Addresses
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Manage your delivery addresses for seamless 1-click checkout on all merchandise orders
              </p>
            </div>
            <button
              type="button"
              onClick={openAddAddressModal}
              className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-[#10182b] text-xs font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={15} />
              <span>Add New Address</span>
            </button>
          </div>

          {loadingAddresses ? (
            <div className="py-12 text-center text-xs text-[#64748b]">
              <div className="w-6 h-6 border-2 border-[#89ca2e] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#e5e9e3] bg-[#f7f9f5] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#89ca2e]/20 text-[#367c35] flex items-center justify-center mx-auto">
                <MapPin size={22} />
              </div>
              <h4 className="text-sm font-bold text-[#10182b]">No Delivery Addresses Saved</h4>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                Save your home or work address now so you won't need to re-enter shipping details at checkout.
              </p>
              <button
                type="button"
                onClick={openAddAddressModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#89ca2e] hover:bg-[#78b327] text-[#10182b] text-xs font-black rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    addr.isDefault
                      ? 'bg-green-50/30 border-[#89ca2e] shadow-xs'
                      : 'bg-[#f7f9f5] border-[#e5e9e3] hover:border-[#89ca2e]/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-black text-[#10182b]">
                        {addr.recipientName}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#89ca2e]/20 text-[#367c35] text-[10px] font-black rounded-full border border-[#89ca2e]/40 shrink-0">
                          <Check size={11} /> Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[#64748b] flex items-center gap-1">
                      <Phone size={12} /> {addr.phone}
                    </p>

                    <div className="text-xs text-[#172033] pt-1 leading-relaxed">
                      <p>{addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                      <p className="text-[#64748b]">
                        {addr.city}, {addr.state} {addr.postalCode ? `• ${addr.postalCode}` : ''}
                      </p>
                      <p className="text-[#64748b] font-medium">{addr.country || 'Pakistan'}</p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#e5e9e3] flex items-center justify-between">
                    <div>
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          className="text-[11px] font-bold text-[#367c35] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Star size={12} /> Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#64748b]">Primary Delivery</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditAddressModal(addr)}
                        className="p-1.5 text-[#64748b] hover:text-[#10182b] rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Edit address"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 text-[#64748b] hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Form */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
            Password & Security
          </h3>

          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9 pr-10"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10182b] cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9 pr-10"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10182b] cursor-pointer"
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9 pr-10"
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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
            Email & Notification Alerts
          </h3>

          <div className="divide-y divide-[#e5e9e3]">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#10182b]">Donation Receipts & Tax Certificates</p>
                <p className="text-[11px] text-[#64748b]">Receive instant digital PDF receipts upon verified contributions</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailReceipts}
                onChange={(e) => setNotifications({ ...notifications, emailReceipts: e.target.checked })}
                className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#10182b]">Campaign Milestone Updates</p>
                <p className="text-[11px] text-[#64748b]">Get notified when causes you back reach 50%, 75%, and 100% of their goal</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.campaignMilestones}
                onChange={(e) => setNotifications({ ...notifications, campaignMilestones: e.target.checked })}
                className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#10182b]">Merchandise & Purpose Store Alerts</p>
                <p className="text-[11px] text-[#64748b]">Updates on new charity drops and product launches</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.merchandiseAlerts}
                onChange={(e) => setNotifications({ ...notifications, merchandiseAlerts: e.target.checked })}
                className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Address Add / Edit Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e9e3] max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
              <div>
                <h3 className="text-base font-black text-[#10182b]">
                  {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  {editingAddressId
                    ? 'Update destination address details'
                    : 'Add a new shipping destination for merchandise deliveries'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="p-1.5 text-[#64748b] hover:text-[#10182b] rounded-lg hover:bg-[#f7f9f5] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    placeholder="e.g. Sara Ahmed"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="House #, Street name, Sector / Area"
                  className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                  Apartment / Suite / Floor (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                  placeholder="Flat 3B, 2nd Floor"
                  className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Lahore"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    Province / State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Punjab"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="54000"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#10182b] uppercase mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalIsDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
                />
                <label htmlFor="modalIsDefault" className="text-xs text-[#10182b] font-semibold cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f7f9f5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-[#10182b] text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
