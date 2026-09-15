function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const LABELS = {
    certain: "Biztos",
    possible: "Lehetséges",
    impossible: "Lehetetlen"
};

const EVENTS = {
    certain: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Páros vagy páratlan számot kapunk." },
        { emoji: "🌞", text: "Holnapra virrad, és új nap kezdődik." },
        { emoji: "🍎", text: "Az almának van magja." },
        { emoji: "🐟", text: "A hal a vízben él." }
    ],
    possible: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Hatost dobunk." },
        { emoji: "☂️", text: "Holnap esik az eső." },
        { emoji: "⚽", text: "A kedvenc csapatunk megnyeri a meccset." },
        { emoji: "🍬", text: "A zacskóban citromízű és eperízű cukorka is van. Citromízűt húzunk belőle." }
    ],
    impossible: [
        { emoji: "🎲", text: "Egy dobókockával dobunk. Hetest dobunk." },
        { emoji: "🐱", text: "A macska megtanul repülni." },
        { emoji: "🌙", text: "Nappal a Hold és a csillagok ragyognak." },
        { emoji: "🧊", text: "A puszta nyáron hó esik." }
    ]
};

const CATEGORIES = ["certain", "possible", "impossible"];

function generateTask() {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const event = EVENTS[cat][Math.floor(Math.random() * EVENTS[cat].length)];
    const correctLabel = LABELS[cat];
    const otherLabels = CATEGORIES
        .filter(c => c !== cat)
        .map(c => LABELS[c]);
    const options = shuffle([correctLabel, ...otherLabels]);

    return {
        type: "probability",
        emoji: event.emoji,
        text: event.text,
        category: cat,
        answer: options.indexOf(correctLabel),
        options,
        correctLabel
    };
}

export function generateProbability(opts = {}) {
    const { count = 6 } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateTask());
    }
    return tasks;
}