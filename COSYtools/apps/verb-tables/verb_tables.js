// Verb Tables Script

import { fetchVerbs } from '../../js/shared/data_fetcher.js';

document.addEventListener('DOMContentLoaded', async () => {
    const verbs = await fetchVerbs();
    const select = document.getElementById('verb-table-select');

    if (verbs && verbs.length > 0) {
        verbs.forEach((v, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${v.verb} (${v.language.toUpperCase()}) - ${v.translation_key}`;
            select.appendChild(opt);
        });

        renderMatrix(verbs[0]);

        select.addEventListener('change', (e) => {
            renderMatrix(verbs[e.target.value]);
        });
    }
});

function renderMatrix(verb) {
    const tbody = document.getElementById('matrix-body');
    tbody.innerHTML = '';

    if (!verb || !verb.tenses || !verb.tenses.present) return;

    Object.entries(verb.tenses.present).forEach(([pronoun, form]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${pronoun}</strong></td><td>${form}</td>`;
        tbody.appendChild(tr);
    });
}
