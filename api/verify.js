export default async function handler(req, res) {
  const { email } = req.query;

  const allowedListUrl = "https://raw.githubusercontent.com/livekiron/kiron-extension-auth/main/allowed.json";

  try {
    const response = await fetch(allowedListUrl);
    const data = await response.json();

    if (data.allowed.includes(email)) {
      return res.status(200).json({ status: "allowed" });
    } else {
      return res.status(200).json({ status: "denied" });
    }

  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
