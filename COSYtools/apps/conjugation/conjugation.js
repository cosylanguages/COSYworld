// Conjugation Trainer Script

import { fetchVerbs } from '../../js/shared/data_fetcher.js';

let verbs = [];
let currentVerb = null;
let currentPronoun = 'je';

document.addEventListener('DOMContentLoaded', async () => {
    verbs = await fetchVerbs();
    const verbSelect = document.getElementById('verb-select');

    if (verbs && verbs.length > 0) {
        verbs.forEach((v, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${v.verb} (${v.language.toUpperCase()}) - ${v.translation_key}`;
            verbSelect.appendChild(opt);
        });

        currentVerb = verbs[0];
        setupPrompt();

        verbSelect.addEventListener('change', (e) => {
            currentVerb = verbs[e.target.value];
            setupPrompt();
        });
    }

    // Pre-fill from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paramWord = urlParams.get('word');
    if (paramWord && verbs.length > 0) {
        const foundIndex = verbs.findIndex(v => v.verb.toLowerCase() === paramWord.toLowerCase());
        if (foundIndex !== -1) {
            verbSelect.value = foundIndex;
            currentVerb = verbs[foundIndex];
            setupPrompt();
        }
    }

    document.getElementById('check-btn').addEventListener('click', checkAnswer);
});

function setupPrompt() {
    if (!currentVerb) return;
    document.getElementById('target-verb-title').textContent = `${currentVerb.verb} (${currentVerb.language.toUpperCase()})`;
    const pronouns = Object.keys(currentVerb.tenses.present || {});
    currentPronoun = pronouns[Math.floor(Math.random() * pronouns.length)] || 'je';
    document.getElementById('pronoun-prompt').innerHTML = `Pronoun: <strong>${currentPronoun}</strong>`;

    const feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    document.getElementById('answer-input').value = '';
}

function checkAnswer() {
    if (!currentVerb) return;
    const inputVal = document.getElementById('answer-input').value.trim().toLowerCase();
    const expected = (currentVerb.tenses.present[currentPronoun] || '').toLowerCase();
    const feedback = document.getElementById('feedback');

    feedback.style.display = 'block';
    if (inputVal === expected) {
        feedback.className = 'result-feedback result-correct';
        feedback.textContent = '✅ Correct! Well done!';
        setTimeout(setupPrompt, 1500);
    } else {
        feedback.className = 'result-feedback result-incorrect';
        feedback.textContent = `❌ Incorrect. Correct form: "${expected}"`;
    }
}
