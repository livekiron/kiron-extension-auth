const API_BASE = "https://kiron-extension-auth.vercel.app/api/auth/verify";

document.getElementById('serverUrl').textContent = API_BASE.replace('/api/auth/verify','');

const emailInput = document.getElementById("email");
const verifyBtn = document.getElementById("verify");
const injectBtn = document.getElementById("inject");
const status = document.getElementById("status");

function setStatus(txt, ok) {
  status.textContent = txt;
  status.className = ok === true ? "ok" : ok === false ? "err" : "";
}

// 🔥 DEVICE ID (Permanent)
function getDeviceID() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

verifyBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return setStatus("Enter a valid email", false);

  const deviceId = getDeviceID();
  setStatus("Verifying...");

  try {
    const res = await fetch(API_BASE + `?email=${encodeURIComponent(email)}&deviceId=${deviceId}`);

    const j = await res.json();

    if (!res.ok || !j.allowed) {
      await chrome.storage.local.remove("authorizedEmail");
      return setStatus(j.message || "Access denied ❌", false);
    }

    await chrome.storage.local.set({ authorizedEmail: email });
    setStatus("Access granted ✔ (" + email + ")", true);

  } catch (e) {
    console.error(e);
    setStatus("Network/Server error", false);
  }
});

injectBtn.addEventListener("click", async () => {
  const s = await chrome.storage.local.get(["authorizedEmail"]);
  if (!s.authorizedEmail) return setStatus("Not authorized!", false);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content_script.js"] });
    setStatus("Script injected!", true);
  } catch {
    setStatus("Injection failed", false);
  }
});
