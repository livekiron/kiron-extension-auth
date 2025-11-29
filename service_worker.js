let isVerified = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "setVerified") {
    isVerified = true;
    sendResponse({ success: true });
  }

  if (msg.action === "isVerified") {
    sendResponse({ verified: isVerified });
  }
});
