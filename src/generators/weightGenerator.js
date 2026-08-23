const ITEMS = [
    { id: "lufi", emoji: "🎈", name: "lufi", grams: 5 },
    { id: "toll", emoji: "🖊️", name: "toll", grams: 10 },
    { id: "alma", emoji: "🍎", name: "alma", grams: 150 },
    { id: "labda", emoji: "⚽", name: "labda", grams: 400 },
    { id: "kenyer", emoji: "🍞", name: "kenyér", grams: 500 },
    { id: "konyv", emoji: "📖", name: "könyv", grams: 600 },
    { id: "hatizsak", emoji: "🎒", name: "hátizsák", grams: 900 },
    { id: "tej", emoji: "🥛", name: "liter tej", grams: 1000 }
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateWeight(options = {}) {

    const { count = 6, minRatio = 4 } = options;

    const tasks = [];
    const usedPairs = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts < count * 50) {
        attempts++;

        const a = pick(ITEMS);
        const b = pick(ITEMS);

        if (a.id === b.id) continue;
        if (a.grams > b.grams ? a.grams / b.grams < minRatio : b.grams / a.grams < minRatio) continue;

        const key = [a.id, b.id].sort().join("|");
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);

        const question = Math.random() < 0.5 ? "nehezebb" : "könnyebb";
        const heavierSide = a.grams > b.grams ? "left" : "right";

        tasks.push({
            type: "weight",
            left: { emoji: a.emoji, name: a.name },
            right: { emoji: b.emoji, name: b.name },
            question,
            answer: question === "nehezebb" ? heavierSide : heavierSide === "left" ? "right" : "left"
        });
    }

    return tasks;
}
