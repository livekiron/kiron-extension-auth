chrome.storage.local.get(["authorizedEmail"], data => {

  // =====================
  // STOP if not verified
  // =====================
  if (!data.authorizedEmail) return;


  (function () {
    let autoYesEnabled = false;

    function ensureButtons() {
      if (!document.getElementById("k_yes_btn")) {
        createYesButton();
      }
      if (!document.getElementById("k_m5_btn")) {
        createMinusFiveButton();
      }
    }

    function createYesButton() {
      const btn = document.createElement("button");
      btn.id = "k_yes_btn";
      btn.textContent = "YES";
      Object.assign(btn.style, {
        position: "fixed",
        bottom: "15px",
        right: "70px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "#ff4444",
        color: "#fff",
        zIndex: "999999"
      });

      btn.onclick = () => {
        autoYesEnabled = !autoYesEnabled;
        btn.style.background = autoYesEnabled ? "#28a745" : "#ff4444";
        processAllSelects();
      };

      document.body.appendChild(btn);
    }

    function createMinusFiveButton() {
      const btn = document.createElement("button");
      btn.id = "k_m5_btn";
      btn.textContent = "-5";
      Object.assign(btn.style, {
        position: "fixed",
        bottom: "15px",
        right: "10px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "#007bff",
        color: "#fff",
        zIndex: "999999"
      });

      btn.onclick = () => {
        const box = document.querySelector("input[type='text'],input[type='number']");
        if (box) {
          box.value = "-5";
          box.dispatchEvent(new Event("input", { bubbles: true }));
        }
      };

      document.body.appendChild(btn);
    }

    function processAllSelects() {
      if (!autoYesEnabled) return;
      document.querySelectorAll("select").forEach(sel => {
        for (let opt of sel.options) {
          if (["YES", "Yes", "হ্যাঁ"].includes(opt.text.trim())) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      });
    }

    ensureButtons();
    setInterval(ensureButtons, 1000);

  })();

});
