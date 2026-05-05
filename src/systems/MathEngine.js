function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddition() {
    const a = rand(1, 20);
    const b = rand(1, 20);
    return { text: `${a} + ${b}`, answer: a + b };
}

function makeSubtraction() {
    const b = rand(1, 15);
    const a = rand(b + 1, 20);
    return { text: `${a} - ${b}`, answer: a - b };
}

function makeMultiplication() {
    const a = rand(2, 10);
    const b = rand(2, 10);
    return { text: `${a} × ${b}`, answer: a * b };
}

function makeDivision() {
    const divisor = rand(2, 10);
    const result = rand(2, 10);
    const dividend = divisor * result;
    return { text: `${dividend} ÷ ${divisor}`, answer: result };
}

export function generateQuestion(difficulty) {
    switch (difficulty) {
        case 'easy':
            return makeAddition();
        case 'medium':
            return Math.random() < 0.5 ? makeAddition() : makeSubtraction();
        case 'hard': {
            const r = Math.random();
            if (r < 0.33) return makeAddition();
            if (r < 0.66) return makeSubtraction();
            return makeMultiplication();
        }
        case 'hell': {
            const r = Math.random();
            if (r < 0.25) return makeAddition();
            if (r < 0.5) return makeSubtraction();
            if (r < 0.75) return makeMultiplication();
            return makeDivision();
        }
        default:
            return makeAddition();
    }
}

export function generateChoices(answer) {
    const choices = new Set([answer]);
    let attempts = 0;
    while (choices.size < 4 && attempts < 50) {
        attempts++;
        const delta = rand(1, 8) * (Math.random() < 0.5 ? 1 : -1);
        const wrong = answer + delta;
        if (wrong > 0 && wrong !== answer) choices.add(wrong);
    }
    return Array.from(choices).sort(() => Math.random() - 0.5);
}
