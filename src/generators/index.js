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
import { generatePattern } from "./patternGenerator.js?v=4";
import { generateShapeSort } from "./shapeSortGenerator.js?v=3";
import { generateTime } from "./timeGenerator.js?v=5";
import { generatePosition } from "./positionGenerator.js?v=4";
import { generateMoneyPay } from "./moneyPayGenerator.js?v=4";
import { generateMoneyCompare } from "./moneyCompareGenerator.js?v=4";
import { generateMoneyEnough } from "./moneyEnoughGenerator.js?v=4";
import { generateMeasureCompare } from "./measureCompareGenerator.js?v=3";
import { generateMeasureSquares } from "./measureSquaresGenerator.js?v=3";
import { generateWordProblems } from "./wordProblemGenerator.js?v=5";
import { generateMultPrep } from "./multPrepGenerator.js?v=2";
import { generateMultiplication } from "./multiplicationGenerator.js?v=2";
import { generateDivision } from "./divisionGenerator.js?v=2";
import { generateMissingOperand } from "./missingOperandGenerator.js?v=1";
import { generateEstimate } from "./estimateGenerator.js?v=2";
import { generateTrueFalse } from "./trueFalseGenerator.js?v=1";
import { generateFindError } from "./findErrorGenerator.js?v=1";
import { generateShapeCompare } from "./shapeCompareGenerator.js?v=1";
import { generateSolidShape } from "./solidShapeGenerator.js?v=1";
import { generateWeight } from "./weightGenerator.js?v=1";
import { getActiveWorld } from "../profile/Profile.js";

export function generate(step) {

    const world = getActiveWorld();
    const opts = { ...step.options, world };

    switch (step.generator) {

        case "addition":
            return generateAddition(opts);
        case "missing-to-10":
            return generateMissingTo10(opts);
        case "missing-random":
            return generateMissingRandom(opts);
        case "comparison":
            return generateComparison(opts);
        case "neighbor":
            return generateNeighbor(opts);
        case "neighbor-single":
            return generateNeighborSingle(opts);
        case "subtraction":
            return generateSubtraction(opts);
        case "mixed":
            return generateMixed(opts);
        case "place-value":
            return generatePlaceValue(opts);
        case "place-value-two-input":
            return generatePlaceValue(opts);
        case "bridge-to-10":
            return generateBridgeTo10(opts);
        case "sequence":
            return generateSequence(opts);
        case "order":
            return generateOrder(opts);
        case "even-odd":
            return generateEvenOdd(opts);
        case "pattern":
            return generatePattern(opts);
        case "shape-sort":
            return generateShapeSort(opts);
        case "time":
            return generateTime(opts);
        case "position":
            return generatePosition(opts);
        case "money-pay":
            return generateMoneyPay(opts);
        case "money-compare":
            return generateMoneyCompare(opts);
        case "money-enough":
            return generateMoneyEnough(opts);
        case "measure-compare":
            return generateMeasureCompare(opts);
        case "measure-squares":
            return generateMeasureSquares(opts);
        case "word-problem":
            return generateWordProblems(opts);
        case "mult-prep":
            return generateMultPrep(opts);
        case "multiplication":
            return generateMultiplication(opts);
        case "division":
            return generateDivision(opts);
        case "missing-operand":
            return generateMissingOperand(opts);
        case "estimate":
            return generateEstimate(opts);
        case "true-false":
            return generateTrueFalse(opts);
        case "find-error":
            return generateFindError(opts);
        case "shape-compare":
            return generateShapeCompare(opts);
        case "solid-shape":
            return generateSolidShape(opts);
        case "weight":
            return generateWeight(opts);

        default:
            throw new Error(
                `Ismeretlen generátor: ${step.generator}`
            );
    }

}