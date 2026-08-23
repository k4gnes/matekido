import { COINS } from "../data/money.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function sum(arr) {
    return arr.reduce((s, v) => s + v, 0);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function randomWallet(minCoins, maxCoins, values) {
    const n = randint(minCoins, maxCoins);
    const coins = [];
    for (let i = 0; i < n; i++) {
        coins.push(pick(values));
    }
    return { coins, total: sum(coins) };
}

export function generateMoneyCompare(options = {}) {

    const { count = 5, minCoins = 2, maxCoins = 4, coins = null } = options;

    const values = coins ?? COINS;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const left = randomWallet(minCoins, maxCoins, values);
        let right;

        if (Math.random() < 0.2) {
            right = { coins: shuffle([...left.coins]), total: left.total };
        } else {
            right = randomWallet(minCoins, maxCoins, values);
        }

        const operator = left.total === right.total
            ? "="
            : left.total > right.total
                ? ">"
                : "<";

        tasks.push({
            type: "money-compare",
            leftCoins: left.coins,
            rightCoins: right.coins,
            leftTotal: left.total,
            rightTotal: right.total,
            operator
        });
    }

    return tasks;
}
