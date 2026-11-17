// Adventi naptár: a dátum-alapú ablak- és leckeválasztás.
//
// Futtatás: make test

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const {
    ADVENT_DAYS, adventDateKeys, adventPool, adventStart, adventYear,
    pickAdventLesson, todayKey, windowState
} = await import("./utils/advent.js");

check(adventYear(new Date(2026, 11, 1)) === 2026, "december a saját évéhez tartozik");
check(adventYear(new Date(2026, 11, 31)) === 2026, "december 31. is adventi év");
check(adventYear(new Date(2027, 0, 5)) === 2026, "január 5. az előző adventi évhez tartozik");
check(adventYear(new Date(2027, 0, 6)) === null, "vízkereszt (január 6.) után nincs naptár");
check(adventYear(new Date(2027, 5, 1)) === null, "nyáron nincs naptár");

const keys = adventDateKeys(2026);
check(keys.length === ADVENT_DAYS, "24 ablak");
check(keys[0] === "2026-12-01" && keys[23] === "2026-12-24", "az ablakok dec 1-től dec 24-ig tartanak");
check(new Set(keys).size === ADVENT_DAYS, "nincs duplikált dátum");
check(keys.every(k => /^\d{4}-\d{2}-\d{2}$/.test(k)), "a dátumkulcsok formátuma YYYY-MM-DD");

const lessons = [];
for (let i = 0; i < 30; i++) {
    lessons.push({ id: `l${i}`, file: `l${i}.json`, grades: [5], practice: false, master: false });
}
lessons.push({ id: "play", file: "play.json", grades: [5], practice: true });
lessons.push({ id: "master", file: "master.json", grades: [5], master: true });
lessons.push({ id: "other", file: "other.json", grades: [3] });

const pool = adventPool(lessons, 5);
check(pool.length === 30, "a medencében csak az évfolyam rendes leckéi vannak (nincs egyperces és mester)");
check(adventPool(lessons, 3).length === 1, "más évfolyam más medencét kap");
check(adventPool(lessons, null).length === 0, "évfolyam nélkül nincs medence");
check(adventPool([], 5).length === 0, "üres listából üres medence");

check(pickAdventLesson([], "2026-12-01") === null, "üres medencéből nincs lecke");

const first = keys.map(k => pickAdventLesson(pool, k));
check(first.every(e => e && pool.includes(e)), "minden napra jön lecke a medencéből");
check(first.every((e, i) => e === pickAdventLesson(pool, keys[i])), "ugyanaz a dátum ugyanazt a leckét adja");
check(new Set(first.map(e => e.id)).size > 1, "a 24 nap nem ugyanazt a leckét adja");

check(windowState("2026-12-05", "2026-12-03", false) === "future", "jövőbeli ablak zárva");
check(windowState("2026-12-03", "2026-12-03", false) === "open", "mai ablak nyitva");
check(windowState("2026-12-01", "2026-12-03", false) === "open", "lejárt ablak bepótolható");
check(windowState("2026-12-03", "2026-12-03", true) === "done", "teljesített ablak kész");
check(windowState("2026-12-20", "2026-12-03", true) === "done", "a kész mindig felülírja a zártat");

check(adventStart(2026) === new Date(2026, 11, 1).getTime(), "a gyűjtés dec 1-jén kezdődik");
check(/^\d{4}-\d{2}-\d{2}$/.test(todayKey()), "a mai dátum kulcsa YYYY-MM-DD");

if (failures > 0) {
    console.error(`${failures} hiba`);
    process.exit(1);
}
console.log("advent teszt OK ✔");
