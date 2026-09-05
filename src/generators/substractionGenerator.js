const MAX_GENERATION_ATTEMPTS = 10000;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSubtraction(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 20,
        subMax = 20,
        multiplesOfTen = false,
        multiplesOfHundred = false,
        bMultiplesOfTen = false,
        bMultiplesOfHundred = false,
        bMax = null,
        noCrossingTen = false,
        crossingTen = "any",
        crossHundreds = "any",
        interaction = "mixed"
    } = options;

    const validCrossingModes = ["never", "always", "any"];

    if (!validCrossingModes.includes(crossingTen)) {
        throw new Error(`Érvénytelen crossingTen érték: ${crossingTen}`);
    }

    const validCrossHundredsModes = ["never", "always", "any"];

    if (!validCrossHundredsModes.includes(crossHundreds)) {
        throw new Error(`Érvénytelen crossHundreds érték: ${crossHundreds}`);
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const a = random(min, max);

        const bUpper = Math.min(subMax, a - 1);
        if (bUpper < 1) continue;

        let b = random(1, bMax !== null ? Math.min(bMax, bUpper) : bUpper);

        // Kerek tízes: mind a, mind b legyen 10-es többszöröse
        if (multiplesOfTen) {
            const aRound = Math.ceil(a / 10) * 10;
            if (aRound > max) continue;
            const bRound = Math.ceil(b / 10) * 10;
            if (bRound < 10 || bRound >= aRound) continue;
            if (aRound - bRound < 0) continue;
            tasks.push({ a: aRound, b: bRound, interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction });
            continue;
        }

        // Kerek százas: mind a, mind b legyen 100-as többszöröse
        if (multiplesOfHundred) {
            const aRound = Math.ceil(a / 100) * 100;
            if (aRound > max) continue;
            const bRound = Math.ceil(b / 100) * 100;
            if (bRound < 100 || bRound >= aRound) continue;
            if (aRound - bRound < 0) continue;
            tasks.push({ a: aRound, b: bRound, interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction });
            continue;
        }

        // Csak b legyen kerek tizes (a véletlen marad)
        if (bMultiplesOfTen) {
            b = Math.ceil(b / 10) * 10;
            if (b < 10 || b >= a) continue;
            if (a - b < 0) continue;
            tasks.push({ a, b, interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction });
            continue;
        }

        // Csak b legyen kerek százas (a véletlen marad)
        if (bMultiplesOfHundred) {
            b = Math.ceil(b / 100) * 100;
            if (b < 100 || b >= a) continue;
            if (a - b < 0) continue;
            tasks.push({ a, b, interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction });
            continue;
        }

        if (a - b < 1) continue;

        // Tízesátlépés ellenőrzése
        const onesA = a % 10;
        const onesB = b % 10;
        const doesCross = onesA < onesB;

        if (noCrossingTen && doesCross) continue;

        if (crossingTen === "always" && !doesCross) continue;
        if (crossingTen === "never" && doesCross) continue;

        // Százasátlépés (tens column crossing) – 1000-ig
        const doesCrossHundreds = Math.floor((a % 100) / 10) < Math.floor((b % 100) / 10);

        if (crossHundreds === "always" && !doesCrossHundreds) continue;
        if (crossHundreds === "never" && doesCrossHundreds) continue;

        tasks.push({ a, b, interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
