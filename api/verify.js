export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.query;

  // allowed.json ফাইল লোড
  const allowed = require("../allowed.json").allowed;

  if (!email) {
    return res.status(400).json({ allowed: false, message: "No email provided" });
  }

  if (allowed.includes(email)) {
    return res.status(200).json({ allowed: true, message: "Access granted" });
  } else {
    return res.status(403).json({ allowed: false, message: "Access denied" });
  }
}
