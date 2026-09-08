const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function polygonPoints(n, cx, cy, r, rotation = -Math.PI / 2) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const angle = rotation + i * 2 * Math.PI / n;
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(" ");
}

export function createShapeSvg(shape = {}) {
    const kind = shape.kind ?? "circle";
    const color = shape.color ?? "#3b82f6";
    const size = shape.size ?? 36;

    const svg = svgEl("svg", { viewBox: "0 0 64 64" });
    const stroke = { stroke: "#1e293b", "stroke-width": "2", "stroke-linejoin": "round" };

    if (kind === "circle") {
        svg.append(svgEl("circle", {
            cx: 32, cy: 32, r: size / 2,
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    } else if (kind === "triangle") {
        const r = size / 1.5;
        svg.append(svgEl("polygon", {
            points: polygonPoints(3, 32, 32, r),
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    } else if (kind === "square") {
        const s = size * 0.9;
        svg.append(svgEl("rect", {
            x: 32 - s / 2, y: 32 - s / 2, width: s, height: s, rx: 3,
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    } else if (kind === "rectangle") {
        const w = size * 1.1;
        const h = size * 0.68;
        svg.append(svgEl("rect", {
            x: 32 - w / 2, y: 32 - h / 2, width: w, height: h, rx: 3,
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    } else if (kind === "pentagon") {
        svg.append(svgEl("polygon", {
            points: polygonPoints(5, 32, 32, size / 1.8),
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    } else if (kind === "hexagon") {
        svg.append(svgEl("polygon", {
            points: polygonPoints(6, 32, 32, size / 1.8),
            fill: color, "fill-opacity": ".9",
            ...stroke
        }));
    }

    return svg;
}