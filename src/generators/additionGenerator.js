/**
 * Kétjegyű összeadások generálása.
 * A generátor nem tud semmit a játékról.
 * Csak feladatokat készít.
 */

export function generateAddition(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 99,
        carry = true
    } = options;

    const tasks = [];

    while (tasks.length < count) {

        const a = random(min, max);
        const b = random(min, max);

        if (!carry && hasCarry(a, b)) {
            continue;
        }

        tasks.push({
            type: "addition",
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