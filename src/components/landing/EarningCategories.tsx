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
      title: "Hotels & Restaurants",
      maxBounty: "Up to KES 500",
      tag: "Luxury Bounties",
      description: "Review top dining, safari lodges, boutique cafés, and resorts across Kenya.",
      icon: UtensilsCrossed,
      href: "/earn?category=hotels_restaurants",
    },
    {
      id: "apps",
      title: "App & Website Reviews",
      maxBounty: "Up to KES 300",
      tag: "Rate & Earn",
      description: "Submit genuine UX, speed, and reliability feedback on African apps and digital platforms.",
      icon: Smartphone,
      href: "/earn?category=apps_websites",
    },
    {
      id: "local",
      title: "Local Services Reviews",
      maxBounty: "Up to KES 200",
      tag: "Local Gems",
      description: "Salons, barbers, gyms, mechanics, courier riders, and matatu commuter experiences.",
      icon: MapPin,
      href: "/earn?category=local_services",
    },
    {
      id: "telco",
      title: "Telco & Fintech Reviews",
      maxBounty: "Up to KES 250",
      tag: "Money Matters",
      description: "M-Pesa services, digital bank apps, loan products, crypto on-ramps, and home fiber ISPs.",
      icon: CreditCard,
      href: "/earn?category=telco_fintech",
    },
    {
      id: "public",
      title: "Public Services Reviews",
      maxBounty: "Up to KES 150",
      tag: "Community Voice",
      description: "eCitizen services, Huduma Centres, hospitals, NHIF/SHA transitions, and citizen utilities.",
      icon: Building2,
      href: "/earn?category=public_services",
    },
    {
      id: "surveys",
      title: "Paid Surveys",
      maxBounty: "Up to KES 600",
      tag: "Quick Cash",
      description: "Answer research questionnaires from verified academic and commercial partners.",
      icon: ClipboardCheck,
      href: "/earn?category=paid_surveys",
    },
    {
      id: "products",
      title: "Sponsored Product Testing",
      maxBounty: "Up to KES 1,000",
      tag: "Brand Bounties",
      description: "Receive free product samples delivered to your address, test physical items, and provide feedback.",
      icon: PackageCheck,
      href: "/earn?category=product_testing",
    },
    {
      id: "voice",
      title: "Voice Reviews",
      maxBounty: "Up to KES 400",
      tag: "Audio Bounties",
      description: "Record 60-second authentic audio impressions in Sheng, Swahili, or English with background nuance.",
      icon: Mic,
      href: "/earn?category=watch_answer",
    },
  ];

  return (
    <section id="categories" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-blue-200/70 text-[#1E6FD9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>8 Active Earning Tracks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F3D] tracking-tight">
            Ways to Earn on EarnOra
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7A99] leading-relaxed">
            Choose from multiple review categories matching your lifestyle. Every verified opinion is credited directly to your balance.
          </p>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col justify-between p-6 rounded-[20px] bg-white border border-blue-100/80 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.12)] hover:border-[#1E6FD9]/40 transition-all duration-200 hover:-translate-y-1 active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#EEF3FF] group-hover:bg-[#EAF3FF] text-[#1E6FD9] border border-blue-100/70 flex items-center justify-center shadow-xs transition-colors">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/50">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#0F1F3D] group-hover:text-[#1E6FD9] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#6B7A99] mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16A34A] numeral-bold">
                    {cat.maxBounty}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#EEF3FF] group-hover:bg-gradient-to-r group-hover:from-[#1E6FD9] group-hover:to-[#0B4FB3] text-[#1E6FD9] group-hover:text-white flex items-center justify-center transition-all duration-200">
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
