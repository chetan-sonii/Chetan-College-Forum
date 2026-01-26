// test-env.js
// Usage: node test-env.js [--reveal] [--env path/to/.env]
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const args = process.argv.slice(2);
const reveal = args.includes("--reveal");
const envIndex = args.findIndex(a => a === "--env");
const envPath = envIndex >= 0 ? args[envIndex + 1] : ".env";

const ENV_FULL_PATH = path.resolve(process.cwd(), envPath);

function readEnvFile(fp) {
    try {
        const raw = fs.readFileSync(fp, { encoding: "utf8" });
        const parsed = dotenv.parse(raw);
        return { raw, parsed };
    } catch (err) {
        console.error(`Error reading .env file at ${fp}:`, err.message);
        process.exit(2);
    }
}

function normalizeValue(v) {
    if (typeof v !== "string") return v;
    // Remove wrapping single/double quotes
    return v.replace(/^['"]|['"]$/g, "");
}

function looksLikeSecret(key) {
    return /KEY|SECRET|PASSWORD|PASS|TOKEN|TOKEN_SECRET|API|PWD|PRIVATE/i.test(key);
}

function mask(v) {
    if (v == null) return "(not set)";
    const s = String(v);
    if (s.length <= 6) return "*".repeat(s.length);
    return s.slice(0, 3) + "*".repeat(Math.max(4, s.length - 6)) + s.slice(-3);
}

function isDurationFormat(v) {
    return /^\d+[smhd]$/.test(v);
}

function printRow(key, fileVal, envVal, status) {
    const showFile = reveal ? String(fileVal) : (looksLikeSecret(key) ? mask(fileVal) : String(fileVal));
    const showEnv = reveal ? String(envVal) : (looksLikeSecret(key) ? mask(envVal) : String(envVal));
    console.log(`${key.padEnd(40)} | file: ${showFile.padEnd(30)} | env: ${showEnv.padEnd(30)} | ${status}`);
}

(async function main() {
    console.log("🔎 Environment file inspector");
    console.log("  .env path:", ENV_FULL_PATH);
    console.log("  reveal secrets?:", reveal ? "YES" : "NO (use --reveal to show)");

    const { raw, parsed } = readEnvFile(ENV_FULL_PATH);
    // Load .env into process.env but do not overwrite existing env vars
    dotenv.config({ path: ENV_FULL_PATH });

    const keys = Object.keys(parsed);
    if (keys.length === 0) {
        console.warn("⚠️  No variables found in the parsed .env file.");
    }

    const errors = [];
    const warnings = [];

    console.log("\n📄 Checking variables from the .env file\n");
    console.log("KEY".padEnd(40) + " | file".padEnd(34) + " | env".padEnd(34) + " | STATUS");
    console.log("-".repeat(120));

    keys.forEach((k) => {
        const rawFileVal = parsed[k];
        const fileVal = normalizeValue(rawFileVal);
        const envVal = process.env[k] === undefined ? "(not set)" : normalizeValue(process.env[k]);

        let status = "OK";

        if (fileVal === "" || fileVal === undefined || fileVal === null) {
            status = "EMPTY in file";
            warnings.push(k + " is empty in file");
        } else if (String(fileVal).toLowerCase() === "undefined" || String(fileVal).toLowerCase() === "null") {
            status = `INVALID (${String(fileVal)})`;
            errors.push(k + " has invalid literal: " + String(fileVal));
        }

        if (envVal === "(not set)") {
            // okay - maybe environment override missing
            status = status === "OK" ? "Loaded from file only" : status + " & not exported";
        } else if (String(envVal) !== String(fileVal)) {
            status = status === "OVERRIDDEN in process.env";
            warnings.push(`${k} is overridden by environment (process.env)`);
        }

        // Additional checks for specific well-known keys
        if (/PORT$/i.test(k) && envVal !== "(not set)") {
            if (isNaN(Number(envVal))) {
                errors.push(k + " should be numeric");
                status = "INVALID (expected number)";
            }
        }

        if (/SMTP_PORT/i.test(k) && envVal !== "(not set)") {
            if (isNaN(Number(envVal))) {
                errors.push(k + " (SMTP_PORT) should be numeric");
                status = "INVALID (expected number)";
            }
        }

        if (/MONGODB|MONGO/i.test(k) && String(fileVal).length > 0 && !String(fileVal).startsWith("mongodb")) {
            warnings.push(k + " does not start with mongodb (looks odd)");
            if (status === "OK") status = "WARN (mongo URI format?)";
        }

        if (/EXPIRATION|EXPIRY|TTL/i.test(k)) {
            const val = String(fileVal);
            if (!isDurationFormat(val)) {
                warnings.push(k + " has unexpected expiration format (expected like 5m, 1d, etc.)");
                if (status === "OK") status = "WARN (exp format)";
            }
        }

        printRow(k, fileVal, envVal, status);
    });

    // Also show any env vars that exist but not present in the .env file (helpful)
    const extraEnvKeys = Object.keys(process.env).filter(k => !keys.includes(k));
    if (extraEnvKeys.length) {
        console.log("\n⚠️  Variables present in process.env but not found in .env file (possibly set by system/hosting):");
        console.log("-".repeat(120));
        extraEnvKeys.forEach(k => {
            const v = normalizeValue(process.env[k]);
            const show = reveal ? v : (looksLikeSecret(k) ? mask(v) : v);
            console.log(`${k.padEnd(40)} | env: ${String(show)}`);
        });
    }

    // Report summary
    console.log("\n\nSummary:");
    if (errors.length) {
        console.error(`\n❌ ERRORS (${errors.length}):`);
        errors.forEach(e => console.error("  -", e));
    } else {
        console.log("✅ No critical errors found.");
    }

    if (warnings.length) {
        console.warn(`\n⚠️ WARNINGS (${warnings.length}):`);
        warnings.forEach(w => console.warn("  -", w));
    } else {
        console.log("✅ No warnings.");
    }

    // Optional: attempt SMTP verify if SMTP settings present and not masked
    const smtpKeyCandidates = ["SMTP_SERVER", "SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD"];
    const smtpPresent = smtpKeyCandidates.every(k => process.env[k]);

    if (smtpPresent) {
        console.log("\n📧 SMTP credentials appear present. Attempting a connection verify (this will contact the SMTP server)...");
        try {
            const host = process.env.SMTP_SERVER || process.env.SMTP_HOST;
            const port = Number(process.env.SMTP_PORT || process.env.SMTP_PORT);
            const secure = port === 465;
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                },
                // tls: { rejectUnauthorized: false }, // uncomment for debugging self-signed certs (not recommended)
            });

            if (typeof transporter.verify === "function") {
                await transporter.verify();
                console.log("✅ SMTP verify succeeded — credentials accepted and server reachable.");
            } else {
                console.warn("⚠️ transporter.verify() not available on this Nodemailer transport.");
            }
        } catch (err) {
            console.error("❌ SMTP verify failed:", err && err.message ? err.message : err);
        }
    } else {
        console.log("\nℹ️ SMTP verify skipped — SMTP vars missing or incomplete (SMTP_SERVER/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD).");
    }

    // Exit codes:
    if (errors.length) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
