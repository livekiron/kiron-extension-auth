import allowedData from "../../allowed.json";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { email, device } = req.query;
  if (!email || !device) {
    return res.status(400).json({ allowed: false, msg: "Missing email/device" });
  }

  const allowedEmails = allowedData.allowed;
  if (!allowedEmails.includes(email)) {
    return res.status(403).json({ allowed: false });
  }

  const filePath = path.join(process.cwd(), "device_lock.json");
  const db = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // first time use → save device ID
  if (!db.devices[email]) {
    db.devices[email] = device;
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    return res.status(200).json({ allowed: true });
  }

  // same device → allowed
  if (db.devices[email] === device) {
    return res.status(200).json({ allowed: true });
  }

  // different device → BLOCK
  return res.status(403).json({
    allowed: false,
    msg: "Different device — Blocked"
  });
}
