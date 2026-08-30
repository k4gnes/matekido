/**
 * Segédfüggvények számok kezeléséhez.
 */

/**
 * Egy kétjegyű szám felbontása tízesekre és egyesekre.
 *
 * splitNumber(43)
 * → { tens: 40, ones: 3 }
 */
export function splitNumber(number) {

    return {
        tens: Math.floor(number / 10) * 10,
        ones: number % 10
    };

}

/**
 * Hány hiányzik a következő tízeshez.
 *
 * distanceToNextTen(27)
 * → 3
 */
export function distanceToNextTen(number) {

    const ones = number % 10;

    return ones === 0 ? 0 : 10 - ones;

}

const ONES = ["", "egy", "kettő", "három", "négy", "öt", "hat", "hét", "nyolc", "kilenc"];
const TENS_BASE = ["", "", "huszon", "harminc", "negyven", "ötven", "hatvan", "hetven", "nyolcvan", "kilencven"];
const TENS_ROUND = ["", "tíz", "húsz", "harminc", "negyven", "ötven", "hatvan", "hetven", "nyolcvan", "kilencven"];

/**
 * Egy szám magyar neve (1–1000).
 *
 * numberToWords(345)
 * → "háromszáznegyvenöt"
 */
export function numberToWords(number) {

    if (number === 0) return "nulla";
    if (number === 1000) return "ezer";
    if (number < 10) return ONES[number];

    if (number < 20) {
        return number === 10 ? "tíz" : "tizen" + ONES[number - 10];
    }

    if (number < 100) {
        const tens = Math.floor(number / 10);
        const ones = number % 10;
        return ones === 0 ? TENS_ROUND[tens] : TENS_BASE[tens] + ONES[ones];
    }

    const hundreds = Math.floor(number / 100);
    const rest = number % 100;

    let result;
    if (hundreds === 1) {
        result = "száz";
    } else if (hundreds === 2) {
        result = "kétszáz";
    } else {
        result = ONES[hundreds] + "száz";
    }

    if (rest > 0) {
        result += numberToWords(rest);
    }

    return result;

}