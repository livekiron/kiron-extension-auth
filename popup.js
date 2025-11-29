// ========== CONFIG =============
const API_BASE = "https://kiron-extension-auth.vercel.app/pages/api/auth/verify";
// ===============================

// HTML Elements
const emailInput = document.getElementById("email");
const verifyBtn = document.getElementById("verify");
const injectBtn = document.getElementById("inject");
const status = document.getElementById("status");

document.getElementById("serverUrl").textContent =
  API_BASE.replace("/pages/api/auth/verify", "");

// Status function
function setStatus(msg, ok) {
  status.textContent = msg;
  status.className = ok ? "ok" : "err";
}

// Generate device ID
function generateDeviceId() {
  const parts = [
    navigator.userAgent,
    navigator.platform,
    screen.width + "x" + screen.height,
    navigator.language,
    navigator.hardwareConcurrency || 0,
  ];
  return btoa(parts.join("|")); // base64 encode
}

const DEVICE_ID = generateDeviceId();

// ================= VERIFY BUTTON ===================
verifyBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    setStatus("Enter a valid email", false);
    return;
  }

  setStatus("Verifying...");

  try {
    const url = `${API_BASE}?email=${encodeURIComponent(
      email
    )}&device=${encodeURIComponent(DEVICE_ID)}`;

    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
    });

    const j = await res.json();
    const allowed = j.allowed === true;

    if (allowed) {
      await chrome.storage.local.set({
        authorizedEmail: email,
        deviceId: DEVICE_ID,
      });
      setStatus(`Access granted ✅ (${email})`, true);
    } else {
      await chrome.storage.local.remove(["authorizedEmail", "deviceId"]);
      setStatus(j.message || "Access denied ✖", false);
    }
  } catch (e) {
    console.error(e);
    setStatus("Server / network error", false);
  }
});

// ================= INJECT BUTTON ===================
injectBtn.addEventListener("click", async () => {
  const saved = await chrome.storage.local.get([
    "authorizedEmail",
    "deviceId",
  ]);

  if (!saved.authorizedEmail) {
    setStatus("Not authorized. Verify email first.", false);
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content_script.js"],
    });

    setStatus("Script injected!", true);
  } catch (err) {
    console.error(err);
    setStatus("Injection failed", false);
  }
});
