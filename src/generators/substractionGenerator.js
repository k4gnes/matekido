const MAX_GENERATION_ATTEMPTS = 10000;

export function generateSubtraction(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 20,
        subMax = 20,
        multiplesOfTen = false,
        bMultiplesOfTen = false,
        bMax = null,
        noCrossingTen = false,
        crossingTen = "any"
    } = options;

    const validCrossingModes = ["never", "always", "any"];

    if (!validCrossingModes.includes(crossingTen)) {
        throw new Error(`Érvénytelen crossingTen érték: ${crossingTen}`);
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const a = random(min, max);

        const bUpper = Math.min(subMax, a);
        let b = random(1, bMax !== null ? Math.min(bMax, bUpper) : bUpper);

        // Kerek tízes: mind a, mind b legyen 10-es többszöröse
        if (multiplesOfTen) {
            const aRound = Math.ceil(a / 10) * 10;
            if (aRound > max) continue;
            const bRound = Math.ceil(b / 10) * 10;
            if (bRound < 10 || bRound >= aRound) continue;
            if (aRound - bRound < 0) continue;
            tasks.push({ a: aRound, b: bRound });
            continue;
        }

        // Csak b legyen kerek tizes (a véletlen marad)
        if (bMultiplesOfTen) {
            b = Math.ceil(b / 10) * 10;
            if (b < 10 || b >= a) continue;
            if (a - b < 0) continue;
            tasks.push({ a, b });
            continue;
        }

        if (a - b < 0) continue;

        // Tízesátlépés ellenőrzése
        const onesA = a % 10;
        const onesB = b % 10;
        const doesCross = onesA < onesB;

        if (noCrossingTen && doesCross) continue;

        if (crossingTen === "always" && !doesCross) continue;
        if (crossingTen === "never" && doesCross) continue;

        tasks.push({ a, b });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
