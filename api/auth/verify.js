import allowed from "../../allowed.json";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // CORS:
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
      message: "email & deviceId required"
    });
  }

  // Allowed email check
  const isAllowed = allowed.allowed.includes(email);
  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "Email not allowed"
    });
  }

  const filePath = path.join(process.cwd(), "device_lock.json");
  const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const existing = fileData.locks.find(x => x.email === email);

  // Already used on another PC?
  if (existing && existing.deviceId !== deviceId) {
    return res.status(403).json({
      success: false,
      locked: true,
      message: "This email is already used on another device"
    });
  }

  // First time user? Save device
  if (!existing) {
    fileData.locks.push({ email, deviceId });
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
  }

  return res.status(200).json({
    success: true,
    allowed: true,
    message: "Access granted"
  });
}
