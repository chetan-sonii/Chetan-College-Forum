// sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options = {}) => {
  if (!options || !options.email) {
    throw new Error("sendEmail: options.email is required");
  }

  // Normalize env names and provide helpful error if missing
  const smtpHost = process.env.SMTP_SERVER || process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error(
        "Missing SMTP config. Ensure SMTP_SERVER, SMTP_PORT, SMTP_USERNAME and SMTP_PASSWORD are set"
    );
  }

  // secure true for implicit TLS (port 465), false for STARTTLS (587)
  const secure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // tls: { rejectUnauthorized: false }, // only for debugging; not recommended in prod
  });

  // If verify is available, run it — wrapped in typeof check to avoid linter complaints
  if (typeof transporter.verify === "function") {
    try {
      await transporter.verify();
    } catch (err) {
      err.message = `SMTP verify failed: ${err.message}`;
      throw err;
    }
  }

  const mailOptions = {
    from: options.from || `CHETAN Forum <${smtpUser}>`,
    to: options.email,
    subject: options.subject || "No subject",
    text: options.text || "",
    html: options.html || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // Use or return info so it's not flagged as an unused variable
    return info;
  } catch (err) {
    err.message = `sendMail failed: ${err.message}`;
    throw err;
  }
};

module.exports = sendEmail;
