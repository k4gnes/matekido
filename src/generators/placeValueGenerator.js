export function generatePlaceValue(options = {}) {

    const { count = 10, max = 100 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const num = Math.floor(Math.random() * Math.min(max, 100)) + 1;

        const tens = Math.floor(num / 10);
        const ones = num % 10;

        tasks.push({
            tens,
            ones,
            answer: num
        });

    }

    return tasks;

}
