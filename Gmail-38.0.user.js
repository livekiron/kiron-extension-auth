// ==UserScript==
// @name          Gmail
// @namespace    http://tampermonkey.net/
// @version      38.0
// @description  Full automation for e-GP with Gmail Verification System
// @author       AI Assistant
// @match        *://*.eprocure.gov.bd/*
// @grant        GM_xmlhttpRequest
// @connect      kiron-extension-auth.vercel.app
// ==/UserScript==

(async function() {
    'use strict';

    // ==========================================
    // ১. ভেরিফিকেশন কনফিগারেশন
    // ==========================================
    const API_BASE = "https://kiron-extension-auth.vercel.app/api/auth/verify";
    let authorizedEmail = localStorage.getItem('authorizedEmail');

    // ভেরিফিকেশন স্টাইল (CSS)
    const authStyle = document.createElement('style');
    authStyle.innerHTML = `
        #auth-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 10000000;
            display: flex; justify-content: center; align-items: center; font-family: sans-serif;
        }
        .auth-box {
            background: #fff; padding: 25px; border-radius: 12px; width: 320px; text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .auth-box h2 { margin: 0 0 15px; color: #333; font-size: 18px; }
        .auth-box input {
            width: 100%; padding: 10px; margin-bottom: 15px;
            border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box;
        }
        .auth-box button {
            width: 100%; padding: 10px; background: #4CAF50; color: white;
            border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
        }
        .auth-box button:hover { background: #45a049; }
        #auth-status { margin-top: 10px; font-size: 13px; font-weight: bold; }
        .err { color: red; }
        .ok { color: green; }
    `;
    document.head.appendChild(authStyle);

    // ভেরিফিকেশন চেক ফাংশন
    async function checkAuth(email) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `${API_BASE}?email=${encodeURIComponent(email)}`,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.status === "allowed" || data.allowed === true) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } catch (e) { resolve(false); }
                },
                onerror: function() { resolve(false); }
            });
        });
    }

    // লগইন উইন্ডো তৈরি
    function showLoginUI() {
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-box">
                <h2>BOQ Tool - Login</h2>
                <p style="font-size: 12px; color: #666;">Enter your Gmail to continue</p>
                <input type="email" id="userEmail" placeholder="example@gmail.com" value="${authorizedEmail || ''}">
                <button id="verifyBtn">Verify & Enter</button>
                <div id="auth-status"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const btn = overlay.querySelector('#verifyBtn');
        const status = overlay.querySelector('#auth-status');
        const input = overlay.querySelector('#userEmail');

        btn.onclick = async () => {
            const email = input.value.trim();
            if (!email) { status.innerText = "Please enter email"; status.className = "err"; return; }

            status.innerText = "Verifying..."; status.className = "";
            const isOk = await checkAuth(email);

            if (isOk) {
                localStorage.setItem('authorizedEmail', email);
                status.innerText = "Access Granted! Loading..."; status.className = "ok";
                setTimeout(() => location.reload(), 1000);
            } else {
                status.innerText = "Access Denied! ✖"; status.className = "err";
            }
        };
    }

    // শুরুতে চেক করুন ইউজার ভেরিফাইড কি না
    if (!authorizedEmail) {
        showLoginUI();
        return; // ভেরিফাইড না হলে নিচের কোড রান হবে না
    } else {
        // ব্যাকগ্রাউন্ডে চেক করবে ইমেল এখনো লিস্টে আছে কি না
        const stillAllowed = await checkAuth(authorizedEmail);
        if (!stillAllowed) {
            localStorage.removeItem('authorizedEmail');
            showLoginUI();
            return;
        }
    }

    // ==========================================
    // ২. আপনার মূল কোড (এখন ভেরিফাইড ইউজারের জন্য রান হবে)
    // ==========================================

    const myPhotoURL = `https://lh3.googleusercontent.com/d/1KvJDr7HZ4lQXjQLQ34be0gmFuj6I1Yub`;

    let currentDelay = parseInt(localStorage.getItem('eval_delay')) || 2000;
    let posTop = localStorage.getItem('eval_pos_top') || '100px';
    let posLeft = localStorage.getItem('eval_pos_left') || '10px';

    const style = document.createElement('style');
    style.innerHTML = `
        #eval-control-panel {
            position: fixed; top: ${posTop}; left: ${posLeft};
            z-index: 999999; background: #ffffff; border: 1px solid #aaa;
            padding: 4px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            width: 110px; cursor: move; user-select: none; font-family: sans-serif;
            text-align: center;
        }
        .img-container {
            display: flex !important; justify-content: center !important; align-items: center !important;
            width: 100% !important; padding: 1px 0 !important;
        }
        .user-profile-pic {
            width: 45px !important; height: 45px !important; border-radius: 50% !important;
            border: 2px solid #ffffff !important; object-fit: cover !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
        }
        #mainToggleBtn, #reportToggleBtn {
            width: 100%; padding: 4px; margin-top: 4px; cursor: pointer;
            font-weight: bold; border-radius: 5px; border: none; color: white; font-size: 14px;
        }
        .slider-section { background: #f0f0f0; padding: 2px; border-radius: 5px; margin-top: 3px; }
        input[type=range] { width: 95%; cursor: pointer; height: 10px; margin-top: 1px; }

        #live-status-bar {
            position: fixed; top: 40px; left: 50%; transform: translateX(-50%);
            z-index: 1000000; background: rgba(0, 0, 0, 0.9); color: #fff;
            padding: 12px 40px; border-radius: 12px;
            font-size: 18px; font-weight: bold; box-shadow: 0 6px 20px rgba(0,0,0,0.5);
            display: none; white-space: nowrap; pointer-events: none;
            border: 2px solid #4CAF50;
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'eval-control-panel';
    document.body.appendChild(container);

    const statusBar = document.createElement('div');
    statusBar.id = 'live-status-bar';
    document.body.appendChild(statusBar);

    container.innerHTML = `
        <div class="img-container"><img src="${myPhotoURL}" class="user-profile-pic"></div>
        <div style="font-weight: bold; font-size: 11px; margin: 0;">S M RUKONUT ZAMAN </div>
        <button id="mainToggleBtn">Evaluation</button>
        <button id="reportToggleBtn">Eval. Report</button>
        <div class="slider-section">
            <div style="font-size: 10px; text-align: left; padding-left: 2px;">Spd: <span id="speedVal" style="font-weight: bold; color: red;">${currentDelay}</span></div>
            <input type="range" id="speedSlider" min="500" max="10000" step="10" value="${currentDelay}">
        </div>
        <div style="font-size: 7px; color: #999; margin-top: 1px; cursor:pointer;" id="logoutBtn">LOGOUT</div>
    `;

    // লগআউট লজিক
    container.querySelector('#logoutBtn').onclick = () => {
        if(confirm("Do you want to logout?")) {
            localStorage.removeItem('authorizedEmail');
            location.reload();
        }
    };

    const mainToggleBtn = container.querySelector('#mainToggleBtn');
    const reportToggleBtn = container.querySelector('#reportToggleBtn');
    const speedSlider = container.querySelector('#speedSlider');
    const speedValDisp = container.querySelector('#speedVal');

    function updateBtnUI() {
        const isGeneralActive = sessionStorage.getItem('evaluator_active') === 'true';
        const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
        mainToggleBtn.innerHTML = isGeneralActive ? 'ON' : 'Evaluation';
        mainToggleBtn.style.backgroundColor = isGeneralActive ? '#4CAF50' : '#f44336';
        reportToggleBtn.innerHTML = isReportActive ? 'REP: ON' : 'Eval. Report';
        reportToggleBtn.style.backgroundColor = isReportActive ? '#4CAF50' : '#8FC70C';
        if (!isGeneralActive && !isReportActive) statusBar.style.display = 'none';
    }
    updateBtnUI();

    speedSlider.oninput = function() {
        currentDelay = this.value;
        speedValDisp.innerText = currentDelay;
        localStorage.setItem('eval_delay', currentDelay);
    };

    let isDragging = false; let offsetTop, offsetLeft;
    container.onmousedown = function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.id === 'logoutBtn') return;
        isDragging = true;
        offsetLeft = e.clientX - container.getBoundingClientRect().left;
        offsetTop = e.clientY - container.getBoundingClientRect().top;
    };
    document.onmousemove = function(e) {
        if (!isDragging) return;
        container.style.left = (e.clientX - offsetLeft) + 'px';
        container.style.top = (e.clientY - offsetTop) + 'px';
        localStorage.setItem('eval_pos_left', container.style.left);
        localStorage.setItem('eval_pos_top', container.style.top);
    };
    document.onmouseup = function() { isDragging = false; };

    mainToggleBtn.onclick = function() {
        const isActive = sessionStorage.getItem('evaluator_active') === 'true';
        sessionStorage.setItem('evaluator_active', !isActive);
        sessionStorage.setItem('eval_report_active', 'false');
        updateBtnUI();
        if (!isActive) runLogic(); else { statusBar.innerText = ""; location.reload(); }
    };

    reportToggleBtn.onclick = function() {
        const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
        sessionStorage.setItem('eval_report_active', !isReportActive);
        sessionStorage.setItem('evaluator_active', 'false');
        updateBtnUI();
        if (!isReportActive) runLogic(); else { statusBar.innerText = ""; location.reload(); }
    };

    function setMessage(msg) {
        if (msg && msg.trim() !== "") {
            statusBar.innerText = msg;
            statusBar.style.display = 'block';
        } else {
            statusBar.style.display = 'none';
        }
    }

    function getEntityName() {
        let nameField = document.querySelector('td.txtBoldLeft') ||
                        Array.from(document.querySelectorAll('td')).find(td => td.innerText.includes('Company Name'))?.nextElementSibling;
        return nameField ? nameField.innerText.trim() : "Tenderer";
    }

    function runLogic() {
        const isGeneralActive = sessionStorage.getItem('evaluator_active') === 'true';
        const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
        if (!isGeneralActive && !isReportActive) return;
        const url = window.location.href;

        if (url.includes('Evalclarify')) {
            setTimeout(() => {
                if (isReportActive) {
                    const reportTab = Array.from(document.querySelectorAll('a')).find(a => a.innerText.trim().includes('Report'));
                    const isReportTabActive = url.includes('st=rp');
                    if (!isReportTabActive && reportTab) { setMessage("Eval. Report ট্যাবে যাওয়া হচ্ছে..."); reportTab.click(); return; }

                    const rows = Array.from(document.querySelectorAll('tr')).filter(tr => tr.cells.length >= 5);
                    let nextActionLink = null;
                    let currentTendererName = "";
                    let pendingCount = 0;
                    let completedCount = 0;

                    for (let row of rows) {
                        let serialNo = row.cells[0] ? row.cells[0].innerText.trim() : "";
                        if (!/^\d+$/.test(serialNo)) continue;
                        let statusText = row.cells[2] ? row.cells[2].innerText.trim() : "";
                        let actionLink = row.querySelector('a[href*="EvalTenderer"]');
                        if ((statusText === "-" || statusText === "") && actionLink) {
                            if (!nextActionLink) { nextActionLink = actionLink; currentTendererName = row.cells[1] ? row.cells[1].innerText.trim() : "Tenderer"; }
                            pendingCount++;
                        } else if (statusText !== "" && statusText !== "-") { completedCount++; }
                    }

                    if (nextActionLink) {
                        setMessage(`শেষ: ${completedCount} | বাকি: ${pendingCount} | চলছে: ${currentTendererName}`);
                        setTimeout(() => { if(sessionStorage.getItem('eval_report_active') === 'true') nextActionLink.click(); }, 500);
                    } else {
                        setMessage("রিপোর্টের সব কাজ শেষ!");
                        sessionStorage.setItem('eval_report_active', 'false');
                        updateBtnUI();
                    }
                }
                else if (isGeneralActive) {
                    const evalLinks = Array.from(document.querySelectorAll('a')).filter(a => a.innerText.trim().includes('Evaluate Tenderer'));
                    if (evalLinks.length > 0) {
                        let tendererRow = evalLinks[0].closest('tr');
                        let name = tendererRow ? tendererRow.cells[1].innerText.trim() : "Tenderer";
                        setMessage(evalLinks.length + " টি ফাইল বাকি। এখন কাজ চলছে: " + name);
                        setTimeout(() => { if(sessionStorage.getItem('evaluator_active') === 'true') evalLinks[0].click(); }, 500);
                    } else {
                        setMessage("ইভালুয়েশন কাজ শেষ");
                        sessionStorage.setItem('evaluator_active', 'false');
                        setTimeout(() => { updateBtnUI(); setMessage(""); }, 500);
                    }
                }
            }, currentDelay);
        }
        else if (url.includes('SeekEvalClari')) {
            setTimeout(() => {
                const forms = Array.from(document.querySelectorAll('a')).filter(a => a.innerText.trim().includes('Evaluate Form'));
                if (forms.length > 0) {
                    setMessage(getEntityName() + " এর " + forms.length + " টি ফর্ম বাকি।");
                    setTimeout(() => { forms[0].click(); }, 300);
                } else {
                    setMessage("পরবর্তী ফাইলে যাওয়া হচ্ছে...");
                    const clarTab = Array.from(document.querySelectorAll('a')).find(a => a.innerText.trim().includes('Clarification'));
                    if (clarTab) clarTab.click();
                }
            }, currentDelay);
        }
        else if (url.includes('ViewQueAns') || url.includes('EvalTenderer')) {
            setMessage(getEntityName() + " এর ডাটা সাবমিট হচ্ছে...");
            setTimeout(() => {
                const acceptRadio = document.querySelector('input[type="radio"][value="Accept"]') ||
                                   document.querySelector('input[type="radio"][value="Responsive"]') ||
                                   document.querySelector('input[type="radio"]');
                const reasonText = document.querySelector('textarea');
                if (acceptRadio) acceptRadio.click();
                if (reasonText) { reasonText.value = 'ok'; reasonText.dispatchEvent(new Event('input', { bubbles: true })); }
                setTimeout(() => {
                    const submitBtn = document.querySelector('input[type="submit"]') ||
                                     document.querySelector('button[type="submit"]') ||
                                     Array.from(document.querySelectorAll('input')).find(i => i.value === 'Submit');
                    if (submitBtn) submitBtn.click();
                }, currentDelay);
            }, currentDelay / 2);
        }
    }

    // উইন্ডো লোড চেক
    if (document.readyState === 'complete') {
        const isGeneralActive = sessionStorage.getItem('evaluator_active') === 'true';
        const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
        if (isGeneralActive || isReportActive) setTimeout(runLogic, 200);
    } else {
        window.addEventListener('load', function() {
            const isGeneralActive = sessionStorage.getItem('evaluator_active') === 'true';
            const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
            if (isGeneralActive || isReportActive) setTimeout(runLogic, 200);
        });
    }

    // সেফটি ইন্টারভাল
    setInterval(() => {
        const isGeneralActive = sessionStorage.getItem('evaluator_active') === 'true';
        const isReportActive = sessionStorage.getItem('eval_report_active') === 'true';
        if (isGeneralActive || isReportActive) {
            const url = window.location.href;
            if (url.includes('.jsp')) {
                const isStuck = !document.querySelector('#live-status-bar') || statusBar.style.display === 'none';
                if (isStuck) runLogic();
            }
        }
    }, 3000);

})();