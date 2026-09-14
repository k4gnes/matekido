import { ITEMS, COINS } from "../data/money.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

export function generateMoneyPay(options = {}) {

    const { count = 5, minPrice = 8, maxPrice = 50, items = null, coins = null } = options;

    const pool = items ? ITEMS.filter(i => items.includes(i.id)) : ITEMS;

    const coinSet = coins ?? COINS;
    const step = coinSet.reduce((g, v) => gcd(g, v), 0) || 1;
    const minRounded = Math.ceil(minPrice / step) * step;
    const maxRounded = Math.floor(maxPrice / step) * step;
    const lo = Math.min(minRounded, maxRounded);
    const hi = Math.max(minRounded, maxRounded);

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const item = pick(pool);
        tasks.push({
            type: "money-pay",
            item: item.id,
            emoji: item.emoji,
            name: item.name,
            price: randint(lo / step, hi / step) * step,
            ...(coins ? { coins } : {})
        });
    }

    return tasks;
}
