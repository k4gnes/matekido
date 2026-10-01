import { makeCarryParts } from "../math/placeValue.js";

const PLACES = [
    { key: "tens", value: 10 },
    { key: "ones", value: 1 }
];

export function generatePlaceValue(options = {}) {

    const { count = 10, max = 100, min = 1, carry = false } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const carryTask = carry ? makeCarryParts(PLACES, min, max) : null;

        if (carryTask) {

            const tens = carryTask.parts.find(part => part.key === "tens");
            const ones = carryTask.parts.find(part => part.key === "ones");

            tasks.push({
                tens: tens ? tens.count : 0,
                ones: ones ? ones.count : 0,
                answer: carryTask.sum
            });

            continue;

        }

        const num = Math.floor(Math.random() * Math.min(max, 100)) + 1;

        const tens = Math.floor(num / 10);
        const ones = num % 10;

        tasks.push({
            tens,
            ones,
            answer: num
        });

    }

    return tasks;

}
