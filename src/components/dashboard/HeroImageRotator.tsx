"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export interface HeroPromoImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Configurable timing constants for the Dashboard Hero promotional image rotation.
 * - HERO_ROTATION_INTERVAL_MS: How long each promotional image stays visible (7 seconds).
 * - HERO_FADE_DURATION_MS: Smooth crossfade transition duration (750 milliseconds).
 */
export const HERO_ROTATION_INTERVAL_MS = 7000;
export const HERO_FADE_DURATION_MS = 750;

/**
 * Both promotional hero images remain permanently available in the rotation pool:
 * 1. Existing male hero image (yellow hoodie, holding cash & EarnOra app on smartphone)
 * 2. Female Watch Ads hero image (holding smartphone with Watch Ads & Earn Rewards interface)
 */
export const HERO_PROMO_IMAGES: readonly HeroPromoImage[] = [
  {
    id: "earnora-hero-male-cash",
    src: "/images/dashboard-hero.png",
    alt: "Happy Earnora user holding cash and the Earnora app on his phone",
    width: 903,
    height: 1024,
  },
  {
    id: "earnora-hero-female-watch-ads",
    src: "/images/dashboard-hero-watch-ads.png",
    alt: "Happy Earnora user holding a smartphone displaying the Earnora Watch Ads and Earn Rewards screen",
    width: 763,
    height: 1024,
  },
] as const;

export function HeroImageRotator() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [loadedSources, setLoadedSources] = useState<Record<string, boolean>>({
    [HERO_PROMO_IMAGES[0].src]: true,
    [HERO_PROMO_IMAGES[1].src]: false,
  });

  // 1. Preload both promotional images & pick a randomized starting image on mount
  useEffect(() => {
    let isMounted = true;

    // Preload all hero images in browser memory so switching never shows a blank frame
    HERO_PROMO_IMAGES.forEach((imgConfig) => {
      const preloadImg = new window.Image();
      preloadImg.src = imgConfig.src;
      if (preloadImg.complete) {
        if (isMounted) {
          setLoadedSources((prev) =>
            prev[imgConfig.src] ? prev : { ...prev, [imgConfig.src]: true }
          );
        }
      } else {
        preloadImg.onload = () => {
          if (isMounted) {
            setLoadedSources((prev) => ({ ...prev, [imgConfig.src]: true }));
          }
        };
      }
    });

    // Randomly select which of the two promotional images appears first on initial load
    const randomStartIndex = Math.random() < 0.5 ? 0 : 1;
    setActiveIndex(randomStartIndex);

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Respect prefers-reduced-motion accessibility preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // 3. Controlled alternation timer (never repeats the same image consecutively)
  useEffect(() => {
    if (prefersReducedMotion || HERO_PROMO_IMAGES.length < 2) {
      return;
    }

    const timerId = window.setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_PROMO_IMAGES.length;
        const nextSrc = HERO_PROMO_IMAGES[nextIndex].src;
        // Only transition if the target image is ready in browser memory
        if (!loadedSources[nextSrc]) {
          return prevIndex;
        }
        return nextIndex;
      });
    }, HERO_ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [prefersReducedMotion, loadedSources]);

  const markImageLoaded = (src: string) => {
    setLoadedSources((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  return (
    <div className="relative w-[85%] max-w-[280px] sm:max-w-[310px] md:max-w-[340px] flex justify-center items-end">
      {HERO_PROMO_IMAGES.map((image, index) => {
        const isActive = index === activeIndex;
        const isPrimaryAnchor = index === 0;

        return (
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority
            aria-hidden={!isActive}
            onLoad={() => markImageLoaded(image.src)}
            style={{
              transitionDuration: prefersReducedMotion
                ? "0ms"
                : `${HERO_FADE_DURATION_MS}ms`,
            }}
            className={[
              isPrimaryAnchor
                ? "relative w-full h-auto"
                : "absolute inset-0 w-full h-full",
              "max-h-[270px] sm:max-h-[295px] md:max-h-[310px]",
              "object-contain object-bottom block select-none pointer-events-none -mb-[1px]",
              "transition-opacity ease-in-out motion-reduce:transition-none",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
