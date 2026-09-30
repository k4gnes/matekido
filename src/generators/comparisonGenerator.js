function spreadEqualSlots(count, forceEqual) {

    if (forceEqual <= 0 || count <= 1) return [];

    const total = Math.max(1, Math.min(forceEqual, Math.ceil(count / 2)));

    if (total === 1) {
        return [1 + Math.floor(Math.random() * (count - 1))];
    }

    const slots = [];
    let index = Math.floor(Math.random() * 2);

    while (slots.length < total && index < count) {
        slots.push(index);
        index += 2;
    }

    return slots;
}

export function generateComparison(options = {}) {

    const { count = 10, min = 0, max = 20, emoji, plain = false, forceEqual = 0 } = options;

    const showEmoji = emoji ?? (!plain && max <= 20);

    const equalSlots = new Set(spreadEqualSlots(count, forceEqual));

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const makeEqual = equalSlots.has(i);
        const previousEqual = i > 0 && tasks[i - 1].operator === "=";

        const left = plain ? randomPlainNumber(min, max) : randomExpression(max);

        let right = makeEqual
            ? (plain ? { expr: String(left.value), value: left.value } : randomExpressionEqualTo(left.value))
            : (plain ? randomPlainNumber(min, max) : randomExpression(max));

        if (!makeEqual && previousEqual && left.value === right.value) {
            right = plain
                ? differentPlainNumber(left.value, min, max)
                : differentExpression(left.value, max);
        }

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

function randomPlainNumber(min, max) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    return { expr: String(value), value };
}

function differentPlainNumber(value, min, max) {
    for (let attempt = 0; attempt < 20; attempt++) {
        const candidate = Math.floor(Math.random() * (max - min + 1)) + min;
        if (candidate !== value) return { expr: String(candidate), value: candidate };
    }
    const fallback = value + 1 <= max ? value + 1 : value - 1;
    return { expr: String(fallback), value: fallback };
}

function differentExpression(value, max) {
    for (let attempt = 0; attempt < 20; attempt++) {
        const candidate = randomExpression(max);
        if (candidate.value !== value) return candidate;
    }
    const offset = value + 1 <= max ? 1 : -1;
    return { expr: `${Math.max(0, value + offset)} + 0`, value: Math.max(0, value + offset) };
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

function randomExpressionEqualTo(value) {
    if (value <= 0) return { expr: String(value), value };
    const a = Math.floor(Math.random() * value);
    return { expr: `${a} + ${value - a}`, value };
}
