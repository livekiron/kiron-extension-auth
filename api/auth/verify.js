import { kv } from "@vercel/kv";
import allowedData from "../../allowed.json";

export default async function handler(req, res) {
  // ১. CORS সেটিংস
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ২. ইনপুট চেক
  const { email, machineId } = req.query;
  if (!email || !machineId) {
    return res.status(400).json({ allowed: false, message: "Email and MachineId required" });
  }

  // ৩. হোয়াইটলিস্ট চেক
  const isWhitelisted = allowedData.allowed.some(e => e.toLowerCase() === email.toLowerCase());
  if (!isWhitelisted) {
    return res.status(403).json({ allowed: false, message: "ইমেইলটি অনুমোদিত নয়!" });
  }

  try {
    // ৪. ডিভাইস লক লজিক (KV ব্যবহার করে)
    const key = `user_device:${email.toLowerCase()}`;
    const storedId = await kv.get(key);

    if (!storedId) {
      // প্রথম পিসি সেভ করা হচ্ছে
      await kv.set(key, machineId);
      return res.status(200).json({ allowed: true, message: "Device Registered ✅" });
    }

    if (storedId === machineId) {
      // পিসি মিলেছে
      return res.status(200).json({ allowed: true, message: "Access Granted ✅" });
    } else {
      // অন্য পিসি
      return res.status(403).json({ allowed: false, message: "Locked to another PC ❌" });
    }
  } catch (err) {
    console.error("KV Error:", err);
    return res.status(500).json({ allowed: false, message: "সার্ভার ডাটাবেস এরর!" });
  }
}
