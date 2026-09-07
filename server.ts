import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Check SMTP configuration status
  app.get("/api/email-config", (_req, res) => {
    const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      configured: hasSmtp,
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : null,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || null
    });
  });

  // Real server-side email dispatch
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, html, noticeType, recipientName, smtpConfig } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields (to, subject, text/html)" 
      });
    }

    const smtpUser = (smtpConfig?.user || process.env.SMTP_USER || "").trim();
    const smtpPass = (smtpConfig?.pass || process.env.SMTP_PASS || "").trim();
    const smtpHost = (smtpConfig?.host || process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const smtpPort = parseInt(smtpConfig?.port || process.env.SMTP_PORT || "465", 10);
    const smtpSecure = smtpConfig?.secure !== undefined 
      ? Boolean(smtpConfig.secure) 
      : (process.env.SMTP_SECURE === "false" || smtpPort === 587 ? false : true);
    const smtpFrom = (smtpConfig?.from || process.env.SMTP_FROM || smtpUser).trim();

    if (!smtpUser || !smtpPass) {
      return res.json({
        success: false,
        requiresSmtpConfig: true,
        message: "Server SMTP credentials are not configured. Use 1-Click Gmail Web dispatch or configure SMTP credentials."
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 12000,
        greetingTimeout: 8000,
        socketTimeout: 18000
      });

      // Wrap in clean institutional HTML email if raw html isn't supplied
      const finalHtml = html || `
        <div style="font-family: Arial, 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">Central Library & Learning Resource Center</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #93c5fd;">Automated Academic Circulation Notification</p>
          </div>
          <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Recipient: <strong style="color: #0f172a;">${recipientName || to}</strong> &lt;${to}&gt;</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Notice Subject: <strong style="color: #2563eb;">${subject}</strong></p>
            </div>
            <div style="white-space: pre-wrap; font-size: 14px; color: #334155; line-height: 1.7;">${text}</div>
            <div style="margin-top: 30px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
              <p style="margin: 0; font-weight: bold; color: #0f172a;">Circulation & Information Desk</p>
              <p style="margin: 2px 0 0 0;">Dinajpur Polytechnic Institute Central Library</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">This is an official automated notification. For inquiries, visit the circulation counter.</p>
            </div>
          </div>
        </div>
      `;

      const fromAddress = smtpFrom.includes("<") ? smtpFrom : `"Central Library" <${smtpFrom}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: text || "",
        html: finalHtml
      });

      console.log("Email sent successfully via SMTP:", info.messageId);
      return res.json({
        success: true,
        method: "smtp",
        messageId: info.messageId,
        recipient: to
      });
    } catch (err: any) {
      console.error("SMTP Error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to send email via SMTP server"
      });
    }
  });

  // Test SMTP connection endpoint
  app.post("/api/test-smtp", async (req, res) => {
    const { smtpConfig } = req.body;
    const smtpUser = (smtpConfig?.user || process.env.SMTP_USER || "").trim();
    const smtpPass = (smtpConfig?.pass || process.env.SMTP_PASS || "").trim();
    const smtpHost = (smtpConfig?.host || process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const smtpPort = parseInt(smtpConfig?.port || process.env.SMTP_PORT || "465", 10);
    const smtpSecure = smtpConfig?.secure !== undefined 
      ? Boolean(smtpConfig.secure) 
      : (process.env.SMTP_SECURE === "false" || smtpPort === 587 ? false : true);

    if (!smtpUser || !smtpPass) {
      return res.status(400).json({ success: false, message: "SMTP User and Password are required" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10000
      });
      await transporter.verify();
      return res.json({ success: true, message: "SMTP connection verified successfully!" });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
