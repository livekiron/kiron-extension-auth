chrome.storage.local.get(["authorizedEmail"], data => {
  if (!data.authorizedEmail) return;

  (function () {
    function ensureButtons() {
      if (!document.getElementById("k_yes_btn")) createButtons();
    }

    function createButtons() {
      // YES Button
      const yesBtn = document.createElement("button");
      yesBtn.id = "k_yes_btn";
      yesBtn.textContent = "YES";
      Object.assign(yesBtn.style, { position: "fixed", bottom: "15px", right: "75px", width: "55px", height: "55px", borderRadius: "50%", background: "#ff4444", color: "#fff", zIndex: "999999", cursor: "pointer", fontWeight: "bold", border: "none" });

      yesBtn.onclick = () => {
        document.querySelectorAll("select").forEach(sel => {
          for (let opt of sel.options) {
            if (["YES", "Yes", "হ্যাঁ"].includes(opt.text.trim())) {
              sel.value = opt.value;
              sel.dispatchEvent(new Event("change", { bubbles: true }));
              break;
            }
          }
        });
        yesBtn.style.background = "#28a745";
      };

      // -5 Button
      const m5Btn = document.createElement("button");
      m5Btn.id = "k_m5_btn";
      m5Btn.textContent = "-5";
      Object.assign(m5Btn.style, { position: "fixed", bottom: "15px", right: "10px", width: "55px", height: "55px", borderRadius: "50%", background: "#007bff", color: "#fff", zIndex: "999999", cursor: "pointer", fontWeight: "bold", border: "none" });

      m5Btn.onclick = () => {
        const boxes = document.querySelectorAll("input[type='text'], input[type='number']");
        boxes.forEach(box => {
          if (box.offsetParent !== null && !box.readOnly) {
            box.value = "-5";
            box.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      };

      document.body.appendChild(yesBtn);
      document.body.appendChild(m5Btn);
    }
    setInterval(ensureButtons, 1000);
  })();
});
