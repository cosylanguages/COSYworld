#!/usr/bin/env node
/**
 * Read-only audit of learner-facing grammar and quest text localization.
 *
 * This script reports coverage gaps; it does not infer source language,
 * translate content, or modify data.
 *
 * Run from the repository root:
 *   node scripts/audit-learning-content-language.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const supportedLanguages = ['en', 'fr', 'it', 'es', 'de', 'ru', 'el', 'pt'];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function localeCoverage(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return [];
  return supportedLanguages.filter((language) => text(map[language]));
}

function collectGrammarGaps(grammar) {
  const gaps = [];
  const addScalar = (path, value) => {
    if (text(value)) gaps.push({ path, missingLocales: supportedLanguages.join(','), value: value.slice(0, 100) });
  };
  const addLocaleMap = (path, map) => {
    const present = localeCoverage(map);
    const missing = supportedLanguages.filter((language) => !present.includes(language));
    if (missing.length) gaps.push({ path, missingLocales: missing.join(','), value: '[localized text map]' });
  };

  grammar.forEach((point, index) => {
    const base = `data/grammar/grammar.json[${index}:${point.id || 'unknown'}]`;
    addScalar(`${base}.title`, point.title);
    addScalar(`${base}.rule`, point.rule);

    (point.examples || []).forEach((example, i) => {
      if (example.targetLang) addLocaleMap(`${base}.examples[${i}].targetLang`, example.targetLang);
      else addScalar(`${base}.examples[${i}].text`, example.text);
      addScalar(`${base}.examples[${i}].context`, example.context);
    });

    (point.interactiveExercises || []).forEach((exercise, i) => {
      const path = `${base}.interactiveExercises[${i}]`;
      addScalar(`${path}.question`, exercise.question);
      addScalar(`${path}.explanation`, exercise.explanation);
      (exercise.options || []).forEach((option, j) => addScalar(`${path}.options[${j}]`, option));
      (exercise.words || []).forEach((word, j) => addScalar(`${path}.words[${j}]`, word));
      (exercise.correctOrder || []).forEach((word, j) => addScalar(`${path}.correctOrder[${j}]`, word));
    });

    (point.dialogues || []).forEach((dialogue, i) => {
      addScalar(`${base}.dialogues[${i}].prompt`, dialogue.prompt);
      addScalar(`${base}.dialogues[${i}].grammarUsage`, dialogue.grammarUsage);
    });
  });
  return gaps;
}

function collectQuestGaps(quests) {
  const gaps = [];
  const add = (path, value) => {
    if (text(value)) gaps.push({ path, missingLocales: supportedLanguages.join(','), value: value.slice(0, 100) });
  };
  quests.forEach((quest, index) => {
    const base = `data/quests/quests.json[${index}:${quest.id || 'unknown'}]`;
    ['title', 'description'].forEach((key) => add(`${base}.${key}`, quest[key]));
    (quest.steps || []).forEach((step, i) => add(`${base}.steps[${i}].description`, step.description));
    (quest.objectives || []).forEach((objective, i) => add(`${base}.objectives[${i}].description`, objective.description));
    if (quest.dialogues && typeof quest.dialogues === 'object') {
      for (const [key, value] of Object.entries(quest.dialogues)) add(`${base}.dialogues.${key}`, value);
    }
  });
  return gaps;
}

let grammar;
let quests;
try {
  grammar = readJson('data/grammar/grammar.json');
  quests = readJson('data/quests/quests.json');
  if (!Array.isArray(grammar) || !Array.isArray(quests)) {
    throw new Error('Expected grammar and quest JSON roots to be arrays.');
  }
} catch (error) {
  console.error(`Unable to load learning-content data: ${error.message}`);
  process.exit(1);
}

const grammarGaps = collectGrammarGaps(grammar);
const questGaps = collectQuestGaps(quests);
const exampleCount = grammar.reduce((sum, point) => sum + (point.examples || []).length, 0);
const localeCounts = Object.fromEntries(supportedLanguages.map((language) => [
  language,
  grammar.reduce((sum, point) => sum + (point.examples || []).filter((example) => text(example.targetLang?.[language])).length, 0)
]));

console.log('COSYworld grammar and quest localization audit');
console.log(`Grammar points: ${grammar.length}; examples: ${exampleCount}; quests: ${quests.length}`);
console.log('Examples with localized targetLang text by language:');
for (const language of supportedLanguages) console.log(`  ${language}: ${localeCounts[language]} / ${exampleCount}`);
console.log('');
console.log(`Static grammar text fields requiring localization review: ${grammarGaps.length}`);
for (const gap of grammarGaps) console.log(`[grammar] ${gap.path} | review locales: ${gap.missingLocales} | ${gap.value}`);
console.log('');
console.log(`Static quest text fields requiring localization review: ${questGaps.length}`);
for (const gap of questGaps) console.log(`[quest] ${gap.path} | review locales: ${gap.missingLocales} | ${gap.value}`);
