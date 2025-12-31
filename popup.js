document.getElementById("verify").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const status = document.getElementById("status");

  if (!email) { status.textContent = "Enter email!"; return; }
  
  status.textContent = "Verifying...";
  chrome.runtime.sendMessage({ type: "verifyEmail", email: email }, (response) => {
    if (response.success) {
      status.className = "ok";
      status.textContent = response.message;
    } else {
      status.className = "err";
      status.textContent = response.message;
    }
  });
});