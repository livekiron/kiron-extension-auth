const API_URL = "https://your-vercel-project.vercel.app/api/auth/verify"; // আপনার Vercel URL দিন

// পিসির জন্য ইউনিক আইডি তৈরি বা উদ্ধার করা
async function getMachineId() {
    let data = await chrome.storage.local.get("machineId");
    if (!data.machineId) {
        let newId = self.crypto.randomUUID(); 
        await chrome.storage.local.set({ "machineId": newId });
        return newId;
    }
    return data.machineId;
}

// মেসেজ লিসেনার (পপআপ থেকে কল আসবে)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "verifyEmail") {
        verifyWithLock(request.email).then(sendResponse);
        return true; 
    }
});

// ভেরিফিকেশন ফাংশন
async function verifyWithLock(email) {
    try {
        const machineId = await getMachineId();
        const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}&machineId=${machineId}`);
        const data = await res.json();

        if (data.allowed) {
            await chrome.storage.local.set({ authorizedEmail: email });
            return { success: true, message: data.message };
        } else {
            await chrome.storage.local.remove("authorizedEmail");
            return { success: false, message: data.message };
        }
    } catch (err) {
        return { success: false, message: "Server Error Connection" };
    }
}

// অটো-ইনজেকশন লজিক
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.includes("eprocure.gov.bd")) {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content_script.js"] }).catch(() => {});
    }
});