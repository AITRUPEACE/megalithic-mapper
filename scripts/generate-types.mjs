#!/usr/bin/env node
/**
 * Generate Supabase TypeScript types
 *
 * Generates TypeScript types from Supabase database schema.
 * Supports both remote (project ID) and local Supabase instances.
 *
 * Usage:
 *   node scripts/generate-types.mjs [--local]
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Load environment variables manually (for ES modules without dotenv)
function loadEnv(path) {
	if (!existsSync(path)) return;

	try {
		const content = readFileSync(path, "utf-8");
		const lines = content.split("\n");
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const match = trimmed.match(/^([^=]+)=(.*)$/);
			if (match) {
				const [, key, value] = match;
				// Remove quotes if present
				const cleanValue = value.replace(/^["']|["']$/g, "");
				process.env[key.trim()] = cleanValue;
			}
		}
	} catch (err) {
		// Ignore errors
	}
}

// Load .env first, then .env.local (so .env.local overrides)
loadEnv(".env");
loadEnv(".env.local");

const isLocal = process.argv.includes("--local");
const outputPath = join(process.cwd(), "src/types/database.types.ts");

function generateFromProject() {
	const projectId = process.env.SUPABASE_PROJECT_ID;

	if (!projectId) {
		console.error("❌ SUPABASE_PROJECT_ID not found in environment variables");
		console.error("   Set it in .env.local or use --local flag for local Supabase");
		console.error("");
		console.error("   Example:");
		console.error("   SUPABASE_PROJECT_ID=abcdefghijklmnopqrst");
		process.exit(1);
	}

	if (!/^[a-z0-9]{20}$/.test(projectId)) {
		console.error(`❌ Invalid SUPABASE_PROJECT_ID format: "${projectId}"`);
		console.error("   Must be 20 characters (alphanumeric lowercase)");
		console.error("   Example: abcdefghijklmnopqrst");
		process.exit(1);
	}

	console.log(`📡 Generating types from remote project: ${projectId.substring(0, 8)}...`);

	try {
		const types = execSync(
			`npx supabase gen types typescript --project-id ${projectId} --schema megalithic`,
			{
				encoding: "utf-8",
				stdio: "pipe",
			}
		);

		const header = `/**
 * Supabase Database Types
 * 
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * 
 * Generated from: Supabase project ${projectId.substring(0, 8)}...
 * Schema: megalithic
 * 
 * To regenerate:
 *   npm run types:generate        # From remote project
 *   npm run types:generate:local  # From local Supabase
 * 
 * Last generated: ${new Date().toISOString()}
 */

`;

		writeFileSync(outputPath, header + types);
		console.log(`✅ Types generated successfully: ${outputPath}`);
	} catch (error) {
		console.error("❌ Failed to generate types from remote project");
		console.error("   Make sure you have:");
		console.error("   1. SUPABASE_PROJECT_ID set in .env.local");
		console.error("   2. Supabase CLI authenticated: npx supabase login");
		console.error("   3. Or use --local flag for local Supabase");
		process.exit(1);
	}
}

function generateFromLocal() {
	console.log("🏠 Generating types from local Supabase...");

	try {
		const types = execSync("npx supabase gen types typescript --local --schema megalithic", {
			encoding: "utf-8",
			stdio: "pipe",
		});

		const header = `/**
 * Supabase Database Types
 * 
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * 
 * Generated from: local Supabase instance
 * Schema: megalithic
 * 
 * To regenerate:
 *   npm run types:generate        # From remote project
 *   npm run types:generate:local  # From local Supabase
 * 
 * Last generated: ${new Date().toISOString()}
 */

`;

		writeFileSync(outputPath, header + types);
		console.log(`✅ Types generated successfully: ${outputPath}`);
	} catch (error) {
		console.error("❌ Failed to generate types from local Supabase");
		console.error("   Make sure:");
		console.error("   1. Supabase is running locally: npx supabase start");
		console.error("   2. Migrations are applied");
		process.exit(1);
	}
}

// Main
if (isLocal) {
	generateFromLocal();
} else {
	generateFromProject();
}
