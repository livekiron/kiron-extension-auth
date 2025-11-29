// pages/api/auth/verify.js
import allowedData from "../../../allowed.json";
import fs from "fs";
import path from "path";

function getClientIp(req) {
  // Vercel / proxies often set x-forwarded-for
  const xff = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (xff) {
    // x-forwarded-for may be comma separated list: take first
    return String(xff).split(',')[0].trim();
  }
  // fallback
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { email, device } = req.query;

  if (!email || !device) {
    return res.status(400).json({ success: false, message: "Email and device required" });
  }

  const allowed = allowedData.allowed || [];
  if (!allowed.includes(email)) {
    return res.status(403).json({ success: false, allowed: false, message: "Email not allowed" });
  }

  // load database
  const dbPath = path.join(process.cwd(), "database.json");
  let db = { devices: {} };
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    db = JSON.parse(raw || "{}");
    if (!db.devices) db.devices = {};
  } catch (e) {
    // if file not present, we'll create it later
    db = { devices: {} };
  }

  const clientIp = getClientIp(req);
  const now = new Date().toISOString();

  const existing = db.devices[email];

  if (!existing) {
    // first time — register device
    db.devices[email] = {
      deviceId: device,
      ip: clientIp,
      firstVerifiedAt: now,
      lastSeenAt: now,
      lastIpSeen: clientIp
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({
      success: true,
      allowed: true,
      message: "Verified and device locked (first time)",
      info: { email, deviceRegistered: true }
    });
  }

  // already registered: check deviceId
  if (existing.deviceId === device) {
    // allowed — update last seen and IP
    existing.lastSeenAt = now;
    existing.lastIpSeen = clientIp || existing.lastIpSeen;
    db.devices[email] = existing;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({
      success: true,
      allowed: true,
      message: "Email + Device matched. Access allowed.",
      info: { email }
    });
  }

  // mismatch => blocked
  return res.status(403).json({
    success: false,
    allowed: false,
    message: "This email is already used on another PC.",
    info: { registeredDevice: existing.deviceId, registeredIp: existing.ip, firstVerifiedAt: existing.firstVerifiedAt }
  });
}
