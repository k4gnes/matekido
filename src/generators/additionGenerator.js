/**
 * Összeadási feladatok generálása.
 * A generátor nem tud semmit a játékról.
 * Csak feladatokat készít.
 */

const MAX_GENERATION_ATTEMPTS = 10000;

export function generateAddition(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 99,
        carry = "any",
        sumMin = min * 2,
        sumMax = Number.MAX_SAFE_INTEGER
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
        const a = random(min, max);

        // Meghatározzuk, milyen tartományból választható a második szám
        const minB = Math.max(min, sumMin - a);
        const maxB = Math.min(max, sumMax - a);

        // Nincs érvényes második szám ehhez az 'a'-hoz
        if (minB > maxB) {
            continue;
        }

        const b = random(minB, maxB);

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
            b
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