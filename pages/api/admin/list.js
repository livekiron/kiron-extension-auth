// pages/api/admin/list.js
import fs from "fs";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || auth.split(" ")[1] !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const dbPath = path.join(process.cwd(), "database.json");
  let db = { devices: {} };
  try {
    db = JSON.parse(fs.readFileSync(dbPath, "utf8") || "{}");
    if (!db.devices) db.devices = {};
  } catch (e) {
    db = { devices: {} };
  }

  return res.status(200).json({ success: true, devices: db.devices });
}
