# Contributing to COSY World

Thank you for your interest in contributing to **COSY World**! We are building an open, peaceful, open-world language learning RPG designed around **Inductive Direct Immersion**.

---

## 🛠️ Contribution Guidelines

### 1. Allowed & Welcomed Contributions
You can freely submit Pull Requests for:
- **New Scenes**: Add new town locations (e.g., market, library, train station) in `data/scenes/districts.json`.
- **New Vocabulary & Objects**: Expand interactive items with 14 target language terms in `data/vocabulary/objects.json`.
- **New Dialogues & NPCs**: Add characters with branching dialogue nodes in `data/npcs/npcs.json`.
- **Language Translations**: Fix or expand multilingual strings across target languages in `data/languages/languages.json`.
- **UI & Bug Fixes**: Improve CSS accessibility, responsive touch controls, or performance.
- **Mini-Games**: Add contextual practice interactions within scenes.

### 2. Requiring Review & Maintainer Approval
Please open an issue to discuss before submitting PRs that affect:
- Core engine architecture (`js/engine/core.js`).
- Educational methodology or CEFR level structure.
- Save system schema breaking changes (`js/save/save_system.js`).

---

## 📋 How to Submit a Pull Request

1. Fork the `COSYworld` repository.
2. Create a feature branch (`git checkout -b feature/new-district-market`).
3. Validate your changes locally in browser.
4. Ensure all JSON data files conform to valid JSON formatting.
5. Commit your changes with clear, descriptive commit messages.
6. Push to your fork and submit a Pull Request.
