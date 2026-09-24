function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const ICON_STYLE = "width:1.05em;height:1.05em;vertical-align:-0.18em;";

const MD_ICONS = {
    "fb": `<svg viewBox="0 0 24 24" style="${ICON_STYLE}" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877f2"/><text x="12" y="15.5" font-size="12" font-family="Arial, sans-serif" font-weight="700" fill="#fff" text-anchor="middle">f</text></svg>`,
    "msg": `<svg viewBox="0 0 24 24" style="${ICON_STYLE}" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#0084ff"/><text x="12" y="16" font-size="14" font-family="Arial, sans-serif" fill="#fff" text-anchor="middle">⚡</text></svg>`
};

function slugify(text) {
    return text
        .replace(/\[\[img:[a-zA-Z0-9-]+(?:#[a-zA-Z0-9-]+)?\]\]/g, "")
        .replace(/\[\[([^\]|]+)(?:\|[^\]|]+)?\]\]/g, "$1")
        .replace(/\{\{([^}|]+)(?:\|[^}|]+)?\}\}/g, "$1")
        .replace(/[`*_]/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u200d\ufeff]/g, " ")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

function renderInline(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\[\[img:([a-zA-Z0-9-]+)(?:#([a-zA-Z0-9-]+))?\]\]/g, (match, name, anchor) => {
            const inner = `<img src="/docs/${name}.svg" alt="">`;
            if (anchor) {
                return `<a class="help-btn help-btn-img" href="#${anchor}">${inner}</a>`;
            }
            return `<span class="help-btn help-btn-img">${inner}</span>`;
        })
        .replace(/\[\[([^\]|]+)(?:\|([^\]|]+))?\]\]/g, (match, label, variant) => {
            const cls = variant === "outline" ? " help-btn-outline" : variant === "ghost" ? " help-btn-ghost" : "";
            return `<span class="help-btn${cls}">${label}</span>`;
        })
        .replace(/\{\{([^}|]+)(?:\|([^}|]+))?\}\}/g, (match, label, variant) => {
            const cls = variant === "grey" ? " help-btn-grey" : "";
            return `<span class="help-btn help-btn-sq${cls}">${label}</span>`;
        })
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
            const safeSrc = src.trim();
            const allowed = /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(safeSrc);
            if (!allowed) {
                return "";
            }
            if (/\.(mp4|webm|ogg)$/i.test(safeSrc)) {
                return `<video controls preload="metadata" muted playsinline style="width:100%;border-radius:12px"><source src="${safeSrc}">A böngésződ nem tudja lejátszani a videót.</video>`;
            }
            return `<img src="${safeSrc}" alt="${alt}" loading="lazy">`;
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
            const trimmed = url.trim();
            if (/^https?:\/\//.test(trimmed)) {
                return `<a href="${trimmed}" target="_blank" rel="noopener">${label}</a>`;
            }
            if (/^#/.test(trimmed)) {
                return `<a href="${trimmed}">${label}</a>`;
            }
            return `<a href="#">${label}</a>`;
        })
        .replace(/:fb:|:msg:/g, token => MD_ICONS[token.slice(1, -1)]);
}

function isTableSeparator(row) {
    return /^[\s|:-]+$/.test(row) && row.includes("-");
}

export function renderMarkdown(markdown, { toc = false } = {}) {
    const lines = markdown.split(/\r?\n/);
    const html = [];
    const tocEntries = [];
    const usedIds = {};
    const backLink = `<a class="help-toc-back" href="#tartalom" aria-label="Vissza a tartalomjegyzékhez">⬆️ Tartalom</a>`;
    let tocInsert = 0;
    let anchored = false;
    let sectionOpen = false;
    let i = 0;

    while (i < lines.length) {
        const trimmed = lines[i].trim();

        if (!trimmed) {
            i++;
            continue;
        }

        if (/^-{3,}$/.test(trimmed)) {
            html.push("<hr>");
            i++;
            continue;
        }

        const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length;
            const raw = heading[2];
            const base = slugify(raw) || "szakasz";
            const count = usedIds[base] = (usedIds[base] || 0) + 1;
            const id = count === 1 ? base : `${base}-${count}`;
            if (toc) {
                if (level === 1 && !anchored) {
                    anchored = true;
                    tocInsert = html.length;
                } else if (level === 2) {
                    if (sectionOpen) {
                        html.push(backLink);
                    }
                    sectionOpen = true;
                    tocEntries.push([id,
                        escapeHtml(raw
                            .replace(/\[\[img:([a-zA-Z0-9-]+)(?:#[a-zA-Z0-9-]+)?\]\]/g, "\u0000IMG:$1\u0000")
                            .replace(/\[\[([^\]|]+)(?:\|[^\]|]+)?\]\]/g, "$1")
                            .replace(/\{\{([^}|]+)(?:\|[^}|]+)?\}\}/g, "$1"))
                            .replace(/\u0000IMG:([a-zA-Z0-9-]+)\u0000/g, (match, name) =>
                                `<img src="/docs/${name}.svg" alt="" class="help-toc-item-img">`)
                    ]);
                }
            }
            html.push(`<h${level} id="${id}">${renderInline(raw)}</h${level}>`);
            i++;
            continue;
        }

        if (trimmed.startsWith("|")) {
            const rows = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                rows.push(lines[i].trim());
                i++;
            }
            const parseRow = row => row.replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => renderInline(cell.trim()));
            let tableHtml = "<table>";
            let bodyRows = rows;
            if (rows.length > 1 && isTableSeparator(rows[1])) {
                tableHtml += `<thead><tr>${parseRow(rows[0]).map(cell => `<th>${cell}</th>`).join("")}</tr></thead>`;
                bodyRows = rows.slice(2);
            }
            tableHtml += `<tbody>${bodyRows.map(row => `<tr>${parseRow(row).map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
            html.push(tableHtml);
            continue;
        }

        if (/^-\s+/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
                items.push(`<li>${renderInline(lines[i].trim().replace(/^-\s+/, ""))}</li>`);
                i++;
            }
            html.push(`<ul>${items.join("")}</ul>`);
            continue;
        }

        const paragraph = [];
        while (i < lines.length && lines[i].trim() && !/^[#|-]|^-{3,}$/.test(lines[i].trim())) {
            paragraph.push(renderInline(lines[i].trim()));
            i++;
        }
        html.push(`<p>${paragraph.join(" ")}</p>`);
    }

    if (toc && sectionOpen) {
        html.push(backLink);
    }

    if (toc && tocEntries.length) {
        const items = tocEntries
            .map(([id, label]) => `<a class="help-toc-item" href="#${id}">${label}</a>`)
            .join("");
        html.splice(tocInsert, 0, `<nav class="help-toc" id="tartalom" aria-label="Tartalomjegyzék"><p class="help-toc-title">📋 Tartalom</p>${items}</nav>`);
    }

    return html.join("\n");
}
