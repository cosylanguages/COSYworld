/**
 * COSY Passport ES Module
 * Location: shared/js/passport.js
 *
 * Client-side module for importing, exporting, merging, downloading,
 * and loading COSY Passport JSON data across the COSYlanguages ecosystem.
 */

export const ALLOWED_SOURCES = [
    "COSYlanguages",
    "COSYtools",
    "COSYworld",
    "COSYgames",
    "COSYevents"
];

/**
 * Normalizes input JSON string or object into a passport structure.
 */
function parsePassportInput(input) {
    if (!input) return null;
    if (typeof input === "string") {
        try {
            return JSON.parse(input);
        } catch (e) {
            return null;
        }
    }
    if (typeof input === "object") {
        return input;
    }
    return null;
}

/**
 * Export / Merge Passport data
 *
 * @param {string|object} existingJSON - Existing passport data string or object (can be null/empty)
 * @param {object} newEntries - Updates to merge: { source, progress: [...|{}], badges: [...] }
 * @param {string} language - ISO language code (e.g., 'en', 'fr')
 * @returns {object} Updated passport object
 */
export function exportPassport(existingJSON, newEntries = {}, language = 'en') {
    const existing = parsePassportInput(existingJSON) || {};

    const activeSource = (newEntries && newEntries.source) || 'COSYlanguages';
    const activeLang = language || existing.language || 'en';

    // Base passport structure
    const passport = {
        cosy_passport_version: 1,
        language: activeLang,
        updated: new Date().toISOString(),
        progress: [],
        badges: []
    };

    // 1. Process Existing Progress (preserving unknown-source entries)
    const existingProgress = Array.isArray(existing.progress) ? existing.progress : [];
    const preservedProgressMap = new Map();

    for (const item of existingProgress) {
        if (item && item.item && item.source) {
            const key = `${item.source}:${item.item}`;
            preservedProgressMap.set(key, { ...item });
        }
    }

    // 2. Process New Progress Entries
    let newProgressList = [];
    if (newEntries && newEntries.progress) {
        if (Array.isArray(newEntries.progress)) {
            newProgressList = newEntries.progress.map(entry => ({
                source: entry.source || activeSource,
                item: entry.item,
                value: entry.value
            }));
        } else if (typeof newEntries.progress === 'object') {
            newProgressList = Object.entries(newEntries.progress).map(([itemKey, val]) => ({
                source: activeSource,
                item: itemKey,
                value: val
            }));
        }
    }

    // Update/add new entries into progress map
    for (const entry of newProgressList) {
        if (entry.item) {
            const key = `${entry.source}:${entry.item}`;
            preservedProgressMap.set(key, entry);
        }
    }

    passport.progress = Array.from(preservedProgressMap.values());

    // 3. Process Badges (deduplicated)
    const existingBadges = Array.isArray(existing.badges) ? existing.badges : [];
    const newBadges = (newEntries && Array.isArray(newEntries.badges)) ? newEntries.badges : [];
    const badgeSet = new Set([...existingBadges, ...newBadges]);

    passport.badges = Array.from(badgeSet);

    return passport;
}

/**
 * Import Passport data for a specific source application
 *
 * @param {string|object} json - Passport JSON string or object
 * @param {string} sourceName - Source name (e.g., 'COSYlanguages', 'COSYtools')
 * @returns {object} Imported data relevant to sourceName plus full passport
 */
export function importPassport(json, sourceName = null) {
    const passport = parsePassportInput(json);

    if (!passport || typeof passport !== 'object') {
        return {
            valid: false,
            error: 'Invalid JSON passport input',
            language: 'en',
            updated: null,
            progress: [],
            badges: [],
            fullPassport: null
        };
    }

    const allProgress = Array.isArray(passport.progress) ? passport.progress : [];
    const filteredProgress = sourceName
        ? allProgress.filter(entry => entry && entry.source === sourceName)
        : allProgress;

    return {
        valid: true,
        cosy_passport_version: passport.cosy_passport_version || 1,
        language: passport.language || 'en',
        updated: passport.updated || null,
        progress: filteredProgress,
        badges: Array.isArray(passport.badges) ? passport.badges : [],
        fullPassport: passport
    };
}

/**
 * Trigger client-side JSON download of passport
 *
 * @param {string|object} obj - Passport object or string
 * @param {string} filename - Target filename (default: 'cosy-passport.json')
 * @returns {string} Formatted JSON string
 */
export function downloadPassport(obj, filename = 'cosy-passport.json') {
    const jsonString = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'cosy-passport.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return jsonString;
}

/**
 * Load Passport JSON object from an input element or File object
 *
 * @param {HTMLInputElement|File} input - Input element or File reference
 * @returns {Promise<object>} Resolved passport object
 */
export function loadPassportFromFile(input) {
    return new Promise((resolve, reject) => {
        let file = null;

        if (input && input.files && input.files.length > 0) {
            file = input.files[0];
        } else if (input instanceof File) {
            file = input;
        }

        if (!file) {
            return reject(new Error('No valid file provided'));
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                resolve(parsed);
            } catch (err) {
                reject(new Error('Failed to parse JSON passport file: ' + err.message));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading passport file'));
        };

        reader.readAsText(file);
    });
}
