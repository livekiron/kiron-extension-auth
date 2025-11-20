// ====== configure this ======
const API_BASE = "https://kiron-extension-auth.vercel.app/api/verify";
// ============================
document.getElementById('serverUrl').textContent = API_BASE.replace('/api/verify','');

const emailInput = document.getElementById("email");
const verifyBtn = document.getElementById("verify");
const injectBtn = document.getElementById("inject");
const status = document.getElementById("status");

function setStatus(txt, ok) {
  status.textContent = txt;
  status.className = ok === true ? "ok" : ok === false ? "err" : "";
}

verifyBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) { setStatus("Enter a valid email", false); return; }
  setStatus("Verifying...");
  try {
    const res = await fetch(API_BASE + "?email=" + encodeURIComponent(email), { method: "GET" });
    if (!res.ok) {
      setStatus("Server error: " + res.status, false);
      return;
    }
    const j = await res.json();
    const allowed = j.status === "allowed" || j.allowed === true;
    if (allowed) {
      await chrome.storage.local.set({ authorizedEmail: email });
      setStatus("Access granted ✅ (" + email + ")", true);
    } else {
      await chrome.storage.local.remove("authorizedEmail");
      setStatus("Access denied ✖", false);
    }
  } catch (e) {
    console.error(e);
    setStatus("Server/network error", false);
  }
});

injectBtn.addEventListener("click", async () => {
  const s = await chrome.storage.local.get(["authorizedEmail"]);
  if (!s.authorizedEmail) {
    setStatus("Not authorized. Verify your email first.", false);
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) { setStatus("No active tab", false); return; }
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content_script.js"] });
    setStatus("Script injected ✅", true);
  } catch (err) {
    console.error(err);
    setStatus("Injection failed", false);
  }
});