#!/usr/bin/env node
/**
 * Inventory language metadata and text completeness for scene dialogue JSON.
 *
 * This is an audit/report tool, not a translator. It deliberately does not infer
 * language from filenames or silently label unreviewed content as English.
 *
 * Run from the repository root:
 *   node scripts/audit-dialogue-languages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dialogueDir = path.join(root, 'data', 'dialogues');

function collectJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
  }).sort();
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const files = collectJsonFiles(dialogueDir);
const report = [];
const parseErrors = [];

for (const file of files) {
  const relativePath = path.relative(root, file).split(path.sep).join('/');
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    parseErrors.push({ file: relativePath, error: error.message });
    continue;
  }

  const declaredLanguage = data.language ?? data.lang ?? data.languageCode ?? null;
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const missingNpcLines = [];
  const missingOptions = [];
  const missingOptionTexts = [];

  nodes.forEach((node, index) => {
    const nodeId = node?.id ?? String(index);
    if (!nonEmptyString(node?.npcLine)) missingNpcLines.push(nodeId);
    if (!Array.isArray(node?.playerOptions)) {
      missingOptions.push(nodeId);
      return;
    }
    node.playerOptions.forEach((option, optionIndex) => {
      if (!nonEmptyString(option?.text)) {
        missingOptionTexts.push(`${nodeId}[${optionIndex}]`);
      }
    });
  });

  report.push({
    file: relativePath,
    language: nonEmptyString(declaredLanguage) ? declaredLanguage : 'UNLABELLED',
    nodeCount: nodes.length,
    missingNpcLines,
    missingOptions,
    missingOptionTexts
  });
}

const labelled = report.filter((item) => item.language !== 'UNLABELLED').length;
const unlabelled = report.length - labelled;
console.log('COSYworld dialogue language audit');
console.log(`Files parsed: ${report.length}; labelled: ${labelled}; unlabelled: ${unlabelled}; parse errors: ${parseErrors.length}`);
console.log('');
console.log('FILE | LANGUAGE | NODES | MISSING NPC LINES | MISSING OPTIONS | MISSING OPTION TEXT');
for (const item of report) {
  const hasContentGaps = item.missingNpcLines.length || item.missingOptions.length || item.missingOptionTexts.length;
  if (item.language === 'UNLABELLED' || hasContentGaps) {
    console.log([
      item.file,
      item.language,
      item.nodeCount,
      item.missingNpcLines.join(',') || '-',
      item.missingOptions.join(',') || '-',
      item.missingOptionTexts.join(',') || '-'
    ].join(' | '));
  }
}
if (parseErrors.length) {
  console.error('');
  console.error('Invalid JSON files:');
  for (const item of parseErrors) console.error(`- ${item.file}: ${item.error}`);
  process.exitCode = 1;
}
