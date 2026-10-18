"use client";

import React from "react";

interface CloudDividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  flip?: boolean;
}

export const CloudDivider: React.FC<CloudDividerProps> = ({
  orientation = "horizontal",
  className = "",
  flip = false,
}) => {
  if (orientation === "vertical") {
    // Vertical cloud wave divider for desktop split screen
    // Left side is blue gradient, Right side is white
    return (
      <div
        className={`relative w-16 sm:w-20 md:w-24 lg:w-28 h-full pointer-events-none select-none overflow-hidden shrink-0 ${
          flip ? "-scale-x-100" : ""
        } ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 120 1000"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Backmost cloud wave - subtle translucent sky glow */}
          <path
            d="M 120 0 
               L 45 0 
               C 10 70, 0 140, 25 210
               C 50 280, 10 360, 20 440
               C 30 520, 5 600, 30 680
               C 55 760, 15 840, 35 920
               C 45 960, 55 985, 60 1000 
               L 120 1000 Z"
            fill="#79B5F6"
            fillOpacity="0.45"
          />

          {/* Middle cloud wave - soft sky blue */}
          <path
            d="M 120 0 
               L 65 0 
               C 35 60, 25 120, 48 180
               C 72 250, 30 330, 42 410
               C 52 485, 22 560, 50 640
               C 75 720, 35 800, 55 880
               C 68 930, 72 970, 80 1000 
               L 120 1000 Z"
            fill="#C3DFFD"
            fillOpacity="0.85"
          />

          {/* Foreground pure white cloud puffs that merge into right content */}
          <path
            d="M 120 0 
               L 85 0 
               C 62 45, 52 95, 68 150
               C 85 210, 48 280, 62 360
               C 76 430, 46 510, 72 590
               C 96 670, 58 750, 78 830
               C 92 885, 88 945, 100 1000 
               L 120 1000 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  // Horizontal cloud wave divider for mobile header / banners
  // Top is blue gradient, Bottom is white
  return (
    <div
      className={`relative w-full h-12 sm:h-16 md:h-20 pointer-events-none select-none overflow-hidden shrink-0 ${
        flip ? "-scale-y-100" : ""
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Backmost cloud layer */}
        <path
          d="M 0 120 
             L 0 45 
             C 70 10, 140 0, 210 25
             C 280 50, 360 10, 440 20
             C 520 30, 600 5, 680 30
             C 760 55, 840 15, 920 35
             C 960 45, 985 55, 1000 60 
             L 1000 120 Z"
          fill="#79B5F6"
          fillOpacity="0.45"
        />

        {/* Middle cloud layer */}
        <path
          d="M 0 120 
             L 0 65 
             C 60 35, 120 25, 180 48
             C 250 72, 330 30, 410 42
             C 485 52, 560 22, 640 50
             C 720 75, 800 35, 880 55
             C 930 68, 970 72, 1000 80 
             L 1000 120 Z"
          fill="#C3DFFD"
          fillOpacity="0.85"
        />

        {/* Front pure white clouds merging into white section below */}
        <path
          d="M 0 120 
             L 0 85 
             C 45 62, 95 52, 150 68
             C 210 85, 280 48, 360 62
             C 430 76, 510 46, 590 72
             C 670 96, 750 58, 830 78
             C 885 92, 945 88, 1000 100 
             L 1000 120 Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
