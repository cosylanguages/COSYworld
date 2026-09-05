// Grammatical Gender Classifier Script

import { fetchNounsGender } from '../../js/shared/data_fetcher.js';

let nouns = [];
let currentNoun = null;

document.addEventListener('DOMContentLoaded', async () => {
    nouns = await fetchNounsGender();
    if (nouns && nouns.length > 0) {
        loadRandomNoun();
    }

    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenGender = btn.getAttribute('data-gender');
            checkGender(chosenGender);
        });
    });
});

function loadRandomNoun() {
    if (!nouns || nouns.length === 0) return;
    currentNoun = nouns[Math.floor(Math.random() * nouns.length)];
    document.getElementById('word-display').textContent = `${currentNoun.word} (${currentNoun.language.toUpperCase()})`;
    const feedback = document.getElementById('gender-feedback');
    feedback.style.display = 'none';
}

function checkGender(chosen) {
    if (!currentNoun) return;
    const feedback = document.getElementById('gender-feedback');
    feedback.style.display = 'block';

    if (chosen.toLowerCase() === currentNoun.gender.toLowerCase()) {
        feedback.style.backgroundColor = '#d4edda';
        feedback.style.color = '#155724';
        feedback.textContent = `✅ Correct! "${currentNoun.article} ${currentNoun.word}" is ${currentNoun.gender.toUpperCase()}.`;
        setTimeout(loadRandomNoun, 1500);
    } else {
        feedback.style.backgroundColor = '#f8d7da';
        feedback.style.color = '#721c24';
        feedback.textContent = `❌ Incorrect. The correct gender is ${currentNoun.gender.toUpperCase()} (${currentNoun.article} ${currentNoun.word}).`;
    }
}
