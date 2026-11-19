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

// Decemberben az adott évfolyam anyagának jó részét még nem tanulták, ezért
// 2. osztálytól az előző évfolyam leckéiből sorsolunk; az 1. osztálynak nincs
// előző évfolyama, ő a sajátjából kap.
export function adventPool(lessons, grade) {
    const source = grade > 1 ? grade - 1 : grade;
    return (lessons || []).filter(l => l.grades?.includes(source) && !l.practice && !l.master);
}

// FNV-1a: ugyanaz a dátum + évfolyam mindig ugyanazt a leckét adja, mindenkinél.
// Az évfolyam is a kulcs része, mert az 1. és a 2. osztály medencéje azonos.
function hash(text) {

    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;

}

function slotOf(pool, dateKey, grade) {

    return hash(`${grade}:${dateKey}`) % pool.length;

}

// Az adott nap helye: az első szabad a saját hash-étől kezdve; a foglalt
// helyeket a `taken` sorrendben, napok szerint adogatjuk hozzá.
function claimSlot(pool, dateKey, grade, taken) {

    let i = slotOf(pool, dateKey, grade);
    for (let n = 0; n < pool.length && taken.has(i); n++) i = (i + 1) % pool.length;
    taken.add(i);
    return i;

}

export function pickAdventLesson(pool, dateKey, grade) {

    if (!pool || pool.length === 0) return null;

    // Minden korábbi nap lefoglalja a helyét, és az ütközést továbbtoljuk,
    // hogy a 24 ablak 24 különböző leckét kapjon. Ha a medence kisebb,
    // mint 24, hamarabb elfogy a hely, és a többi nap megismétel.
    const prefix = dateKey.slice(0, -2);
    const day = Number(dateKey.slice(-2));
    const taken = new Set();
    for (let d = 1; d < day; d++) {
        claimSlot(pool, `${prefix}${String(d).padStart(2, "0")}`, grade, taken);
    }

    return pool[claimSlot(pool, dateKey, grade, taken)];

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
