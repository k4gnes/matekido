/**
 * Segédfüggvények helyiértékes bontáshoz.
 */

function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Olyan helyiérték-bontás, amelyben legalább egy helyen kétjegyű darabszám van
 * (pl. 9 százas + 12 tízes + 3 egyes = 1023). Az összeg a min–max tartományban marad.
 *
 * makeCarryParts([{ key: "hundreds", value: 100 }, { key: "tens", value: 10 }, { key: "ones", value: 1 }], 100, 999)
 * → { parts: [{ key: "hundreds", count: 12 }, { key: "tens", count: 4 }, { key: "ones", count: 3 }], sum: 1243 }
 *
 * forceCarryOn megadásával egy adott helyiérték marad kétjegyű (pl. "tens").
 * Ha egyik helyen sem fér el kétjegyű darabszám, null-t ad vissza.
 */
export function makeCarryParts(places, min, max, options = {}) {

    const { forceCarryOn } = options;
    const valueOf = new Map(places.map(place => [place.key, place.value]));

    let candidates = places.filter(place => place.value * 10 + place.value <= max);
    if (candidates.length === 0) {
        candidates = places.filter(place => place.value * 10 <= max);
    }
    if (candidates.length === 0) {
        return null;
    }

    if (forceCarryOn) {
        const forced = candidates.find(place => place.key === forceCarryOn);
        if (!forced) return null;
        candidates = [forced];
    }

    let fallback = null;

    for (let attempt = 0; attempt < 30; attempt++) {

        const lead = candidates[randInt(0, candidates.length - 1)];
        const maxLeadCount = Math.min(19, Math.floor(max / lead.value) - 9);
        if (maxLeadCount < 10) continue;

        const counts = new Map();
        counts.set(lead.key, randInt(10, maxLeadCount));

        const lowers = shuffle(places.filter(place => place.value < lead.value)).slice(0, 2);
        const uppers = shuffle(places.filter(place => place.value > lead.value)).slice(0, 2);

        for (const place of [...lowers, ...uppers]) {
            const used = sumOf(counts, valueOf);
            const room = Math.floor((max - used) / place.value);
            if (room < 1) continue;
            counts.set(place.key, randInt(1, Math.min(9, room)));
        }

        const sum = sumOf(counts, valueOf);
        if (sum < min) continue;

        const parts = places.filter(place => counts.has(place.key)).map(place => ({ key: place.key, count: counts.get(place.key) }));

        if (counts.size >= 3) return { parts, sum };
        fallback = { parts, sum };
    }

    return fallback;
}

function sumOf(counts, valueOf) {
    let total = 0;
    for (const [key, count] of counts) total += count * valueOf.get(key);
    return total;
}
