/**
 * Összeadási feladatok generálása.
 * A generátor nem tud semmit a játékról.
 * Csak feladatokat készít.
 */

const MAX_GENERATION_ATTEMPTS = 10000;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    return shuffle(options);
}

export function generateAddition(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 99,
        carry = "any",
        sumMin = min * 2,
        sumMax = Number.MAX_SAFE_INTEGER,
        multiplesOfTen = false,
        bMultiplesOfTen = false,
        bMax = null,
        bMin = null,
        noCrossTen = false,
        interaction = "mixed"
    } = options;

    const validCarryModes = ["never", "always", "any"];

    if (!validCarryModes.includes(carry)) {
        throw new Error(
            `Érvénytelen carry érték: ${carry}`
        );
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {

        attempts++;

        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error(
                "Nem sikerült elegendő feladatot generálni a megadott feltételekkel."
            );
        }

        // Első szám kiválasztása
        let a = random(min, max);

        // Kerek tízes: csak 10, 20, 30, ...
        if (multiplesOfTen) {
            a = Math.ceil(a / 10) * 10;
            if (a > max) continue;
        }

        // Meghatározzuk, milyen tartományból választható a második szám
        const minB = bMin !== null ? Math.max(bMin, sumMin - a) : Math.max(min, sumMin - a);
        let maxB = Math.min(max, sumMax - a);
        if (bMax !== null) {
            maxB = Math.min(maxB, bMax);
        }

        // Nincs érvényes második szám ehhez az 'a'-hoz
        if (minB > maxB) {
            continue;
        }

        let b = random(minB, maxB);

        // Kerek tízes: b is legyen 10-es többszöröse
        if (multiplesOfTen) {
            b = Math.ceil(b / 10) * 10;
            if (b < minB || b > maxB) continue;
        }

        // Csak b legyen kerek tizes (a véletlen marad)
        if (bMultiplesOfTen) {
            b = Math.ceil(b / 10) * 10;
            if (b < minB || b > maxB) continue;
        }

        // Tízesátlépés tiltása: b ne legyen nagyobb, mint a hiányzó egyesek a következő tizesig
        if (noCrossTen) {
            const onesA = a % 10;
            if (onesA === 0) continue;
            const remaining = 10 - onesA;
            if (b > remaining) continue;
        }

        // Biztonsági szűrő: az összeg ne haladja meg a megengedett maximumot
        if (a + b > sumMax || a + b < sumMin) {
            continue;
        }

        // Átlépés tiltása
        const carryResult = hasCarry(a, b);

        if (carry === "never" && carryResult) {
            continue;
        }

        if (carry === "always" && !carryResult) {
            continue;
        }

        tasks.push({
            a,
            b,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasCarry(a, b) {

    const onesA = a % 10;
    const onesB = b % 10;

    return onesA + onesB >= 10;
}