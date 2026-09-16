/**
 * Segédfüggvények számok kezeléséhez.
 */

/**
 * Egy szám felbontása százasokra, tízesekre és egyesekre.
 *
 * splitNumber(43)
 * → { hundreds: 0, tens: 40, ones: 3 }
 *
 * splitNumber(345)
 * → { hundreds: 300, tens: 40, ones: 5 }
 */
export function splitNumber(number) {

    return {
        hundreds: Math.floor(number / 100) * 100,
        tens: Math.floor((number % 100) / 10) * 10,
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
 * Egy szám magyar neve (1–9999), iskolai (helyiérték szerinti) olvasatban.
 *
 * numberToWords(125)
 * → "egyszázhuszonöt"
 *
 * numberToWords(1145)
 * → "ezeregyszáznegyvenöt"
 *
 * numberToWords(5444)
 * → "ötezer-négyszáznegyvennégy"
 *
 * numberToWords(5326)
 * → "ötezer-háromszázhuszonhat"
 */
export function numberToWords(number) {

    if (number === 0) return "nulla";
    if (number < 10) return ONES[number];

    if (number < 20) {
        return number === 10 ? "tíz" : "tizen" + ONES[number - 10];
    }

    if (number < 100) {
        const tens = Math.floor(number / 10);
        const ones = number % 10;
        return ones === 0 ? TENS_ROUND[tens] : TENS_BASE[tens] + ONES[ones];
    }

    if (number < 1000) {
        const hundreds = Math.floor(number / 100);
        const rest = number % 100;

        let result;
        if (hundreds === 1) {
            result = "egyszáz";
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

    const thousands = Math.floor(number / 1000);
    const rest = number % 1000;

    let result;
    if (thousands === 1) {
        result = "ezer";
    } else if (thousands === 2) {
        result = "kétezer";
    } else {
        result = ONES[thousands] + "ezer";
    }

    if (rest > 0) {
        result += (thousands >= 2 ? "-" : "") + numberToWords(rest);
    }

    return result;

}