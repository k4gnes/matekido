export function generateComparison(options = {}) {

    const { count = 10, max = 20, emoji, plain = false } = options;

    const showEmoji = emoji ?? (!plain && max <= 20);

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const left = plain ? randomPlainNumber(max) : randomExpression(max);
        const right = plain ? randomPlainNumber(max) : randomExpression(max);

        let operator;

        if (left.value === right.value) {
            operator = "=";
        } else if (left.value > right.value) {
            operator = ">";
        } else {
            operator = "<";
        }

        tasks.push({
            type: "comparison",
            leftExpr: left.expr,
            rightExpr: right.expr,
            leftValue: left.value,
            rightValue: right.value,
            operator,
            emoji: showEmoji
        });
    }

    return tasks;
}

function randomPlainNumber(max) {
    const value = Math.floor(Math.random() * (max + 1));
    return { expr: String(value), value };
}

function randomExpression(max) {

    const useAddition = Math.random() < 0.5;

    if (useAddition) {
        const a = Math.floor(Math.random() * (max + 1));
        const b = Math.floor(Math.random() * (max - a + 1));
        return { expr: `${a} + ${b}`, value: a + b };
    } else {
        const a = Math.floor(Math.random() * (max + 1));
        const b = Math.floor(Math.random() * (a + 1));
        return { expr: `${a} - ${b}`, value: a - b };
    }
}