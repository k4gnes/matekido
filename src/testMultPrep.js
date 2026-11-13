// Egy leckén belül a mult-prep feladatai ne ismétlődjenek: a szűk táblából (pl. [2, 5])
// húzott egyenlő csoportoknál / ismételt összeadásnál / számlálásnál se jöjjön kétszer ugyanaz.
//
// Futtatás: make test

const { generateMultPrep } = await import("./generators/multPrepGenerator.js");

let failures = 0;

function check(cond, message) {
    if (!cond) {
        failures++;
        console.error(`HIBA: ${message}`);
    }
}

const RUNS = 200;

// 2. osztály: egyenlő csoportok, [2, 5] tábla, 30-ig – itt tudott az ismétlődés előjönni.
for (let run = 0; run < RUNS; run++) {
    const groups = generateMultPrep({ count: 5, type: "equal-groups", tables: [2, 5], max: 30 });
    const keys = groups.map(t => `${t.groups}x${t.perGroup}`);
    check(new Set(keys).size === groups.length, `egyenlő csoportok: ismétlődő feladat (${keys.join(", ")})`);

    groups.forEach(t => {
        check([2, 5].includes(t.perGroup), `egyenlő csoportok: táblán küli tagadó (${t.perGroup})`);
        check(t.groups >= 2, `egyenlő csoportok: kevesebb mint 2 csoport (${t.groups})`);
        check(t.total === t.groups * t.perGroup && t.answer === t.total, `egyenlő csoportok: hibás összeg (${t.groups}x${t.perGroup})`);
    });

    // 1. osztály: 20-ig, még szűkebb tér.
    const small = generateMultPrep({ count: 5, type: "equal-groups", tables: [2, 5], max: 20 });
    const smallKeys = small.map(t => `${t.groups}x${t.perGroup}`);
    check(new Set(smallKeys).size === small.length, `egyenlő csoportok 20-ig: ismétlődő feladat (${smallKeys.join(", ")})`);
}

// Ismételt összeadás: 1. osztály, [2, 5] tábla, 20-ig – 7 különböző kifejezés 5 feladatra.
for (let run = 0; run < RUNS; run++) {
    const adds = generateMultPrep({ count: 5, type: "repeated-addition", tables: [2, 5], max: 20 });
    const keys = adds.map(t => t.expression);
    check(new Set(keys).size === adds.length, `ismételt összeadás: ismétlődő feladat (${keys.join(" | ")})`);
    adds.forEach(t => check(t.answer === t.addend * t.times, `ismételt összeadás: hibás összeg (${t.expression})`));
}

// Számlálás: 1. osztály, 2-es lépéssel, 20-ig – 12 különböző sor 5 feladatra.
for (let run = 0; run < RUNS; run++) {
    const skips = generateMultPrep({ count: 5, type: "skip-counting", tables: [2], max: 20 });
    const keys = skips.map(t => t.terms.join(","));
    check(new Set(keys).size === skips.length, `számlálás: ismétlődő feladat (${keys.join(" | ")})`);
    skips.forEach(t => {
        check(t.answer === t.terms[t.missingIndex], `számlálás: a válasz nem a hiányzó hely (${t.terms.join(",")})`);
        check(t.missingIndex >= 1 && t.missingIndex <= 3, `számlálás: rossz hiányzó hely (${t.missingIndex})`);
    });
}

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nMult-prep teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
