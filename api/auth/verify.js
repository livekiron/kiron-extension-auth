import { createClient } from "@vercel/kv";
import allowedData from "../../allowed.json";

// আপনার স্ক্রিনশটে থাকা ভেরিয়েবল ব্যবহার করে কানেক্ট করা
const kv = createClient({
  url: process.env.KV_REDIS_URL || process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN || "", // যদি টোকেন না থাকে তবে এটি কাজ নাও করতে পারে
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ডিবাগ চেক: কোন ভেরিয়েবল পাওয়া যাচ্ছে তা দেখা
  if (!process.env.KV_REDIS_URL && !process.env.KV_REST_API_URL) {
    return res.status(500).json({ 
      allowed: false, 
      message: "Database URL missing! দয়া করে Storage এ গিয়ে পুনরায় কানেক্ট করুন।" 
    });
  }

  const { email, machineId } = req.query;
  if (!email || !machineId) return res.status(400).json({ allowed: false, message: "Email and MachineId required" });

  const isWhitelisted = allowedData.allowed.some(e => e.toLowerCase() === email.toLowerCase());
  if (!isWhitelisted) return res.status(403).json({ allowed: false, message: "ইমেইলটি অনুমোদিত নয়!" });

  try {
    const key = `user_device:${email.toLowerCase()}`;
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
    return res.status(500).json({ allowed: false, message: "Database Error: " + e.message });
  }
}
