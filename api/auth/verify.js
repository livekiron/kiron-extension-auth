import allowed from "../../../allowed.json";

export default function handler(req, res) {
  
  // CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const isAllowed = allowed.allowed.includes(email);

  if (isAllowed) {
    return res.status(200).json({
      status: "allowed",
    });
  }

  return res.status(403).json({
    status: "denied",
  });
}
