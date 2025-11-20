(function () {
  let autoYesEnabled = false;

  function setSelectToYes(selectEl) {
    if (!selectEl || selectEl.tagName !== 'SELECT') return false;

    const current = selectEl.options[selectEl.selectedIndex]?.text?.trim()?.toUpperCase();
    if (current === 'YES') return true;

    const yesVariants = ['YES', 'Yes', 'হ্যাঁ', 'হাঁ', 'হ্যাঁ।'];
    for (let i = 0; i < selectEl.options.length; i++) {
      const optText = selectEl.options[i].text?.trim();
      if (optText && yesVariants.some(v => v.toUpperCase() === optText.toUpperCase())) {
        selectEl.selectedIndex = i;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function processAllSelects() {
    if (!autoYesEnabled) return;
    document.querySelectorAll('select').forEach(setSelectToYes);
  }

  const observer = new MutationObserver(muts => {
    if (!autoYesEnabled) return;

    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.tagName === 'SELECT') {
          setSelectToYes(node);
        } else {
          node.querySelectorAll?.('select')?.forEach(setSelectToYes);
        }
      });
    });
  });

  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });


  function setPercentageToMinusFive() {
    const targetBoxes = Array.from(document.querySelectorAll("input"))
      .filter(el => el.type === "text" || el.type === "number");

    if (targetBoxes.length > 0) {
      const box = targetBoxes[0];
      box.value = "-5";
      box.dispatchEvent(new Event("input", { bubbles: true }));
      box.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function createYesButton() {
    const btn = document.createElement('button');
    btn.title = 'Toggle Auto YES';
    btn.textContent = 'YES  Kiron';

    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '15px',
      right: '70px',
      width: '55px',
      height: '55px',
      borderRadius: '50%',
      background: '#ff4444',
      color: '#fff',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer',
      zIndex: '999999',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease'
    });

    btn.addEventListener('click', () => {
      autoYesEnabled = !autoYesEnabled;
      if (autoYesEnabled) {
        btn.style.background = '#28a745';
        processAllSelects();
      } else {
        btn.style.background = '#ff4444';
      }
    });

    document.body.appendChild(btn);
  }

  function createMinusFiveButton() {
    const btn = document.createElement('button');
    btn.title = 'Set -5';
    btn.textContent = '-5';

    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '15px',
      right: '10px',
      width: '55px',
      height: '55px',
      borderRadius: '50%',
      background: '#007bff',
      color: '#fff',
      fontSize: '18px',
      border: 'none',
      cursor: 'pointer',
      zIndex: '999999',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease'
    });

    btn.addEventListener('click', () => {
      setPercentageToMinusFive();
    });

    document.body.appendChild(btn);
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      createYesButton();
      createMinusFiveButton();
    }, 500);
  });
})();