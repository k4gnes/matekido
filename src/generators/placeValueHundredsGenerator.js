import { makeCarryParts } from "../math/placeValue.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const PLACES = [
    { key: "hundreds", value: 100 },
    { key: "tens", value: 10 },
    { key: "ones", value: 1 }
];

export function generatePlaceValueHundreds(options = {}) {

    const { count = 10, min = 100, max = 999, interaction = "mixed", carry = false } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const carryTask = carry ? makeCarryParts(PLACES, min, max) : null;

        if (carryTask) {

            const part = key => carryTask.parts.find(p => p.key === key);

            tasks.push({
                hundreds: part("hundreds")?.count ?? 0,
                tens: part("tens")?.count ?? 0,
                ones: part("ones")?.count ?? 0,
                answer: carryTask.sum,
                interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
            });

            continue;

        }

        const num = Math.floor(Math.random() * (max - min + 1)) + min;

        const hundreds = Math.floor(num / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;

        tasks.push({
            hundreds,
            tens,
            ones,
            answer: num,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}
