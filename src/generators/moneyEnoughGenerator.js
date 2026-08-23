import { COINS, ITEMS } from "../data/money.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function sum(arr) {
    return arr.reduce((s, v) => s + v, 0);
}

function randomWallet(minCoins, maxCoins, values) {
    const n = randint(minCoins, maxCoins);
    const coins = [];
    for (let i = 0; i < n; i++) {
        coins.push(pick(values));
    }
    return coins;
}

export function generateMoneyEnough(options = {}) {

    const { count = 5, minCoins = 2, maxCoins = 4, items = null, coins = null } = options;

    const itemPool = items ? ITEMS.filter(i => items.includes(i.id)) : ITEMS;
    const values = coins ?? COINS;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const item = pick(itemPool);
        const coins2 = randomWallet(minCoins, maxCoins, values);
        const total = sum(coins2);

        const enough = Math.random() < 0.5 && total > 5;
        let price;

        if (enough) {
            const lo = Math.max(5, total - 12);
            price = randint(lo, Math.max(lo, total));
        } else {
            price = randint(total + 1, total + 12);
        }

        tasks.push({
            type: "money-enough",
            item: item.id,
            emoji: item.emoji,
            name: item.name,
            coins: coins2,
            total,
            price,
            enough
        });
    }

    return tasks;
}
