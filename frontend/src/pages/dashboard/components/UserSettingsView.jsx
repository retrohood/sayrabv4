import { useState } from 'react';
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
      <div className="flex items-center gap-2">
        {[
          { id: 'profile', label: 'Profile Information', icon: User },
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
    </div>
  );
}
