const ORDER_SETS = {
    postman: [
        ["📮", "✉️", "📦"],
        ["📬", "🎁", "📮"],
        ["🔠", "🔡", "🔢"]
    ],
    racing: [
        ["🏎️", "🚗", "🚌"],
        ["🏁", "🚦", "🛞"],
        ["🥇", "🥈", "🥉"]
    ],
    cooking: [
        ["🍎", "🍌", "🍇"],
        ["🍅", "🥕", "🥦"],
        ["🍰", "🧁", "🍪"]
    ],
    football: [
        ["⚽", "🥅", "🧤"],
        ["👟", "🥅", "⛳"],
        ["🏆", "🥇", "🎽"]
    ],
    animals: [
        ["🐶", "🐱", "🐰"],
        ["🦁", "🐘", "🦒"],
        ["🐸", "🐢", "🐠"]
    ],
    space: [
        ["🚀", "🛸", "🛰️"],
        ["🌍", "🌙", "⭐"],
        ["☄️", "🛸", "🚀"]
    ],
    tram: [
        ["🚋", "🚌", "🚲"],
        ["🚏", "🚦", "🧳"],
        ["🎫", "🧳", "🚋"]
    ]
};

const DEFAULT_SETS = [
    ["🐶", "🐱", "🐰"],
    ["🍎", "🍌", "🍇"],
    ["🔴", "🔵", "🟢"],
    ["⭐", "🌙", "☀️"],
    ["🚗", "🚌", "🚲"]
];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickSet(world) {
    const pool = ORDER_SETS[world] ?? DEFAULT_SETS;
    return shuffle([...pool[Math.floor(Math.random() * pool.length)]]);
}

function generateOrderTask(world) {
    const items = pickSet(world);
    return {
        type: "combinatorics",
        mode: "order",
        items,
        total: 6,
        question: "Add meg a következő új sorrendet!"
    };
}

export function generateCombinatorics(opts = {}) {
    const { count = 1, world } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateOrderTask(world));
    }
    return tasks;
}
