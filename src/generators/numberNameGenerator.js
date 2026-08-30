import { makeOptions } from "../components/ui/optionHelper.js";
import { numberToWords } from "../math/number.js";

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateNumberName(options = {}) {

    const { count = 8, min = 10, max = 999, direction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        let number;
        do {
            number = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (number % 10 === 0);

        const dir = direction === "mixed"
            ? (Math.random() < 0.5 ? "toWord" : "toNumber")
            : direction;

        const candidates = makeOptions(number, min, max);

        if (dir === "toWord") {
            const words = shuffle(candidates.map(numberToWords));
            tasks.push({
                number,
                word: numberToWords(number),
                options: words,
                answer: numberToWords(number),
                direction: "toWord"
            });
        } else {
            tasks.push({
                number,
                word: numberToWords(number),
                options: shuffle(candidates),
                answer: number,
                direction: "toNumber"
            });
        }
    }

    return tasks;
}