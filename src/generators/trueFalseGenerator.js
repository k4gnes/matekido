function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAdditionTF(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(5, max - 5);
        const b = randint(2, max - a);
        const correct = a + b;
        const isCorrect = Math.random() < 0.5;

        if (isCorrect) {
            tasks.push({
                type: "true-false",
                statement: `${a} + ${b} = ${correct}`,
                answer: true
            });
        } else {
            const wrong = correct + pick([-3, -2, -1, 1, 2, 3]);
            tasks.push({
                type: "true-false",
                statement: `${a} + ${b} = ${wrong}`,
                answer: false
            });
        }
    }
    return tasks;
}

function generateSubtractionTF(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const a = randint(10, max);
        const b = randint(3, a - 2);
        const correct = a - b;
        const isCorrect = Math.random() < 0.5;

        if (isCorrect) {
            tasks.push({
                type: "true-false",
                statement: `${a} − ${b} = ${correct}`,
                answer: true
            });
        } else {
            const wrong = correct + pick([-3, -2, -1, 1, 2, 3]);
            tasks.push({
                type: "true-false",
                statement: `${a} − ${b} = ${wrong}`,
                answer: false
            });
        }
    }
    return tasks;
}

function generateMixedTF(count, max) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.5) {
            const a = randint(5, max - 5);
            const b = randint(2, max - a);
            const correct = a + b;
            const isCorrect = Math.random() < 0.5;

            if (isCorrect) {
                tasks.push({
                    type: "true-false",
                    statement: `${a} + ${b} = ${correct}`,
                    answer: true
                });
            } else {
                const wrong = correct + pick([-3, -2, -1, 1, 2, 3]);
                tasks.push({
                    type: "true-false",
                    statement: `${a} + ${b} = ${wrong}`,
                    answer: false
                });
            }
        } else {
            const a = randint(10, max);
            const b = randint(3, a - 2);
            const correct = a - b;
            const isCorrect = Math.random() < 0.5;

            if (isCorrect) {
                tasks.push({
                    type: "true-false",
                    statement: `${a} − ${b} = ${correct}`,
                    answer: true
                });
            } else {
                const wrong = correct + pick([-3, -2, -1, 1, 2, 3]);
                tasks.push({
                    type: "true-false",
                    statement: `${a} − ${b} = ${wrong}`,
                    answer: false
                });
            }
        }
    }
    return tasks;
}

export function generateTrueFalse(options = {}) {
    const { count = 8, max = 50, op = "mixed" } = options;

    switch (op) {
        case "addition":
            return generateAdditionTF(count, max);
        case "subtraction":
            return generateSubtractionTF(count, max);
        case "mixed":
        default:
            return generateMixedTF(count, max);
    }
}
