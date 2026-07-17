import { splitNumber, distanceToNextTen } from "./number.js";

export function subtractionSteps(a, b) {

    const onesA = a % 10;

    if (onesA > 0 && onesA <= b) {
        const stepToTen = onesA;
        const rest = b - stepToTen;
        return {
            strategy: "to-ten",
            stepToTen,
            rest,
            tenResult: a - stepToTen
        };
    }

    return {
        strategy: "count-back",
        big: a,
        small: b
    };

}
