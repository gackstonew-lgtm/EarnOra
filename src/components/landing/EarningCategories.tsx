"use client";

import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Smartphone,
  MapPin,
  CreditCard,
  Building2,
  ClipboardCheck,
  PackageCheck,
  Mic,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const EarningCategories: React.FC = () => {
  const categories = [
    {
      id: "hotels",
      title: "Hotels & Restaurants Reviews",
      maxBounty: "Up to KES 500",
      tag: "Luxury Bounties",
      description: "Review top dining, safari lodges, boutique cafés, and resorts across Kenya.",
      icon: UtensilsCrossed,
      gradient: "from-[#0F1E36] via-[#132442] to-[#0A182F]",
      border: "border-blue-500/30 hover:border-blue-400/60",
      iconBg: "bg-blue-500/20 text-blue-400",
      tagClass: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    },
    {
      id: "apps",
      title: "App & Website Reviews",
      maxBounty: "Up to KES 300",
      tag: "Rate & Earn",
      description: "Submit genuine UX, speed, and reliability feedback on African apps and digital platforms.",
      icon: Smartphone,
      gradient: "from-[#0A262C] via-[#0E3339] to-[#081F23]",
      border: "border-teal-500/30 hover:border-teal-400/60",
      iconBg: "bg-teal-500/20 text-teal-400",
      tagClass: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
    },
    {
      id: "local",
      title: "Local Services Reviews",
      maxBounty: "Up to KES 200",
      tag: "Local Gems",
      description: "Salons, barbers, gyms, mechanics, courier riders, and matatu SACCO commuter experiences.",
      icon: MapPin,
      gradient: "from-[#1F1735] via-[#261C42] to-[#150F26]",
      border: "border-purple-500/30 hover:border-purple-400/60",
      iconBg: "bg-purple-500/20 text-purple-400",
      tagClass: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    },
    {
      id: "telco",
      title: "Telco & Fintech Reviews",
      maxBounty: "Up to KES 250",
      tag: "Money Matters",
      description: "M-Pesa services, digital bank apps, loan products, crypto on-ramps, and home fiber ISPs.",
      icon: CreditCard,
      gradient: "from-[#0A291E] via-[#0D3828] to-[#072017]",
      border: "border-emerald-500/30 hover:border-emerald-400/60",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      tagClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    },
    {
      id: "public",
      title: "Public Services Reviews",
      maxBounty: "Up to KES 150",
      tag: "Community Voice",
      description: "eCitizen services, Huduma Centres, hospitals, NHIF/SHA transitions, and citizen utilities.",
      icon: Building2,
      gradient: "from-[#172238] via-[#1B2A47] to-[#111A2D]",
      border: "border-sky-500/30 hover:border-sky-400/60",
      iconBg: "bg-sky-500/20 text-sky-400",
      tagClass: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
    },
    {
      id: "surveys",
      title: "Paid Surveys",
      maxBounty: "Up to KES 600",
      tag: "Quick Cash",
      description: "Answer research questionnaires from verified academic and commercial partners.",
      icon: ClipboardCheck,
      gradient: "from-[#2A1E0E] via-[#382811] to-[#1F160A]",
      border: "border-amber-500/30 hover:border-amber-400/60",
      iconBg: "bg-amber-500/20 text-amber-400",
      tagClass: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    },
    {
      id: "products",
      title: "Sponsored Product Testing",
      maxBounty: "Up to KES 1,000",
      tag: "Brand Bounties",
      description: "Receive free product samples delivered to your address, test physical items, and provide feedback.",
      icon: PackageCheck,
      gradient: "from-[#29101C] via-[#381627] to-[#1E0B14]",
      border: "border-rose-500/30 hover:border-rose-400/60",
      iconBg: "bg-rose-500/20 text-rose-400",
      tagClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    },
    {
      id: "voice",
      title: "Voice Reviews",
      maxBounty: "Up to KES 350",
      tag: "Audio Bounties",
      description: "Record up to 60 seconds of authentic verbal feedback in-browser in English or Sheng/Swahili.",
      icon: Mic,
      gradient: "from-[#1C1838] via-[#241E47] to-[#141029]",
      border: "border-indigo-500/30 hover:border-indigo-400/60",
      iconBg: "bg-indigo-500/20 text-indigo-400",
      tagClass: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    },
  ];

  return (
    <section id="categories" className="py-20 bg-[#070C18]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Track Earnings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Earning Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Choose review tracks matching your daily lifestyle. Advertised maximum amounts are limits for comprehensive reviews.
            </p>
          </div>

          <Link
            href="/earn"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 hover:underline shrink-0"
          >
            <span>Browse All Live Bounties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/earn?category=${cat.id}`}
                className={`group rounded-[22px] bg-gradient-to-br ${cat.gradient} p-5 border ${cat.border} shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cat.iconBg} shadow-inner`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${cat.tagClass}`}
                    >
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300/70 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 numeral-bold">
                    {cat.maxBounty}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-emerald-500 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
