// Vocabulary Explorer Script

import { fetchVocabulary } from '../../js/shared/data_fetcher.js';

let vocabulary = [];

document.addEventListener('DOMContentLoaded', async () => {
    vocabulary = await fetchVocabulary();
    renderCards(vocabulary);

    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = vocabulary.filter(item =>
            item.word.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        renderCards(filtered);
    });
});

function renderCards(items) {
    const grid = document.getElementById('vocab-grid');
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No vocabulary items found.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'tool-card';
        card.innerHTML = `
            <div>
                <span style="font-size: 0.8rem; background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">CEFR ${item.cefr || 'A0'}</span>
                <h3 class="tool-title" style="margin-top: 0.5rem;">${item.word}</h3>
                <p class="tool-desc" style="margin-bottom: 0.5rem;">Category: <strong>${item.category}</strong></p>
                <p style="font-size: 0.9rem; color: #475569; font-style: italic;">"${(item.examples && item.examples[0]) || ''}"</p>
            </div>
        `;
        grid.appendChild(card);
    });
}
