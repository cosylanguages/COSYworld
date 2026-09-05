// Shared Data Fetcher for COSYtools

export async function fetchVerbs() {
    try {
        const res = await fetch('../../data/verbs.json');
        if (!res.ok) throw new Error('Failed to load verbs');
        return await res.json();
    } catch (err) {
        console.warn('Fallback verbs dataset loaded due to fetch error:', err);
        return [
            {
                verb: 'parler',
                language: 'fr',
                translation_key: 'speak',
                tenses: {
                    present: {
                        je: 'parle',
                        tu: 'parles',
                        il_elle: 'parle',
                        nous: 'parlons',
                        vous: 'parlez',
                        ils_elles: 'parlent'
                    }
                }
            },
            {
                verb: 'hablar',
                language: 'es',
                translation_key: 'speak',
                tenses: {
                    present: {
                        yo: 'hablo',
                        tu: 'hablas',
                        el_ella: 'habla',
                        nosotros: 'hablamos',
                        vosotros: 'habláis',
                        ellos_ellas: 'hablan'
                    }
                }
            },
            {
                verb: 'sprechen',
                language: 'de',
                translation_key: 'speak',
                tenses: {
                    present: {
                        ich: 'spreche',
                        du: 'sprichst',
                        er_sie_es: 'spricht',
                        wir: 'sprechen',
                        ihr: 'spracht',
                        sie_Sie: 'sprechen'
                    }
                }
            }
        ];
    }
}

export async function fetchNounsGender() {
    try {
        const res = await fetch('../../data/nouns_gender.json');
        if (!res.ok) throw new Error('Failed to load nouns gender');
        return await res.json();
    } catch (err) {
        console.warn('Fallback nouns dataset loaded due to fetch error:', err);
        return [
            { word: 'casa', language: 'es', gender: 'feminine', article: 'la' },
            { word: 'libro', language: 'es', gender: 'masculine', article: 'el' },
            { word: 'Haus', language: 'de', gender: 'neuter', article: 'das' },
            { word: 'Tisch', language: 'de', gender: 'masculine', article: 'der' },
            { word: 'maison', language: 'fr', gender: 'feminine', article: 'la' }
        ];
    }
}

export async function fetchVocabulary() {
    try {
        const res = await fetch('../../data/vocabulary.json');
        if (!res.ok) throw new Error('Failed to load vocabulary');
        return await res.json();
    } catch (err) {
        return [
            { id: 'coffee_table', word: 'coffee table', cefr: 'A0', category: 'furniture', examples: ['A low table in living room.'] },
            { id: 'sofa', word: 'sofa', cefr: 'A0', category: 'furniture', examples: ['A comfortable sofa for sitting.'] },
            { id: 'baguette', word: 'baguette', cefr: 'A1', category: 'food', examples: ['A long fresh French bread.'] }
        ];
    }
}
