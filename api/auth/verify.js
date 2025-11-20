import allowed from "../../../allowed.json";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  const ok = allowed.allowed.includes(email);

  if (ok) {
    return res.status(200).json({
      success: true,
      allowed: true,
      status: "allowed"
    });
  }

  return res.status(403).json({
    success: false,
    allowed: false,
    status: "denied"
  });
}