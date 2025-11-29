import allowedData from "../../allowed.json";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email, device } = req.query;

  if (!email || !device) {
    return res.status(400).json({
      success: false,
      message: "Email and Device ID are required"
    });
  }

  // Check allowed list
  const allowed = allowedData.allowed;
  const isAllowedEmail = allowed.includes(email);

  if (!isAllowedEmail) {
    return res.status(403).json({
      success: false,
      allowed: false,
      message: "Email not in allowed list"
    });
  }

  // load database.json
  const dbPath = path.join(process.cwd(), "database.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (!db.devices[email]) {
    // First time verification — save this device
    db.devices[email] = device;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({
      success: true,
      allowed: true,
      message: "Email verified & device locked (first time)"
    });
  }

  // Device already registered — check match
  if (db.devices[email] === device) {
    return res.status(200).json({
      success: true,
      allowed: true,
      message: "Email + Device matched ✔ Access allowed"
    });
  }

  // Device mismatch → block
  return res.status(403).json({
    success: false,
    allowed: false,
    message: "This email is already used on another PC ❌"
  });
}
