import { generateAddition } from "./additionGenerator.js?v=3";
import { generateMissingTo10, generateMissingRandom } from "./missingNumberGenerator.js?v=3";
import { generateComparison } from "./comparisonGenerator.js?v=3";
import { generateNeighbor } from "./neighborGenerator.js?v=3";

export function generate(step) {

    switch (step.generator) {

        case "addition":
            return generateAddition(step.options);
        case "missing-to-10":
            return generateMissingTo10(step.options);
        case "missing-random":
            return generateMissingRandom(step.options);
        case "comparison":
            return generateComparison(step.options);
        case "neighbor":
            return generateNeighbor(step.options);
        case "subtraction":
        case "multiplication":
        case "division":

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}