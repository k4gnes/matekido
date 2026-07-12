import { splitNumber, distanceToNextTen } from "./number.js";

/**
 * Eldönti, milyen segítséget érdemes adni
 * egy összeadási feladathoz.
 */
export function getAdditionStrategy(a, b) {

    // Mindig a nagyobb számhoz adjuk hozzá a kisebbet.
    if (b > a) {
        [a, b] = [b, a];
    }

    const step = distanceToNextTen(a);

    // Tízesátlépéses stratégia
    if (step > 0 && step < b) {

        return {
            type: "carry",
            a,
            b,
            step,
            rest: b - step
        };

    }

    // Bontásos stratégia
    return {

        type: "split",

        a,
        b,

        left: splitNumber(a),
        right: splitNumber(b)

    };

}