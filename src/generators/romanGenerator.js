import { makeOptions } from "../components/ui/optionHelper.js";

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const SYMBOLS = [
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
];

export function toRoman(number) {

    let n = number;
    let result = "";

    for (const [value, symbol] of SYMBOLS) {
        while (n >= value) {
            result += symbol;
            n -= value;
        }
    }

    return result;
}

export function generateRoman(options = {}) {

    const { count = 8, min = 1, max = 100, direction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const number = Math.floor(Math.random() * (max - min + 1)) + min;

        const dir = direction === "mixed"
            ? (Math.random() < 0.5 ? "toRoman" : "toNumber")
            : direction;

        const candidates = makeOptions(number, min, max);

        if (dir === "toRoman") {
            const romans = shuffle(candidates.map(toRoman));
            tasks.push({
                number,
                roman: toRoman(number),
                options: romans,
                answer: toRoman(number),
                direction: "toRoman"
            });
        } else {
            tasks.push({
                number,
                roman: toRoman(number),
                options: shuffle(candidates),
                answer: number,
                direction: "toNumber"
            });
        }
    }

    return tasks;
}