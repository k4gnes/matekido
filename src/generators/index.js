import { generateAddition } from "./additionGenerator.js?v=3";
import { generateSubtraction } from "./substractionGenerator.js?v=3";
import { generateMixed } from "./mixedGenerator.js?v=3";
import { generateMissingTo10, generateMissingRandom } from "./missingNumberGenerator.js?v=3";
import { generateComparison } from "./comparisonGenerator.js?v=3";
import { generateNeighbor } from "./neighborGenerator.js?v=3";
import { generateNeighborSingle } from "./neighborSingleGenerator.js?v=3";
import { generatePlaceValue } from "./placeValueGenerator.js?v=3";
import { generateBridgeTo10 } from "./bridgeTenGenerator.js?v=3";
import { generateSequence } from "./sequenceGenerator.js?v=3";
import { generateOrder } from "./orderGenerator.js?v=3";
import { generateEvenOdd } from "./evenOddGenerator.js?v=3";
import { generatePattern } from "./patternGenerator.js?v=3";
import { generateShapeSort } from "./shapeSortGenerator.js?v=3";
import { generateTime } from "./timeGenerator.js?v=3";
import { generatePosition } from "./positionGenerator.js?v=3";

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
        case "place-value":
            return generatePlaceValue(step.options);
        case "place-value-two-input":
            return generatePlaceValue(step.options);
        case "bridge-to-10":
            return generateBridgeTo10(step.options);
        case "sequence":
            return generateSequence(step.options);
        case "order":
            return generateOrder(step.options);
        case "even-odd":
            return generateEvenOdd(step.options);
        case "pattern":
            return generatePattern(step.options);
        case "shape-sort":
            return generateShapeSort(step.options);
        case "time":
            return generateTime(step.options);
        case "position":
            return generatePosition(step.options);
        case "multiplication":
        case "division":

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}