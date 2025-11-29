chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  
  if (msg.action === "setVerified") {
    chrome.storage.local.set({ verified: true }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.action === "isVerified") {
    chrome.storage.local.get(["verified"], (data) => {
      sendResponse({ verified: data.verified === true });
    });
    return true;
  }

});
