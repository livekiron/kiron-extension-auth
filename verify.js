// api/verify.js (Vercel Serverless - Node)
import fetch from 'node-fetch';

const RAW_ALLOWED_URL = "https://raw.githubusercontent.com/<GITHUB_USERNAME>/<REPO_NAME>/main/allowed.json";
// replace <GITHUB_USERNAME> and <REPO_NAME> accordingly (e.g. livekiron/kiron-extension-auth)

export default async function handler(req, res) {
  // CORS - allow all origins (chrome-extension fetch allowed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }

  try {
    const r = await fetch(RAW_ALLOWED_URL, { method: 'GET' });
    if (!r.ok) {
      return res.status(500).json({ error: 'failed to fetch allowed list' });
    }
    const j = await r.json();
    const allowedList = Array.isArray(j.allowed) ? j.allowed.map(e => e.toString().toLowerCase()) : [];

    const allowed = allowedList.includes(email);
    if (allowed) {
      return res.status(200).json({ status: "allowed", email });
    } else {
      return res.status(200).json({ status: "denied", email });
    }
  } catch (err) {
    console.error('verify error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}