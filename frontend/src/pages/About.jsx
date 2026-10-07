import { useState, useEffect } from 'react';
import {
  Heart,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/format';

const valueIcons = [Shield, Heart, Users, CheckCircle, TrendingUp];

const DEFAULT_ABOUT_CONTENT = {
  mission: "Sayrab is dedicated to connecting donors with verified campaigns and providing a trusted fundraising platform with real-time merchandise allocation.",
  impactStatistics: {
    totalFundsRaised: 0,
    totalCampaignsSupported: 0,
    totalDonors: 0,
    emergencyCampaignsFunded: 0,
  },
  howItWorks: [],
  coreValues: ["Transparency", "Integrity", "Impact", "Community", "Accountability"],
};

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/platform/about')
      .then((res) => setContent(res.data && typeof res.data === 'object' ? res.data : DEFAULT_ABOUT_CONTENT))
      .catch((err) => {
        console.error('Failed to fetch platform about details:', err);
        setContent(DEFAULT_ABOUT_CONTENT);
      });
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const stats = content.impactStatistics || DEFAULT_ABOUT_CONTENT.impactStatistics;
  const howItWorks = Array.isArray(content.howItWorks) ? content.howItWorks : [];
  const coreValues = Array.isArray(content.coreValues) ? content.coreValues : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-20">
      <section className="text-center space-y-4">
        <img src="/sayrab.png" alt="Sayrab" className="h-28 mx-auto mb-2" />
        <h1 className="text-4xl font-black text-white tracking-tight">About Sayrab</h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {content.mission}
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-black text-white uppercase tracking-wider text-center text-cyan-400">
          Impact Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Funds Raised', value: formatCurrency(stats.totalFundsRaised) },
            { label: 'Campaigns Supported', value: stats.totalCampaignsSupported?.toLocaleString() },
            { label: 'Total Donors', value: stats.totalDonors?.toLocaleString() },
            { label: 'Emergency Campaigns', value: stats.emergencyCampaignsFunded?.toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 text-center shadow-xl hover:border-cyan-500/40 transition-all"
            >
              <p className="text-2xl font-black text-cyan-400">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {howItWorks.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wider text-center text-cyan-400">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center font-black mx-auto mb-3 shadow-md shadow-cyan-500/20 text-xs">
                  {step.step}
                </div>
                <h3 className="font-bold text-white text-xs mb-1.5">{step.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-black text-white uppercase tracking-wider text-center text-cyan-400">
          Core Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {coreValues.map((value, i) => {
            const Icon = valueIcons[i] || Heart;
            return (
              <div
                key={value}
                className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 text-center shadow-xl hover:border-cyan-500/40 transition-all"
              >
                <Icon className="text-cyan-400 mx-auto mb-2" size={26} />
                <p className="font-bold text-white text-xs">{value}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
