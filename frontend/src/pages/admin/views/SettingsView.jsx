import { useState } from 'react';
import {
  Settings,
  Percent,
  Clock,
  KeyRound,
  Mail,
  Truck,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function SettingsView({ settings, onUpdateSettings }) {
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleShippingProvider = (code) => {
    const updated = form.shippingProviders?.map((p) =>
      p.code === code ? { ...p, active: !p.active } : p
    );
    setForm({ ...form, shippingProviders: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Settings size={18} className="text-emerald-500" />
            <span>Platform Financial & System Configuration</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated revenue allocation parameters, escrow dispute delays, and API gateways
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          {savedSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : savedSuccess ? 'Saved Changes!' : 'Save Settings'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Platform configuration updated successfully. Rules applied live.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* 1. Revenue & Dispute Window Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Percent size={16} className="text-emerald-600" />
            <span>Revenue Split & Dispute Settlement Window</span>
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Org Share (%)
              </label>
              <input
                type="number"
                value={form.organizationShare ?? 50}
                onChange={(e) => setForm({ ...form, organizationShare: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Mfg Share (%)
              </label>
              <input
                type="number"
                value={form.manufacturerShare ?? 45}
                onChange={(e) => setForm({ ...form, manufacturerShare: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                Sayrab Fee (%)
              </label>
              <input
                type="number"
                value={form.platformCommission ?? 5}
                onChange={(e) => setForm({ ...form, platformCommission: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Payout Dispute Hold Window (Days after campaign end)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.payoutDelayDays ?? 7}
                onChange={(e) => setForm({ ...form, payoutDelayDays: Number(e.target.value) })}
                className="w-28 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
              <span className="text-slate-400">days buffer for customer returns/disputes before disbursement</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Sales Tax / GST Rate (%)
            </label>
            <input
              type="number"
              value={form.taxRate ?? 0}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
              className="w-28 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            />
          </div>
        </div>

        {/* 2. Stripe Payment Keys */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <KeyRound size={16} className="text-emerald-600" />
            <span>Stripe Payment Gateway Integration</span>
          </h4>

          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Stripe Publishable Key
            </label>
            <input
              type="text"
              value={form.stripePublicKey || ''}
              onChange={(e) => setForm({ ...form, stripePublicKey: e.target.value })}
              placeholder="pk_test_..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Stripe Secret API Key
            </label>
            <input
              type="password"
              value={form.stripeSecretKey || ''}
              onChange={(e) => setForm({ ...form, stripeSecretKey: e.target.value })}
              placeholder="sk_test_••••••••••••••••••••••••••••••••"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
              Stripe Webhook Secret
            </label>
            <input
              type="password"
              value={form.stripeWebhookSecret || ''}
              onChange={(e) => setForm({ ...form, stripeWebhookSecret: e.target.value })}
              placeholder="whsec_•••••••••••••••••••••••••••••••"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* 3. Email & Notification Alerts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Mail size={16} className="text-emerald-600" />
            <span>Email Dispatch & Notifications</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                SMTP Server
              </label>
              <input
                type="text"
                value={form.emailSettings?.smtpHost || 'smtp.sendgrid.net'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailSettings: { ...form.emailSettings, smtpHost: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                System Sender Email
              </label>
              <input
                type="email"
                value={form.emailSettings?.senderEmail || 'admin@sayrab.org'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailSettings: { ...form.emailSettings, senderEmail: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailSettings?.notifyOnPayout ?? true}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailSettings: { ...form.emailSettings, notifyOnPayout: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Send instant email on new Payout Request</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailSettings?.notifyOnVerification ?? true}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailSettings: { ...form.emailSettings, notifyOnVerification: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Send email when organization uploads verification documents</span>
            </label>
          </div>
        </div>

        {/* 4. Shipping Carriers & Logistics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Truck size={16} className="text-emerald-600" />
            <span>Shipping Providers & Logistics Partners</span>
          </h4>

          <div className="space-y-2.5">
            {form.shippingProviders?.map((prov) => (
              <div
                key={prov.code}
                onClick={() => toggleShippingProvider(prov.code)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  prov.active
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 opacity-60'
                }`}
              >
                <div>
                  <span className="font-bold text-xs">{prov.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Code: {prov.code}</span>
                </div>
                <span className="text-xs font-semibold">
                  {prov.active ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
