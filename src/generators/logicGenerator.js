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

function buildTask() {
    const tasks = [
        {
            question: "Igaz-e: Minden páros szám osztható 2-vel?",
            options: [
                { text: "Igaz", correct: true },
                { text: "Hamis", correct: false }
            ]
        },
        {
            question: "Igaz-e: Van olyan háromszög, amelynek szögei 90°, 60°, 30°?",
            options: [
                { text: "Igaz", correct: true },
                { text: "Hamis", correct: false }
            ]
        },
        {
            question: "Igaz-e: Minden prímszám páratlan?",
            options: [
                { text: "Hamis", correct: true },
                { text: "Igaz", correct: false }
            ]
        },
        {
            question: "Igaz-e: Van olyan egész szám, amely nem pozitív és nem negatív?",
            options: [
                { text: "Igaz", correct: true },
                { text: "Hamis", correct: false }
            ]
        },
        {
            question: "Igaz-e: Ha egy szám osztható 3-mal, akkor osztható 9-cel is?",
            options: [
                { text: "Hamis", correct: true },
                { text: "Igaz", correct: false }
            ]
        },
        {
            question: "Igaz-e: Minden négyzet téglalap?",
            options: [
                { text: "Igaz", correct: true },
                { text: "Hamis", correct: false }
            ]
        }
    ];
    const t = pick(tasks);
    return {
        type: "logic",
        mode: "true-false",
        question: t.question,
        options: shuffle(t.options)
    };
}

export function generateLogic(options = {}) {
    const { count = 5 } = options;
    const tasks = [];
    const seen = new Set();
    for (let i = 0; i < count; i++) {
        let task = buildTask();
        let tries = 0;
        while (seen.has(task.question) && tries < 20) {
            task = buildTask();
            tries++;
        }
        seen.add(task.question);
        tasks.push(task);
    }
    return tasks;
}
