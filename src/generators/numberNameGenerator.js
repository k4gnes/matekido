import { makeOptions } from "../components/ui/optionHelper.js";
import { numberToWords } from "../math/number.js?v=2";

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateNumberName(options = {}) {

    const { count = 8, min = 10, max = 999, direction = "mixed", allowRound = false } = options;

    if (max < min) {
        throw new Error("A max értéknek legalább akkora kell lennie, mint a min.");
    }

    if (max - min < 3) {
        throw new Error(`A ${min}–${max} tartomány túl szűk: legalább 4 különböző szám kell a válaszlehetőségekhez.`);
    }

    function pickNumber() {

        if (allowRound) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const num = Math.floor(Math.random() * (max - min + 1)) + min;

        if (num % 10 !== 0) return num;
        if (num + 1 <= max) return num + 1;
        if (num - 1 >= min) return num - 1;

        throw new Error(`A ${min}–${max} tartományban nincs 10-re nem végződő szám. Használd az allowRound: true opciót.`);

    }

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const number = pickNumber();

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