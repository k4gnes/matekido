const CONTAINERS = [
    { id: "kanal", emoji: "🥄", name: "kanál", dl: 0.5 },
    { id: "bogre", emoji: "☕", name: "bögre", dl: 3 },
    { id: "palack", emoji: "🍾", name: "palack", dl: 7 },
    { id: "tej", emoji: "🥛", name: "liter tej", dl: 10 },
    { id: "kancso", emoji: "🏺", name: "kancsó", dl: 20 },
    { id: "kád", emoji: "🛁", name: "fürdőkád", dl: 1500 }
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateVolume(options = {}) {

    const { count = 6, minRatio = 4 } = options;

    const tasks = [];
    const usedPairs = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts < count * 50) {
        attempts++;

        const a = pick(CONTAINERS);
        const b = pick(CONTAINERS);

        if (a.id === b.id) continue;
        if (a.dl > b.dl ? a.dl / b.dl < minRatio : b.dl / a.dl < minRatio) continue;

        const key = [a.id, b.id].sort().join("|");
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);

        const question = Math.random() < 0.5 ? "több" : "kevesebb";
        const biggerSide = a.dl > b.dl ? "left" : "right";

        tasks.push({
            type: "volume",
            left: { emoji: a.emoji, name: a.name },
            right: { emoji: b.emoji, name: b.name },
            question,
            answer: question === "több" ? biggerSide : biggerSide === "left" ? "right" : "left"
        });
    }

    return tasks;
}
