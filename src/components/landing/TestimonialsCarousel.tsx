"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";

export const TestimonialsCarousel: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote:
        "I was skeptical until my first KES 450 reached my M-Pesa account 2 hours after reviewing Java House. Now I do reviews during my commute on Super Metro.",
      author: "Kevin M.",
      location: "Nairobi (CBD)",
      role: "Gold Reviewer (32 approved reviews)",
      rating: 5,
      avatar: "K",
    },
    {
      id: 2,
      quote:
        "The best part is that you can speak the truth. I gave a 3-star review for a mobile banking app that had laggy OTPs, and EarnOra still approved and paid my KES 300 bounty because my review was detailed and constructive.",
      author: "Amina S.",
      location: "Mombasa (Nyali)",
      role: "Silver Reviewer (19 approved reviews)",
      rating: 5,
      avatar: "A",
    },
    {
      id: 3,
      quote:
        "EarnOra has made giving feedback worthwhile. As a uni student in Eldoret, cashing out KES 1,200 weekly for surveys and app testing covers my internet bundles seamlessly.",
      author: "Brian O.",
      location: "Eldoret",
      role: "Platinum Reviewer (54 approved reviews)",
      rating: 5,
      avatar: "B",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? testimonials.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === testimonials.length - 1 ? 0 : prevIdx + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const active = testimonials[currentIndex];

  return (
    <section className="py-20 bg-white border-y border-blue-100/70 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-blue-200/70 text-[#1E6FD9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F3D] tracking-tight">
            Loved by Reviewers Across Kenya
          </h2>
          <p className="text-xs text-[#16A34A] font-semibold">
            [Early Beta Reviewer Testimonials]
          </p>
        </div>

        {/* Carousel Card */}
        <div className="relative rounded-[24px] bg-white border border-blue-100/80 p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,31,61,0.06)]">
          <Quote className="w-10 h-10 text-[#1E6FD9]/20 mb-4" />

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(active.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-[#0F1F3D] italic leading-relaxed min-h-[90px]">
            &ldquo;{active.quote}&rdquo;
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-black text-sm flex items-center justify-center shadow-xs">
                {active.avatar}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0F1F3D]">{active.author}</h4>
                <p className="text-xs text-[#6B7A99]">
                  {active.location} • <span className="text-[#16A34A] font-semibold">{active.role}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full bg-[#EEF3FF] hover:bg-[#EAF3FF] text-[#0F1F3D] flex items-center justify-center transition-colors border border-blue-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full bg-[#EEF3FF] hover:bg-[#EAF3FF] text-[#0F1F3D] flex items-center justify-center transition-colors border border-blue-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
