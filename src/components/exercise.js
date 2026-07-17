import { renderAddition } from "./addition.js";
import { renderSubtraction } from "./subtraction.js";

export function renderExercise(step, root, next,progress) {

    switch (step.kind) {

        case "addition":
            renderAddition(step, root, next,progress);
            break;

        case "subtraction":
            renderSubtraction(step, root, next, progress);
            break;

        default:
            console.error(
                "Ismeretlen feladattípus:",
                step.kind
            );

    }

}