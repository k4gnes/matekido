import { ITEMS } from "../data/money.js";

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateMoneyChange(options = {}) {

    const { count = 6, minPrice = 11, maxPrice = 99, paidFrom = [50, 100, 200] } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const item = pick(ITEMS);
        const price = randint(minPrice, maxPrice);
        const paid = pick(paidFrom.filter(p => p > price));

        tasks.push({
            type: "money-change",
            item: item.id,
            emoji: item.emoji,
            name: item.name,
            price,
            paid,
            change: paid - price
        });
    }

    return tasks;
}
