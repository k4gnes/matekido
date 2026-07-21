import { generateAddition } from "./additionGenerator.js?v=3";
import { generateSubtraction } from "./substractionGenerator.js?v=3";
import { generateMixed } from "./mixedGenerator.js?v=3";
import { generateMissingTo10, generateMissingRandom } from "./missingNumberGenerator.js?v=3";
import { generateComparison } from "./comparisonGenerator.js?v=3";
import { generateNeighbor } from "./neighborGenerator.js?v=3";
import { generateNeighborSingle } from "./neighborSingleGenerator.js?v=3";

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
        case "neighbor-single":
            return generateNeighborSingle(step.options);
        case "subtraction":
            return generateSubtraction(step.options);
        case "mixed":
            return generateMixed(step.options);
        case "multiplication":
        case "division":

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}