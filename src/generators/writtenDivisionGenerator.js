const MAX_GENERATION_ATTEMPTS = 10000;

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dividerSteps(a, b) {
    const digits = String(a).split("").map(Number);
    const steps = [];
    let remainder = 0;
    for (const d of digits) {
        const partial = remainder * 10 + d;
        const qd = Math.floor(partial / b);
        const product = qd * b;
        remainder = partial - product;
        steps.push({
            partial,
            qd,
            product,
            remainder
        });
    }
    const quotient = Number(steps.map(s => s.qd).join(""));
    return { quotient, steps };
}

export function generateWrittenDivision(options = {}) {

    const {
        count = 6,
        min = 100,
        max = 999,
        divisors = [2, 3, 4, 5, 6, 7, 8, 9],
        firstDigitGe = true,
        withZeroRemainder = false
    } = options;

    if (!Array.isArray(divisors) || divisors.length === 0) {
        throw new Error(`Érvénytelen osztótartomány: ${divisors}`);
    }

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {

        attempts++;

        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő írásbeli osztást generálni.");
        }

        const b = divisors[Math.floor(Math.random() * divisors.length)];
        const firstDigitMin = firstDigitGe ? b : 1;
        const maxFirst = 9;
        const first = random(firstDigitMin, maxFirst);
        const second = random(0, 9);
        const third = random(0, 9);
        const a = first * 100 + second * 10 + third;

        if (a < min || a > max) {
            continue;
        }

        const { quotient, steps } = dividerSteps(a, b);

        if (quotient < 100 || quotient > 999) {
            continue;
        }

        if (!withZeroRemainder && steps[steps.length - 1].remainder === 0) {
            continue;
        }

        tasks.push({
            a,
            b,
            quotient,
            remainder: steps[steps.length - 1].remainder,
            steps,
            interaction: "input"
        });
    }

    return tasks;
}