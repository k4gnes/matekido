import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, exportUsers, importUsers } from "../profile/UserManager.js";

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

    const [{ default: qrcode }, { default: LZString }] = await Promise.all([
        import("../vendor/qrcode.js"),
        import("../vendor/lzstring.js")
    ]);

    const qr = qrcode(0, "L");
    qr.addData(TRANSFER_PREFIX + LZString.compressToBase64(payload));
    qr.make();

    if (!Number.isFinite(qr.getModuleCount()) || qr.getModuleCount() <= 0) {
        throw new Error("too-large");
    }

    return qr.createDataURL(6, 2);

}

async function decodeQrPayload(text) {

    if (!text || !text.startsWith(TRANSFER_PREFIX)) {
        return null;
    }

    const { default: LZString } = await import("../vendor/lzstring.js");
    return LZString.decompressFromBase64(text.slice(TRANSFER_PREFIX.length));

}

function downloadJson(filename, content) {

    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

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
    subtitle.textContent = "Menthető fájlba vagy QR-kódba; a másik eszközön importálással vagy QR beolvasással visszaállítható.";

    card.append(title, subtitle);

    const status = document.createElement("p");
    status.className = "backup-status";

    const actions = document.createElement("div");
    actions.className = "backup-actions";

    card.append(actions, status);

    const qrArea = document.createElement("div");
    qrArea.className = "backup-qr-area";
    card.append(qrArea);

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

    const downloadBtn = createButton("💾 Letöltés fájlba", {
        className: "backup-btn",
        onClick: () => {
            const ids = selectedIds();
            if (ids.length === 0) {
                setStatus("⚠️ Jelölj ki legalább egy játékost!");
                return;
            }
            const filename = buildFilename();
            downloadJson(filename, exportUsers(ids));
            setStatus(`💾 Elmentve: ${filename}`);
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
            setStatus("QR-kód készül…");
            try {
                const url = await buildQrImage(exportUsers(ids));
                qrArea.replaceChildren();
                const img = document.createElement("img");
                img.className = "backup-qr-img";
                img.src = url;
                img.alt = "QR-kód";
                const hint = document.createElement("p");
                hint.className = "backup-hint";
                hint.textContent = "Tartsd a másik eszközön indított QR beolvasás elé ezt a kódot.";
                qrArea.append(img, hint);
                setStatus("");
            } catch {
                setStatus("⚠️ A kiválasztott profilok túl nagyok QR-kódnak. Használd a letöltést!");
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
            handleImport(await file.text());
        } catch {
            setStatus("⚠️ A fájl nem olvasható.");
        }
        fileInput.value = "";
    });

    const scanBtn = createButton("📷 QR beolvasása", {
        className: "backup-btn",
        onClick: () => startScan()
    });

    actions.append(downloadBtn, qrBtn, importBtn, scanBtn);
    card.append(fileInput);

    function handleImport(text) {

        const result = importUsers(text);

        if (!result.ok) {
            setStatus("⚠️ " + result.error);
            return;
        }

        const parts = [];
        parts.push(`${result.imported} profil importálva`);
        if (result.skipped > 0) {
            parts.push(`${result.skipped} már létezett`);
        }
        setStatus("✅ " + parts.join(", ") + ".");

        if (result.imported > 0) {
            onChanged();
        }

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
        canvas.width = 640;
        canvas.height = 480;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        let cancelled = false;

        const tick = async () => {

            if (cancelled || !activeStream) return;

            if (video.readyState >= 2) {
                context.drawImage(video, 0, 0, 640, 480);
                const image = context.getImageData(0, 0, 640, 480);
                const found = jsQR(image.data, 640, 480);

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