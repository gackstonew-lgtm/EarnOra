import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("Popular Categories contains all 6 categories in exact mobile grid order with Watch Ads at index 3", () => {
  const dashboardPath = path.join(rootDir, "src", "app", "dashboard", "page.tsx");
  const source = fs.readFileSync(dashboardPath, "utf8");

  const expectedOrder = [
    { id: "hotels_restaurants", name: "Restaurants", subtext: "Food & Drinks" },
    { id: "apps_websites", name: "Apps", subtext: "Mobile Apps" },
    { id: "local_services", name: "Local Business", subtext: "Shops & Services" },
    { id: "watch_ads", name: "Watch Ads", subtext: "Watch short ads & earn" },
    { id: "telco_fintech", name: "Telcos", subtext: "Networks & Bundles" },
    { id: "product_testing", name: "Products", subtext: "Goods & Services" },
  ];

  let lastIndex = -1;
  for (const cat of expectedOrder) {
    const idPos = source.indexOf(`id: "${cat.id}"`);
    assert.ok(idPos > -1, `Missing category id "${cat.id}" in popularCategories`);
    assert.ok(
      idPos > lastIndex,
      `Category "${cat.name}" (${cat.id}) is not in the expected sequence`
    );
    assert.ok(
      source.includes(`name: "${cat.name}"`),
      `Missing category name "${cat.name}"`
    );
    assert.ok(
      source.includes(`subtext: "${cat.subtext}"`),
      `Missing category subtext "${cat.subtext}"`
    );
    lastIndex = idPos;
  }

  // Verify Watch Ads specific styling and destination route
  assert.match(source, /id:\s*"watch_ads"[\s\S]*?icon:\s*SquarePlay/);
  assert.match(source, /id:\s*"watch_ads"[\s\S]*?iconColor:\s*"#22C55E"/);
  assert.match(source, /id:\s*"watch_ads"[\s\S]*?iconBg:\s*"bg-green-500\/15"/);
  assert.match(source, /id:\s*"watch_ads"[\s\S]*?href:\s*"\/earn\/ads"/);
});

test("Popular Categories grid uses responsive 2-col mobile / 3-col tablet+desktop layout and accessible markup", () => {
  const dashboardPath = path.join(rootDir, "src", "app", "dashboard", "page.tsx");
  const source = fs.readFileSync(dashboardPath, "utf8");

  assert.match(
    source,
    /grid-cols-1\s+min-\[300px\]:grid-cols-2\s+sm:grid-cols-3\s+gap-3/
  );
  assert.match(
    source,
    /aria-label=\{`\$\{cat\.name\}\s*—\s*\$\{cat\.subtext\}\.\s*Start Earning`\}/
  );
  assert.match(source, /focus-visible:ring-2/);
  assert.match(source, /motion-reduce:transition-none/);
});
