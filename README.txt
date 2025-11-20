BOQ Auto Fill (Protected - Simple)
---------------------------------
How it works:
- User opens extension popup and enters their Gmail.
- Popup calls the server:
  https://kiron-extension-auth.vercel.app/api/verify?email=USER_EMAIL
- If server returns allowed, extension stores authorizedEmail and user can inject the content script.
Files:
- manifest.json
- popup.html / popup.js
- service_worker.js
- content_script.js (original logic, unchanged)
Notes:
- Make sure your server (Vercel) is live at https://kiron-extension-auth.vercel.app
- allowed.json should include permitted emails.
