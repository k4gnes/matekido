const MAX_GENERATION_ATTEMPTS = 10000;

export function generateSubtraction(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 20,
        subMax = 20,
        multiplesOfTen = false,
        bMax = null,
        noCrossingTen = false
    } = options;

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

        // Tízesátlépés tiltása: b ne legyen nagyobb, mint a egyesei
        if (noCrossingTen) {
            const onesA = a % 10;
            if (onesA === 0) continue;
            if (b > onesA) continue;
        }

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

        if (a - b < 0) continue;

        tasks.push({ a, b });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
