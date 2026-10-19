import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("1. Real Video Ads: migration, self-hosted royalty-free videos, and server anti-cheat routes exist", () => {
  const migrationPath = path.join(root, "supabase/migrations/20261019000003_video_ads_and_views.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration 20261019000003_video_ads_and_views.sql must exist");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");
  assert.ok(migrationSql.includes("CREATE TABLE IF NOT EXISTS public.ad_views"), "ad_views table must be defined");
  assert.ok(migrationSql.includes("UNIQUE (user_id, ad_id)"), "unique constraint on (user_id, ad_id) must exist");
  assert.ok(migrationSql.includes("ENABLE ROW LEVEL SECURITY"), "RLS must be enabled");

  // Verify the 3 seeded royalty-free video files exist in public/videos
  assert.ok(fs.existsSync(path.join(root, "public/videos/earnora-promo-1.mp4")));
  assert.ok(fs.existsSync(path.join(root, "public/videos/earnora-promo-2.webm")));
  assert.ok(fs.existsSync(path.join(root, "public/videos/earnora-promo-3.mp4")));

  // Verify server-side anti-cheat routes exist
  assert.ok(fs.existsSync(path.join(root, "src/app/api/ads/start/route.ts")));
  assert.ok(fs.existsSync(path.join(root, "src/app/api/ads/heartbeat/route.ts")));
  assert.ok(fs.existsSync(path.join(root, "src/app/api/ads/complete/route.ts")));
});

test("2. Mobile Font Visibility & Contrast: reward pills on /earn/ads show readable text and globals.css enforces 12px floor", () => {
  const adsPage = fs.readFileSync(path.join(root, "src/app/earn/ads/page.tsx"), "utf8");
  assert.ok(adsPage.includes("+KES {ad.rewardKes}"), "Green reward pill must display +KES X");
  assert.ok(adsPage.includes("+{ad.rewardPoints} pts"), "Blue reward pill must display +Y pts");
  assert.ok(adsPage.includes("whitespace-nowrap"), "Reward pills must not wrap/clip text");
  assert.ok(adsPage.includes('controlsList="nodownload'), "Hosted video player must disable download button");

  const globalsCss = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  assert.ok(globalsCss.includes("text-size-adjust: 100%"), "text-size-adjust: 100% must be set");
  assert.ok(globalsCss.includes("font-size: 0.75rem !important"), "12px minimum font floor must be enforced");
});

test("3. Direct One-Tap PWA Install: manifest.webmanifest, service worker, and InstallProvider exist without Chrome menu instructions", () => {
  const manifestRaw = fs.readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8");
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.ok(manifest.icons.some((i) => i.sizes === "192x192" && i.purpose === "any"));
  assert.ok(manifest.icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable"));

  assert.ok(fs.existsSync(path.join(root, "public/sw.js")), "Service worker public/sw.js must exist");
  assert.ok(fs.existsSync(path.join(root, "public/offline.html")), "Offline fallback public/offline.html must exist");

  const bannerCode = fs.readFileSync(path.join(root, "src/components/ui/PwaInstallBanner.tsx"), "utf8");
  assert.ok(!bannerCode.includes("menu ⋮"), "Must not show manual Chrome 3-dot menu instructions");
  assert.ok(bannerCode.includes("promptInstall"), "Must trigger direct one-tap promptInstall()");
});
