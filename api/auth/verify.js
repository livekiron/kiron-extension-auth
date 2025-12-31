import { createClient } from "@vercel/kv";
import allowedData from "../../allowed.json";

// ম্যানুয়ালি ডাটাবেস কানেক্ট করা
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

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
    
    // ডাটাবেস চেক
    const storedId = await kv.get(key);

    if (!storedId) {
      await kv.set(key, machineId);
      return res.status(200).json({ allowed: true, message: "এই পিসির জন্য লক করা হলো! ✅" });
    }

    if (storedId === machineId) {
      return res.status(200).json({ allowed: true, message: "অ্যাক্সেস অনুমোদিত। ✅" });
    } else {
      return res.status(403).json({ allowed: false, message: "অন্য পিসিতে লক করা। ❌" });
    }
  } catch (e) {
    console.error("Redis Error:", e);
    return res.status(500).json({ allowed: false, message: "ডাটাবেস কানেকশন এরর!" });
  }
}
