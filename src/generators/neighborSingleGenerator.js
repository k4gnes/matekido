export function generateNeighborSingle(options = {}) {

    const { count = 10, max = 100 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        let a;
        do {
            a = Math.floor(Math.random() * (max - 1)) + 2;
        } while (a % 10 === 0);

        const q = Math.floor(Math.random() * 4);

        let question, answer;

        switch (q) {
            case 0:
                question = `Mi ${a} kisebb szomszédja?`;
                answer = a - 1;
                break;
            case 1:
                question = `Mi ${a} nagyobb szomszédja?`;
                answer = a + 1;
                break;
            case 2:
                question = `${a} kinek a nagyobb szomszédja?`;
                answer = a - 1;
                break;
            case 3:
                question = `${a} kinek a kisebb szomszédja?`;
                answer = a + 1;
                break;
        }

        tasks.push({
            type: "neighbor-single",
            a,
            question,
            answer
        });
    }

    return tasks;
}
