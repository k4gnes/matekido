export function createCountRow(emoji, count) {

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:0.2rem;";

    if (count < 10) {

        const row = document.createElement("div");
        row.style.cssText = "font-size:1.4rem; line-height:1.6; text-align:center; max-width:12rem;";
        row.textContent = Array(count).fill(emoji).join(" ");

        wrap.append(row);

        return wrap;

    }

    const bundles = Math.floor(count / 10);
    const rest = count % 10;

    for (let i = 0; i < bundles; i++) {
        const bundle = document.createElement("div");
        bundle.style.cssText = "font-size:0.85rem; line-height:1.2; padding:0.15rem 0.3rem; border:1px solid var(--line,#e5e7eb); border-radius:0.4rem; background:var(--card-bg,#fff);";
        bundle.textContent = Array(10).fill(emoji).join("");
        wrap.append(bundle);
    }

    if (rest > 0) {
        const row = document.createElement("div");
        row.style.cssText = "font-size:1.2rem; line-height:1.4;";
        row.textContent = Array(rest).fill(emoji).join(" ");
        wrap.append(row);
    }

    return wrap;

}