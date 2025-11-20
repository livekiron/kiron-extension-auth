export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.query;

  const allowedURL =
    "https://raw.githubusercontent.com/livekiron/kiron-extension-auth/main/allowed.json";

  try {
    const response = await fetch(allowedURL);
    const data = await response.json();

    if (data.allowed.includes(email)) {
      res.status(200).json({ access: true, message: "Access Granted" });
    } else {
      res.status(200).json({ access: false, message: "Access Denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}
