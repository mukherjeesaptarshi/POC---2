import { spawn } from "node:child_process";
import { resolve } from "node:path";

const browsers = ["chrome", "firefox", "edge"] as const;
const cucumberCli = resolve(
  process.cwd(),
  "node_modules",
  "@cucumber",
  "cucumber",
  "bin",
  "cucumber.js",
);
const forwardedArgs = process.argv.slice(2);

async function main(): Promise<void> {
  const exitCodes = await Promise.all(
    browsers.map(
      (browser) =>
        new Promise<number>((resolveExitCode) => {
          console.log(`[${browser}] Starting web scenarios`);
          const child = spawn(
            process.execPath,
            [cucumberCli, "--profile", "web", ...forwardedArgs],
            {
              env: { ...process.env, WEB_BROWSER: browser },
              stdio: "inherit",
            },
          );

          child.once("error", (error) => {
            console.error(`[${browser}] Could not start Cucumber:`, error);
            resolveExitCode(1);
          });
          child.once("close", (code) => resolveExitCode(code ?? 1));
        }),
    ),
  );

  process.exitCode = exitCodes.some((code) => code !== 0) ? 1 : 0;
}

void main();