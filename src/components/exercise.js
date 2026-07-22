import { renderAddition } from "./addition.js";
import { renderSubtraction } from "./subtraction.js";
import { renderMixed } from "./mixed.js";

export function renderExercise(step, root, next, progress, onResult, onAttempt) {

    const typedResult = (isCorrect) => onResult?.(isCorrect, step.kind);

    switch (step.kind) {

        case "addition":
            renderAddition(step, root, next, progress, typedResult, onAttempt);
            break;

        case "subtraction":
            renderSubtraction(step, root, next, progress, typedResult, onAttempt);
            break;

        case "mixed":
            renderMixed(step, root, next, progress, typedResult, onAttempt);
            break;

        default:
            console.error(
                "Ismeretlen feladattípus:",
                step.kind
            );

    }

}
