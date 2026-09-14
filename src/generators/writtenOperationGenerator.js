const MAX_GENERATION_ATTEMPTS = 10000;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateWrittenOperation(options = {}) {

    const {
        count = 8,
        op = "add",
        min = 100,
        max = 999,
        carry = "any",
        borrow = "any",
        resultMin = 100,
        resultMax = 999,
        interaction = "mixed"
    } = options;

    const validCarryModes = ["never", "always", "any"];

    if (!validCarryModes.includes(carry)) {
        throw new Error(`Érvénytelen carry érték: ${carry}`);
    }

    const validBorrowModes = ["never", "always", "any"];

    if (!validBorrowModes.includes(borrow)) {
        throw new Error(`Érvénytelen borrow érték: ${borrow}`);
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {

        attempts++;

        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő írásbeli feladatot generálni.");
        }

        const a = random(min, max);

        if (op === "add") {

            const minB = Math.max(min, resultMin - a);
            const maxB = Math.min(max, resultMax - a);

            if (minB > maxB) {
                continue;
            }

            const b = random(minB, maxB);
            const result = a + b;

            if (result < resultMin || result > resultMax) {
                continue;
            }

            const onesCarry = (a % 10) + (b % 10) >= 10;
            const tensA = Math.floor(a / 10) % 10;
            const tensB = Math.floor(b / 10) % 10;
            const tensCarry = tensA + tensB + (onesCarry ? 1 : 0) >= 10;
            const carryResult = onesCarry || tensCarry;

            if (carry === "always" && !carryResult) {
                continue;
            }

            if (carry === "never" && carryResult) {
                continue;
            }

            tasks.push({
                op,
                a,
                b,
                answer: result,
                interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
            });

        } else {

            const minB = Math.max(min, a - resultMax);
            const maxB = Math.min(max, a - resultMin);

            if (minB > maxB) {
                continue;
            }

            const b = random(minB, maxB);
            const result = a - b;

            if (result < resultMin || result > resultMax) {
                continue;
            }

            const onesBorrow = (a % 10) < (b % 10);
            const tensA = Math.floor(a / 10) % 10;
            const tensB = Math.floor(b / 10) % 10;
            const tensBorrow = tensA - (onesBorrow ? 1 : 0) < tensB;
            const borrowResult = onesBorrow || tensBorrow;

            if (borrow === "always" && !borrowResult) {
                continue;
            }

            if (borrow === "never" && borrowResult) {
                continue;
            }

            tasks.push({
                op,
                a,
                b,
                answer: result,
                interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
            });
        }
    }

    return tasks;
}