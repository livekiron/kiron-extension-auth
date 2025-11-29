const API_URL = "https://kiron-extension-auth.vercel.app/api/auth/verify";

// ---------- Device ID Generator ----------
function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device_id", id);
    }
    return id;
}

// ---------- UI Elements ----------
const emailInput = document.getElementById("email");
const verifyBtn = document.getElementById("verify");
const injectBtn = document.getElementById("inject");
const status = document.getElementById("status");

function setStatus(msg, ok) {
    status.textContent = msg;
    status.className = ok ? "ok" : "err";
}

// ---------- VERIFY BUTTON ----------
verifyBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return setStatus("Enter valid email", false);

    const deviceId = getDeviceId();
    setStatus("Verifying...", true);

    try {
        const res = await fetch(`${API_URL}?email=${email}&device=${deviceId}`);
        const data = await res.json();

        if (data.allowed === true) {
            await chrome.storage.local.set({ authorizedEmail: email });
            setStatus("Access Granted ✔", true);
        } else {
            setStatus("Access Blocked ❌ (Different PC)", false);
        }
    } catch (e) {
        console.log(e);
        setStatus("Network/Server error", false);
    }
});

// ---------- INJECT BUTTON ----------
injectBtn.addEventListener("click", async () => {
    const s = await chrome.storage.local.get(["authorizedEmail"]);
    if (!s.authorizedEmail) {
        return setStatus("Not authorized!", false);
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content_script.js"]
    });

    setStatus("Script Injected ✔", true);
});
