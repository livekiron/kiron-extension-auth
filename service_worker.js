chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "verifyEmail") {
        const email = encodeURIComponent(msg.email);
        const device = crypto.randomUUID();

        const url = `https://kiron-extension-auth.vercel.app/api/auth/verify?email=${email}&device=${device}`;

        fetch(url, {
            method: "GET"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                chrome.storage.local.set({ verified: true });
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: data.error || "Server error" });
            }
        })
        .catch(err => {
            sendResponse({ success: false, error: "Network error / CORS error" });
        });

        return true; // async response allowed
    }
});
