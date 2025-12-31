import { kv } from "@vercel/kv";
import allowedData from "../../allowed.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { email, machineId } = req.query;

  if (!email || !machineId) return res.status(400).json({ allowed: false, message: "Missing data" });

  // হোয়াইটলিস্ট চেক
  const isWhitelisted = allowedData.allowed.some(e => e.toLowerCase() === email.toLowerCase());
  if (!isWhitelisted) return res.status(403).json({ allowed: false, message: "Email not authorized" });

  try {
    const key = `user_device:${email.toLowerCase()}`;
    const storedId = await kv.get(key);

    if (!storedId) {
      await kv.set(key, machineId); // প্রথম পিসি রেজিস্টার
      return res.status(200).json({ allowed: true, message: "Device Locked to this PC ✅" });
    }

    if (storedId === machineId) {
      return res.status(200).json({ allowed: true, message: "Access Granted ✅" });
    } else {
      return res.status(403).json({ allowed: false, message: "Locked to another PC ❌" });
    }
  } catch (e) {
    return res.status(500).json({ allowed: false, message: "DB Error" });
  }
}