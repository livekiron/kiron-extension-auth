chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tab.url && tab.url.includes("eprocure.gov.bd")) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content_script.js"]
      }).catch(e => console.warn("Inject failed:", e));
    }
  }
});