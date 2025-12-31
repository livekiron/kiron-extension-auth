const API_URL = "https://kiron-extension-auth.vercel.app/api/auth/verify";

// পিসির জন্য একটি পার্মানেন্ট ইউনিক আইডি তৈরি করা
async function getMachineId() {
    let data = await chrome.storage.local.get("machineId");
    if (!data.machineId) {
        let newId = self.crypto.randomUUID(); // পিসির জন্য ইউনিক আইডি
        await chrome.storage.local.set({ "machineId": newId });
        return newId;
    }
    return data.machineId;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "verifyEmail") {
        verifyWithLock(request.email).then(sendResponse);
        return true; 
    }
});

async function verifyWithLock(email) {
    try {
        const machineId = await getMachineId();
        const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}&machineId=${machineId}`);
        const data = await res.json();

        if (data.allowed) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message };
        }
    } catch (err) {
        return { success: false, message: "Server Connection Error" };
    }
}

// অটো-ইনজেকশন লজিক আগের মতোই থাকবে...
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.includes("eprocure.gov.bd")) {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content_script.js"] }).catch(() => {});
    }
});
