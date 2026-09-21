import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { REFERENCES, OBJECTS } from "../data/spatial.js?v=8";

const SVG_NS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "🧭",
    racing: "🏁",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

function el(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        node.setAttribute(key, value);
    }
    return node;
}

function rect(svg, x, y, w, h, fill, stroke, sw) {
    svg.append(el("rect", { x, y, width: w, height: h, rx: 4, fill, stroke, "stroke-width": sw }));
}

function circle(svg, cx, cy, r, fill, stroke, sw) {
    svg.append(el("circle", { cx, cy, r, fill, stroke, "stroke-width": sw }));
}

function polygon(svg, points, fill, stroke, sw) {
    svg.append(el("polygon", { points, fill, stroke, "stroke-width": sw }));
}

function ellipse(svg, cx, cy, rx, ry, fill, stroke, sw) {
    svg.append(el("ellipse", { cx, cy, rx, ry, fill, stroke, "stroke-width": sw }));
}


function drawReference(svg, ref) {
    if (ref.draw === "garage") {
        drawGarage(svg, ref.bbox);
        return;
    }
    if (ref.draw === "cage") {
        drawCage(svg, ref.bbox);
        return;
    }
    if (ref.draw === "pond") {
        drawPond(svg, ref.bbox);
        return;
    }
    if (ref.draw === "fridge") {
        drawFridge(svg, ref.bbox);
        return;
    }
    if (ref.draw === "trough") {
        drawTrough(svg, ref.bbox);
        return;
    }
    if (ref.draw === "rack") {
        drawBallRack(svg, ref.bbox);
        return;
    }
    if (ref.draw === "stands") {
        drawBleachers(svg, ref.bbox);
        return;
    }
    if (ref.draw === "stove") {
        drawStove(svg, ref.bbox);
        return;
    }
    if (ref.draw === "bowl") {
        drawBowl(svg, ref.bbox);
        return;
    }
    if (ref.draw === "rocket") {
        drawRocket(svg, ref.bbox);
        return;
    }
    if (ref.draw === "station") {
        drawStation(svg, ref.bbox);
        return;
    }
    if (ref.draw === "tank") {
        drawTank(svg, ref.bbox);
        return;
    }
    if (ref.draw === "mailbox") {
        drawMailbox(svg, ref.bbox);
        return;
    }
    if (ref.draw === "car") {
        drawCar(svg, ref.bbox);
        return;
    }
    if (ref.draw === "house") {
        drawHouse(svg, ref.bbox);
        return;
    }
    if (ref.draw === "goal") {
        drawGoal(svg, ref.bbox);
        return;
    }
    if (ref.draw === "racecar") {
        drawRaceCar(svg, ref.bbox);
        return;
    }
    if (ref.draw === "gate") {
        drawStartGate(svg, ref.bbox);
        return;
    }
    const emoji = el("text", {
        x: ref.bbox.x + ref.bbox.w / 2,
        y: ref.bbox.y + ref.bbox.h / 2,
        "font-size": Math.min(ref.bbox.w, ref.bbox.h) * 0.95,
        "text-anchor": "middle",
        "dominant-baseline": "central"
    });
    emoji.textContent = ref.emoji;
    svg.append(emoji);
}

function drawGarage(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const y0 = b.y + b.h * 0.16;
    const y1 = b.y + b.h;
    polygon(svg, `${x0 - 7},${y0} ${x0},${y0 - 9} ${x1},${y0 - 9} ${x1 + 7},${y0}`, "#64748b", "#475569", 1.5);
    rect(svg, x0, y0, x1 - x0, y1 - y0, "#dbeafe", "#64748b", 1.5);
    polygon(svg, `${x0},${y0} ${x0},${y1} ${x1},${y1} ${x1},${y0}`, "none", "none", 0);
    const doorTop = y0 + 16;
    const doorW = (x1 - x0) * 0.32;
    rect(svg, x0 + 12, doorTop, doorW, y1 - doorTop, "#f59e0b", "#b45309", 1.5);
    rect(svg, x0 + 12 + doorW + 8, doorTop, 5, y1 - doorTop, "#94a3b8", "#94a3b8", 0);
    rect(svg, x1 - 12 - doorW, doorTop, doorW, y1 - doorTop, "#f59e0b", "#b45309", 1.5);
}

function drawFridge(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const y0 = b.y + 2;
    const y1 = b.y + b.h - 2;
    const freezerH = (y1 - y0) * 0.34;
    const divider = y0 + freezerH;
    rect(svg, x0, y0, x1 - x0, y1 - y0, "#f1f5f9", "#64748b", 2);
    rect(svg, x0 + 2, y0 + 2, x1 - x0 - 4, freezerH - 4, "#e2e8f0", "#94a3b8", 1.5);
    rect(svg, x0 + 2, divider + 2, x1 - x0 - 4, y1 - divider - 4, "#ffffff", "#94a3b8", 1.5);
    rect(svg, x0 + 9, y0 + freezerH * 0.24, 3, 3, "#38bdf8", "#38bdf8", 0);
    rect(svg, x0 + 14, y0 + freezerH * 0.24, 3, 3, "#38bdf8", "#38bdf8", 0);
    rect(svg, x0 + 9, y0 + freezerH * 0.24 + 5, 3, 3, "#38bdf8", "#38bdf8", 0);
    rect(svg, x0 + 14, y0 + freezerH * 0.24 + 5, 3, 3, "#38bdf8", "#38bdf8", 0);
    rect(svg, x1 - 14, y0 + 12, 5, 12, "#64748b", "#64748b", 0);
    rect(svg, x1 - 14, divider + 24, 5, 16, "#64748b", "#64748b", 0);
}

function drawStove(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const topY = b.y + 2;
    const baseY = b.y + b.h - 2;
    const bodyW = x1 - x0;
    rect(svg, x0, topY + 4, bodyW, baseY - topY - 4, "#f8fafc", "#64748b", 2);
    const burners = [x0 + 14, x0 + 34, x1 - 14, x1 - 34];
    burners.forEach(bx => circle(svg, bx, topY, 6, "#374151", "#111827", 1.5));
    rect(svg, x0 + 8, topY + 12, bodyW - 16, 4, "#e2e8f0", "#94a3b8", 1);
    rect(svg, x0 + 8, topY + 22, bodyW - 16, baseY - topY - 26, "#e2e8f0", "#64748b", 1.5);
    rect(svg, x0 + 11, topY + 34, 3, 3, "#64748b", "#64748b", 0);
    rect(svg, x0 + 11, topY + 41, 3, 3, "#64748b", "#64748b", 0);
    rect(svg, x0 + 11, topY + 48, 3, 3, "#64748b", "#64748b", 0);
    rect(svg, x1 - 14, topY + 22 + (baseY - topY - 26) / 2 - 2, 6, 4, "#94a3b8", "#64748b", 1);
}

function drawBowl(svg, b) {
    const cx = b.x + b.w / 2;
    const rimY = b.y + b.h * 0.28;
    const baseY = b.y + b.h - 4;
    const halfW = b.w * 0.42;
    polygon(svg, `${cx - halfW},${rimY} ${cx + halfW},${rimY} ${cx + halfW * 0.42},${baseY} ${cx - halfW * 0.42},${baseY}`, "#fbbf24", "#b45309", 1.5);
    ellipse(svg, cx, rimY, halfW, 6, "#fde68a", "#b45309", 1.2);
    ellipse(svg, cx, rimY, halfW - 4, 4, "#f59e0b", "#92400e", 1);
    rect(svg, cx, rimY - 10, 2, 4, "#94a3b8", "#94a3b8", 0);
    rect(svg, cx + 5, rimY - 15, 2, 5, "#94a3b8", "#94a3b8", 0);
    ellipse(svg, cx + halfW * 0.55, rimY - 3, 5, 2.5, "#cbd5e1", "#94a3b8", 1);
    rect(svg, cx + halfW * 0.55 + 3, rimY - 2, 8, 2, "#cbd5e1", "#94a3b8", 1);
}

function drawRocket(svg, b) {
    const cx = b.x + b.w / 2;
    const topY = b.y + 2;
    const baseY = b.y + b.h - 6;
    const halfW = b.w * 0.22;
    rect(svg, cx - halfW, topY + 16, halfW * 2, baseY - topY - 16, "#e2e8f0", "#64748b", 1.5);
    polygon(svg, `${cx},${topY - 4} ${cx - halfW},${topY + 16} ${cx + halfW},${topY + 16}`, "#ef4444", "#b91c1c", 1.5);
    circle(svg, cx, topY + 38, 7, "#93c5fd", "#2563eb", 1.5);
    rect(svg, cx - halfW, baseY - 16, halfW * 2, 4, "#ef4444", "#b91c1c", 0);
    polygon(svg, `${cx - halfW},${baseY - 14} ${cx - halfW - 8},${baseY + 6} ${cx - halfW},${baseY}`, "#ef4444", "#b91c1c", 1);
    polygon(svg, `${cx + halfW},${baseY - 14} ${cx + halfW + 8},${baseY + 6} ${cx + halfW},${baseY}`, "#ef4444", "#b91c1c", 1);
    polygon(svg, `${cx - 4},${baseY} ${cx + 4},${baseY} ${cx + 8},${baseY + 10} ${cx},${baseY + 16} ${cx - 8},${baseY + 10}`, "#fb923c", "#c2410c", 1);
}

function drawStation(svg, b) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const bx0 = b.x + 2;
    const bx1 = b.x + b.w - 2;
    rect(svg, bx0, cy - 8, 20, 16, "#1d4ed8", "#1e40af", 1.5);
    rect(svg, bx1 - 20, cy - 8, 20, 16, "#1d4ed8", "#1e40af", 1.5);
    for (let i = 0; i < 4; i++) {
        rect(svg, bx0 + 5 + i * 4, cy - 8, 2, 16, "#60a5fa", "#60a5fa", 0);
        rect(svg, bx1 - 18 + i * 4, cy - 8, 2, 16, "#60a5fa", "#60a5fa", 0);
    }
    rect(svg, cx - 24, cy - 3, 14, 7, "#94a3b8", "#64748b", 1);
    rect(svg, cx + 10, cy - 3, 14, 7, "#94a3b8", "#64748b", 1);
    rect(svg, cx - 10, cy - 10, 20, 20, "#e2e8f0", "#64748b", 1.5);
    rect(svg, cx - 6, cy - 6, 6, 6, "#93c5fd", "#2563eb", 1);
    rect(svg, cx + 1, cy - 6, 6, 6, "#93c5fd", "#2563eb", 1);
    rect(svg, cx - 1, cy - 16, 2, 6, "#64748b", "#64748b", 0);
    circle(svg, cx, cy - 18, 2, "#ef4444", "#ef4444", 0);
}

function drawTank(svg, b) {
    const cx = b.x + b.w / 2;
    const topY = b.y + 4;
    const baseY = b.y + b.h - 2;
    const bodyW = b.w - 16;
    rect(svg, b.x + 8, topY + 8, bodyW, baseY - topY - 8, "#cbd5e1", "#64748b", 2);
    ellipse(svg, cx, topY + 8, bodyW / 2, 7, "#cbd5e1", "#64748b", 1.5);
    rect(svg, cx - 7, topY + 1, 14, 8, "#94a3b8", "#64748b", 1.5);
    circle(svg, cx, topY + 1, 3, "#fbbf24", "#b45309", 0);
    rect(svg, b.x + 8, topY + 22, bodyW, 3.5, "#94a3b8", "#94a3b8", 0);
    rect(svg, b.x + 8, baseY - 18, bodyW, 3.5, "#94a3b8", "#94a3b8", 0);
    rect(svg, cx - 6, baseY - 12, 12, 12, "#ef4444", "#b91c1c", 1.5);
    rect(svg, cx - 4, baseY - 10, 8, 5, "#fca5a5", "#fca5a5", 0);
}

function drawMailbox(svg, b) {
    const cx = b.x + b.w / 2;
    const topY = b.y + 2;
    const baseY = b.y + b.h;
    const boxW = b.w * 0.66;
    rect(svg, cx - 3, topY + 40, 6, baseY - topY - 40, "#64748b", "#475569", 1);
    rect(svg, cx - boxW / 2, topY, boxW, 40, "#2563eb", "#1d4ed8", 2);
    ellipse(svg, cx, topY + 1, boxW / 2, 7, "#2563eb", "#1d4ed8", 1.5);
    rect(svg, cx - boxW / 4, topY + 10, boxW / 2, 4, "#1e3a8a", "#1e3a8a", 0);
    rect(svg, cx + boxW / 2 - 3, topY + 6, 4, 20, "#ef4444", "#b91c1c", 1);
    polygon(svg, `${cx + boxW / 2 + 1},${topY + 8} ${cx + boxW / 2 + 13},${topY + 12} ${cx + boxW / 2 + 1},${topY + 18}`, "#ef4444", "#b91c1c", 1);
}

function drawCar(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const baseY = b.y + b.h;
    const bodyTop = b.y + 12;
    polygon(svg, `${x0 + 18},${bodyTop} ${x0 + 30},${b.y + 2} ${x0 + 60},${b.y + 2} ${x0 + 70},${bodyTop}`, "#3b82f6", "#1d4ed8", 1.5);
    rect(svg, x0, bodyTop, x1 - x0, baseY - bodyTop - 12, "#facc15", "#ca8a04", 1.5);
    rect(svg, x0 + 27, b.y + 5, 13, 9, "#bfdbfe", "#2563eb", 1);
    rect(svg, x0 + 44, b.y + 5, 13, 9, "#bfdbfe", "#2563eb", 1);
    circle(svg, x0 + 22, baseY - 8, 8, "#1f2937", "#111827", 1.5);
    circle(svg, x0 + 22, baseY - 8, 3, "#cbd5e1", "#cbd5e1", 0);
    circle(svg, x1 - 22, baseY - 8, 8, "#1f2937", "#111827", 1.5);
    circle(svg, x1 - 22, baseY - 8, 3, "#cbd5e1", "#cbd5e1", 0);
    rect(svg, x0 + 2, bodyTop + 4, 6, 6, "#fef9c3", "#fde68a", 1);
}

function drawHouse(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const roofY = b.y + 2;
    const wallY = b.y + 34;
    const baseY = b.y + b.h - 2;
    polygon(svg, `${x0 - 8},${wallY} ${x1 + 8},${wallY} ${(x0 + x1) / 2},${roofY}`, "#ef4444", "#b91c1c", 1.5);
    rect(svg, x0, wallY, x1 - x0, baseY - wallY, "#fde68a", "#d97706", 1.5);
    rect(svg, (x0 + x1) / 2 - 7, wallY + 20, 14, baseY - wallY - 22, "#92400e", "#78350f", 1);
    circle(svg, (x0 + x1) / 2 + 5, wallY + 34, 1.5, "#fde68a", "#fde68a", 0);
    rect(svg, x0 + 8, wallY + 12, 14, 14, "#bfdbfe", "#2563eb", 1.5);
    rect(svg, x0 + 13, wallY + 12, 2, 14, "#93c5fd", "#93c5fd", 0);
    rect(svg, x1 - 22, wallY + 12, 14, 14, "#bfdbfe", "#2563eb", 1.5);
    rect(svg, x1 - 17, wallY + 12, 2, 14, "#93c5fd", "#93c5fd", 0);
    rect(svg, x0 + 14, b.y + 8, 10, 20, "#64748b", "#475569", 1);
}

function drawGoal(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const topY = b.y + 2;
    const baseY = b.y + b.h - 2;
    const barY = topY + 30;
    rect(svg, x0, barY, x1 - x0, baseY - barY, "#7db3f2", "#2563eb", 1);
    for (let gx = x0; gx <= x1; gx += 10) {
        rect(svg, gx, barY, 1.5, baseY - barY, "#2563eb", "#2563eb", 0);
    }
    for (let gy = barY; gy <= baseY; gy += 8) {
        rect(svg, x0, gy, x1 - x0, 1.5, "#2563eb", "#2563eb", 0);
    }
    rect(svg, x0 - 3, barY + 5, 5, baseY - barY - 5, "#ffffff", "#334155", 1.5);
    rect(svg, x1 - 2, barY + 5, 5, baseY - barY - 5, "#ffffff", "#334155", 1.5);
    rect(svg, x0 - 3, barY, x1 - x0 + 6, 5, "#ffffff", "#334155", 1.5);
}

function drawRaceCar(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const baseY = b.y + b.h;
    const bodyTop = b.y + 14;
    rect(svg, x1 - 20, bodyTop - 4, 14, 3, "#ef4444", "#b91c1c", 1);
    polygon(svg, `${x0 + 8},${bodyTop} ${x0 + 30},${b.y + 4} ${x0 + 62},${b.y + 4} ${x1 - 8},${bodyTop} ${x1 - 14},${baseY - 10} ${x0 + 16},${baseY - 10}`, "#ef4444", "#b91c1c", 1.5);
    rect(svg, x0 + 34, b.y + 7, 16, 7, "#334155", "#1e293b", 1);
    circle(svg, x0 + 24, baseY - 7, 7, "#1f2937", "#111827", 1.5);
    circle(svg, x0 + 24, baseY - 7, 2.5, "#d1d5db", "#d1d5db", 0);
    circle(svg, x1 - 24, baseY - 7, 7, "#1f2937", "#111827", 1.5);
    circle(svg, x1 - 24, baseY - 7, 2.5, "#d1d5db", "#d1d5db", 0);
}

function drawBleachers(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const topY = b.y + 2;
    const baseY = b.y + b.h - 2;
    const steps = 4;
    const stepH = (baseY - topY) / steps;
    for (let i = 0; i < steps; i++) {
        const y = topY + i * stepH;
        rect(svg, x0, y, x1 - x0, stepH - 1, i % 2 ? "#cbd5e1" : "#94a3b8", "#64748b", 0.5);
        rect(svg, x0 + 8, y + stepH - 4, x1 - x0 - 16, 2.5, "#ef4444", "#ef4444", 0);
    }
    rect(svg, x0 - 3, topY, 3, baseY - topY, "#64748b", "#475569", 1);
    rect(svg, x1, topY, 3, baseY - topY, "#64748b", "#475569", 1);
    rect(svg, x0 - 3, topY - 2, x1 - x0 + 6, 3, "#64748b", "#475569", 1);
}

function drawBallRack(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const rimY = b.y + b.h * 0.34;
    const baseY = b.y + b.h;
    rect(svg, x0, rimY, x1 - x0, baseY - rimY, "#475569", "#334155", 0);
    const ballY = rimY;
    const xs = [x0 + 16, x0 + 34, x1 - 16];
    xs.forEach(bx => {
        circle(svg, bx, ballY, 11, "#ffffff", "#1f2937", 1.5);
        polygon(svg, `${bx},${ballY - 8} ${bx + 4},${ballY - 2} ${bx - 4},${ballY - 2}`, "#1f2937", "#1f2937", 0);
    });
    rect(svg, x0 - 2, rimY + 2, x1 - x0 + 4, 8, "#cbd5e1", "#64748b", 1.5);
}

function drawTrough(svg, b) {
    const x0 = b.x + 4;
    const x1 = b.x + b.w - 4;
    const waterY = b.y + b.h - 8;
    rect(svg, x0, waterY - 14, x1 - x0, 14, "#cbd5e1", "#64748b", 1.5);
    rect(svg, x0 + 4, waterY - 10, x1 - x0 - 8, 9, "#60a5fa", "#2563eb", 1);
    rect(svg, x0 + 4, waterY - 10, x1 - x0 - 8, 2.5, "#dbeafe", "#dbeafe", 0);
    rect(svg, x0 + 9, waterY, 7, 6, "#64748b", "#475569", 0.8);
    rect(svg, x1 - 16, waterY, 7, 6, "#64748b", "#475569", 0.8);
}

function drawPond(svg, b) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const rx = b.w * 0.48;
    const ry = b.h * 0.42;
    ellipse(svg, cx, cy, rx, ry, "#93c5fd", "#2563eb", 2);
    ellipse(svg, cx - 8, cy - 3, rx * 0.35, ry * 0.25, "none", "#60a5fa", 1.5);
    ellipse(svg, cx + 12, cy + 3, rx * 0.28, ry * 0.2, "none", "#60a5fa", 1.5);
    ellipse(svg, cx + 4, cy - 1, 5, 3, "#f97316", "#c2410c", 1);
    polygon(svg, `${cx + 9},${cy - 1} ${cx + 14},${cy - 4} ${cx + 14},${cy + 2}`, "#f97316", "#c2410c", 1);
    circle(svg, cx + 6, cy - 2, 1, "#111827", "#111827", 0);
}

function drawCage(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const y0 = b.y + b.h * 0.14;
    const y1 = b.y + b.h;
    rect(svg, x0, y0 - 5, x1 - x0, y1 - y0, "#fef3c7", "#d97706", 2);
    const bars = 9;
    for (let i = 0; i <= bars; i++) {
        const x = x0 + ((x1 - x0) * i) / bars;
        rect(svg, x - 1.5, y0, 3, y1 - y0, "#94a3b8", "#94a3b8", 0);
    }
    rect(svg, x0, y0 + (y1 - y0) / 3, x1 - x0, 3, "#94a3b8", "#94a3b8", 0);
    rect(svg, x0, y0 + (2 * (y1 - y0)) / 3, x1 - x0, 3, "#94a3b8", "#94a3b8", 0);
    rect(svg, x0, y0 - 5, x1 - x0, 6, "#64748b", "#475569", 1.5);
}

function drawStartGate(svg, b) {
    const x0 = b.x + 2;
    const x1 = b.x + b.w - 2;
    const y0 = b.y + b.h * 0.18;
    const y1 = b.y + b.h;
    rect(svg, x0 + 4, y0 + 12, 8, y1 - y0 - 12, "#475569", "#334155", 1.5);
    rect(svg, x1 - 12, y0 + 12, 8, y1 - y0 - 12, "#475569", "#334155", 1.5);
    rect(svg, x0, y0, x1 - x0, 13, "#f8fafc", "#334155", 1.5);
    const cells = Math.round((x1 - x0) / 11);
    const cellW = (x1 - x0) / cells;
    for (let i = 0; i < cells; i++) {
        if (i % 2 === 0) {
            rect(svg, x0 + i * cellW, y0, cellW, 13, "#334155", "#334155", 0);
        }
    }
    rect(svg, x0 + 2, y0 - 20, 4, 20, "#64748b", "#475569", 1);
    polygon(svg, `${x0 + 6},${y0 - 20} ${x0 + 20},${y0 - 22} ${x0 + 6},${y0 - 13}`, "#ef4444", "#b91c1c", 1);
}

const OBJECT_DRAW = {
    labda(n, x, y) {
        circle(n, x, y, 20, "#ffffff", "#1f2937", 2);
        const angles = [-90, -18, 54, 126, 198];
        const pv = angles.map(a => {
            const rad = (a * Math.PI) / 180;
            return { x: x + 7.5 * Math.cos(rad), y: y + 7.5 * Math.sin(rad) };
        });
        polygon(n, pv.map((p, i) => `${p.x},${p.y}`).join(" "), "#1f2937", "#1f2937", 1);
        pv.forEach(p => {
            const rad = Math.atan2(p.y - y, p.x - x);
            const ex = x + 18.5 * Math.cos(rad);
            const ey = y + 18.5 * Math.sin(rad);
            n.append(el("line", { x1: p.x, y1: p.y, x2: ex, y2: ey, stroke: "#1f2937", "stroke-width": 1.5 }));
        });
        ellipse(n, x - 8, y - 12, 5, 3.5, "#e2e8f0", "#e2e8f0", 0);
    },
    alma(n, x, y) {
        circle(n, x - 7, y, 13, "#ef4444", "#b91c1c", 2);
        ellipse(n, x - 13, y + 6, 4, 7, "#fca5a5", "#fca5a5", 0);
        rect(n, x - 4, y - 20, 3, 8, "#78350f", "#78350f", 0);
        ellipse(n, x + 5, y - 16, 7, 4, "#22c55e", "#16a34a", 1);
    },
    virag(n, x, y) {
        circle(n, x, y - 14, 10, "#f472b6", "#db2777", 1.5);
        circle(n, x + 13, y - 4, 10, "#fb7185", "#db2777", 1.5);
        circle(n, x - 13, y - 4, 10, "#f9a8d4", "#db2777", 1.5);
        circle(n, x + 8, y + 10, 10, "#c4b5fd", "#db2777", 1.5);
        circle(n, x - 8, y + 10, 10, "#fbcfe8", "#db2777", 1.5);
        circle(n, x, y, 8, "#fbbf24", "#b45309", 2);
    },
    pillango(n, x, y) {
        ellipse(n, x - 12, y - 6, 10, 13, "#c084fc", "#7e22ce", 1.5);
        ellipse(n, x + 12, y - 6, 10, 13, "#c084fc", "#7e22ce", 1.5);
        ellipse(n, x - 8, y + 8, 7, 9, "#a855f7", "#7e22ce", 1.5);
        ellipse(n, x + 8, y + 8, 7, 9, "#a855f7", "#7e22ce", 1.5);
        rect(n, x - 2, y - 16, 4, 32, "#374151", "#374151", 0);
    },
    macska(n, x, y) {
        circle(n, x - 8, y + 2, 15, "#f97316", "#c2410c", 2);
        circle(n, x + 11, y - 8, 9, "#fb923c", "#c2410c", 2);
        polygon(n, `${x + 6},${y - 16} ${x + 10},${y - 24} ${x + 16},${y - 17}`, "#f97316", "#c2410c", 1);
        polygon(n, `${x + 13},${y - 17} ${x + 17},${y - 25} ${x + 21},${y - 13}`, "#f97316", "#c2410c", 1);
        rect(n, x + 21, y + 3, 13, 3, "#c2410c", "#c2410c", 0);
    },
    kutya(n, x, y) {
        circle(n, x + 8, y - 2, 14, "#ca8a04", "#713f12", 2);
        circle(n, x - 8, y - 8, 9, "#e7e5e4", "#713f12", 2);
        ellipse(n, x - 2, y - 16, 5, 8, "#a16207", "#713f12", 1);
        rect(n, x + 19, y + 2, 12, 3, "#713f12", "#713f12", 0);
    },
    eger(n, x, y) {
        circle(n, x, y, 11, "#9ca3af", "#4b5563", 1.5);
        ellipse(n, x - 11, y - 3, 6, 8, "#9ca3af", "#4b5563", 1);
        ellipse(n, x + 11, y - 3, 6, 8, "#9ca3af", "#4b5563", 1);
        rect(n, x - 1, y + 8, 15, 2.5, "#6b7280", "#6b7280", 0);
    },
    level(n, x, y) {
        rect(n, x - 16, y - 13, 32, 26, "#f8fafc", "#64748b", 2);
        polygon(n, `${x - 16},${y - 13} ${x},${y + 3} ${x + 16},${y - 13}`, "#db2777", "#db2777", 0);
    },
    csomag(n, x, y) {
        rect(n, x - 16, y - 15, 32, 30, "#b45309", "#78350f", 2);
        rect(n, x - 3, y - 15, 6, 30, "#fde68a", "#d97706", 1);
        rect(n, x - 16, y - 3, 32, 6, "#fde68a", "#d97706", 1);
    },
    kulcs(n, x, y) {
        circle(n, x - 12, y, 8, "#d4d4d8", "#71717a", 2);
        circle(n, x - 12, y, 2, "#71717a", "#71717a", 0);
        rect(n, x - 5, y - 2, 18, 4, "#d4d4d8", "#71717a", 1);
        rect(n, x + 10, y + 2, 4, 8, "#d4d4d8", "#71717a", 1);
        rect(n, x + 3, y + 5, 4, 6, "#d4d4d8", "#71717a", 1);
    },
    kerek(n, x, y) {
        circle(n, x, y, 17, "#1f2937", "#111827", 2);
        circle(n, x, y, 11, "#d1d5db", "#374151", 2);
        rect(n, x - 1.5, y - 12, 3, 24, "#374151", "#374151", 0);
        rect(n, x - 12, y - 1.5, 24, 3, "#374151", "#374151", 0);
        n.append(el("rect", { x: x - 1.5, y: y - 12, width: 3, height: 24, fill: "#374151", transform: `rotate(45 ${x} ${y})` }));
        n.append(el("rect", { x: x - 1.5, y: y - 12, width: 3, height: 24, fill: "#374151", transform: `rotate(-45 ${x} ${y})` }));
        circle(n, x, y, 2.5, "#374151", "#374151", 0);
    },
    sisak(n, x, y) {
        ellipse(n, x, y - 9, 17, 16, "#ef4444", "#b91c1c", 2);
        rect(n, x - 15, y - 1, 30, 6, "#b91c1c", "#991b1b", 1.5);
        rect(n, x - 15, y + 5, 24, 7, "#ef4444", "#b91c1c", 1.5);
        rect(n, x - 11, y - 2, 20, 4, "#1e293b", "#111827", 1);
        rect(n, x - 3, y - 8, 3, 3, "#1e293b", "#111827", 0);
        rect(n, x + 4, y - 8, 3, 3, "#1e293b", "#111827", 0);
        rect(n, x - 3, y - 20, 6, 4, "#dc2626", "#991b1b", 0);
        rect(n, x + 6, y - 19, 3, 4, "#dc2626", "#991b1b", 0);
    },
    kesztyu(n, x, y) {
        rect(n, x - 8.5, y - 8, 17, 15, "#f43f5e", "#be123c", 1.5);
        rect(n, x - 8.5, y - 1, 17, 2, "#be123c", "#be123c", 0);
        const fw = 3.6;
        for (let i = 0; i < 4; i++) {
            const fx = x - 8 + i * fw;
            const fh = 13 - (i % 3);
            rect(n, fx, y - 8 - fh, fw, fh, "#f43f5e", "#be123c", 1);
            circle(n, fx + fw / 2, y - 8 - fh, fw / 2, "#f43f5e", "#be123c", 0.8);
        }
        ellipse(n, x - 12, y - 1, 3.5, 5.5, "#f43f5e", "#be123c", 1.2);
        rect(n, x - 9.5, y + 7, 19, 4, "#fda4af", "#be123c", 1.2);
        rect(n, x - 9.5, y + 12, 19, 3, "#fecdd3", "#be123c", 1);
        rect(n, x - 9.5, y + 13, 19, 1.5, "#be123c", "#be123c", 0);
    },
    tojas(n, x, y) {
        ellipse(n, x, y, 12, 17, "#fef3c7", "#f59e0b", 2);
        ellipse(n, x - 4, y - 5, 4, 7, "#ffffff", "#ffffff", 0);
    },
    gomba(n, x, y) {
        rect(n, x - 4, y - 2, 8, 18, "#f8fafc", "#94a3b8", 1.5);
        ellipse(n, x, y - 7, 18, 13, "#ef4444", "#b91c1c", 2);
        circle(n, x - 8, y - 10, 3, "#fef2f2", "#fef2f2", 0);
        circle(n, x + 6, y - 5, 2.5, "#fef2f2", "#fef2f2", 0);
        circle(n, x + 1, y - 13, 2.2, "#fef2f2", "#fef2f2", 0);
    },
    jatekos(n, x, y) {
        circle(n, x, y - 15, 8, "#fcd9b8", "#b45309", 1.5);
        rect(n, x - 9, y - 8, 18, 16, "#3b82f6", "#1d4ed8", 2);
        rect(n, x - 11, y + 8, 6, 10, "#2563eb", "#1e40af", 1);
        rect(n, x + 5, y + 8, 6, 10, "#2563eb", "#1e40af", 1);
    },
    zaszlo(n, x, y) {
        rect(n, x - 2, y - 19, 4, 35, "#64748b", "#475569", 1.5);
        polygon(n, `${x + 2},${y - 19} ${x + 22},${y - 16} ${x + 2},${y - 7}`, "#ef4444", "#b91c1c", 1.5);
    },
    oroszlan(n, x, y) {
        circle(n, x, y, 16, "#d97706", "#92400e", 2);
        circle(n, x, y, 10, "#fbbf24", "#b45309", 1.5);
        circle(n, x - 5, y + 3, 3, "#7c2d12", "#7c2d12", 0);
        circle(n, x + 5, y + 3, 3, "#7c2d12", "#7c2d12", 0);
        ellipse(n, x, y + 8, 6, 3, "#f59e0b", "#b45309", 1);
    },
    zebra(n, x, y) {
        rect(n, x - 16, y - 7, 26, 14, "#f8fafc", "#334155", 2);
        rect(n, x - 12, y - 7, 3, 14, "#111827", "#111827", 0);
        rect(n, x - 5, y - 7, 3, 14, "#111827", "#111827", 0);
        rect(n, x + 2, y - 7, 3, 14, "#111827", "#111827", 0);
        rect(n, x + 8, y - 21, 9, 15, "#f8fafc", "#334155", 1.5);
        rect(n, x + 10, y - 21, 3, 15, "#111827", "#111827", 0);
        circle(n, x + 14.5, y - 15, 2, "#111827", "#111827", 0);
        polygon(n, `${x + 8},${y - 21} ${x + 11},${y - 28} ${x + 14},${y - 21}`, "#111827", "#111827", 0);
        polygon(n, `${x + 11},${y - 21} ${x + 14},${y - 28} ${x + 17},${y - 21}`, "#111827", "#111827", 0);
        rect(n, x + 1, y - 14, 9, 3, "#111827", "#111827", 0);
        rect(n, x + 1, y - 11, 9, 3, "#111827", "#111827", 0);
        polygon(n, `${x - 16},${y - 5} ${x - 24},${y - 9} ${x - 22},${y - 2} ${x - 16},${y}`, "#111827", "#111827", 0);
        rect(n, x - 14, y + 7, 4, 10, "#334155", "#334155", 0);
        rect(n, x - 4, y + 7, 4, 10, "#334155", "#334155", 0);
        rect(n, x + 3, y + 7, 4, 10, "#334155", "#334155", 0);
        rect(n, x + 11, y + 7, 4, 10, "#334155", "#334155", 0);
    },
    majom(n, x, y) {
        circle(n, x - 15, y, 9, "#92400e", "#78350f", 1.5);
        circle(n, x + 15, y, 9, "#92400e", "#78350f", 1.5);
        circle(n, x, y, 14, "#a16207", "#713f12", 2);
        circle(n, x - 5, y + 3, 3, "#78350f", "#78350f", 0);
        circle(n, x + 5, y + 3, 3, "#78350f", "#78350f", 0);
        ellipse(n, x, y + 9, 6, 3, "#fde68a", "#78350f", 1);
    },
    zsiraf(n, x, y) {
        rect(n, x - 4, y - 25, 8, 34, "#facc15", "#ca8a04", 2);
        circle(n, x, y - 27, 7, "#fbbf24", "#ca8a04", 1.5);
        ellipse(n, x + 5, y - 28, 3, 4, "#fbbf24", "#ca8a04", 1);
        circle(n, x - 3, y - 28, 1.5, "#2d3748", "#2d3748", 0);
        rect(n, x + 3, y - 8, 8, 3, "#ca8a04", "#ca8a04", 0);
    },
    robot(n, x, y) {
        rect(n, x - 3, y - 27, 6, 6, "#ef4444", "#ef4444", 0);
        rect(n, x - 8, y - 17, 16, 10, "#94a3b8", "#475569", 2);
        rect(n, x - 13, y - 5, 26, 23, "#94a3b8", "#475569", 2);
        circle(n, x - 5, y - 12, 2.5, "#1e293b", "#1e293b", 0);
        circle(n, x + 5, y - 12, 2.5, "#1e293b", "#1e293b", 0);
        rect(n, x - 9, y + 4, 6, 4, "#38bdf8", "#38bdf8", 0);
        rect(n, x + 3, y + 4, 6, 4, "#38bdf8", "#38bdf8", 0);
    },
    muhold(n, x, y) {
        rect(n, x - 10, y - 5, 20, 17, "#f8fafc", "#64748b", 2);
        rect(n, x - 24, y - 16, 10, 13, "#2563eb", "#1d4ed8", 1.5);
        rect(n, x + 14, y - 16, 10, 13, "#2563eb", "#1d4ed8", 1.5);
        rect(n, x - 4, y - 16, 3, 11, "#94a3b8", "#94a3b8", 0);
        rect(n, x + 1, y - 16, 3, 11, "#94a3b8", "#94a3b8", 0);
        rect(n, x - 2, y + 12, 4, 7, "#ef4444", "#ef4444", 0);
        circle(n, x, y + 24, 3, "#ef4444", "#ef4444", 0);
    },
    urhajos(n, x, y) {
        circle(n, x, y - 15, 9, "#f8fafc", "#64748b", 2);
        circle(n, x, y - 15, 5, "#bfdbfe", "#2563eb", 1);
        rect(n, x - 9, y - 5, 18, 20, "#e2e8f0", "#64748b", 2);
        rect(n, x - 11, y + 2, 4, 6, "#cbd5e1", "#64748b", 1);
        rect(n, x + 7, y + 2, 4, 6, "#cbd5e1", "#64748b", 1);
        rect(n, x - 7, y + 14, 5, 5, "#cbd5e1", "#64748b", 1);
        rect(n, x + 2, y + 14, 5, 5, "#cbd5e1", "#64748b", 1);
    }
};

function shadow(svg, cx, baseY, w) {
    ellipse(svg, cx, baseY, w / 2, 5, "rgba(15,23,42,0.16)", "rgba(15,23,42,0)", 0);
}

function measureInDom(svgNode) {
    svgNode.style.position = "fixed";
    svgNode.style.left = "-9999px";
    svgNode.style.width = "1px";
    svgNode.style.height = "1px";
    document.body.append(svgNode);
    let bb;
    try {
        bb = svgNode.getBBox();
    } finally {
        svgNode.remove();
    }
    return bb;
}

function measureReference(ref) {
    const probe = el("svg", {});
    drawReference(probe, ref);
    return measureInDom(probe);
}

function measureObject(obj) {
    const probe = el("svg", {});
    const g = el("g", { transform: "translate(100 100)" });
    OBJECT_DRAW[obj.id](g, 0, 0);
    probe.append(g);
    const bb = measureInDom(probe);
    return { x: bb.x - 100, y: bb.y - 100, width: bb.width, height: bb.height };
}

function mark(svg, cx, cy, r) {
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#2563eb", "stroke-width": 2.5, "stroke-dasharray": "6 5", opacity: 0.9 }));
}

function drawObject(svg, obj, cx, baseY, scale) {
    const group = el("g", { transform: `translate(${cx} ${baseY - 26 * scale}) scale(${scale})` });
    OBJECT_DRAW[obj.id](group, 0, 0);
    svg.append(group);
}

function createScene(step) {

    const ref = REFERENCES.find(r => r.id === step.ref);
    const obj = OBJECTS.find(o => o.id === step.object);
    const b = ref.bbox;
    const pos = step.position;
    const floorY = b.y + b.h;
    const cx = b.x + b.w / 2;
    const groundY = floorY - 44;

    const svg = el("svg", { viewBox: "0 0 220 210", class: "spatial-svg" });

    rect(svg, 0, 0, 220, groundY, "#e0f2fe");
    rect(svg, 0, groundY, 220, 210 - groundY, "#ecfdf5");
    rect(svg, 0, groundY, 220, 3, "#a7f3d0");
    rect(svg, 0, groundY + 22, 220, 1.5, "#d1fae5");
    rect(svg, 0, groundY + 44, 220, 1.5, "#d1fae5");
    shadow(svg, cx, floorY, b.w * 0.55);

    if (pos === "behind") {
        const cy = b.y + b.h / 2;
        const ox = cx + b.w * 0.3;
        const s = 0.85;
        drawObject(svg, obj, ox, cy + 26 * s, s);
        mark(svg, ox, cy, 24);
        const g = el("g", { transform: `rotate(10, ${cx}, ${cy})` });
        svg.append(g);
        drawReference(g, ref);
    } else if (pos === "below") {
        const centerY = Math.min(floorY + 30, 185);
        const baseY = centerY + 26 * 0.9;
        drawObject(svg, obj, cx, baseY, 0.9);
        mark(svg, cx, centerY, 28);
        drawReference(svg, ref);
        shadow(svg, cx, Math.min(centerY + 26, 200), 36);
    } else if (pos === "in-front") {
        drawReference(svg, ref);
        shadow(svg, cx, floorY, 46);
        const centerY = floorY - 18;
        const baseY = centerY + 26 * 1.15;
        drawObject(svg, obj, cx, baseY, 1.15);
        mark(svg, cx, centerY, 31);
    } else if (pos === "above") {
        drawReference(svg, ref);
        const cy = Math.max(b.y - 58, 22);
        const baseY = cy + 26 * 0.95;
        drawObject(svg, obj, cx, baseY, 0.95);
        mark(svg, cx, cy, 27);
    } else {
        const refBB = measureReference(ref);
        const objBB = measureObject(obj);
        let ox;
        if (pos === "left") {
            ox = refBB.x - 12 - (objBB.x + objBB.width);
        } else {
            ox = refBB.x + refBB.width + 12 - objBB.x;
        }
        ox = Math.max(16 - objBB.x, Math.min(ox, 208 - objBB.x - objBB.width));
        drawReference(svg, ref);
        shadow(svg, ox, floorY, 38);
        drawObject(svg, obj, ox, floorY, 1);
        mark(svg, ox, floorY - 27, 28);
    }

    return { svg, ref, obj };

}

export function renderSpatial(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const ref = REFERENCES.find(r => r.id === step.ref);
    const obj = OBJECTS.find(o => o.id === step.object);

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.className = "spatial-title";
    title.textContent = `${WORLD_EMOJI[world] ?? "🧭"} Hol van ${obj.article} ${obj.name}?`;
    card.append(title);

    const sceneWrap = document.createElement("div");
    sceneWrap.className = "spatial-scene";
    sceneWrap.append(createScene(step).svg);
    card.append(sceneWrap);

    const prompt = document.createElement("p");
    prompt.className = "spatial-prompt";
    prompt.textContent = "Kattints a helyes válaszra!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "spatial-options";

    const message = createMessageBox();

    card.append(optionsContainer, message.element);
    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext,
        onResult,
        onAttempt
    });

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "spatial-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            optionsContainer.querySelectorAll("button").forEach(b => (b.style.pointerEvents = "none"));

            if (opt.correct) {
                markCorrect(btn);
                feedback.success("🎉 Jó válasz!");
            } else {
                btn.classList.add("spatial-option-wrong");
                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b.textContent === step.answer) {
                        b.classList.add("spatial-option-correct");
                    }
                });
                feedback.reveal(`🤔 Nem! A helyes meghatározás: ${step.answer}`);
            }
        });

        optionsContainer.append(btn);
    });
}
