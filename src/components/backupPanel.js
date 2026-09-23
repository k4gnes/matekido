import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, exportUsers, importUsers } from "../profile/UserManager.js";
import { queueMessage } from "./appDiagnostics.js";

const TRANSFER_PREFIX = "matekido-atvitel:";

let activeStream = null;

function stopActiveStream() {

    if (!activeStream) return;

    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;

}

function buildFilename() {

    const date = new Date().toISOString().split("T")[0];
    return `matekido-mentes-${date}.json`;

}

async function buildQrImage(payload) {

    const [{ default: qrcode }, { default: LZString }, { default: jsQR }] = await Promise.all([
        import("../vendor/qrcode.js"),
        import("../vendor/lzstring.js"),
        import("../vendor/jsqr.js")
    ]);

    const text = TRANSFER_PREFIX + LZString.compressToBase64(payload);

    const qr = qrcode(0, "L");
    qr.addData(text);

    try {
        qr.make();
    } catch {
        return { url: null, text, tooLarge: true };
    }

    const modules = qr.getModuleCount();

    if (modules > 117) {
        return { url: null, text, tooLarge: true };
    }

    const cell = 8;
    const margin = 4;
    const size = modules * cell + margin * 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#000000";

    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if (qr.isDark(row, col)) {
                context.fillRect(margin + col * cell, margin + row * cell, cell, cell);
            }
        }
    }

    const probe = context.getImageData(0, 0, size, size);
    const found = jsQR(probe.data, size, size);

    if (!found || found.data !== text) {
        return { url: null, text, tooLarge: true };
    }

    return { url: canvas.toDataURL("image/png"), text };

}

async function decodeQrPayload(text) {

    let cleaned = (text ?? "").trim().replace(/^\uFEFF/, "");

    if (cleaned.startsWith(TRANSFER_PREFIX)) {
        cleaned = cleaned.slice(TRANSFER_PREFIX.length);
    }

    cleaned = cleaned.replace(/\s+/g, "");

    if (!cleaned) {
        return null;
    }

    const { default: LZString } = await import("../vendor/lzstring.js");
    const payload = LZString.decompressFromBase64(cleaned);

    if (!payload) {
        return null;
    }

    try {
        const parsed = JSON.parse(payload.trim().replace(/^\uFEFF/, ""));
        if (parsed && parsed.app === "matekido") {
            return payload;
        }
    } catch {
        return null;
    }

    return null;

}

async function copyText(value) {

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const field = document.createElement("textarea");
    field.value = value;
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    document.body.removeChild(field);

}

function showToast(message, isError = false) {

    const toast = document.createElement("div");
    toast.className = "backup-toast" + (isError ? " warn" : "");
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);

}

function downloadJson(filename, content) {

    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 2000);

}

async function shareOrDownload(filename, content) {

    const file = new File([content], filename, { type: "application/json" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: "matekidő – profilok",
                text: "A matekidő játékosprofiljainak mentése. A másik eszközön: Profilok átvitele → Importálás fájlból."
            });
            return true;
        } catch (error) {
            if (error && error.name === "AbortError") {
                return true;
            }
        }
    }

    downloadJson(filename, content);
    return false;

}

function readFileText(file) {

    if (typeof file.text === "function") {
        return file.text();
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });

}

function downscaleImageData(image, width, height, factor) {

    const source = document.createElement("canvas");
    source.width = width;
    source.height = height;
    source.getContext("2d").putImageData(image, 0, 0);

    const target = document.createElement("canvas");
    target.width = Math.max(1, Math.round(width * factor));
    target.height = Math.max(1, Math.round(height * factor));
    target.getContext("2d").drawImage(source, 0, 0, target.width, target.height);

    return target.getContext("2d").getImageData(0, 0, target.width, target.height);

}

export function createBackupPanel({ playerIds = null, onChanged = () => {} } = {}) {

    const card = createCard("backup-panel");

    stopActiveStream();

    const players = listPlayers().filter(p => !playerIds || playerIds.includes(p.id));

    const title = document.createElement("h2");
    title.className = "backup-title";
    title.textContent = "💾 Profilok átvitele";

    const subtitle = document.createElement("p");
    subtitle.className = "backup-subtitle";
    subtitle.textContent = "Fájlként letölthető vagy megosztható (Androidon azonnal megosztási menü ugrik fel), vagy QR-kódba menthető; a másik eszközön importálással visszaállítható.";

    card.append(title, subtitle);

    const status = document.createElement("p");
    status.className = "backup-status";

    const actions = document.createElement("div");
    actions.className = "backup-actions";

    card.append(actions, status);

    const qrArea = document.createElement("div");
    qrArea.className = "backup-qr-area";

    const pasteArea = document.createElement("div");
    pasteArea.className = "backup-paste-area";
    pasteArea.hidden = true;

    const pasteInput = document.createElement("textarea");
    pasteInput.className = "backup-paste-input";
    pasteInput.rows = 3;
    pasteInput.placeholder = "Ide másold az átviteli kódot vagy a mentés szövegét…";

    const pasteBtn = createButton("📥 Kód importálása", {
        className: "backup-btn",
        onClick: () => {
            handleAnyText(pasteInput.value);
        }
    });

    pasteArea.append(pasteInput, pasteBtn);

    card.append(qrArea, pasteArea);

    function setStatus(message) {
        status.textContent = message ?? "";
    }

    function selectedIds() {

        const checks = card.querySelectorAll("input[data-player-id]");
        if (checks.length === 0) {
            return players.map(p => p.id);
        }

        return [...checks].filter(c => c.checked).map(c => c.dataset.playerId);

    }

    if (players.length === 0) {
        setStatus("Nincs játékos a mentéshez.");
        return card;
    }

    if (players.length > 1) {

        const pickTitle = document.createElement("p");
        pickTitle.className = "backup-pick-title";
        pickTitle.textContent = "Melyik profilokat vigyük át?";

        const list = document.createElement("div");
        list.className = "backup-players";

        players.forEach(player => {
            const row = document.createElement("label");
            row.className = "backup-player-row";

            const check = document.createElement("input");
            check.type = "checkbox";
            check.checked = true;
            check.dataset.playerId = player.id;

            const avatar = document.createElement("span");
            avatar.className = "backup-player-avatar";
            avatar.textContent = player.avatar ?? "🦊";

            const name = document.createElement("span");
            name.className = "backup-player-name";
            name.textContent = player.name ?? "Játékos";

            row.append(check, avatar, name);
            list.append(row);
        });

        card.insertBefore(pickTitle, actions);
        card.insertBefore(list, actions);

    } else {
        setStatus("🏟️ " + (players[0].name ?? "Játékos") + " profilja");
    }

    const downloadBtn = createButton("💾 Letöltés / megosztás", {
        className: "backup-btn",
        onClick: async () => {
            const ids = selectedIds();
            if (ids.length === 0) {
                setStatus("⚠️ Jelölj ki legalább egy játékost!");
                return;
            }
            const filename = buildFilename();
            setStatus("Előkészítés…");
            const shared = await shareOrDownload(filename, exportUsers(ids));
            setStatus(shared
                ? "💾 Válaszd ki a megosztásban, hová mented a fájlt (pl. Messenger, Drive, e-mail)."
                : `💾 Elmentve: ${filename}`);
        }
    });

    const qrBtn = createButton("🔗 QR-kód mutatása", {
        className: "backup-btn",
        onClick: async () => {
            const ids = selectedIds();
            if (ids.length === 0) {
                setStatus("⚠️ Jelölj ki legalább egy játékost!");
                return;
            }
            qrArea.replaceChildren();
            setStatus("Kód készül…");
            try {
                const { url, text, tooLarge } = await buildQrImage(exportUsers(ids));
                qrArea.replaceChildren();

                if (!tooLarge) {
                    const img = document.createElement("img");
                    img.className = "backup-qr-img";
                    img.src = url;
                    img.alt = "QR-kód";
                    qrArea.append(img);
                }

                const copyBtn = createButton("📋 Kód másolása", {
                    className: "backup-btn",
                    onClick: async () => {
                        setStatus("Kód másolása…");
                        try {
                            await copyText(text);
                            setStatus("📋 Az átviteli kód a vágólapon van. A másik eszközön: Kód beillesztése.");
                        } catch {
                            setStatus("⚠️ A másolás nem sikerült. Használd a letöltést.");
                        }
                    }
                });

                const details = document.createElement("details");
                details.className = "backup-qr-details";
                const summary = document.createElement("summary");
                summary.textContent = "Nézd meg a kódot szövegként";
                const pre = document.createElement("textarea");
                pre.className = "backup-paste-input";
                pre.readOnly = true;
                pre.rows = 4;
                pre.value = text;
                details.append(summary, pre);

                const hint = document.createElement("p");
                hint.className = "backup-hint";
                hint.textContent = tooLarge
                    ? "A profil túl nagy a QR-képhez, de a kód így is átvihető: másold ki, és a másik eszközön használd a Kód beillesztése opciót."
                    : "Tartsd a másik eszközön indított QR beolvasás elé. Ha nem olvasható: másold a kódot, és ott használd a Kód beillesztése opciót.";

                qrArea.append(copyBtn, details, hint);
                setStatus("");
            } catch {
                setStatus("⚠️ Hibás kód készítés. Használd a letöltést!");
            }
        }
    });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json,.json,text/plain";
    fileInput.className = "backup-hidden";

    const importBtn = createButton("📂 Importálás fájlból", {
        className: "backup-btn",
        onClick: () => fileInput.click()
    });

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;
        try {
            handleAnyText(await readFileText(file));
        } catch (error) {
            const detail = (error && error.message) ? ": " + error.message : "";
            const message = "⚠️ Hibás fájl" + detail + ".";
            setStatus(message);
            queueMessage(message, true);
        }
        fileInput.value = "";
    });

    const scanBtn = createButton("📷 QR beolvasása", {
        className: "backup-btn",
        onClick: () => startScan()
    });

    const pasteToggle = createButton("📋 Kód beillesztése", {
        className: "backup-btn",
        onClick: () => {
            pasteArea.hidden = !pasteArea.hidden;
            if (!pasteArea.hidden) {
                pasteInput.focus();
            }
        }
    });

    actions.append(downloadBtn, qrBtn, importBtn, scanBtn, pasteToggle);
    card.append(fileInput);

    function handleImport(text) {

        let result;

        try {
            result = importUsers(text);
        } catch (error) {
            const detail = (error && error.message) ? ": " + error.message : "";
            const message = "⚠️ Hiba az importálás közben" + detail + ".";
            setStatus(message);
            queueMessage(message, true);
            return;
        }

        if (!result.ok) {
            setStatus("⚠️ " + result.error);
            return;
        }

        const parts = [];
        if (result.imported > 0) {
            parts.push(`${result.imported} új profil importálva`);
        }
        if (result.merged > 0) {
            parts.push(`${result.merged} profil összefésülve`);
        }

        const message = "✅ " + (parts.join(", ") || "Nincs változás.") + ".";
        setStatus(message);
        showToast(message);
        queueMessage(message);

        if (result.imported > 0 || result.merged > 0) {
            try {
                onChanged();
            } catch {
                showToast("✅ Az adatok mentve. Az oldal frissítéséhez lépj egyet vissza, majd újra ide.", true);
            }
        }

    }

    function handleAnyText(text) {

        const cleaned = text.trim().replace(/^\uFEFF/, "");

        if (!cleaned) {
            setStatus("⚠️ Üres beillesztés.");
            return;
        }

        if (cleaned.startsWith("{")) {
            handleImport(cleaned);
            return;
        }

        decodeQrPayload(cleaned).then(payload => {
            if (payload) {
                handleImport(payload);
            } else {
                setStatus("⚠️ Ez a szöveg nem matekidős átviteli kód. Próbáld a letöltés + importálás fájlból párost.");
            }
        });

    }

    async function startScan() {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus("⚠️ A kamera nem érhető el ezen az eszközön.");
            return;
        }

        stopActiveStream();

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        } catch {
            setStatus("⚠️ A kamera engedélyezése meghiúsult (engedély és HTTPS szükséges).");
            return;
        }

        activeStream = stream;

        const { default: jsQR } = await import("../vendor/jsqr.js");

        qrArea.replaceChildren();

        const video = document.createElement("video");
        video.className = "backup-scan-video";
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        video.play();

        const hint = document.createElement("p");
        hint.className = "backup-hint";
        hint.textContent = "Tartsd a kódot a kamera elé. Beolvasáskor automatikusan importálódik.";

        const stopBtn = createButton("⏹ Kamera bezárása", {
            className: "backup-scan-stop",
            onClick: () => {
                stopActiveStream();
                qrArea.replaceChildren();
                setStatus("");
            }
        });

        qrArea.append(video, hint, stopBtn);

        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d", { willReadFrequently: true });
        let cancelled = false;

        const tick = async () => {

            if (cancelled || !activeStream) return;

            if (video.readyState >= 2 && video.videoWidth > 0) {

                const srcW = video.videoWidth;
                const srcH = video.videoHeight;
                const maxDim = 1000;
                const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
                const w = Math.max(1, Math.round(srcW * scale));
                const h = Math.max(1, Math.round(srcH * scale));

                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                }

                context.drawImage(video, 0, 0, w, h);
                const image = context.getImageData(0, 0, w, h);

                let found = jsQR(image.data, w, h);

                if (!found) {
                    for (const factor of [0.6, 0.35]) {
                        const small = downscaleImageData(image, w, h, factor);
                        found = jsQR(small.data, small.width, small.height);
                        if (found) break;
                    }
                }

                if (found && found.data) {
                    cancelled = true;
                    stopActiveStream();
                    const payload = await decodeQrPayload(found.data);
                    if (payload) {
                        handleImport(payload);
                    } else {
                        qrArea.replaceChildren();
                        setStatus("⚠️ A kód nem matekidős átviteli kód.");
                    }
                    return;
                }

            }

            requestAnimationFrame(tick);

        };

        requestAnimationFrame(tick);

    }

    return card;

}