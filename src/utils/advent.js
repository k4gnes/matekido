export const ADVENT_DAYS = 24;

// Előnézet: ?advent=12 – a naptár a megadott dec. napjaként jelenik meg, bármikor.
function previewDay() {

    if (typeof location === "undefined") return null;

    const value = new URLSearchParams(location.search).get("advent");
    if (value === null) return null;

    const day = Number(value);
    return Number.isInteger(day) && day >= 1 && day <= ADVENT_DAYS ? day : 1;

}

export function todayKey(now = new Date()) {

    const preview = previewDay();
    if (preview) return `${now.getFullYear()}-12-${String(preview).padStart(2, "0")}`;

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;

}

// A naptár dec 1-jén nyílik, és vízkereszt (jan 6.) előtt tűnik el:
// dec. 25-én és jan. 1-5-én még az adott adventi évhez tartozik.
export function adventYear(now = new Date()) {

    if (previewDay()) return now.getFullYear();
    if (now.getMonth() === 11) return now.getFullYear();
    if (now.getMonth() === 0 && now.getDate() <= 5) return now.getFullYear() - 1;
    return null;

}

export function adventDateKeys(year) {

    const keys = [];
    for (let day = 1; day <= ADVENT_DAYS; day++) {
        keys.push(`${year}-12-${String(day).padStart(2, "0")}`);
    }
    return keys;

}

// A dísz a adventi év dec. 1. utáni teljesítésért jár; előnézetben minden
// eddigi teljesítés beleszámít, hogy látszódjon a feldíszített fa.
export function adventStart(year) {

    if (previewDay()) return 0;
    return new Date(year, 11, 1).getTime();

}

export function adventPool(lessons, grade) {
    return (lessons || []).filter(l => l.grades?.includes(grade) && !l.practice && !l.master);
}

// FNV-1a: ugyanaz a dátum mindig ugyanazt a leckét adja, mindenkinél.
function hash(text) {

    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;

}

export function pickAdventLesson(pool, dateKey) {

    if (!pool || pool.length === 0) return null;
    return pool[hash(dateKey) % pool.length];

}

export function windowState(dateKey, today, done) {

    if (done) return "done";
    return dateKey <= today ? "open" : "future";

}

// A díszek soronként egyre szélesebb sorban ülnek a fán, felülről lefelé.
// A 24. ablak nem ide kerül: ő a csúcsdísz, a fa tetején lévő csillag.
const ORNAMENT_ROWS = [1, 1, 2, 3, 3, 4, 5, 4];

// A dísz sugara %-ban a fa oldalhosszához mérve (a legszűkebb eset a mobil).
export const ORNAMENT_MARGIN = 6;

// A fenyő kontúrjának (a clip-path polygonnak) fele szélessége a megadott
// magasságon: a dísz csak addig mehet kifelé, amíg a fa ki nem vágja.
export function treeHalfWidth(y) {

    if (y <= 22) return (14 * y) / 22;
    if (y <= 48) return 7 + (19 * (y - 22)) / 26;
    if (y <= 76) return 17 + (25 * (y - 48)) / 28;
    return 28 + (22 * (y - 76)) / 20;

}

export const ORNAMENT_SLOTS = (() => {

    const slots = [];

    ORNAMENT_ROWS.forEach((count, row) => {
        const top = 16 + row * 8.5;

        // A dísz a teljes magasságában kell, hogy a fában maradjon.
        let safe = Infinity;
        for (let y = top - 5; y <= top + 5; y += 0.5) {
            safe = Math.min(safe, treeHalfWidth(y));
        }

        const spread = Math.max(0, safe - ORNAMENT_MARGIN);

        for (let i = 0; i < count; i++) {
            const left = count === 1 ? 50 : 50 + (i - (count - 1) / 2) * (2 * spread / (count - 1));
            slots.push({ top, left });
        }
    });

    return slots;

})();
