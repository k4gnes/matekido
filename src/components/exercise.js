import { renderAddition } from "./addition.js";

export function renderExercise(step, root, next,progress) {

    switch (step.kind) {

        case "addition":
            renderAddition(step, root, next,progress);
           // renderAdditionHint(step, hint);
            break;

        default:
            console.error(
                "Ismeretlen feladattípus:",
                step.kind
            );

    }

}