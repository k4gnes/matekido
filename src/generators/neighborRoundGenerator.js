function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const UNITS = {
    ten: { step: 10, label: "tízes" },
    hundred: { step: 100, label: "százas" },
    thousand: { step: 1000, label: "ezres" }
};

export function generateNeighborRound(options = {}) {

    const { count = 8, min = 1000, max = 9999, units = ["ten", "hundred", "thousand"] } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const unit = pick(units);
        const { step, label } = UNITS[unit];

        let num;
        do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (num % step === 0);

        tasks.push({
            number: num,
            unit,
            unitLabel: label,
            lower: Math.floor(num / step) * step,
            upper: Math.ceil(num / step) * step
        });
    }

    return tasks;
}