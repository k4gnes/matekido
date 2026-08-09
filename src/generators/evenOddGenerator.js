function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateEvenOdd(options = {}) {

    const { count = 5, min = 1, max = 20, numbersPerRound = 8 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const pool = [];
        for (let n = min; n <= max; n++) {
            pool.push(n);
        }
        shuffle(pool);

        const numbers = pool.slice(0, numbersPerRound);

        const hasEven = numbers.some(n => n % 2 === 0);
        const hasOdd = numbers.some(n => n % 2 !== 0);

        if (!hasEven || !hasOdd) {
            const wantedParity = hasEven ? 1 : 0;
            for (const n of pool.slice(numbersPerRound)) {
                if (n % 2 === wantedParity) {
                    numbers[numbers.length - 1] = n;
                    break;
                }
            }
        }

        const question = Math.random() < 0.5 ? "even" : "odd";

        tasks.push({
            type: "even-odd",
            numbers,
            question,
            answer: numbers.filter(n => (n % 2 === 0) === (question === "even"))
        });
    }

    return tasks;
}
