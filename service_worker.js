// আপনার আসল Vercel URL এখানে বসান
const API_URL = "https://kiron-extension-auth.vercel.app/api/auth/verify"; 

async function getMachineId() {
    let data = await chrome.storage.local.get("machineId");
    if (!data.machineId) {
        let newId = self.crypto.randomUUID(); 
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
        // encodeURIComponent ব্যবহার করা হয়েছে যাতে ইমেইলের '+' চিহ্ন সমস্যা না করে
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
        console.error(err);
        return { success: false, message: "সার্ভার কানেকশন এরর! লিঙ্ক চেক করুন।" };
    }
}

// অটো স্ক্রিপ্ট ইনজেকশন
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.includes("eprocure.gov.bd")) {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content_script.js"] }).catch(() => {});
    }
});
