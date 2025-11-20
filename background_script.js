// Your live API URL
const API_URL = "https://kiron-extension-auth.vercel.app/api/verify";

// Listen when popup or content script sends email
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "verifyEmail") {
        verifyEmail(request.email).then(result => {
            sendResponse(result);
        });

        return true; // Keep message channel open
    }
});

// Function to verify user email
async function verifyEmail(email) {
    try {
        const res = await fetch(${API_URL}?email=${email});
        const data = await res.json();

        if (data.allowed) {
            return { success: true, message: "Email Verified ✔ Allowed User" };
        } else {
            return { success: false, message: "❌ Not Allowed" };
        }
    } catch (err) {
        return { success: false, message: "Server Error" };
    }
}
