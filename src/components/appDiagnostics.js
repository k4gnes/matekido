const PENDING_KEY = "matekido-pending-msg";

function showBanner(message, isError = false) {

    const existing = document.querySelector(".backup-toast");
    if (existing) {
        existing.remove();
    }

    const banner = document.createElement("div");
    banner.className = "backup-toast" + (isError ? " warn" : "");
    banner.textContent = message;
    document.body.appendChild(banner);

    setTimeout(() => banner.remove(), 6000);

}

export function queueMessage(message, isError = false) {

    try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ message, isError, at: Date.now() }));
    } catch {
        showBanner(message, isError);
    }

}

export function showPendingMessage() {

    let raw;
    try {
        raw = localStorage.getItem(PENDING_KEY);
    } catch {
        return;
    }

    if (!raw) {
        return;
    }

    try {
        localStorage.removeItem(PENDING_KEY);
    } catch {
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.message) {
            showBanner(parsed.message, !!parsed.isError);
        }
    } catch {
        return;
    }

}

export function installDiagnostics() {

    window.addEventListener("error", (event) => {
        const detail = event?.message || "ismeretlen hiba";
        showBanner("⚠️ Váratlan hiba: " + detail, true);
    });

    window.addEventListener("unhandledrejection", (event) => {
        const reason = event?.reason;
        let detail = "ismeretlen hiba";
        if (reason instanceof Error) {
            detail = reason.message;
        } else if (reason) {
            detail = String(reason);
        }
        showBanner("⚠️ Váratlan hiba: " + detail, true);
    });

}