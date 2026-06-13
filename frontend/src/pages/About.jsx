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

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/platform/about').then((res) => setContent(res.data));
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const stats = content.impactStatistics;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center mb-12">
        <img src="/sayrab.png" alt="Sayrab" className="h-32 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-slate-800 mb-4">About Sayrab</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {content.mission}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Impact Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Funds Raised', value: formatCurrency(stats.totalFundsRaised) },
            { label: 'Campaigns Supported', value: stats.totalCampaignsSupported?.toLocaleString() },
            { label: 'Total Donors', value: stats.totalDonors?.toLocaleString() },
            { label: 'Emergency Campaigns', value: stats.emergencyCampaignsFunded?.toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-6 text-center"
            >
              <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {content.howItWorks.map((step) => (
            <div
              key={step.step}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center"
            >
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {step.step}
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {content.coreValues.map((value, i) => {
            const Icon = valueIcons[i] || Heart;
            return (
              <div
                key={value}
                className="bg-primary-50 rounded-xl border border-primary-100 p-5 text-center"
              >
                <Icon className="text-primary-600 mx-auto mb-2" size={28} />
                <p className="font-semibold text-slate-800">{value}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
