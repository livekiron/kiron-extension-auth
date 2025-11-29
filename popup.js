const API = "https://kiron-extension-auth.vercel.app/api/auth/verify";

function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

verifyBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return setStatus("Enter email", false);

  const deviceId = getDeviceId();
  setStatus("Verifying...");

  try {
    const res = await fetch(`${API}?email=${email}&deviceId=${deviceId}`);
    const j = await res.json();

    if (res.ok && j.allowed) {
      await chrome.storage.local.set({ authorizedEmail: email });
      setStatus("Verified ✔ Single PC Lock Activated", true);
    } else {
      setStatus(j.message || "Blocked", false);
    }

  } catch (err) {
    console.log(err);
    setStatus("Network/Server error", false);
  }
});
