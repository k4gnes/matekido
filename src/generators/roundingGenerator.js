import { makeOptions } from "../components/ui/optionHelper.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function roundToTen(n) {
    return Math.round(n / 10) * 10;
}

function roundToHundred(n) {
    return Math.round(n / 100) * 100;
}

export function generateRounding(options = {}) {

    const { count = 10, min = 10, max = 999, target = "mixed", interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const useHundreds = target === "hundreds" || (target === "mixed" && Math.random() < 0.5);

        let number;
        let answer;

        if (useHundreds) {
            do {
                number = Math.floor(Math.random() * (max - 50 + 1)) + 50;
            } while (number % 100 === 0 || number % 100 === 50);
            answer = roundToHundred(number);
        } else {
            do {
                number = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (number % 10 === 0);
            answer = roundToTen(number);
        }

        tasks.push({
            type: "rounding",
            number,
            target: useHundreds ? "hundreds" : "tens",
            answer,
            options: makeOptions(answer, Math.max(0, answer - 100), Math.min(max, answer + 100)),
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}