document.getElementById("verify").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter email");

  const device = crypto.randomUUID();
  const url = `https://kiron-extension-auth.vercel.app/api/auth/verify?email=${email}&device=${device}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      document.getElementById("msg").innerText = "Server error / Not allowed!";
      return;
    }

    const data = await res.json();

    if (data.success) {
      chrome.runtime.sendMessage({ action: "setVerified" }, () => {
        document.getElementById("msg").innerText = "Verified!";
      });
    } else {
      document.getElementById("msg").innerText = "Not verified!";
    }
  } catch (e) {
    document.getElementById("msg").innerText = "Network/CORS error";
  }
});
