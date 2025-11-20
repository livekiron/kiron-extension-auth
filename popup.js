// ====== CONFIG ======
const API_BASE = "https://kiron-extension-auth.vercel.app/api/auth/verify";
// =====================

document.getElementById('serverUrl').textContent = API_BASE.replace('/api/auth/verify','');

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
  if (!email) return setStatus("Enter a valid email", false);

  setStatus("Verifying...");

  try {
    const res = await fetch(API_BASE + "?email=" + encodeURIComponent(email));
    const data = await res.json();

    if (data.allowed) {
      await chrome.storage.local.set({ authorizedEmail: email });
      setStatus("Access granted ✅", true);
    } else {
      setStatus("Access denied ✖", false);
    }
  } catch (e) {
    setStatus("Server/network error", false);
  }
});

injectBtn.addEventListener("click", async () => {
  const s = await chrome.storage.local.get(["authorizedEmail"]);
  if (!s.authorizedEmail)
    return setStatus("Not authorized. Verify first.", false);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return setStatus("No active tab", false);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content_script.js"]
    });
    setStatus("Script injected ✅", true);
  } catch {
    setStatus("Injection failed", false);
  }
});