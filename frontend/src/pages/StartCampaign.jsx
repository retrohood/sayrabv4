import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFundraiserUser } from '../utils/format';
import {
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Factory,
  FileText,
  Users,
  Coins,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Calendar,
  X,
  Target,
  FileCheck,
} from 'lucide-react';

export default function StartCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFundraiser = isFundraiserUser(user);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);
  const [showDonorModal, setShowDonorModal] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Button and Route Behavior (Section 10)
  const handleStartCampaign = () => {
    if (!user) {
      // Unauthenticated guest: redirect to fundraiser registration/login flow
      navigate('/auth?type=fundraiser&redirect=/create-campaign');
      return;
    }

    if (isFundraiser || user.role === 'admin') {
      // Authorized fundraiser/manager: navigate to campaign creation workflow
      navigate('/create-campaign');
      return;
    }

    // Logged in as donor: show friendly role explanation modal
    setShowDonorModal(true);
  };

  const faqs = [
    {
      q: 'Who is eligible to start a campaign on Sayrab?',
      a: 'Any verified individual, student society, non-profit organization, or community group raising funds for legitimate social, medical, educational, or emergency causes can start a campaign. Organizers must provide valid contact details and verifiable information about their cause.',
    },
    {
      q: 'Can my campaign receive donations before administrative verification?',
      a: 'Yes. Under Sayrab’s dual-state verification model (Business Rule BR-01), submitted campaigns become publicly discoverable and can receive direct donations immediately upon submission. However, collected funds remain locked in platform escrow and cannot be withdrawn until our administrative team formally verifies your campaign and organizing entity.',
    },
    {
      q: 'How does merchandise-based fundraising work and what is the revenue split?',
      a: 'Campaign creators can pair their fundraising appeal with custom merchandise (hoodies, t-shirts, caps). When supporters buy merchandise, revenue is divided transparently: 50% directly to your Organization/Cause, 45% to the verified Sialkot Manufacturer for production and materials, and 5% to Sayrab for platform operations.',
    },
    {
      q: 'What documentation is required to launch a campaign?',
      a: 'Depending on your category, you should prepare supporting proofs—such as medical hospital estimates for medical assistance, university fee challans or admission letters for student support, or registration certificates for NGOs. Complete documentation accelerates the administrative verification process.',
    },
    {
      q: 'When and how can accumulated campaign funds be withdrawn?',
      a: 'Funds can be withdrawn once both your campaign and organizing profile have achieved verified status. Payouts are transferred directly to your organization’s verified Pakistani bank account (IBAN) with full accounting ledger records.',
    },
    {
      q: 'Are there any upfront fees or registration charges to create a campaign?',
      a: 'No. Creating a campaign on Sayrab is 100% free with zero upfront fees. Direct donations operate on a 100% direct passthrough principle with zero platform deductions. On-demand merchandise is produced batch-by-batch without upfront inventory risk.',
    },
  ];

  const checklistItems = [
    {
      title: 'Campaign Title',
      desc: 'A concise, memorable headline clearly stating who or what you are raising funds for.',
      icon: Target,
    },
    {
      title: 'Clear Explanation of the Cause',
      desc: 'A genuine narrative detailing the background situation, the exact need, and the anticipated community impact.',
      icon: FileText,
    },
    {
      title: 'Campaign Category',
      desc: 'Choose from established categories: Medical Assistance, Education / Student Fees, Disaster Relief, etc.',
      icon: Layers,
    },
    {
      title: 'Target Funding Amount',
      desc: 'A realistic financial target in Pakistani Rupees (PKR) reflecting the real budgetary requirements.',
      icon: Coins,
    },
    {
      title: 'Realistic Deadline',
      desc: 'Set an achievable campaign window (e.g., 30 to 60 days) to build urgency and donor momentum.',
      icon: Calendar,
    },
    {
      title: 'Supporting Images',
      desc: 'High-quality, authentic photographs of the community, beneficiary, or project.',
      icon: Award,
    },
    {
      title: 'Relevant Supporting Documents',
      desc: 'Hospital bills, fee vouchers, or institutional verification certificates for administrative review.',
      icon: FileCheck,
    },
    {
      title: 'Intended Use of Funds',
      desc: 'A transparent budgetary breakdown showing donors exactly how every Rupee will be spent.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-16 pb-20 bg-[#f7f9f5]">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#89ca2e]/12 via-[#f7f9f5] to-[#f7f9f5] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#e5e9e3]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Description, and Dual CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-[10px] sm:text-xs font-black uppercase tracking-wider border border-[#89ca2e]/40 shadow-2xs max-w-full">
              <Sparkles size={14} className="text-[#367c35] shrink-0" />
              <span className="truncate sm:whitespace-normal">CAMPAIGN CREATOR PORTAL • CONNECTED FUNDRAISING</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] sm:text-4xl lg:text-6xl font-black text-[#10182b] tracking-tight leading-[1.25] sm:leading-[1.15] break-words">
                Your Cause Deserves a{' '}
                <span className="text-[#367c35] underline decoration-[#89ca2e] decoration-4 underline-offset-8">
                  Platform.
                </span>
              </h1>
              <p className="text-xs sm:text-xl font-bold text-[#10182b] tracking-tight pt-1">
                Start a Campaign. Bring People Together. Make an Impact.
              </p>
            </div>

            <p className="text-sm sm:text-lg text-[#64748b] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Whether you are raising funds for an important cause or organizing a merchandise-based fundraising
              initiative, Sayrab provides a connected platform to help you present your campaign and reach supporters.
            </p>

            {/* Dual CTAs with Strict Hierarchy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={handleStartCampaign}
                className="w-full sm:w-auto justify-center px-7 py-4 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
              >
                Start Your Campaign <ArrowRight size={17} />
              </button>

              <Link
                to="/campaigns"
                className="w-full sm:w-auto justify-center px-7 py-4 bg-[#10182b] hover:bg-[#172033] text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                Explore Existing Campaigns <Heart size={16} className="text-[#89ca2e]" />
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#64748b] font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#367c35]" /> 100% Free Campaign Creation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Coins size={15} className="text-[#367c35]" /> Zero Direct Donation Fee
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-[#367c35]" /> On-Demand Merchandise
              </span>
            </div>
          </div>

          {/* Right Column: Visual Campaign Creator & Launch Preview Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#e5e9e3] shadow-2xl p-6 overflow-hidden">
              {/* Creator Preview Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e9e3] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#89ca2e] animate-pulse" />
                  <span className="font-extrabold text-[#10182b] tracking-wide">Live Campaign Simulation</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-[10px] font-black uppercase">
                  Creator View
                </span>
              </div>

              {/* Realistic Campaign Preview Card */}
              <div className="mt-4 space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-[#e5e9e3] shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80"
                    alt="Education and Student Tech Lab Initiative"
                    className="w-full h-full object-cover brightness-90 group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-[#10182b]/85 backdrop-blur-md text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm">
                      Education & Youth
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#10182b]/85 backdrop-blur-md border border-[#89ca2e]/40 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1">
                    <Sparkles size={11} className="text-[#89ca2e]" />
                    <span>Publicly Discoverable</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-base text-[#10182b] leading-tight">
                    Youth Tech Lab & Digital Skills Scholarship 2026
                  </h3>
                  <p className="text-xs text-[#64748b] mt-1 line-clamp-2">
                    Empowering 120 underprivileged students with verified modern computer hardware and certified software
                    curriculum.
                  </p>
                </div>

                {/* Live Progress Simulation */}
                <div className="space-y-1.5 bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#10182b]">Rs 420,000 Raised</span>
                    <span className="text-[11px] font-bold text-[#367c35]">56% of Rs 750,000</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#e5e9e3]">
                    <div
                      className="bg-gradient-to-r from-[#89ca2e] to-[#367c35] h-2 rounded-full"
                      style={{ width: '56%' }}
                    />
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#64748b]">
                    <span>148 Community Donors</span>
                    <span className="text-[#10182b] font-bold">24 Days Remaining</span>
                  </div>
                </div>

                {/* Integrated Merch Pairing Strip */}
                <div className="p-2.5 rounded-xl bg-[#89ca2e]/15 border border-[#89ca2e]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-[#367c35]" />
                    <span className="font-bold text-[#10182b] text-[11px]">Paired with Custom Hoodies & Tees</span>
                  </div>
                  <span className="font-extrabold text-[#367c35] text-[10px] uppercase">50% Merch Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW CAMPAIGN CREATION WORKS (4-Step Visual Timeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
            <Layers size={13} /> The Creation Journey
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
            How Campaign Creation Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            A transparent, step-by-step process designed to help you organize, launch, and fund your cause.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Your Account',
              desc: 'Register as a fundraiser and provide basic organizational or individual contact information.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Share Campaign Details',
              desc: 'Define your title, target funding goal, category, cause story, duration, and supporting evidence.',
              icon: FileText,
            },
            {
              step: '03',
              title: 'Submit Your Campaign',
              desc: 'Submit through our streamlined form. Your campaign is published and ready to receive donations while verification review takes place.',
              icon: ShieldCheck,
            },
            {
              step: '04',
              title: 'Reach Supporters',
              desc: 'Share your public campaign page, accept direct donor contributions, and offer customized apparel to your community.',
              icon: Heart,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl border border-[#e5e9e3] p-6 flex flex-col justify-between hover:border-[#89ca2e] hover:shadow-xl transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#89ca2e] tracking-widest">{item.step}</span>
                    <div className="p-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] group-hover:bg-[#89ca2e] group-hover:text-[#10182b] transition-colors">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="font-black text-[#10182b] text-base">{item.title}</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TWO WAYS OF FUNDRAISING (Dual-Stream Model) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
            <Coins size={13} /> Dual-Stream Capital
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">Two Ways of Fundraising</h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Sayrab gives campaign organizers two complementary avenues to mobilize community support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card A: Direct Donations */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 space-y-6">
            <div className="space-y-5">
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
                  alt="Direct Humanitarian Donations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#10182b]/90 backdrop-blur-md rounded-lg text-white text-xs font-extrabold flex items-center gap-1.5">
                  <Coins size={14} className="text-[#89ca2e]" />
                  <span>100% Direct Passthrough</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#10182b] tracking-tight">A. Direct Donations</h3>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Create a campaign to request direct financial contributions from compassionate supporters. Donors can
                  browse campaigns and contribute securely through local cards and digital payment channels.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#172033] font-medium border-t border-[#e5e9e3] pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Zero platform commission deducted from direct charitable gifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Real-time public donor ledger with optional anonymous giving</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Automatic progress bar updates and donor milestone sharing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartCampaign}
              className="w-full py-3 bg-[#10182b] hover:bg-[#172033] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              Start a Donation Campaign <ArrowRight size={16} />
            </button>
          </div>

          {/* Card B: Merchandise-Based Fundraising */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 space-y-6">
            <div className="space-y-5">
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
                  alt="Custom Apparel Merchandise for Causes"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#89ca2e] rounded-lg text-[#10182b] text-xs font-black flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-[#10182b]" />
                  <span>50% Cause Revenue Share</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#10182b] tracking-tight">B. Merchandise-Based Fundraising</h3>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Design and launch purpose-driven customized apparel (hoodies, t-shirts, caps) paired directly with your
                  cause. Supporters buy quality merchandise while funding your mission.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#172033] font-medium border-t border-[#e5e9e3] pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Strict 50% Organization / 45% Manufacturer / 5% Sayrab split</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Zero upfront inventory investment—batch production on demand</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#367c35] shrink-0" />
                  <span>Fulfilled by verified industrial garment factories in Sialkot, Pakistan</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartCampaign}
              className="w-full py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              Start Merchandise Campaign <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHY USE SAYRAB (4 Benefit Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
            <Award size={13} /> Platform Advantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">Why Use Sayrab</h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Designed from the ground up to solve the challenges of community fundraising and decentralized garment
            coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Centralized Campaign Management',
              desc: 'Monitor donor contributions, order statuses, visitor traffic, and financial settlements in one unified dashboard.',
              icon: TrendingUp,
            },
            {
              title: 'Accessible Online Fundraising',
              desc: 'Launch causes quickly with transparent public landing pages, social share tools, and mobile-friendly donor checkouts.',
              icon: Users,
            },
            {
              title: 'Merchandise & Product Customization',
              desc: 'Easily add custom hoodies, t-shirts, and apparel to your campaign with pre-configured sizing, variants, and colors.',
              icon: ShoppingBag,
            },
            {
              title: 'Integrated Manufacturing Workflows',
              desc: 'Direct integration with verified Sialkot garment manufacturers for quotation, sampling, production, and shipping tracking.',
              icon: Factory,
            },
          ].map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e5e9e3] p-6 space-y-4 hover:border-[#89ca2e] hover:shadow-lg transition-all"
              >
                <div className="p-3 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] w-fit">
                  <Icon size={22} />
                </div>
                <h3 className="font-black text-[#10182b] text-base">{benefit.title}</h3>
                <p className="text-xs text-[#64748b] leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WHAT YOU SHOULD PREPARE (Fundraiser Checklist) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={13} /> Pre-Launch Preparation
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
              What You Should Prepare
            </h2>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Gathering complete and accurate information beforehand ensures your campaign is reviewed promptly and
              garners trust from donors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {checklistItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] hover:border-[#89ca2e] transition-colors space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-[#e5e9e3] text-[#367c35] shrink-0">
                      <Icon size={16} />
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-[#10182b]">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#10182b] text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#89ca2e] shrink-0" />
              <span>
                <strong>Privacy Assurance:</strong> Private identity papers and banking IBANs are strictly confidential
                and never published publicly.
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Verified by Sayrab Governance</span>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENCY AND VERIFICATION (BR-01 Rule Explanation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#10182b] via-[#172033] to-[#10182b] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#89ca2e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
              <ShieldCheck size={13} /> Platform Governance & Compliance
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Transparency and Verification Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Sayrab balances community agility with fiduciary accountability. Here is how campaign visibility and
              payout governance operate under platform rules:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#89ca2e]/20 flex items-center justify-center text-[#89ca2e] font-black text-sm">
                1
              </div>
              <h4 className="font-black text-sm text-white">Immediate Public Visibility</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submitted campaigns are published immediately with full public discoverability to accept donations and
                gain momentum without onboarding delays.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 font-black text-sm">
                2
              </div>
              <h4 className="font-black text-sm text-white">Pending Verification Badge</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unverified campaigns display a clear &quot;Verification Pending&quot; notice, transparently notifying
                donors that credentials are currently undergoing review.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#89ca2e]/20 flex items-center justify-center text-[#89ca2e] font-black text-sm">
                3
              </div>
              <h4 className="font-black text-sm text-white">Secure Withdrawal Gating</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                All collected capital is held securely in platform escrow. Funds cannot be withdrawn until our
                administrators formally verify your identity and bank details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
            <HelpCircle size={13} /> Common Inquiries
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Everything you need to know about starting and managing a campaign on Sayrab.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e5e9e3] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#f7f9f5]/50 transition-colors"
                >
                  <span className="font-black text-sm text-[#10182b]">{faq.q}</span>
                  <div className="p-1.5 rounded-lg bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#64748b] leading-relaxed border-t border-[#e5e9e3]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CONCLUDING CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-14 text-center shadow-lg space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#367c35] text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} /> Take Action Today
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#10182b] tracking-tight">
              Ready to Bring Your Campaign to Life?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Take the first step towards connecting your cause with people who want to support it. Set up your
              campaign narrative, configure your goals, and begin rallying your community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStartCampaign}
              className="w-full sm:w-auto px-8 py-4 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              Start Your Campaign <ArrowRight size={17} />
            </button>

            <Link
              to="/campaigns"
              className="w-full sm:w-auto px-8 py-4 bg-[#10182b] hover:bg-[#172033] text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Browse Campaigns <Heart size={16} className="text-[#89ca2e]" />
            </Link>
          </div>
        </div>
      </section>

      {/* DONOR ROLE GUIDANCE MODAL */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e5e9e3] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <AlertCircle size={24} />
              </div>
              <button
                onClick={() => setShowDonorModal(false)}
                className="p-1 rounded-xl text-[#64748b] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-[#10182b]">Fundraiser Role Required</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                You are currently signed in with a <strong>Buyer / Donor</strong> account ({user?.email}). To launch and
                manage campaigns, you need a <strong>Fundraiser</strong> profile.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/auth?type=fundraiser&redirect=/create-campaign"
                className="w-full py-3 text-center bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-xl transition-all shadow-xs"
              >
                Sign In as a Fundraiser
              </Link>
              <button
                type="button"
                onClick={() => setShowDonorModal(false)}
                className="w-full py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-[#10182b] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
