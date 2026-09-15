function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const CATEGORIES = ["acute", "right", "obtuse"];

const LABELS = {
    acute: "Hegyes",
    right: "Derékszög",
    obtuse: "Tompa"
};

function generateAngle() {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    let angle;
    if (cat === "acute") {
        angle = random(4, 14) * 5;
    } else if (cat === "right") {
        angle = 90;
    } else {
        angle = random(22, 31) * 5;
    }
    const correctLabel = LABELS[cat];
    const otherLabels = CATEGORIES
        .filter(c => c !== cat)
        .map(c => LABELS[c]);
    const options = shuffle([correctLabel, ...otherLabels]);

    return {
        type: "angles",
        angle,
        category: cat,
        answer: options.indexOf(correctLabel),
        options,
        correctLabel
    };
}

export function generateAngles(opts = {}) {
    const { count = 6 } = opts;
    const tasks = [];
    for (let i = 0; i < count; i++) {
        tasks.push(generateAngle());
    }
    return tasks;
}