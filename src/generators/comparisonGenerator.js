function spreadEqualSlots(count, forceEqual) {

    const slots = [];

    if (forceEqual <= 0 || count <= 0) return slots;

    const total = Math.min(forceEqual, count);

    if (total >= count) {
        for (let i = 0; i < count; i++) slots.push(i);
        return slots;
    }

    if (total === 1) {
        slots.push(1 + Math.floor(Math.random() * (count - 1)));
        return slots;
    }

    const gap = Math.max(2, Math.floor(count / total));
    for (let i = 0; i < total; i++) {
        slots.push(Math.min(count - 1, i * gap + 1));
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

        const left = plain ? randomPlainNumber(min, max) : randomExpression(max);

        const right = makeEqual
            ? (plain ? { expr: String(left.value), value: left.value } : randomExpressionEqualTo(left.value))
            : (plain ? randomPlainNumber(min, max) : randomExpression(max));

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
