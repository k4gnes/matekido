import { getActiveWorld } from "../profile/Profile.js";

const KINDS = ["join", "remove", "part-whole", "compare"];

const MULT_DIV_KINDS = ["multiply", "divide"];

const DIFF_SUFFIX = {
    1: "gyel", 2: "vel", 3: "mal", 4: "gyel", 5: "tel",
    6: "tal", 7: "tel", 8: "cal", 9: "cel", 10: "zel",
    11: "gyel", 12: "vel", 13: "mal", 14: "gyel", 15: "tel",
    16: "tal", 17: "tel", 18: "cal", 19: "cel", 20: "zel"
};

function diffPhrase(n) {
    return `${n}-${DIFF_SUFFIX[n] ?? "vel"} több`;
}

const THEMES = {
    postman: {
        join: {
            title: "📮 Egyesítés",
            text: (a, b) => `A Virág utca 13. postaládájában ${a} levél van. Tibi postás ma újabb ${b} levelet kézbesít ide.`,
            question: "Mennyi levél van összesen a ládában a kézbesítés után?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} levél van a ládában!`
        },
        remove: {
            title: "📮 Elmegy belőle",
            text: (total, leaving) => `${total} postás várakozik a postán. ${leaving} piros sapkás elindul kézbesíteni.`,
            question: "Hányan maradnak a postán?",
            hint: "Húzd a piros sapkás postásokat a kézbesítő autóhoz!",
            success: (answer) => `😊 Szép munka! A postán ${answer} postás maradt!`
        },
        "part-whole": {
            title: "📮 Rész és egész",
            text: (total, part) => `${total} postás várakozik az indulásra. Közülük ${part} postásnak kék a cipője, a többieknek barna.`,
            question: "Hány barna cipős van közöttük?",
            success: (answer) => `😊 Szép munka! ${answer} postásnak barna a cipője!`
        },
        compare: {
            title: "📮 Összehasonlítás",
            text: (a, b) => `A páros oldalra ma ${a} levelet, a páratlan oldalra ${b} levelet kézbesítettek.`,
            question: "Mennyivel több levél került az egyik oldalra, mint a másikra?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} levél került a páros oldalra!`
        },
        multiply: {
            title: "📮 Szorzás",
            text: (groups, perGroup) => `${groups} postaládába egyformán ${perGroup} levelet tesznek.`,
            question: "Hány levelet tesznek ki összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} levelet tesznek ki!`
        },
        divide: {
            title: "📮 Osztás",
            text: (total, groups) => `${total} levelet kell szétosztani ${groups} postaládába egyenlően.`,
            question: "Hány levél kerül egy postaládába?",
            success: (answer) => `😊 Szép munka! Minden postaládába ${answer} levél kerül!`
        }
    },
    racing: {
        join: {
            title: "🔧 Egyesítés",
            text: (a, b) => `A szerelőgarázsban ${a} kerék van a polcon. A versenyautóhoz még ${b} kereket szerelnek.`,
            question: "Hány kerék lesz összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} kerék lesz!`
        },
        remove: {
            title: "🔧 Elmegy belőle",
            text: (total, leaving) => `${total} versenyautó várakozik a rajtvonalnál. ${leaving} piros autó elindul az első körre.`,
            question: "Hány autó marad a rajtvonalnál?",
            hint: "Húzd a piros autókat a pályára!",
            success: (answer) => `😊 Szép munka! A rajtvonalnál ${answer} autó maradt!`
        },
        "part-whole": {
            title: "🔧 Rész és egész",
            text: (total, part) => `${total} versenyautó várakozik a rajtvonalnál. Közülük ${part} piros, a többi kék.`,
            question: "Hány kék autó van?",
            success: (answer) => `😊 Szép munka! ${answer} kék autó van!`
        },
        compare: {
            title: "🔧 Összehasonlítás",
            text: (a, b) => `Az első versenyen ${a} kört, a másodikon ${b} kört futottak.`,
            question: "Mennyivel több kört futottak az első versenyen?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} kört futottak az első versenyen!`
        },
        multiply: {
            title: "🔧 Szorzás",
            text: (groups, perGroup) => `${groups} versenyautó mindegyikére ${perGroup} alkatrész kell.`,
            question: "Hány alkatrész kell összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} alkatrész kell!`
        },
        divide: {
            title: "🔧 Osztás",
            text: (total, groups) => `${total} alkatrészt kell szétosztani ${groups} autó között egyenlően.`,
            question: "Hány alkatrész jut egy autóra?",
            success: (answer) => `😊 Szép munka! Minden autóra ${answer} alkatrész jut!`
        }
    },
    cooking: {
        join: {
            title: "🍳 Egyesítés",
            text: (a, b) => `A konyhapulton ${a} tojás van a tálban. Ancsika szakács még ${b} tojást üt bele.`,
            question: "Hány tojás lesz összesen a tálban?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} tojás van a tálban!`
        },
        remove: {
            title: "🍳 Elmegy belőle",
            text: (total, leaving) => `${total} palacsinta van a tányéron. ${leaving} csokoládésat megesznek.`,
            question: "Hány palacsinta marad a tányéron?",
            hint: "Húzd a csokoládés palacsintákat a tányér mellé, ezeket megeszik!",
            success: (answer) => `😊 Szép munka! A tányéron ${answer} palacsinta maradt!`
        },
        "part-whole": {
            title: "🍳 Rész és egész",
            text: (total, part) => `${total} palacsinta van a tányéron. Közülük ${part} lekváros, a többi sajtos.`,
            question: "Hány sajtos palacsinta van?",
            success: (answer) => `😊 Szép munka! ${answer} sajtos palacsinta van!`
        },
        compare: {
            title: "🍳 Összehasonlítás",
            text: (a, b) => `Reggel ${a} palacsintát, délben ${b} palacsintát sütöttek.`,
            question: "Mennyivel több palacsinta sült reggel?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} palacsinta sült reggel!`
        },
        multiply: {
            title: "🍳 Szorzás",
            text: (groups, perGroup) => `${groups} tányérra egyformán ${perGroup} palacsintát tesznek.`,
            question: "Hány palacsintát sütöttek összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} palacsintát sütöttek!`
        },
        divide: {
            title: "🍳 Osztás",
            text: (total, groups) => `${total} palacsintát kell szétosztani ${groups} tányérra egyenlően.`,
            question: "Hány palacsinta kerül egy tányérra?",
            success: (answer) => `😊 Szép munka! Minden tányérra ${answer} palacsinta kerül!`
        }
    },
    football: {
        join: {
            title: "⚽ Egyesítés",
            text: (a, b) => `A labdatartóban ${a} labda van. A csapat még ${b} labdát hoz.`,
            question: "Hány labda lesz összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} labda van a tartóban!`
        },
        remove: {
            title: "⚽ Elmegy belőle",
            text: (total, leaving) => `${total} játékos van a pályán. ${leaving} piros mezes lecserélik a szünetben.`,
            question: "Hány játékos marad a pályán?",
            hint: "Húzd a piros mezes játékosokat a kispadra!",
            success: (answer) => `😊 Szép munka! A pályán ${answer} játékos maradt!`
        },
        "part-whole": {
            title: "⚽ Rész és egész",
            text: (total, part) => `${total} játékos van a csapatban. Közülük ${part} piros mezes, a többi kék mezes.`,
            question: "Hány kék mezes játékos van?",
            success: (answer) => `😊 Szép munka! ${answer} kék mezes játékos van!`
        },
        compare: {
            title: "⚽ Összehasonlítás",
            text: (a, b) => `Az első félidőben ${a} gólt, a másodikban ${b} gólt rúgtak.`,
            question: "Mennyivel több gól esett az első félidőben?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} gól esett az első félidőben!`
        },
        multiply: {
            title: "⚽ Szorzás",
            text: (groups, perGroup) => `${groups} csapat mindegyike ${perGroup} gólt rúg.`,
            question: "Hány gól esett összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} gól esett!`
        },
        divide: {
            title: "⚽ Osztás",
            text: (total, groups) => `${total} labdát kell szétosztani ${groups} csapat között egyenlően.`,
            question: "Hány labda jut egy csapatra?",
            success: (answer) => `😊 Szép munka! Minden csapatra ${answer} labda jut!`
        }
    },
    animals: {
        join: {
            title: "🦓 Egyesítés",
            text: (a, b) => `A karámban ${a} zebra van. A gondozó még ${b} zebrát enged be.`,
            question: "Hány zebra lesz összesen a karámban?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} zebra van a karámban!`
        },
        remove: {
            title: "🦓 Elmegy belőle",
            text: (total, leaving) => `${total} zebra van a kifutóban. ${leaving} sárga nyakörvű zebrát megetetnek és behoznak a ketrecbe.`,
            question: "Hány zebra marad a kifutóban?",
            hint: "Húzd a sárga nyakörvű zebrákat a ketrecbe!",
            success: (answer) => `😊 Szép munka! A kifutóban ${answer} zebra maradt!`
        },
        "part-whole": {
            title: "🦓 Rész és egész",
            text: (total, part) => `${total} zebra van a kifutóban. Közülük ${part} zebrának sárga a nyakörve, a többinek zöld.`,
            question: "Hány zöld nyakörvű zebra van?",
            success: (answer) => `😊 Szép munka! ${answer} zebrának zöld a nyakörve!`
        },
        compare: {
            title: "🦓 Összehasonlítás",
            text: (a, b) => `Reggel ${a} zebrát, este ${b} zebrát etettek meg.`,
            question: "Mennyivel több zebrát etettek meg reggel?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} zebrát etettek meg reggel!`
        },
        multiply: {
            title: "🦓 Szorzás",
            text: (groups, perGroup) => `${groups} karámban egyformán ${perGroup} zebra van.`,
            question: "Hány zebra van összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} zebra van!`
        },
        divide: {
            title: "🦓 Osztás",
            text: (total, groups) => `${total} zebrát kell szétosztani ${groups} karámba egyenlően.`,
            question: "Hány zebra kerül egy karámba?",
            success: (answer) => `😊 Szép munka! Minden karámba ${answer} zebra kerül!`
        }
    },
    space: {
        join: {
            title: "🤖 Egyesítés",
            text: (a, b) => `A fedélzeten ${a} robot van. A rakéta még ${b} robotot hoz.`,
            question: "Hány robot lesz összesen a fedélzeten?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} robot van a fedélzeten!`
        },
        remove: {
            title: "🤖 Elmegy belőle",
            text: (total, leaving) => `${total} robot van az űrállomáson. ${leaving} szürke robot elindul a bolygóra.`,
            question: "Hány robot marad az űrállomáson?",
            hint: "Húzd a szürke robotokat a rakétához!",
            success: (answer) => `😊 Szép munka! Az űrállomáson ${answer} robot maradt!`
        },
        "part-whole": {
            title: "🤖 Rész és egész",
            text: (total, part) => `${total} robot van az űrállomáson. Közülük ${part} működik, a többi töltődik.`,
            question: "Hány robot töltődik?",
            success: (answer) => `😊 Szép munka! ${answer} robot töltődik!`
        },
        compare: {
            title: "🤖 Összehasonlítás",
            text: (a, b) => `Az első űrhajóval ${a} robotot, a másodikkal ${b} robotot szállítottak.`,
            question: "Mennyivel több robotot szállított az első űrhajó?",
            success: (answer) => `😊 Szép munka! ${diffPhrase(answer)} robotot szállított az első űrhajó!`
        },
        multiply: {
            title: "🤖 Szorzás",
            text: (groups, perGroup) => `${groups} rakétára egyformán ${perGroup} robotot szerelnek.`,
            question: "Hány robotot szerelnek összesen?",
            success: (answer) => `😊 Szép munka! Összesen ${answer} robotot szerelnek!`
        },
        divide: {
            title: "🤖 Osztás",
            text: (total, groups) => `${total} robotot kell szétosztani ${groups} bolygó között egyenlően.`,
            question: "Hány robot jut egy bolygóra?",
            success: (answer) => `😊 Szép munka! Minden bolygóra ${answer} robot jut!`
        }
    }
};

export function generateWordProblems(options = {}) {

    const { count = 4, max = 20, kind } = options;

    if (max < 6) {
        throw new Error("A max értéknek legalább 6-nak kell lennie.");
    }

    const world = getActiveWorld();

    const tasks = [];

    if (kind === "multiply") {
        for (let i = 0; i < count; i++) {
            tasks.push(generateMultiply(max, world));
        }
    } else if (kind === "divide") {
        for (let i = 0; i < count; i++) {
            tasks.push(generateDivide(max, world));
        }
    } else if (kind === "two-step") {
        for (let i = 0; i < count; i++) {
            tasks.push(generateTwoStep(max, world));
        }
    } else {
        for (let i = 0; i < count; i++) {
            tasks.push(generateTask(KINDS[i % KINDS.length], max, world));
        }
    }

    return tasks;
}

function getTheme(world, kind) {
    return THEMES[world]?.[kind] ?? THEMES.postman[kind];
}

function generateTask(kind, max, world) {
    switch (kind) {
        case "join":
            return generateJoin(max, world);
        case "remove":
            return generateRemove(max, world);
        case "part-whole":
            return generatePartWhole(max, world);
        case "compare":
            return generateCompare(max, world);
    }
}

function generateJoin(max, world) {

    const a = random(3, max - 4);
    const b = random(2, max - a);
    const answer = a + b;

    const theme = getTheme(world, "join");

    return {
        kind: "join",
        world,
        title: theme.title,
        text: theme.text(a, b),
        question: theme.question,
        a,
        b,
        answer,
        successText: theme.success(answer),
        options: makeOptions(answer, 0, max)
    };
}

function generateRemove(max, world) {

    const total = random(8, max);
    const leaving = random(2, Math.min(6, total - 2));

    const theme = getTheme(world, "remove");

    return {
        kind: "remove",
        world,
        title: theme.title,
        text: theme.text(total, leaving),
        question: theme.question,
        hint: theme.hint,
        total,
        leaving,
        answer: total - leaving,
        successText: theme.success(total - leaving)
    };
}

function generatePartWhole(max, world) {

    const total = random(5, max);
    const part = random(2, total - 2);

    const theme = getTheme(world, "part-whole");

    return {
        kind: "part-whole",
        world,
        title: theme.title,
        text: theme.text(total, part),
        question: theme.question,
        total,
        part,
        answer: total - part,
        successText: theme.success(total - part)
    };
}

function generateCompare(max, world) {

    const a = random(5, max);
    const b = random(2, a - 1);
    const answer = a - b;

    const theme = getTheme(world, "compare");

    return {
        kind: "compare",
        world,
        title: theme.title,
        text: theme.text(a, b),
        question: theme.question,
        a,
        b,
        answer,
        successText: theme.success(answer),
        options: makeOptions(answer, 0, max)
    };
}

function makeOptions(answer, min, max, count = 4) {

    const options = [answer];
    const seen = new Set([answer]);

    const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];

    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }

    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}

function generateMultiply(max, world) {
    const perGroup = random(2, 5);
    const groups = random(2, Math.min(6, Math.floor(max / perGroup)));
    const answer = perGroup * groups;
    const theme = getTheme(world, "multiply");
    return {
        kind: "multiply",
        world,
        title: theme.title,
        text: theme.text(groups, perGroup),
        question: theme.question,
        a: groups,
        b: perGroup,
        answer,
        successText: theme.success(answer),
        options: makeOptions(answer, 1, max + 10)
    };
}

function generateDivide(max, world) {
    const groups = random(2, 5);
    const perGroup = random(2, Math.min(5, Math.floor(max / groups)));
    const total = groups * perGroup;
    const theme = getTheme(world, "divide");
    return {
        kind: "divide",
        world,
        title: theme.title,
        text: theme.text(total, groups),
        question: theme.question,
        a: total,
        b: groups,
        answer: perGroup,
        successText: theme.success(perGroup),
        options: makeOptions(perGroup, 1, max)
    };
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TWO_STEP_THEMES = {
    postman: [
        { text: (a, b, c) => `A postán ${a} csomag van. ${b} újabb csomag érkezik. Aztán ${c} csomagot visznek el. Hány csomag van most a postán?`, question: "Hány csomag van most a postán?", success: (ans) => `😊 Szép munka! Most ${ans} csomag van a postán!` },
        { text: (a, b, c) => `A postaládában ${a} levél van. Tibi ${b} levelet tesz bele. Aztán ${c} levelet kivesz. Hány levél van a ládában?`, question: "Hány levél van a ládában?", success: (ans) => `😊 Szép munka! Most ${ans} levél van a ládában!` }
    ],
    racing: [
        { text: (a, b, c) => `A versenyautó ${a} km-t ment az első körben. A második körben ${b} km-t. Aztán ${c} km-t visszafelé. Hány km-t ment összesen?`, question: "Hány km-t ment összesen?", success: (ans) => `😊 Szép munka! Összesen ${ans} km-t ment!` },
        { text: (a, b, c) => `A garázsban ${a} kerék van. ${b} új kerék érkezik. Aztán ${c} kereket szerelnek fel. Hány kerék marad a garázsban?`, question: "Hány kerék marad a garázsban?", success: (ans) => `😊 Szép munka! ${ans} kerék maradt a garázsban!` }
    ],
    cooking: [
        { text: (a, b, c) => `A tálban ${a} tojás van. Ancsika ${b} tojást üt bele. Aztán ${c} tojást félretesz. Hány tojás marad a tálban?`, question: "Hány tojás marad a tálban?", success: (ans) => `😊 Szép munka! ${ans} tojás maradt a tálban!` },
        { text: (a, b, c) => `${a} palacsinta van a tányéron. ${b} palacsintát megsütünk még. Aztán ${c}-t megesznek. Hány palacsinta van a tányéron?`, question: "Hány palacsinta van a tányéron?", success: (ans) => `😊 Szép munka! ${ans} palacsinta van a tányéron!` }
    ],
    football: [
        { text: (a, b, c) => `A csapatban ${a} játékos van. ${b} játékos csatlakozik. Aztán ${c} játékos lecserélik. Hány játékos van a pályán?`, question: "Hány játékos van a pályán?", success: (ans) => `😊 Szép munka! ${ans} játékos van a pályán!` },
        { text: (a, b, c) => `${a} gól esett az első félidőben. A második félidőben ${b} gól. Aztán ${c} gólt érvénytelenítettek. Hány gól maradt?`, question: "Hány gól maradt?", success: (ans) => `😊 Szép munka! ${ans} gól maradt!` }
    ],
    animals: [
        { text: (a, b, c) => `A kifutóban ${a} zebra van. ${b} zebra érkezik. Aztán ${c} zebrát bezárnak a ketrecbe. Hány zebra marad a kifutóban?`, question: "Hány zebra marad a kifutóban?", success: (ans) => `😊 Szép munka! ${ans} zebra maradt a kifutóban!` },
        { text: (a, b, c) => `${a} madár ül a fán. ${b} madár Repül oda. Aztán ${c} madár elrepül. Hány madár marad a fán?`, question: "Hány madár marad a fán?", success: (ans) => `😊 Szép munka! ${ans} madár maradt a fán!` }
    ],
    space: [
        { text: (a, b, c) => `Az űrállomáson ${a} robot van. ${b} robot érkezik a rakétával. Aztán ${c} robotot a bolygóra küldenek. Hány robot marad az űrállomáson?`, question: "Hány robot marad az űrállomáson?", success: (ans) => `😊 Szép munka! ${ans} robot maradt az űrállomáson!` },
        { text: (a, b, c) => `${a} rakéta van a dokkban. ${b} rakéta indul el. Aztán ${c} rakéta érkezik. Hány rakéta van most a dokkban?`, question: "Hány rakéta van most a dokkban?", success: (ans) => `😊 Szép munka! ${ans} rakéta van a dokkban!` }
    ]
};

function generateTwoStep(max, world) {
    const templates = TWO_STEP_THEMES[world] ?? TWO_STEP_THEMES.postman;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const a = random(5, Math.floor(max * 0.5));
    const b = random(3, Math.floor(max * 0.4));
    const intermediate = a + b;
    const c = random(2, Math.min(intermediate - 1, 8));
    const answer = intermediate - c;

    return {
        kind: "two-step",
        world,
        title: "📝 Kétlépéses feladat",
        text: template.text(a, b, c),
        question: template.question,
        a,
        b,
        c,
        intermediate,
        answer,
        firstAnswer: intermediate,
        successText: template.success(answer),
        options: makeOptions(answer, 0, max + 5)
    };
}
