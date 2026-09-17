const NS = "http://www.w3.org/2000/svg";

function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
}

function roundRect(svg, x, y, w, h, r, fill, stroke) {
    const rect = el("rect", {
        x, y, width: w, height: h,
        rx: r, ry: r,
        fill, stroke: stroke ?? "none",
        "stroke-width": stroke ? 2 : 0
    });
    svg.append(rect);
}

function drawSlice(svg, cx, cy, r, total, index, filled, fillColor, strokeColor) {
    const a1 = index * 2 * Math.PI / total - Math.PI / 2;
    const a2 = (index + 1) * 2 * Math.PI / total - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const largeArc = a2 - a1 > Math.PI ? 1 : 0;
    const path = el("path", {
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        fill: filled ? fillColor : "#f6c453",
        stroke: strokeColor,
        "stroke-width": 2
    });
    svg.append(path);
}

function drawPizza(svg, total, filled) {
    const cx = 60, cy = 60, r = 46;
    for (let i = 0; i < total; i++) {
        drawSlice(svg, cx, cy, r, total, i, i < filled, "#e2574c", "#b4423a");
    }
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#d9746b", "stroke-width": 3 }));
}

function drawChoco(svg, total, filled) {
    const W = 120, H = 54, x0 = 12, y0 = 8, w = W - 24, h = H - 16;
    roundRect(svg, x0, y0, w, h, 6, "#a06a3c", "#7a4a2b");
    for (let i = 0; i < total; i++) {
        const x = x0 + 3 + i * (w - 6) / total;
        const cw = (w - 6) / total - 3;
        const filledColor = i < filled;
        const fill = filledColor ? "#5d3016" : "#c8906a";
        roundRect(svg, x, y0 + 3, cw, h - 6, 3, fill, "#7a4a2b");
    }
}

function drawSandwich(svg, total, filled) {
    const W = 120, H = 54, x0 = 8, y0 = 8, w = W - 16, h = H - 16;
    for (let i = 0; i < total; i++) {
        const x = x0 + i * w / total;
        const sw = w / total;
        const fill = i < filled ? "#8bc34a" : "#ffe082";
        svg.append(el("rect", {
            x, y: y0 + 8, width: sw, height: h - 12,
            fill, stroke: "#c0a24f",
            "stroke-width": 1
        }));
    }
    roundRect(svg, x0, y0, w, 8, 4, "#d9a066", "#b57a4a");
    roundRect(svg, x0, y0 + h - 8, w, 8, 4, "#d9a066", "#b57a4a");
    svg.append(el("line", { x1: x0, y1: y0 + 8, x2: x0 + w, y2: y0 + 8, stroke: "#b57a4a", "stroke-width": 2 }));
}

function drawTorta(svg, total, filled) {
    const cx = 60, cy = 60, r = 46;
    for (let i = 0; i < total; i++) {
        drawSlice(svg, cx, cy, r, total, i, i < filled, "#ef5350", "#d81b60");
    }
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#ad1457", "stroke-width": 3 }));
}

const VIEWBOX = {
    pizza: [0, 0, 120, 120],
    torta: [0, 0, 120, 120],
    csoki: [0, 0, 120, 64],
    szendvics: [0, 0, 120, 64]
};

export function createFractionSvg(option) {
    const svg = document.createElementNS(NS, "svg");
    const [vx, vy, vw, vh] = VIEWBOX[option.kind] ?? [0, 0, 120, 64];
    svg.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`);
    svg.setAttribute("width", String(vw));
    svg.setAttribute("height", String(vh));
    svg.setAttribute("class", "fraction-svg");

    if (option.kind === "pizza") drawPizza(svg, option.total, option.filled);
    else if (option.kind === "csoki") drawChoco(svg, option.total, option.filled);
    else if (option.kind === "szendvics") drawSandwich(svg, option.total, option.filled);
    else if (option.kind === "torta") drawTorta(svg, option.total, option.filled);

    return svg;
}

export function renderFractionSymbol(numerator, denominator) {
    const wrap = document.createElement("div");
    wrap.className = "frsym";
    const n = document.createElement("div");
    n.className = "frsym-num";
    n.textContent = numerator;
    const line = document.createElement("div");
    line.className = "frsym-line";
    const d = document.createElement("div");
    d.className = "frsym-den";
    d.textContent = denominator;
    wrap.append(n, line, d);
    return wrap;
}