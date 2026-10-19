import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

function collectSourceFiles(dirPath, result = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, result);
    } else if (/\.(tsx|ts|jsx|js|svg)$/.test(entry.name)) {
      result.push(fullPath);
    }
  }
  return result;
}

test("No AI-style Sparkles, Sparkle, Wand, or Bot icons remain anywhere in src/ or public/", () => {
  const srcFiles = collectSourceFiles(path.join(rootDir, "src"));
  const publicFiles = collectSourceFiles(path.join(rootDir, "public"));

  for (const filePath of [...srcFiles, ...publicFiles]) {
    const content = fs.readFileSync(filePath, "utf8");
    const relPath = path.relative(rootDir, filePath);

    assert.doesNotMatch(
      content,
      /\bSparkles?\b/,
      `Found prohibited Sparkle/Sparkles icon in ${relPath}`
    );
    assert.doesNotMatch(
      content,
      /\bWand2?\b/,
      `Found prohibited Wand icon in ${relPath}`
    );
    assert.doesNotMatch(
      content,
      /\bBot\b/,
      `Found prohibited Bot icon in ${relPath}`
    );
  }
});

test("Consistent non-AI icons (Compass, ShieldCheck, Headphones) replace all former Sparkles usages", () => {
  const desktopSidebar = fs.readFileSync(
    path.join(rootDir, "src", "components", "navigation", "DesktopSidebar.tsx"),
    "utf8"
  );
  const bottomNav = fs.readFileSync(
    path.join(rootDir, "src", "components", "navigation", "BottomNav.tsx"),
    "utf8"
  );
  const earnPage = fs.readFileSync(
    path.join(rootDir, "src", "app", "earn", "page.tsx"),
    "utf8"
  );
  const dashboardPage = fs.readFileSync(
    path.join(rootDir, "src", "app", "dashboard", "page.tsx"),
    "utf8"
  );
  const earnAdsPage = fs.readFileSync(
    path.join(rootDir, "src", "app", "earn", "ads", "page.tsx"),
    "utf8"
  );
  const howPointsWorkModal = fs.readFileSync(
    path.join(rootDir, "src", "components", "points", "HowPointsWorkModal.tsx"),
    "utf8"
  );
  const supportChatModal = fs.readFileSync(
    path.join(rootDir, "src", "components", "support", "SupportChatModal.tsx"),
    "utf8"
  );

  // Navigation & Explore (/earn) use Compass consistently
  assert.match(desktopSidebar, /icon:\s*Compass/);
  assert.match(bottomNav, /icon:\s*Compass/);
  assert.match(earnPage, /<Compass\s+className=/);

  // Sponsored badges & verified review points use ShieldCheck
  assert.match(dashboardPage, /<ShieldCheck\s+className="w-3 h-3"\s*\/>/);
  assert.match(earnAdsPage, /<ShieldCheck\s+className="h-3\.5 w-3\.5"\s*\/>/);
  assert.match(howPointsWorkModal, /icon:\s*ShieldCheck/);

  // Support chat uses Headphones and ShieldCheck
  assert.match(supportChatModal, /<Headphones\s+className="w-5 h-5"\s*\/>/);
  assert.match(supportChatModal, /<ShieldCheck\s+className="w-3\.5 h-3\.5"\s*\/>/);
});
