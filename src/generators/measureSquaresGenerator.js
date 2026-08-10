import { SQUARE_OBJECTS } from "../data/measure.js?v=3";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeSquaresTask() {
    const directions = ["horizontal", "tall", "deep"];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const list = SQUARE_OBJECTS[direction];
    const obj = list[Math.floor(Math.random() * list.length)];

    return {
        direction,
        emoji: obj.emoji,
        name: obj.name,
        length: rand(4, 12)
    };
}

export function generateMeasureSquares(options = {}) {
    const count = options.count ?? 6;
    return Array.from({ length: count }, makeSquaresTask);
}
