import { generate } from "../generators/index.js?v=3";

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
            } else if (step.generator === "subtraction") {
                result.push({
                    type: "exercise",
                    kind: "subtraction",
                    title: `🎒 ${index + 1}. táska`,
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
                    title: `🏠 ${index + 1}. ház`,
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