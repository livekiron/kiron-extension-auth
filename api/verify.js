export default async function handler(req, res) {
  // CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email missing!" });
  }

  // Allowed list JSON from GitHub raw link
  const allowedURL =
    "https://raw.githubusercontent.com/livekiron/kiron-extension-auth/main/allowed.json";

  try {
    const response = await fetch(allowedURL);
    const data = await response.json();

    if (data.allowed.includes(email)) {
      return res.status(200).json({
        access: true,
        message: "Access Granted",
      });
    } else {
      return res.status(200).json({
        access: false,
        message: "Access Denied",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
      details: error.toString(),
    });
  }
}
