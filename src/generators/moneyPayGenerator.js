import { ITEMS } from "../data/money.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateMoneyPay(options = {}) {

    const { count = 5, minPrice = 8, maxPrice = 50, items = null } = options;

    const pool = items ? ITEMS.filter(i => items.includes(i.id)) : ITEMS;

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const item = pick(pool);
        tasks.push({
            type: "money-pay",
            item: item.id,
            emoji: item.emoji,
            name: item.name,
            price: randint(minPrice, maxPrice)
        });
    }

    return tasks;
}
