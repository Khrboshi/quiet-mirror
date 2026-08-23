#!/usr/bin/env node
/**
 * Verifies that production reflects the active non-billable early-access state.
 * Read-only: does not modify the application or external services.
 */
const url = process.env.PRODUCTION_URL || "https://quietmirror.me/";
const response = await fetch(url, { redirect: "follow" });
const html = await response.text();
const normalized = html.replace(/\s+/g, " ").toLowerCase();
const required = ["early access", "full access", "no charge"];
const forbidden = ["$25/month", "3-day free trial", "used by people carrying more than they’ve named out loud", "used by people carrying more than they've named out loud"];
const missing = required.filter((value) => !normalized.includes(value));
const presentForbidden = forbidden.filter((value) => normalized.includes(value));
console.log(JSON.stringify({ url, status: response.status, finalUrl: response.url, required, missing, forbiddenFound: presentForbidden }, null, 2));
if (!response.ok) process.exit(1);
if (missing.length || presentForbidden.length) process.exit(1);
console.log("Production beta messaging check passed.");
