import { generateAddition } from "./additionGenerator.js?v=3";
import { generateMissingTo10 } from "./missingNumberGenerator.js?v=3";

export function generate(step) {

    switch (step.generator) {

        case "addition":
            return generateAddition(step.options);
        case "missing-to-10":
            return generateMissingTo10(step.options);
        case "subtraction":
        case "multiplication":
        case "division":

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}