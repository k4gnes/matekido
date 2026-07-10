import { renderAddition } from "./addition.js";

export function renderExercise(step, root, next) {

    switch (step.kind) {

        case "addition":
            renderAddition(step, root, next);
            break;

        default:
            console.error(
                "Ismeretlen feladattípus:",
                step.kind
            );

    }

}