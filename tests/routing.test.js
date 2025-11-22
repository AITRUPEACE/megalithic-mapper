const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");

const readFile = (filePath) => fs.readFileSync(path.join(repoRoot, filePath), "utf8");

describe("legacy route redirects", () => {
  test("redirects /app/* to the route-group equivalent", () => {
    const configSource = readFile("next.config.ts");
    assert.match(configSource, /source:\s*["']\/app\/:path\*["']/);
    assert.match(configSource, /destination:\s*["']\/:path\*["']/);
  });
});

describe("map entry points", () => {
  const entryPoints = [
    { file: "src/app/page.tsx", snippet: 'href="/map"', description: "Landing CTA" },
    { file: "src/widgets/navigation/app-sidebar.tsx", snippet: 'href: "/map"', description: "Sidebar navigation" },
    { file: "src/widgets/navigation/app-topbar.tsx", snippet: 'href="/map#new-site"', description: "Topbar quick action" },
    { file: "src/app/(app)/discover/page.tsx", snippet: 'href="/map"', description: "Discover featured cards" },
    { file: "src/app/(app)/discover/page.tsx", snippet: 'href={`/map?focus=', description: "Discover focus deep-links" },
    { file: "src/app/(app)/research/page.tsx", snippet: 'href={`/map?project=', description: "Research project hand-off" },
  ];

  for (const { file, snippet, description } of entryPoints) {
    test(`${description} includes a link to /map`, () => {
      const source = readFile(file);
      assert.ok(
        source.includes(snippet),
        `Expected ${file} to contain "${snippet}" so navigation to /map remains reachable.`
      );
    });
  }

  test("map route component is present", () => {
    const mapRoute = "src/app/(app)/map/page.tsx";
    assert.ok(fs.existsSync(path.join(repoRoot, mapRoute)), "Map page should exist inside the (app) route group.");
    const source = readFile(mapRoute);
    assert.match(source, /export default function MapPage/, "Map page should export the MapPage component.");
  });
});
