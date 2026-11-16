import { useState } from 'react';
import { User, Building2, MapPin, Phone, Mail, ShieldCheck, Save, Layers } from 'lucide-react';
import api from '../../../api/client';

export default function ProfileView({ profileData, onRefresh }) {
  const [formData, setFormData] = useState({
    name: profileData?.name || 'Apex TexCraft Manufacturing Ltd.',
    contactPerson: profileData?.contactPerson || 'Zubair Qureshi',
    email: profileData?.email || 'manufacturer@sayrab.com',
    phone: profileData?.phone || '+92 321 5556677',
    address: profileData?.address || 'Plot 45, Industrial Area, SITE, Karachi, Pakistan',
    capacityPerMonth: profileData?.capacityPerMonth || 25000,
  });

  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.put('/api/manufacturer/profile', formData);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-[#e5e9e3] p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10182b] to-[#367c35] flex items-center justify-center text-white font-black text-2xl shadow-md">
            M
          </div>
          <div>
            <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
              {formData.name} <ShieldCheck className="w-4 h-4 text-[#367c35]" />
            </h2>
            <p className="text-xs text-[#64748b]">Verified Manufacturing Partner • 45% Revenue Share</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
          Verified Active
        </span>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e5e9e3] rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-[#172033] pb-3 border-b border-[#e5e9e3]">
          Manufacturing Plant Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#64748b] font-bold mb-1">Company / Plant Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>

          <div>
            <label className="block text-[#64748b] font-bold mb-1">Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>

          <div>
            <label className="block text-[#64748b] font-bold mb-1">Official Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>

          <div>
            <label className="block text-[#64748b] font-bold mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#64748b] font-bold mb-1">Plant Location / Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>

          <div>
            <label className="block text-[#64748b] font-bold mb-1">Monthly Production Capacity (Units)</label>
            <input
              type="number"
              value={formData.capacityPerMonth}
              onChange={(e) => setFormData({ ...formData, capacityPerMonth: Number(e.target.value) })}
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#e5e9e3] flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="px-5 py-2.5 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#89ca2e]" /> Save Profile Details
          </button>
        </div>
      </form>
    </div>
  );
}
