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

const SCALES = [
    { value: 1000000, name: "millió", alwaysHyphen: true, prefixOne: true },
    { value: 1000, name: "ezer", alwaysHyphen: false, prefixOne: false }
];

/**
 * Nagysávi szó megalkotása (ezer, millió): az 1 és a 2 külön alakú, a
 * 10 fölötti darabszám iskolai olvasatban szó szerint következik utána.
 * A millió csak összetételben kap "egy" előtagot, önmagában nem.
 *
 * scaleWords(3, "ezer", false)
 * → "háromezer"
 *
 * scaleWords(2, "millió", true)
 * → "kétmillió"
 *
 * scaleWords(120, "millió", true)
 * → "százhuszonötmillió"
 */
function scaleWords(count, name, prefixOne) {

    if (count === 1) return prefixOne ? "egy" + name : name;
    if (count === 2) return "két" + name;
    if (count < 10) return ONES[count] + name;

    return numberToWords(count) + name;

}

/**
 * Egy szám magyar neve (1–999 999 999), iskolai (helyiérték szerinti) olvasatban.
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
 *
 * numberToWords(1234567)
 * → "egymillió-kétszázharmincnégyezer-ötszázhatvanhét"
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

    const scale = SCALES.find(s => number >= s.value);
    const count = Math.floor(number / scale.value);
    const rest = number % scale.value;

    let result = scaleWords(count, scale.name, scale.prefixOne && rest > 0);

    if (rest > 0) {
        result += (scale.alwaysHyphen || count >= 2 ? "-" : "") + numberToWords(rest);
    }

    return result;

}