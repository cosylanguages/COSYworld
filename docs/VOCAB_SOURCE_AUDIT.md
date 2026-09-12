# 📊 Vocabulary & Grammar Data Source Audit — COSY World

## 📌 Executive Summary

This audit evaluates vocabulary, grammar rules, verb conjugation patterns, and language reference data maintained within `COSYworld` (`data/` and `game/` directories). The goal is to identify data structures that duplicate datasets already or prospectively maintained by **COSYtools** (e.g., verb conjugation matrices, gender rules, word definitions, grammar reference trees) and to recommend a clean migration strategy aligned with COSYtools' shared **Data Contract** (`docs/DATA_CONTRACT.md`).

> **Note:** Per product specification, this audit documents the redundancy and recommended integration path. No live game engine or dialogue logic was rewired during this step.

---

## 🔍 Audited Datasets & Duplication Findings

### 1. Grammar Reference & Rule Definitions
* **Source Files**:
  - `data/grammar/grammar.json`
  - `data/grammar_patterns/grammar_patterns.json`
* **Current Contents**:
  - Contains CEFR-graded grammar rules (`gt_to_be`, `gt_personal_pronouns`, `gt_present_simple`, `gt_comparatives`, etc.), rule descriptions, example sentences with multilingual translations, and interactive multiple-choice questions.
* **Duplication Analysis**:
  - **COSYtools** maintains interactive grammar tables and rule reference modules (`apps/verb-tables/`, `apps/conjugation/`).
  - Storing static grammar definitions in `data/grammar/grammar.json` creates a duplicate source of truth across the ecosystem.

### 2. Verb Conjugation & Drill Exercises
* **Source Files**:
  - `data/minigames/minigames.json`
  - `data/grammar/grammar.json` (inside `interactiveExercises`)
* **Current Contents**:
  - Hardcoded verb form questions (e.g., choosing `am`/`is`/`are`, present continuous transformations, past tense verb forms).
* **Duplication Analysis**:
  - **COSYtools** already provides dedicated verb conjugation matrices and tables (`apps/conjugation/`, `apps/verb-tables/`).
  - Hardcoding exercise options in COSYworld risks drift when verb paradigms or target language rules are updated in COSYtools.

### 3. Vocabulary Lexicon & Word Attributes
* **Source Files**:
  - `data/vocabulary/objects.json`
  - `data/vocabulary/vocabulary_database.json`
  - `data/vocabulary/objects/objects_vocabulary.json`
  - `data/vocabulary/actions/actions_vocabulary.json`
  - `data/vocabulary/adjectives/adjectives_vocabulary.json`
* **Current Contents**:
  - Multilingual translation maps across 14+ target languages for world objects (`key`, `door_lock`, `apple`, `sofa`, etc.).
  - Monolingual vocabulary database entries detailing CEFR level, category, example usage sentences, related terms, and associated actions.
* **Duplication Analysis**:
  - **COSYtools** maintains word explorer and gender rules applications (`apps/vocab-explorer/`, `apps/gender/`).
  - Storing full translations and word metadata in COSYworld duplicates COSYtools' vocabulary contracts.

### 4. Gender Rules & Noun Classifications
* **Source Files**:
  - `data/vocabulary/objects.json`
  - `data/grammar/grammar.json`
* **Current Contents**:
  - Implicit noun gender properties and grammatical agreement patterns for supported target languages.
* **Duplication Analysis**:
  - **COSYtools** maintains explicit gender rules and practice modules (`apps/gender/`).
  - Noun gender metadata should be sourced directly from COSYtools rather than maintained locally in scene/object configs.

---

## 🎯 Recommended Architecture & Integration Strategy

### Single Source of Truth via COSYtools Data Contract

When the COSYtools Data Contract (`docs/DATA_CONTRACT.md`) lands, `COSYworld` should transition from static data files to consuming COSYtools' standardized data schemas or API/JSON endpoints.

```
                  ┌─────────────────────────────────┐
                  │    COSYtools Data Contract      │
                  │  (Central Source of Truth)      │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Verb Conjugation│       │ Gender Rules &  │       │ Vocab Lexicon & │
│   & Grammar     │       │ Noun Classes    │       │  CEFR Metadata  │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │  (Fetch / Shared Module Import)
                                   ▼
                  ┌─────────────────────────────────┐
                  │           COSYworld             │
                  │ (RPG Game & Spatial Mechanics)  │
                  └─────────────────────────────────┘
```

### Separation of Concerns
1. **COSYworld Responsibilities**:
   - World spatial layout, district maps, and hotspot coordinates (`x`, `y`, `width`, `height`).
   - Quest state progression, inventory management, NPC relationship scores (FP), and chapter progression.
   - Interactive dialogue tree flows (`data/dialogues/`).
2. **COSYtools Responsibilities**:
   - Canonical vocabulary word definitions, CEFR ratings, audio pronunciations, and example usage sentences.
   - Verb conjugation tables and grammatical paradigm rules.
   - Noun gender classifications and agreement rules.

---

## 🚀 Recommended Migration Roadmap

1. **Phase 1: Shared JSON / Data Contract Adoption**
   - Align `data/vocabulary/vocabulary_database.json` and `data/grammar/grammar.json` schemas with COSYtools data contract definitions.
2. **Phase 2: Dynamic Data Fetching**
   - Refactor `VocabularyEngine` (`js/vocabulary/vocabulary_engine.js`) and `GrammarEngine` (`js/grammar/grammar_engine.js`) to dynamically fetch or import grammar and vocabulary data from COSYtools endpoints/bundles at runtime, falling back to local cached snapshots when offline.
3. **Phase 3: Clean Local Redundancy Removal**
   - Remove redundant local verb tables and gender rules from `data/`, retaining only RPG-specific hotspot positioning and quest bindings in COSYworld.
