document.getElementById("verifyBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    const res = await fetch(https://YOUR_DOMAIN/api/auth/verify?email=${email});
    const data = await res.json();

    if (data.allowed) {
      alert("Email verified ✓");

      chrome.runtime.sendMessage({ action: "setVerified" });

    } else {
      alert("Not allowed");
    }
  } catch (err) {
    alert("Server error");
  }
});


document.getElementById("injectBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "isVerified" }, (resp) => {
    if (!resp.verified) {
      alert("You must verify email first!");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
    });

    alert("Script Injected ✓");
  });
});
