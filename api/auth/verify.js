import { kv } from "@vercel/kv";
import allowedData from "../../allowed.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { email, machineId } = req.query;

  if (!email || !machineId) {
    return res.status(400).json({ allowed: false, message: "Email and MachineId required" });
  }

  const isWhitelisted = allowedData.allowed.some(e => e.toLowerCase() === email.toLowerCase());
  if (!isWhitelisted) {
    return res.status(403).json({ allowed: false, message: "ইমেইলটি অনুমোদিত নয়!" });
  }

  try {
    const key = `user_device:${email.toLowerCase()}`;
    const storedId = await kv.get(key);

    if (!storedId) {
      await kv.set(key, machineId);
      return res.status(200).json({ allowed: true, message: "পিসি লক সফল হয়েছে! ✅" });
    }

    if (storedId === machineId) {
      return res.status(200).json({ allowed: true, message: "অ্যাক্সেস অনুমোদিত। ✅" });
    } else {
      return res.status(403).json({ allowed: false, message: "অন্য পিসিতে লক করা! ❌" });
    }
  } catch (e) {
    return res.status(500).json({ allowed: false, message: "ডাটাবেস এরর: " + e.message });
  }
}
