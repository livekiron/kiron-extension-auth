(function () {
  let autoYesEnabled = false;

  function setSelectToYes(selectEl) {
    if (!selectEl || selectEl.tagName !== 'SELECT') return false;

    const yesVariants = ['YES', 'Yes', 'হ্যাঁ', 'হাঁ'];

    for (let i = 0; i < selectEl.options.length; i++) {
      const t = selectEl.options[i].text.trim();
      if (yesVariants.some(v => v.toUpperCase() === t.toUpperCase())) {
        selectEl.selectedIndex = i;
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function processAllSelects() {
    if (!autoYesEnabled) return;
    document.querySelectorAll("select").forEach(setSelectToYes);
  }

  new MutationObserver(m => {
    if (!autoYesEnabled) return;
    m.forEach(mu =>
      mu.addedNodes.forEach(n => {
        if (n.tagName === "SELECT") setSelectToYes(n);
        n.querySelectorAll?.("select").forEach(setSelectToYes);
      })
    );
  }).observe(document.body, { childList: true, subtree: true });

  function setMinusFive() {
    const input = document.querySelector("input[type='text'],input[type='number']");
    if (input) {
      input.value = "-5";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function createButton(txt, color, clickFn, rightPos) {
    const b = document.createElement("button");
    b.textContent = txt;
    Object.assign(b.style, {
      position: "fixed",
      bottom: "15px",
      right: rightPos,
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      background: color,
      color: "#fff",
      border: "none",
      zIndex: "999999"
    });
    b.onclick = clickFn;
    document.body.appendChild(b);
  }

  window.onload = () => {
    createButton("YES", "#ff4444", () => {
      autoYesEnabled = !autoYesEnabled;
      processAllSelects();
    }, "70px");

    createButton("-5", "#007bff", setMinusFive, "10px");
  };
})();