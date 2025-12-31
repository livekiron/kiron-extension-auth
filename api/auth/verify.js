import { kv } from "@vercel/kv";
import allowedData from "../../allowed.json";


  // CORS Headers (এই অংশটি আপনার স্ক্রিনশটের সমস্যার সমাধান করবে)
 export default async function handler(req, res) {
  // এই ৩টি লাইন অবশ্যই থাকতে হবে
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();


  }

  const { email, machineId } = req.query;

  if (!email || !machineId) {
    return res.status(400).json({ allowed: false, message: "ইমেইল এবং পিসি আইডি প্রয়োজন।" });
  }

  // হোয়াইটলিস্ট চেক (allowed.json থেকে)
  const isWhitelisted = allowedData.allowed.some(e => e.toLowerCase() === email.toLowerCase());
  if (!isWhitelisted) {
    return res.status(403).json({ allowed: false, message: "এই ইমেইলটি অনুমোদিত নয়।" });
  }

  try {
    const key = `user_device:${email.toLowerCase()}`;
    const storedId = await kv.get(key);

    if (!storedId) {
      // প্রথমবার লগইন করলে পিসি আইডি সেভ হবে
      await kv.set(key, machineId);
      return res.status(200).json({ allowed: true, message: "সফল! এই পিসির জন্য লক করা হলো। ✅" });
    }

    if (storedId === machineId) {
      // পিসি আইডি মিলে গেলে
      return res.status(200).json({ allowed: true, message: "অ্যাক্সেস অনুমোদিত। ✅" });
    } else {
      // অন্য পিসি হলে ব্লক
      return res.status(403).json({ allowed: false, message: "দুঃখিত, এই ইমেইলটি অন্য পিসিতে লক করা। ❌" });
    }
  } catch (e) {
    return res.status(500).json({ allowed: false, message: "সার্ভার এরর।" });
  }
}
