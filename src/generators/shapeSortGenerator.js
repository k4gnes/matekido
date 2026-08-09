import { SHAPE_CATEGORIES } from "../data/shapes.js";

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateShapeSort(options = {}) {

    const { count = 5, categories = ["circle", "rectangle"], perRound = 5 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const used = new Set();
        const items = [];

        const cats = shuffle([...categories]);

        for (const cat of cats) {
            const candidates = shuffle([...SHAPE_CATEGORIES[cat].emojis]);
            const pick = candidates.find(e => !used.has(e));
            if (pick) {
                used.add(pick);
                items.push({ value: pick, category: cat });
            }
        }

        const all = shuffle(
            categories.flatMap(cat =>
                SHAPE_CATEGORIES[cat].emojis.map(e => ({ value: e, category: cat }))
            )
        );

        for (const x of all) {
            if (items.length >= perRound) break;
            if (used.has(x.value)) continue;
            used.add(x.value);
            items.push(x);
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
