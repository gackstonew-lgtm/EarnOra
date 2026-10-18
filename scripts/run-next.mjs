#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { startLocalProxyBridge } from "./local-proxy-bridge.mjs";

const args = process.argv.slice(2);
const subcommand = args[0] || "dev";

const nextBin = path.resolve(process.cwd(), "node_modules/next/dist/bin/next");

if (!fs.existsSync(nextBin)) {
  console.error("\n[ERROR] Next.js binary not found at node_modules/next/dist/bin/next.");
  process.exit(1);
}

async function run() {
  const proxyUrl = await startLocalProxyBridge(10809);

  const env = {
    ...process.env,
    NODE_ENV: subcommand === "dev" ? "development" : "production",
    PORT: process.env.PORT || "3005",
  };

  if (proxyUrl) {
    env.HTTP_PROXY = proxyUrl;
    env.HTTPS_PROXY = proxyUrl;
    env.NO_PROXY = "localhost,127.0.0.1";
    env.NODE_USE_ENV_PROXY = "1";
  }

  if (subcommand === "dev") {
    console.log("============================================================");
    console.log("  Starting Earnora — Review. Earn. Grow.");
    console.log(`  Local URL   : http://localhost:${env.PORT}`);
    console.log(`  Auth URL    : http://localhost:${env.PORT}/auth/login`);
    console.log("============================================================");
  }

  const baseArgs = [...args];
  if (!baseArgs.includes("--webpack")) {
    baseArgs.push("--webpack");
  }

  const childArgs = proxyUrl
    ? ["--use-env-proxy", nextBin, ...baseArgs]
    : [nextBin, ...baseArgs];

  const child = spawn(process.execPath, childArgs, {
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

run();
