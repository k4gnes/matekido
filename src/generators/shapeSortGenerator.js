import { SHAPE_CATEGORIES } from "../data/shapes.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4"];
const SIZES = [26, 34, 42];

export function generateShapeSort(options = {}) {

    const { count = 5, categories = ["circle", "rectangle"], perRound = 5 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const perCat = Math.max(1, Math.round(perRound / categories.length));
        const used = new Set();
        const items = [];
        let id = 0;

        for (const cat of shuffle([...categories])) {
            const kind = SHAPE_CATEGORIES[cat].kind;
            for (let k = 0; k < perCat; k++) {
                let color = pick(COLORS);
                let size = pick(SIZES);
                const combos = shuffle(COLORS.flatMap(c => SIZES.map(s => [c, s])));
                for (const [c, s] of combos) {
                    if (!used.has(kind + c + s)) {
                        color = c;
                        size = s;
                        break;
                    }
                }
                used.add(kind + color + size);
                items.push({ value: `s${id++}`, category: cat, kind, color, size });
            }
        }

        shuffle(items);

        tasks.push({
            type: "shape-sort",
            categories,
            items
        });
    }

    return tasks;

}