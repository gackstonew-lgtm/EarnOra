import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  assert.equal(buffer[0], 0x89, `${filePath} must be a valid PNG`);
  assert.equal(buffer[1], 0x50, `${filePath} must be a valid PNG`);
  assert.equal(buffer[2], 0x4e, `${filePath} must be a valid PNG`);
  assert.equal(buffer[3], 0x47, `${filePath} must be a valid PNG`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer.readUInt8(25);
  return { width, height, colorType, byteLength: buffer.byteLength };
}

test("Both promotional hero PNG assets exist, are valid RGBA PNGs, and retain expected dimensions", () => {
  const maleHeroPath = path.join(rootDir, "public", "images", "dashboard-hero.png");
  const femaleHeroPath = path.join(
    rootDir,
    "public",
    "images",
    "dashboard-hero-watch-ads.png"
  );

  assert.ok(
    fs.existsSync(maleHeroPath),
    "Existing male hero image (public/images/dashboard-hero.png) must never be deleted"
  );
  assert.ok(
    fs.existsSync(femaleHeroPath),
    "New female Watch Ads hero image (public/images/dashboard-hero-watch-ads.png) must exist"
  );

  const maleMeta = readPngDimensions(maleHeroPath);
  assert.equal(maleMeta.width, 903);
  assert.equal(maleMeta.height, 1024);
  assert.equal(maleMeta.colorType, 6, "Male hero PNG must be RGBA (colorType 6)");

  const femaleMeta = readPngDimensions(femaleHeroPath);
  assert.equal(femaleMeta.width, 763);
  assert.equal(femaleMeta.height, 1024);
  assert.equal(femaleMeta.colorType, 6, "Female hero PNG must be RGBA (colorType 6)");
});

test("HeroImageRotator configures both hero images, 6-8s rotation interval, 600-900ms crossfade, and accessibility safeguards", () => {
  const rotatorPath = path.join(
    rootDir,
    "src",
    "components",
    "dashboard",
    "HeroImageRotator.tsx"
  );
  assert.ok(fs.existsSync(rotatorPath), "HeroImageRotator.tsx must exist");

  const source = fs.readFileSync(rotatorPath, "utf8");

  // Both image paths must be configured
  assert.match(source, /\/images\/dashboard-hero\.png/);
  assert.match(source, /\/images\/dashboard-hero-watch-ads\.png/);

  // Configurable interval (6000-8000ms) and fade duration (600-900ms)
  const intervalMatch = source.match(/HERO_ROTATION_INTERVAL_MS\s*=\s*(\d+)/);
  assert.ok(intervalMatch, "HERO_ROTATION_INTERVAL_MS must be defined");
  const intervalMs = Number(intervalMatch[1]);
  assert.ok(
    intervalMs >= 6000 && intervalMs <= 8000,
    `HERO_ROTATION_INTERVAL_MS (${intervalMs}) should be between 6000ms and 8000ms`
  );

  const fadeMatch = source.match(/HERO_FADE_DURATION_MS\s*=\s*(\d+)/);
  assert.ok(fadeMatch, "HERO_FADE_DURATION_MS must be defined");
  const fadeMs = Number(fadeMatch[1]);
  assert.ok(
    fadeMs >= 600 && fadeMs <= 900,
    `HERO_FADE_DURATION_MS (${fadeMs}) should be between 600ms and 900ms`
  );

  // Randomized initial image selection & non-repeating alternation
  assert.match(source, /Math\.random\(\)/);
  assert.match(source, /\(prevIndex\s*\+\s*1\)\s*%\s*HERO_PROMO_IMAGES\.length/);

  // Preloading & cleanup
  assert.match(source, /new window\.Image\(\)/);
  assert.match(source, /window\.clearInterval/);

  // Reduced motion & screen reader accessibility
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /aria-hidden=\{!isActive\}/);
  assert.doesNotMatch(source, /aria-live/);
});

test("Dashboard page renders HeroImageRotator inside the existing hero layout container", () => {
  const dashboardPath = path.join(rootDir, "src", "app", "dashboard", "page.tsx");
  const dashboardSource = fs.readFileSync(dashboardPath, "utf8");

  assert.match(
    dashboardSource,
    /import\s+\{\s*HeroImageRotator\s*\}\s+from\s+"@\/components\/dashboard\/HeroImageRotator"/
  );
  assert.match(dashboardSource, /<HeroImageRotator\s*\/>/);
});
