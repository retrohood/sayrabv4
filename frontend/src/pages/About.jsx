import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  Scissors,
  Workflow,
  Factory,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Heart,
  Palette,
  FileSpreadsheet,
  Globe,
  Compass,
  Lightbulb,
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 pb-24 text-[#172033]">
      {/* 1. Hero Section: Fashion-Tech Aesthetic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10182b] via-[#172033] to-[#10182b] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#10182b]">
        {/* Decorative Grid & Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(#89ca2e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#89ca2e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left: Text & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-[10px] sm:text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
              <Sparkles size={13} /> Apparel Tech • AI Innovation • Customization
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Reimagining the Future of<br className="sm:hidden" /> <span className="text-[#89ca2e]">Apparel Design.</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Exploring how artificial intelligence and creative technology can transform the way clothing is designed, visualized, customized, and brought to production.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <a
                href="#narrative"
                className="px-6 py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Explore Sayrab Vision <ArrowRight size={15} />
              </a>
              <Link
                to="/store"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={15} /> Visit Merch Store
              </Link>
            </div>
          </div>

          {/* Right: Fashion-Technology Visual Mockup */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative mx-auto max-w-md rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-md shadow-2xl space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
                  alt="Apparel Design and Tech-Pack Flatlay"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#10182b]/85 backdrop-blur-md text-[#89ca2e] text-[11px] font-black uppercase tracking-wider rounded-lg border border-white/10">
                  Concept Visualization
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                  Tech Pack Ready
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400">Garment AI</p>
                  <p className="font-bold text-white text-xs mt-0.5">Exploration</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400">Quotation</p>
                  <p className="font-bold text-[#89ca2e] text-xs mt-0.5">Automated</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400">Production</p>
                  <p className="font-bold text-white text-xs mt-0.5">Coordinated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Narrative: About Sayrab */}
      <section id="narrative" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3.5 py-1 rounded-full">
            About Sayrab
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#10182b] tracking-tight">
            Bridging Creative Design<br className="sm:hidden" /> & Practical Manufacturing
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-12 shadow-sm space-y-6 text-sm sm:text-base text-[#172033] leading-relaxed">
          <p className="font-bold text-base sm:text-lg text-[#10182b] leading-relaxed">
            Sayrab is an emerging apparel technology platform focused on transforming how clothing is designed, visualized, customized, and brought to production.
          </p>

          <p className="text-[#64748b]">
            We believe the future of apparel design lies at the intersection of artificial intelligence, creative technology, and manufacturing. Our vision is to make clothing design more intelligent, accessible, and precise by developing tools that bridge the gap between digital creativity and real-world production.
          </p>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35] flex items-center gap-1.5">
              <Cpu size={16} /> Garment-Specialized Generative Research
            </h3>
            <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
              At the heart of Sayrab is our ambition to advance garment-specialized generative AI. We are exploring approaches that combine multimodal intelligence, apparel-focused design data, and specialized model adaptation to develop systems that better understand garment structures, materials, patterns, and design details.
            </p>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Unlike conventional image-generation workflows, our long-term research focuses on <strong className="text-[#10182b]">controlled garment editing</strong>: enabling users to modify specific elements of a clothing design while preserving the characteristics and details that make the original garment unique.
            </p>
          </div>

          <p className="text-[#64748b]">
            Beyond AI research, Sayrab brings together apparel customization, design workflows, quotation systems, and manufacturing-oriented services within one integrated platform. Our goal is to create a seamless journey from an initial design concept to a visualized, refined, and production-ready garment.
          </p>

          <p className="text-[#64748b]">
            Our platform also connects merchandise, fundraising, and manufacturing workflows, creating opportunities to bring customized products and community-driven initiatives together within one ecosystem.
          </p>

          <div className="pt-4 border-t border-[#e5e9e3] text-center space-y-2">
            <p className="text-sm sm:text-base font-black text-[#10182b]">
              We are building towards a future where apparel creation is not limited by traditional design workflows, but enhanced by intelligent systems that understand both creativity and the practical requirements of manufacturing.
            </p>
            <p className="text-base sm:text-lg font-black text-[#367c35] tracking-wide pt-1">
              Sayrab &mdash; Intelligent Design. Better Apparel. New Possibilities.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Vision, Innovation and Mission Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
            Guiding Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Our Vision, Innovation & Mission</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Vision */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#89ca2e]/20 text-[#367c35] flex items-center justify-center">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-black text-[#10182b]">Our Vision</h3>
              <p className="text-xs sm:text-sm font-bold text-[#367c35] italic">
                &ldquo;Make apparel design more intelligent, accessible, and precise by connecting creative ideas with the practical realities of garment development and manufacturing.&rdquo;
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                We envision a technology-driven apparel landscape where independent creators, organizations, and brands can transition from concept to sample without the traditional barriers of manual technical rendering.
              </p>
            </div>
          </div>

          {/* Innovation */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#10182b] text-white flex items-center justify-center">
                <Lightbulb size={24} />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#10182b]">Our Innovation</h3>
                <span className="text-[10px] font-black uppercase bg-[#89ca2e]/20 text-[#367c35] px-2 py-0.5 rounded-md">
                  Research Ambition
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#10182b] italic">
                &ldquo;Explore garment-specialized generative AI that can understand clothing structures, materials, patterns, and specific design details.&rdquo;
              </p>
              <ul className="text-xs text-[#64748b] space-y-1.5 list-disc pl-4">
                <li>Multimodal Intelligence Exploration</li>
                <li>Apparel-Focused Design Data Training</li>
                <li>Specialized Model Adaptation</li>
                <li>Controlled Garment Editing</li>
                <li>Preservation of Original Silhouettes</li>
              </ul>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#89ca2e]/20 text-[#367c35] flex items-center justify-center">
                <Workflow size={24} />
              </div>
              <h3 className="text-lg font-black text-[#10182b]">Our Mission</h3>
              <p className="text-xs sm:text-sm font-bold text-[#367c35] italic">
                &ldquo;Connect AI-assisted apparel creativity, customization, and manufacturing workflows through one integrated technology platform.&rdquo;
              </p>
              <p className="text-xs text-[#64748b] leading-relaxed">
                We streamline the entire journey from design concept to technical quotation, tech-pack generation, and verified factory fulfillment, uniting creative freedom with production discipline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What Makes Sayrab Different */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
            Core Differentiators
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Beyond Conventional Apparel Design</h2>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-xl mx-auto">
            How Sayrab approaches apparel technology differently from generic image generators or siloed e-commerce tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h4 className="font-extrabold text-[#10182b] text-sm">1. Garment-Specialized AI</h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Research focused on apparel-aware generative systems rather than unrestricted, hallucinated general image generation.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center">
              <Scissors size={20} />
            </div>
            <h4 className="font-extrabold text-[#10182b] text-sm">2. Controlled Design Editing</h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Aiming to make targeted modifications to individual design elements while preserving the original garment&apos;s defining identity.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h4 className="font-extrabold text-[#10182b] text-sm">3. Connected Workflows</h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Bringing design concepts, apparel customization, visualization, and quotation workflows into one unified platform.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center">
              <Factory size={20} />
            </div>
            <h4 className="font-extrabold text-[#10182b] text-sm">4. Manufacturing-Oriented</h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Considering raw materials, garment structures, tech-pack specifications, and the practical requirements of factory production.
            </p>
          </div>
        </div>
      </section>

      {/* 5. From Digital Concept to Real Apparel: Workflow Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
            Process Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">From Digital Concept to Real Apparel</h2>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-xl mx-auto">
            A structured progression connecting creative design ideas with verified factory execution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Stage 1 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 space-y-3 shadow-xs relative">
            <span className="w-7 h-7 rounded-lg bg-[#89ca2e]/20 text-[#367c35] text-xs font-black flex items-center justify-center">
              1
            </span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#10182b] text-xs sm:text-sm">Design Concept</h4>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Initial clothing concept, theme specification, or user-provided moodboard reference.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 space-y-3 shadow-xs relative">
            <span className="w-7 h-7 rounded-lg bg-[#10182b] text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#10182b] text-xs sm:text-sm">AI Visualization</h4>
              <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                Research & Exploration
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Explore garment visualization and design possibilities using available and developing AI-assisted approaches.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 space-y-3 shadow-xs relative">
            <span className="w-7 h-7 rounded-lg bg-[#89ca2e]/20 text-[#367c35] text-xs font-black flex items-center justify-center">
              3
            </span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#10182b] text-xs sm:text-sm">Customization</h4>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Adjust design elements, colorways, prints, and refine technical apparel parameters.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 space-y-3 shadow-xs relative">
            <span className="w-7 h-7 rounded-lg bg-[#89ca2e]/20 text-[#367c35] text-xs font-black flex items-center justify-center">
              4
            </span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#10182b] text-xs sm:text-sm">Technical Quotation</h4>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Organize bill-of-materials, tech packs, and instant cost estimations through available quotation tools.
            </p>
          </div>

          {/* Stage 5 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 space-y-3 shadow-xs relative">
            <span className="w-7 h-7 rounded-lg bg-[#89ca2e]/20 text-[#367c35] text-xs font-black flex items-center justify-center">
              5
            </span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#10182b] text-xs sm:text-sm">Manufacturing</h4>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Connect approved specifications with verified ethical manufacturing partners for sampling and production.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Sayrab Ecosystem: Technology with a Purpose */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
            Ecosystem Integration
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Technology with a Purpose</h2>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            Sayrab&apos;s broader platform brings together merchandise, fundraising, and manufacturing-oriented services. By connecting product design with digital stores and coordinated fulfillment, we aim to make customized merchandise more accessible while supporting community-driven initiatives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#10182b] text-white flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-black text-[#10182b]">Apparel and Merchandise</h3>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Design, customize, present, and coordinate high-quality apparel merchandise through the platform&apos;s existing workflows. Independent creators and organizations can launch branded collections with zero upfront inventory risks.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-3 hover:border-[#89ca2e] transition-all shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#89ca2e]/20 text-[#367c35] flex items-center justify-center">
              <Heart size={24} />
            </div>
            <h3 className="text-base font-black text-[#10182b]">Fundraising & Community Support</h3>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Allow eligible organizations to use verified campaigns and merchandise-based initiatives to engage supporters, transparently sharing 50% of merchandise proceeds directly with beneficiary causes.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Actual Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
            Active Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Verified Platform Features</h2>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-lg mx-auto">
            Tools and workflows demonstrably available and operating across the Sayrab ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <Palette size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Apparel Customization</h4>
            <p className="text-[10px] text-[#64748b]">Size, color, and print placement</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <Workflow size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Design Workflows</h4>
            <p className="text-[10px] text-[#64748b]">Visual preview and tech specs</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <FileSpreadsheet size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Instant Quotation</h4>
            <p className="text-[10px] text-[#64748b]">Real-time cost & BOM estimation</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <Factory size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Maker Coordination</h4>
            <p className="text-[10px] text-[#64748b]">Sampling & ethical production</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <Heart size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Social Campaigns</h4>
            <p className="text-[10px] text-[#64748b]">Verified community fundraising</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 text-center space-y-2 shadow-xs hover:border-[#89ca2e] transition-all">
            <ShoppingBag size={22} className="mx-auto text-[#367c35]" />
            <h4 className="font-bold text-xs text-[#10182b]">Merch Store</h4>
            <p className="text-[10px] text-[#64748b]">E-commerce with 50% split</p>
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#10182b] via-[#172033] to-[#10182b] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Join the Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">The Future of Apparel Starts with Ideas.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover the Sayrab ecosystem and explore how intelligent design, apparel customization, and connected manufacturing workflows can open new possibilities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/campaigns"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Explore Campaigns <ArrowRight size={15} />
            </Link>
            <Link
              to="/store"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2"
            >
              Visit Merch Store
            </Link>
            <Link
              to="/start-campaign"
              className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
