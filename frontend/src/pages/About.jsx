import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Shield,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Eye,
  HandHeart,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Utensils,
  LifeBuoy,
  Building,
  TrendingUp,
  ShieldCheck,
  Award,
} from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/format';

const DEFAULT_ABOUT_CONTENT = {
  mission:
    'Our mission is to create an accessible and reliable fundraising ecosystem where people can seek support, communities can come together, and individuals can contribute towards causes that genuinely matter.',
  impactStatistics: {
    totalFundsRaised: 0,
    totalCampaignsSupported: 0,
    totalDonors: 0,
    emergencyCampaignsFunded: 0,
  },
};

const supportedCauses = [
  { icon: Stethoscope, label: 'Medical Assistance' },
  { icon: GraduationCap, label: 'Educational Expenses' },
  { icon: Users, label: 'Student Support' },
  { icon: Briefcase, label: 'Small Business Development' },
  { icon: Utensils, label: 'Food Distribution' },
  { icon: LifeBuoy, label: 'Disaster Relief' },
  { icon: Building, label: 'Community Welfare' },
];

const missionGoals = [
  'Make fundraising easier and more accessible for individuals and communities.',
  'Connect people in need with donors and supporters.',
  'Encourage transparency and accountability throughout fundraising activities.',
  'Provide alternative ways to support charitable causes through our merchandise store.',
  'Help urgent causes receive attention and financial support when they need it most.',
  'Build a community where generosity and social responsibility become part of everyday life.',
];

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api
      .get('/platform/about')
      .then((res) =>
        setContent(res.data && typeof res.data === 'object' ? res.data : DEFAULT_ABOUT_CONTENT)
      )
      .catch((err) => {
        console.error('Failed to fetch platform about details:', err);
        setContent(DEFAULT_ABOUT_CONTENT);
      });
  }, []);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#89ca2e]" />
      </div>
    );
  }

  const stats = content.impactStatistics || DEFAULT_ABOUT_CONTENT.impactStatistics;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 pb-24 text-[#172033]">
      {/* 1. Turning Compassion into Action (Hero Header) */}
      <section className="text-center space-y-5">
        <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto object-contain mx-auto mb-1" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
          <Sparkles size={14} /> Turning Compassion into Action
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#10182b] tracking-tight">
          About <span className="text-[#367c35]">Sayrab</span>
        </h1>
        <p className="text-base sm:text-lg text-[#64748b] max-w-3xl mx-auto leading-relaxed">
          We believe that even the smallest act of kindness can create a meaningful difference in someone&apos;s life.
          Whether it is helping a student continue their education, supporting someone through a medical emergency,
          providing food to families in need, or helping communities recover from disasters, every contribution has the
          potential to change a life.
        </p>

        {/* Vision Highlight Card */}
        <div className="bg-white border-2 border-[#89ca2e] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto text-center shadow-md">
          <p className="text-xs font-black uppercase tracking-widest text-[#367c35] mb-2">Our Vision</p>
          <p className="text-base sm:text-lg text-[#10182b] font-extrabold leading-relaxed italic">
            &ldquo;To make fundraising more accessible, transparent, and impactful by bringing people who need help
            closer to those who are willing to provide it.&rdquo;
          </p>
        </div>

        {/* 2. Who We Are */}
        <div className="bg-[#f7f9f5] border border-[#e5e9e3] rounded-2xl p-5 max-w-2xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#367c35] mb-1">Who We Are</h2>
          <p className="text-sm text-[#172033] leading-relaxed">
            We are a community-driven fundraising platform that connects individuals, organizations, and supporters through
            two simple ways of making a difference: direct donations and merchandise purchases.
          </p>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            Impact Statistics
          </h2>
          <p className="text-xs text-[#64748b]">Real-time collective difference created on Sayrab</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Funds Raised', value: formatCurrency(stats.totalFundsRaised) },
            { label: 'Campaigns Supported', value: (stats.totalCampaignsSupported || 0).toLocaleString() },
            { label: 'Total Donors', value: (stats.totalDonors || 0).toLocaleString() },
            { label: 'Emergency Campaigns', value: (stats.emergencyCampaignsFunded || 0).toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-[#e5e9e3] p-6 text-center shadow-xs hover:border-[#89ca2e] transition-all"
            >
              <p className="text-2xl sm:text-3xl font-black text-[#10182b]">{stat.value}</p>
              <p className="text-xs text-[#64748b] mt-1 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. What We Do */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            What We Do
          </h2>
          <p className="text-xs text-[#64748b] max-w-xl mx-auto">
            Providing individuals and communities with an opportunity to raise funds for genuine causes.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-6 shadow-xs">
          <p className="text-[#172033] text-sm sm:text-base leading-relaxed">
            We provide individuals and communities with an opportunity to raise funds for genuine causes while making
            it easier for people to discover, support, and contribute to those causes.
          </p>
          <p className="text-[#172033] text-sm sm:text-base leading-relaxed">
            Our platform supports a wide range of fundraising initiatives, including medical assistance, educational
            expenses, student support, small business development, food distribution, disaster relief, and other
            community welfare projects.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {supportedCauses.map((cause) => {
              const CauseIcon = cause.icon;
              return (
                <div
                  key={cause.label}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] hover:border-[#89ca2e] transition-all"
                >
                  <CauseIcon size={18} className="text-[#367c35] shrink-0" />
                  <span className="text-xs font-bold">{cause.label}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[#64748b] text-xs sm:text-sm italic pt-2 border-t border-[#e5e9e3]">
            Whether someone needs financial assistance or simply wants to contribute towards a meaningful cause, our
            platform provides a space where these efforts can come together.
          </p>
        </div>
      </section>

      {/* 4 & 5. Direct Donations and Merchandise Store */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            Two Ways to Make a Difference
          </h2>
          <p className="text-xs text-[#64748b]">Empowering impact through donations and purposeful shopping</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 4. Direct Donations */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl flex items-center justify-center">
                <HandHeart size={24} />
              </div>
              <h3 className="text-lg font-black text-[#10182b]">
                Direct Donations – <span className="text-[#367c35]">Support a Cause That Matters</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                Our primary goal is to make supporting people in need as simple as possible.
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Visitors can explore different fundraising campaigns, learn about the stories behind them, and contribute
                directly to the causes they believe in. Each campaign provides information about its purpose, fundraising
                target, collected amount, and deadline.
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                We aim to make the donation process convenient by supporting accessible payment methods, including card
                payments, Easypaisa, JazzCash, and direct digital wallet options.
              </p>
              <p className="text-xs text-[#367c35] font-bold italic">
                Whether it is a small contribution or a significant donation, every amount brings a campaign one step
                closer to its goal.
              </p>
            </div>
            <Link
              to="/campaigns"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] text-xs font-black transition-all shadow-xs"
            >
              Explore Campaigns <ArrowRight size={14} />
            </Link>
          </div>

          {/* 5. Merchandise Store */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#10182b] text-white rounded-2xl flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-lg font-black text-[#10182b]">
                Merchandise Store – <span className="text-[#367c35]">Shop with a Purpose</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                We believe that supporting a cause does not always have to mean making a direct donation. Sometimes, it can
                be as simple as purchasing something you would use every day.
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Our merchandise store offers a variety of branded products, including clothing, hoodies, mugs, water
                bottles, notebooks, bags, and other everyday accessories.
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Every purchase contributes towards our broader mission. The proceeds generated through merchandise sales
                are allocated to support urgent fundraising campaigns, disaster relief efforts, and platform operations.
              </p>
              <p className="text-xs text-[#10182b] font-bold bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-center">
                &ldquo;Shop for yourself. Make a difference for someone else.&rdquo;
              </p>
            </div>
            <Link
              to="/store"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white text-xs font-black transition-all shadow-xs"
            >
              Visit Our Store <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Our Mission */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            Our Mission
          </h2>
          <p className="text-xs text-[#64748b]">An accessible and reliable fundraising ecosystem</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-6 shadow-xs">
          <p className="text-sm sm:text-base text-[#10182b] leading-relaxed font-bold">
            Our mission is to create an accessible and reliable fundraising ecosystem where people can seek support,
            communities can come together, and individuals can contribute towards causes that genuinely matter.
          </p>

          <p className="text-xs font-black uppercase tracking-wider text-[#367c35]">We aim to:</p>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {missionGoals.map((goal) => (
              <div key={goal} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3]">
                <CheckCircle2 size={18} className="text-[#367c35] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#172033] leading-relaxed">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How Our Platform Works */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            How It Works
          </h2>
          <p className="text-xs text-[#64748b]">Straightforward processes designed for fundraisers and supporters</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/20 text-[#367c35] font-black flex items-center justify-center">
              1
            </div>
            <h3 className="font-extrabold text-[#10182b] text-sm">For People Who Need Support</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Individuals can register on our platform, submit their fundraising requirements, provide relevant
              information and supporting documents, and create campaigns undergoing verified compliance review.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/20 text-[#367c35] font-black flex items-center justify-center">
              2
            </div>
            <h3 className="font-extrabold text-[#10182b] text-sm">For Donors and Supporters</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Visitors can browse available campaigns, explore their objectives, and contribute through supported payment
              methods. They can also share campaigns to help reach more supporters.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/20 text-[#367c35] font-black flex items-center justify-center">
              3
            </div>
            <h3 className="font-extrabold text-[#10182b] text-sm">For Merchandise Buyers</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Supporters can explore our online store, select products, and place orders. The proceeds from merchandise
              sales help fund charitable initiatives and platform operations.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Our Commitment to Transparency */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#10182b] uppercase tracking-wider">
            Our Commitment to Transparency
          </h2>
          <p className="text-xs text-[#64748b]">Trust is the foundation of every successful initiative</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl shrink-0">
              <Eye size={24} />
            </div>
            <div className="space-y-3">
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                We understand that trust is the foundation of every successful fundraising initiative. People who
                contribute towards a cause deserve to know where their support is going and how it is being used.
              </p>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                That is why we aim to establish clear fundraising targets, display campaign progress, introduce
                appropriate verification procedures, and maintain records of donations and fundraising activities.
              </p>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                We also recognize the importance of responsible fund management. Our goal is to ensure that funds are
                handled according to their intended purposes and that supporters can remain informed about progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Be a Part of the Change (CTA) */}
      <section className="bg-gradient-to-br from-[#89ca2e]/25 via-white to-[#f7f9f5] border-2 border-[#89ca2e] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
        <div className="inline-flex p-3 rounded-2xl bg-[#89ca2e]/25 text-[#367c35] mb-2">
          <Heart size={28} className="fill-[#367c35]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
          Be a Part of the Change
        </h2>
        <p className="text-sm sm:text-base text-[#172033] max-w-2xl mx-auto leading-relaxed">
          You do not need to be wealthy to make a difference. You do not need to start a large organization to help
          someone in need.
        </p>
        <p className="text-xs sm:text-sm text-[#64748b] max-w-2xl mx-auto leading-relaxed">
          You can contribute to a campaign, purchase something from our merchandise store, share a fundraising
          initiative with others, or start a campaign for someone who needs support.
        </p>
        <p className="text-sm sm:text-base text-[#367c35] font-extrabold max-w-xl mx-auto">
          Every action matters. Every contribution counts. And together, we can turn compassion into meaningful action.
        </p>
        <p className="text-xl sm:text-2xl font-black text-[#10182b] tracking-wide">
          Together, We Can Make a Difference.
        </p>

        {/* 3 Explicit CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Link
            to="/start-campaign"
            className="px-6 py-3 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
          >
            Start a Campaign <Sparkles size={14} className="text-[#89ca2e]" />
          </Link>
          <Link
            to="/campaigns"
            className="px-6 py-3 rounded-xl bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] text-xs font-black transition-all shadow-md flex items-center gap-2"
          >
            Explore Campaigns <ArrowRight size={14} />
          </Link>
          <Link
            to="/store"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#e5e9e3] text-[#10182b] text-xs font-black transition-all flex items-center gap-2 shadow-xs"
          >
            Visit Our Store <ShoppingBag size={14} className="text-[#367c35]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
