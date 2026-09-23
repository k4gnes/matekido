function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const ICON_STYLE = "width:1.05em;height:1.05em;vertical-align:-0.18em;";

const MD_ICONS = {
    "fb": `<svg viewBox="0 0 24 24" style="${ICON_STYLE}" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877f2"/><text x="12" y="15.5" font-size="12" font-family="Arial, sans-serif" font-weight="700" fill="#fff" text-anchor="middle">f</text></svg>`,
    "msg": `<svg viewBox="0 0 24 24" style="${ICON_STYLE}" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#0084ff"/><text x="12" y="16" font-size="14" font-family="Arial, sans-serif" fill="#fff" text-anchor="middle">⚡</text></svg>`
};

function renderInline(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
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
            const safeUrl = /^https?:\/\//.test(url.trim()) ? url.trim() : "#";
            return `<a href="${safeUrl}" target="_blank" rel="noopener">${label}</a>`;
        })
        .replace(/:fb:|:msg:/g, token => MD_ICONS[token.slice(1, -1)]);
}

function isTableSeparator(row) {
    return /^[\s|:-]+$/.test(row) && row.includes("-");
}

export function renderMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    const html = [];
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
            html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
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

    return html.join("\n");
}
