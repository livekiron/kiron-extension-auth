export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email, device } = req.query;

  if (!email || !device) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Example verification (YOUR LOGIC)
  if (email === "srship2026@gmail.com") {
    return res.status(200).json({ success: true });
  }

  return res.status(403).json({ success: false });
}
