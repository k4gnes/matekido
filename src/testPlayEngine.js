// Füstteszt az egyperces játékok közös motorjához (playEngine.js).
// Minimális DOM-hamisításon végigjátssza mind az 5 játékot:
// választó → indulás → helyes válasz → összegzés → rekord → tovább.
//
// Futtatás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    key: () => null,
    get length() { return Object.keys(store).length; }
};

function makeTarget() {
    const listeners = new Map();
    return {
        addEventListener(type, fn, opts = {}) {
            if (opts.signal?.aborted) return;
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(fn);
            opts.signal?.addEventListener("abort", () => listeners.get(type)?.delete(fn));
        },
        removeEventListener(type, fn) {
            listeners.get(type)?.delete(fn);
        },
        dispatch(type, event = {}) {
            for (const fn of [...(listeners.get(type) ?? [])]) fn(event);
        }
    };
}

class El {
    constructor(tag) {
        this.tagName = tag;
        this.className = "";
        this.children = [];
        this.style = {};
        this.disabled = false;
        this.value = "";
        this._text = "";
        this._target = makeTarget();
    }
    get textContent() {
        if (this.children.length === 0) return this._text;
        return this._text + this.children.map(c => c.textContent).join("");
    }
    set textContent(value) {
        this._text = String(value);
        this.children = [];
    }
    append(...nodes) {
        for (const node of nodes) {
            if (node == null) continue;
            this.children.push(node);
            node.parentNode = this;
        }
    }
    replaceChildren(...nodes) {
        this.children = [];
        this._text = "";
        this.append(...nodes);
    }
    setAttribute() {}
    focus() {}
    click() {
        if (!this.disabled) this._target.dispatch("click", {});
    }
    addEventListener(...args) { return this._target.addEventListener(...args); }
    removeEventListener(...args) { return this._target.removeEventListener(...args); }
    get classList() {
        const own = this;
        const parts = () => own.className.split(/\s+/).filter(Boolean);
        return {
            add(name) { if (!parts().includes(name)) own.className = parts().concat(name).join(" "); },
            contains(name) { return parts().includes(name); },
            toggle(name, force) {
                const has = this.contains(name);
                const want = force === undefined ? !has : Boolean(force);
                if (want) this.add(name);
                else if (has) own.className = parts().filter(p => p !== name).join(" ");
                return want;
            }
        };
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
    querySelectorAll(sel) {
        const cls = sel.startsWith(".") ? sel.slice(1) : sel;
        const out = [];
        const walk = (el) => {
            for (const child of el.children) {
                if (child.classList.contains(cls)) out.push(child);
                walk(child);
            }
        };
        walk(this);
        return out;
    }
}

globalThis.document = {
    hidden: false,
    createElement: (tag) => new El(tag),
    ...makeTarget()
};

globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

const { createPlayGame } = await import("./components/playEngine.js");
const { renderAdditionPlay } = await import("./components/additionPlay.js");
const { renderMultiplicationPlay } = await import("./components/multiplicationPlay.js");
const { renderPowerPlay } = await import("./components/powerPlay.js");
const { renderIntegerPlay } = await import("./components/integerPlay.js");
const { renderOperationOrderPlay } = await import("./components/operationOrderPlay.js");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let failures = 0;

function check(cond, msg) {
    if (cond) console.log(`  ✔ ${msg}`);
    else { failures++; console.error(`  ✘ ${msg}`); }
}

function buttonByText(root, text) {
    const walk = (el) => {
        for (const child of el.children) {
            if (child.tagName === "button" && child.textContent.trim() === text) return child;
            const hit = walk(child);
            if (hit) return hit;
        }
        return null;
    };
    return walk(root);
}

// A képernyőn lévő feladatszövegből kiszámoljuk a helyes választ
// (a motor ugyanilyen kifejezéseket generál), hogy mindig találomra
// helyes válasszal lehessen játszani.
function parseAnswer(factText) {
    const expr = factText
        .replace(/\s*=\s*\?$/, "")
        .replace(/\^/g, "**")
        .replace(/−/g, "-")
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
    return Function(`"use strict"; return (${expr});`)();
}

// Lejátsz egy kört a megadott játékkal a helyes válaszig bezárólag,
// és visszaadja a felületet az összegzéssel.
async function playToSummary(render, step, name) {
    const root = new El("div");
    let nextCalls = 0;
    const cleanup = render(step, root, () => { nextCalls++; }, null);
    const ctx = { root, cleanup, nextCalls: () => nextCalls };

    const startBtn = buttonByText(root, "⏱️ Indul a perc!");
    if (!startBtn) {
        check(false, `${name}: nincs start gomb a választóban`);
        cleanup();
        return null;
    }
    check(true, `${name}: választó megjelenik`);
    startBtn.click();

    const fact = root.querySelector(".mult-play-fact");
    if (!fact) {
        check(false, `${name}: nincs feladat a képernyőn`);
        cleanup();
        return null;
    }
    check(/\?/.test(fact.textContent), `${name}: feladat megjelenik`);
    check(Boolean(root.querySelector(".mult-play-timer")), `${name}: HUD időzítő`);

    const answer = parseAnswer(fact.textContent);
    const options = root.querySelectorAll(".mult-play-option");
    check(options.length === 4, `${name}: 4 válaszgomb (${options.length})`);
    const right = options.find(btn => Number(btn.textContent.replace(/−/g, "-")) === answer);
    if (!right) {
        check(false, `${name}: a helyes válasz nincs a gombok közt`);
        cleanup();
        return null;
    }
    check(true, `${name}: helyes gomb kiválasztható`);
    right.click();

    // A válasz után a kör lezárul, amint lejár az idő (~400 ms).
    await sleep(650);

    const summary = root.querySelector(".mult-play-summary");
    if (!summary) {
        check(false, `${name}: nincs összegzés`);
        cleanup();
        return null;
    }
    check(true, `${name}: összegzés`);
    const text = summary.textContent;
    check(text.includes("1 helyes válasz"), `${name}: pontszám`);
    check(text.includes("Új rekord") || text.includes("Legjobb eredményed"), `${name}: rekordsor`);
    check(text.includes("Ezeket érdemes") || text.includes("elsőre"), `${name}: hibás chip vagy dicséret`);
    return ctx;
}

// A "Még egyet" visszavisz a választóhoz – ezt csak egy plusz körben
// ellenőrizzük, hogy ne keveredjen a "Tovább" hívással.
async function testAgainButton() {
    console.log("additionPlay – Még egyet");
    const ctx = await playToSummary(renderAdditionPlay, { duration: 0.3 }, "újra");
    if (!ctx) return;
    const againBtn = buttonByText(ctx.root, "🔁 Még egyet");
    if (againBtn) {
        againBtn.click();
        check(Boolean(buttonByText(ctx.root, "⏱️ Indul a perc!")), "Még egyet: visszatérés a választóhoz");
    } else {
        check(false, "Még egyet: nincs gomb az összegzésen");
    }
    ctx.cleanup();
}

async function testOptionsGame(render, name) {
    console.log(name);
    const ctx = await playToSummary(render, { duration: 0.3 }, name);
    if (!ctx) return;
    const nextBtn = buttonByText(ctx.root, "➡️ Tovább");
    if (!nextBtn) {
        check(false, `${name}: nincs tovább gomb`);
    } else {
        nextBtn.click();
        check(ctx.nextCalls() === 1, `${name}: a tovább hívja a következő lépést`);
    }
    ctx.cleanup();
}

async function testMissedStaysAfterRetry() {
    const name = "playEngine (kijavított hiba)";
    console.log(name);
    const game = {
        recordMode: "test-retry",
        ui: { postman: { title: "Teszt", item: "📦", done: "Kész" } },
        levels: [],
        defaultLevel: null,
        subtitleIdle: "",
        lead: "",
        subtitleInGame: () => "",
        startRound: (state) => { state.pool = [{ a: 3, b: 5, answer: 15 }]; },
        nextTask: () => ({
            key: "3x5",
            missedKey: "3x5",
            display: "3 × 5 = ?",
            answer: 15,
            options: [15, 13, 16, 18],
            a: 3,
            b: 5
        }),
        successMessage: () => "ok",
        failMessage: () => "nem",
        correctDelay: () => 0,
        wrongDelay: () => 0,
        chipText: (task) => `${task.a} × ${task.b}`,
        allGoodText: "Minden szorzatot elsőre találtál! 🌟"
    };
    const root = new El("div");
    const cleanup = createPlayGame(game, { duration: 0.4 }, root, () => {}, null);

    buttonByText(root, "⏱️ Indul a perc!").click();
    const options = () => root.querySelectorAll(".mult-play-option");
    options().find(btn => btn.textContent === "13").click();
    await sleep(20);
    options().find(btn => btn.textContent === "15").click();
    await sleep(450);

    let summary = root.querySelector(".mult-play-summary");
    if (!summary) {
        buttonByText(root, "🏁 Befejezem")?.click();
        summary = root.querySelector(".mult-play-summary");
    }
    check(Boolean(summary), `${name}: összegzés`);
    check(Boolean(summary) && summary.textContent.includes("Ezeket érdemes"), `${name}: a kijavított hiba a gyakorláslistán marad`);
    check(Boolean(summary) && !summary.textContent.includes("elsőre"), `${name}: nincs hamis dicséret`);
    cleanup();
}

async function testMultiplicationChoice() {
    const name = "multiplicationPlay (választós)";
    console.log(name);
    const root = new El("div");
    let nextCalls = 0;
    const cleanup = renderMultiplicationPlay({ duration: 0.3 }, root, () => { nextCalls++; }, null);

    const startBtn = buttonByText(root, "⏱️ Indul a perc!");
    check(Boolean(startBtn) && startBtn.disabled, `${name}: üres választással nem indul`);
    buttonByText(root, "2×").click();
    check(Boolean(startBtn) && !startBtn.disabled, `${name}: táblakijelölés után indul`);
    startBtn.click();

    const fact = root.querySelector(".mult-play-fact");
    const answer = fact ? parseAnswer(fact.textContent) : NaN;
    const right = root.querySelectorAll(".mult-play-option")
        .find(btn => Number(btn.textContent.replace(/−/g, "-")) === answer);
    if (!right) {
        check(false, `${name}: nincs helyes gomb`);
        cleanup();
        return;
    }
    right.click();
    await sleep(650);

    const summary = root.querySelector(".mult-play-summary");
    if (!summary) {
        check(false, `${name}: nincs összegzés`);
        cleanup();
        return;
    }
    check(true, `${name}: összegzés`);
    check(summary.textContent.includes("1 helyes válasz"), `${name}: pontszám`);
    check(summary.textContent.includes("Új rekord"), `${name}: összesített rekord`);
    check(summary.textContent.includes("Új rekord a tábláknál"), `${name}: táblánkénti rekord`);

    const nextBtn = buttonByText(root, "➡️ Tovább");
    nextBtn.click();
    check(nextCalls === 1, `${name}: a tovább hívja a következő lépést`);
    cleanup();
}

async function testMultiplicationInput() {
    const name = "multiplicationPlay (beírós)";
    console.log(name);
    const root = new El("div");
    let nextCalls = 0;
    const cleanup = renderMultiplicationPlay({ duration: 0.3, mode: "input" }, root, () => { nextCalls++; }, null);

    buttonByText(root, "3×").click();
    const startBtn = buttonByText(root, "⏱️ Indul a perc!");
    startBtn.click();

    const fact = root.querySelector(".mult-play-fact");
    const answer = parseAnswer(fact.textContent);
    const input = root.querySelector(".mult-play-input");
    const submit = buttonByText(root, "Ellenőrzöm");
    check(Boolean(input && submit), `${name}: beírós mező + ellenőrzöm gomb`);

    // Szándékosan rossz válasz: a motor feltölti a helyeset a mezőbe.
    input.value = String(answer + 1);
    submit.click();
    check(input.disabled, `${name}: ellenőrzés után a mező zárolódik`);
    await sleep(50);
    check(input.value === String(answer), `${name}: a helyes válasz beírása (${input.value})`);

    await sleep(650);
    const summary1 = root.querySelector(".mult-play-summary");
    check(Boolean(summary1) && summary1.textContent.includes("0 helyes válasz"), `${name}: összegzés rossz válasz után`);
    check(Boolean(summary1) && summary1.textContent.includes("Ezeket érdemes"), `${name}: hibás chip`);

    // A rossz válasz utáni késleltetett lépés csak a lezárt körben fut
    // (state.over), de várjuk meg, hogy ne induljon el a következő kör közben.
    await sleep(750);

    buttonByText(root, "🔁 Még egyet").click();
    check(Boolean(buttonByText(root, "⏱️ Indul a perc!")), `${name}: Még egyet visszavisz a választóhoz`);
    buttonByText(root, "⏱️ Indul a perc!").click();

    const fact2 = root.querySelector(".mult-play-fact");
    const answer2 = parseAnswer(fact2.textContent);
    const input2 = root.querySelector(".mult-play-input");
    input2.value = String(answer2);
    buttonByText(root, "Ellenőrzöm").click();

    await sleep(650);
    const summary2 = root.querySelector(".mult-play-summary");
    check(Boolean(summary2) && summary2.textContent.includes("Új rekord"), `${name}: rekord a helyes kör után`);

    const nextBtn = buttonByText(root, "➡️ Tovább");
    if (nextBtn) {
        nextBtn.click();
        check(nextCalls === 1, `${name}: a tovább hívja a következő lépést`);
    } else {
        check(false, `${name}: nincs tovább gomb`);
    }
    cleanup();
}

await testOptionsGame(renderAdditionPlay, "additionPlay");
await testAgainButton();
await testOptionsGame(renderPowerPlay, "powerPlay");
await testOptionsGame(renderIntegerPlay, "integerPlay");
await testOptionsGame(renderOperationOrderPlay, "operationOrderPlay");
await testMultiplicationChoice();
await testMultiplicationInput();
await testMissedStaysAfterRetry();

if (failures > 0) {
    console.error(`\nHIBA: ${failures} ellenőrzés bukott meg.`);
} else {
    console.log("\nPlay engine teszt OK ✔");
}
process.exit(failures > 0 ? 1 : 0);
