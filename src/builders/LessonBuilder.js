import { generateAddition } from "../generators/additionGenerator.js";

export function buildLesson(lesson) {

    const steps = [];

    for (const step of lesson.steps) {

        if (step.type !== "exercise") {
            steps.push(step);
            continue;
        }

        switch (step.generator) {

            case "addition":

                const tasks = generateAddition(step.options);

                tasks.forEach((task, index) => {

                    steps.push({
                        type: "addition",
                        title: `🏠 ${index + 1}. ház`,
                        a: task.a,
                        b: task.b
                    });

                });

                break;


            default:
                console.error(
                    "Ismeretlen generátor:",
                    step.generator
                );
        }
    }

    return {
        ...lesson,
        steps
    };
}