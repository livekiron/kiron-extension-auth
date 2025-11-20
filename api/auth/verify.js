import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // CORS Fix
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Load allowed.json properly
  const filePath = path.join(process.cwd(), "allowed.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const allowed = JSON.parse(fileContents).allowed;

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const isAllowed = allowed.includes(email);

  if (isAllowed) {
    return res.status(200).json({
      success: true,
      allowed: true,
    });
  }

  return res.status(403).json({
    success: false,
    allowed: false,
  });
}
