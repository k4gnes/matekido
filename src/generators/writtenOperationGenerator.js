const MAX_GENERATION_ATTEMPTS = 10000;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isInt(x) {
    return Number.isInteger(x);
}

function carryColumns(left, right) {
    const cols = [];
    let carry = 0;
    let l = left;
    let r = right;
    let col = 1;
    while (l > 0 || r > 0 || carry > 0) {
        const sum = (l % 10) + (r % 10) + carry;
        carry = sum >= 10 ? 1 : 0;
        if (carry) cols.push(col);
        l = Math.floor(l / 10);
        r = Math.floor(r / 10);
        col++;
    }
    return cols;
}

function borrowColumns(minuend, subtrahend) {
    const cols = [];
    let borrow = 0;
    let l = minuend;
    let r = subtrahend;
    let col = 1;
    while (l > 0 || r > 0) {
        const ld = (l % 10) - borrow;
        const rd = r % 10;
        borrow = ld < rd ? 1 : 0;
        if (borrow) cols.push(col);
        l = Math.floor(l / 10);
        r = Math.floor(r / 10);
        col++;
    }
    return cols;
}

function mulCarryColumns(a, b) {
    const cols = [];
    const digits = String(a).split("").map(Number);
    digits.forEach((d, i) => {
        if (d * b >= 10) cols.push(digits.length - i);
    });
    return cols;
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
        bMin = 2,
        bMax = 9,
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

    if (op === "mul" && (!isInt(bMin) || !isInt(bMax) || bMin < 1 || bMax > 9 || bMin > bMax)) {
        throw new Error(`Érvénytelen szorzótartomány: ${bMin}..${bMax}`);
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

            const carryResult = carryColumns(a, b).length > 0;

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

        } else if (op === "mul") {

            const b = random(bMin, bMax);
            const result = a * b;

            if (result < resultMin || result > resultMax) {
                continue;
            }

            const carryResult = mulCarryColumns(a, b).length > 0;

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

            const borrowResult = borrowColumns(a, b).length > 0;

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