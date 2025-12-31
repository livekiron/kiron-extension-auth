const API_URL = "https://kiron-extension-auth.vercel.app/api/auth/verify";

// পিসির জন্য ইউনিক আইডি
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
        // এই লাইনটি ভালো করে দেখুন
        const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}&machineId=${machineId}`);
        const data = await res.json();

        if (data.allowed) {
            await chrome.storage.local.set({ authorizedEmail: email });
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "Server Error Connection" };
    }
}
