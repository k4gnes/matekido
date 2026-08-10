import { COMPARE_OBJECTS } from "../data/measure.js?v=3";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeCompareTask() {
    const pool = [...COMPARE_OBJECTS];
    const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const b = pool[Math.floor(Math.random() * pool.length)];

    const lengthA = rand(3, 6);
    const startA = rand(0, 2);
    const endA = startA + lengthA;

    const equal = Math.random() < 0.2;
    let lengthB;
    if (equal) {
        lengthB = lengthA;
    } else {
        do {
            lengthB = rand(3, 6);
        } while (lengthB === lengthA);
    }
    const startB = rand(0, 2);
    const endB = startB + lengthB;

    const answer = lengthA > lengthB ? "A" : lengthB > lengthA ? "B" : "equal";

    const options = shuffle([
        { text: `${a.emoji} ${a.name}`, correct: answer === "A" },
        { text: `${b.emoji} ${b.name}`, correct: answer === "B" },
        { text: "Egyformán hosszúak", correct: answer === "equal" }
    ]);

    return {
        objectA: a,
        objectB: b,
        startA, endA, startB, endB,
        lengthA, lengthB,
        answer,
        options
    };
}

export function generateMeasureCompare(options = {}) {
    const count = options.count ?? 6;
    return Array.from({ length: count }, makeCompareTask);
}
