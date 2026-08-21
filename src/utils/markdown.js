function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
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
