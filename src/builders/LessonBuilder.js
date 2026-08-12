import { generate } from "../generators/index.js?v=3";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    addition: {
        postman: (i) => `🏠 ${i}. ház`,
        racing: (i) => `🏎️ ${i}. kör`,
        football: (i) => `⚽ ${i}. gól`,
        cooking: (i) => `🍳 ${i}. tányér`
    },
    subtraction: {
        postman: (i) => `🎒 ${i}. táska`,
        racing: (i) => `🛞 ${i}. kerék`,
        football: (i) => `⚽ ${i}. félidő`,
        cooking: (i) => `🍳 ${i}. étel`
    }
};

function getTitle(kind, index) {
    const world = getActiveWorld();
    const templates = WORLD_TITLES[kind];
    if (templates && templates[world]) {
        return templates[world](index + 1);
    }
    if (templates && templates.postman) {
        return templates.postman(index + 1);
    }
    return `❓ ${index + 1}.`;
}

export function buildLesson(lesson) {

    const steps = lesson.steps || [];

    const result = [];

    for (const step of steps) {

        if (step.type !== "exercise") {
            result.push(step);
            continue;
        }

        const tasks = generate(step);

        tasks.forEach((task, index) => {

            if (step.generator === "missing-to-10" || step.generator === "missing-random") {
                result.push({
                    type: "missing-number",
                    a: task.a,
                    sum: task.sum,
                    answer: task.answer
                });
            } else if (step.generator === "comparison") {
                result.push({
                    type: "comparison",
                    leftExpr: task.leftExpr,
                    rightExpr: task.rightExpr,
                    leftValue: task.leftValue,
                    rightValue: task.rightValue,
                    operator: task.operator
                });
            } else if (step.generator === "neighbor") {
                result.push({
                    type: "neighbor",
                    a: task.a,
                    left: task.left,
                    right: task.right,
                    answer: task.answer,
                    lowerTen: task.lowerTen,
                    upperTen: task.upperTen
                });
            } else if (step.generator === "neighbor-single") {
                result.push({
                    type: "neighbor-single",
                    a: task.a,
                    question: task.question,
                    answer: task.answer
                });
            } else if (step.generator === "subtraction") {
                result.push({
                    type: "exercise",
                    kind: "subtraction",
                    title: getTitle("subtraction", index),
                    a: task.a,
                    b: task.b
                });
            } else if (step.generator === "mixed") {
                result.push({
                    type: "exercise",
                    kind: "mixed",
                    title: `❓ ${index + 1}.`,
                    op: task.op,
                    a: task.a,
                    b: task.b,
                    answer: task.answer,
                    inputPos: task.inputPos
                });
            } else if (step.generator === "place-value") {
                result.push({
                    type: "place-value",
                    tens: task.tens,
                    ones: task.ones,
                    answer: task.answer
                });
            } else if (step.generator === "place-value-two-input") {
                result.push({
                    type: "place-value-two-input",
                    tens: task.tens,
                    ones: task.ones,
                    answer: task.answer
                });
            } else if (step.generator === "bridge-to-10") {
                result.push({
                    type: "bridge-ten",
                    a: task.a,
                    b: task.b,
                    complement: task.complement,
                    remainder: task.remainder,
                    sum: task.sum,
                    correctDecomp: task.correctDecomp,
                    options: task.options
                });
            } else if (step.generator === "sequence") {
                result.push({
                    type: "sequence",
                    terms: task.terms,
                    answer: task.answer
                });
            } else if (step.generator === "order") {
                result.push({
                    type: "order",
                    values: task.values,
                    direction: task.direction,
                    answer: task.answer
                });
            } else if (step.generator === "even-odd") {
                result.push({
                    type: "even-odd",
                    numbers: task.numbers,
                    question: task.question,
                    answer: task.answer
                });
            } else if (step.generator === "pattern") {
                result.push({
                    type: "pattern",
                    terms: task.terms,
                    answer: task.answer,
                    options: task.options
                });
            } else if (step.generator === "shape-sort") {
                result.push({
                    type: "shape-sort",
                    categories: task.categories,
                    items: task.items
                });
            } else if (step.generator === "time") {
                result.push({
                    type: "time",
                    hour: task.hour,
                    minute: task.minute,
                    answer: task.answer,
                    options: task.options
                });
            } else if (step.generator === "position") {
                result.push({
                    type: "spatial",
                    ref: task.ref,
                    object: task.object,
                    position: task.position,
                    answer: task.answer,
                    options: task.options
                });
            } else if (step.generator === "money-pay") {
                result.push({
                    type: "money-pay",
                    emoji: task.emoji,
                    name: task.name,
                    price: task.price
                });
            } else if (step.generator === "money-compare") {
                result.push({
                    type: "money-compare",
                    leftCoins: task.leftCoins,
                    rightCoins: task.rightCoins,
                    operator: task.operator
                });
            } else if (step.generator === "money-enough") {
                result.push({
                    type: "money-enough",
                    emoji: task.emoji,
                    name: task.name,
                    coins: task.coins,
                    price: task.price,
                    enough: task.enough
                });
            } else if (step.generator === "measure-compare") {
                result.push({
                    type: "measure-compare",
                    objectA: task.objectA,
                    objectB: task.objectB,
                    startA: task.startA,
                    endA: task.endA,
                    startB: task.startB,
                    endB: task.endB,
                    lengthA: task.lengthA,
                    lengthB: task.lengthB,
                    answer: task.answer,
                    options: task.options
                });
            } else if (step.generator === "measure-squares") {
                result.push({
                    type: "measure-squares",
                    direction: task.direction,
                    emoji: task.emoji,
                    name: task.name,
                    length: task.length
                });
            } else if (step.generator === "word-problem") {
                result.push({
                    type: "word-problem",
                    ...task
                });
            } else {
                result.push({
                    type: "exercise",
                    kind: "addition",
                    title: getTitle("addition", index),
                    a: task.a,
                    b: task.b
                });
            }

        });

    }

    return {
        ...lesson,
        steps: result
    };

}
