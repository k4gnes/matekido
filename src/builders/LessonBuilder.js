import { generate } from "../generators/index.js?v=3";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    addition: {
        postman: (i) => `🏠 ${i}. ház`,
        racing: (i) => `🏎️ ${i}. kör`,
        football: (i) => `⚽ ${i}. gól`
    },
    subtraction: {
        postman: (i) => `🎒 ${i}. táska`,
        racing: (i) => `🛞 ${i}. kerék`,
        football: (i) => `⚽ ${i}. félidő`
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
