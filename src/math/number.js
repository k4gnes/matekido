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