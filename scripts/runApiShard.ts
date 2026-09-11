const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const shardIndex = Number(process.env.API_SHARD_INDEX || 1);
const shardCount = Number(process.env.API_SHARD_COUNT || 1);

if (!Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardIndex < 1 || shardIndex > shardCount) {
  throw new Error("API_SHARD_INDEX must be between 1 and API_SHARD_COUNT");
}

function featureFiles(directory: any) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry: { name: string; isDirectory: () => any; }) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return featureFiles(entryPath);
    return entry.name.endsWith(".feature") ? [entryPath] : [];
  });
}

const allFeatures = featureFiles(path.resolve("src/features")).sort();
const selectedFeatures = allFeatures.filter(
  (_feature: any, index: number) => index % shardCount === shardIndex - 1,
);

if (!selectedFeatures.length) {
  throw new Error(`No API features assigned to shard ${shardIndex}/${shardCount}`);
}

const cucumberBinary = path.resolve("node_modules/@cucumber/cucumber/bin/cucumber-js");
const tagExpression = process.env.API_TAGS || "not @A3";
const result = spawnSync(
  process.execPath,
  [cucumberBinary, "--tags", tagExpression, ...selectedFeatures],
  {
    stdio: "inherit",
    env: { ...process.env, API_SHARD_INDEX: String(shardIndex) },
  },
);

process.exit(result.status === null ? 1 : result.status);