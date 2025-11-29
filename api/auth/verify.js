import fs from "fs";
import path from "path";

const allowedData = require("../../allowed.json");

// Save DB file (device lock)
const dbPath = path.join(process.cwd(), "device_lock.json");

// If file not exists create empty object
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}), "utf8");
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email, deviceId } = req.query;

  if (!email || !deviceId) {
    return res.status(400).json({
      success: false,
      message: "Email & Device ID required",
    });
  }

  const allowed = allowedData.allowed;
  const isAllowed = allowed.includes(email);

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      allowed: false,
      message: "Email not allowed",
    });
  }

  // LOAD DB
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // If user already registered from another device → Block
  if (db[email] && db[email] !== deviceId) {
    return res.status(403).json({
      success: false,
      allowed: false,
      message: "This email is already used on another device!",
    });
  }

  // Save new device ID (first time only)
  db[email] = deviceId;
  fs.writeFileSync(dbPath, JSON.stringify(db), "utf8");

  return res.status(200).json({
    success: true,
    allowed: true,
    message: "Verified on your device",
  });
}
