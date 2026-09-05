# 🧰 COSYtools — Auxiliary Language Learning Web Apps Suite

Welcome to **COSYtools**, the standalone auxiliary micro-apps suite supporting the COSY language learning ecosystem!

> **Live Repository**: [https://github.com/cosylanguages/COSYtools](https://github.com/cosylanguages/COSYtools)

---

## 🚀 Available Micro-Apps

This repository contains standalone, zero-dependency HTML5/ES6 web apps designed for targeted linguistic practice:

1. **🗣️ Conjugation Trainer (`apps/conjugation/`)**: Practice verb conjugations across tenses and target languages with interactive quizzes.
2. **🏷️ Grammatical Gender Classifier (`apps/gender/`)**: Master noun gender, articles (*el/la*, *der/die/das*, *le/la*), and gender rules.
3. **📊 Verb & Declension Matrices (`apps/verb-tables/`)**: Search and inspect full paradigm tables for regular and irregular verbs.
4. **🔍 Vocabulary Explorer (`apps/vocab-explorer/`)**: Browse and inspect COSY's monolingual vocabulary database entries.

---

## 🛠️ Quick Start & Local Preview

COSYtools runs natively in any modern browser without build tools or bundlers.

1. Serve this repository root using any web server:
   ```bash
   npx http-server -p 8081 .
   # or
   python3 -m http.server 8081
   ```
2. Open `http://localhost:8081` in your browser to launch the central tools hub.

---

## 📁 Repository Layout

```
COSYtools/
├── index.html              # Central hub launcher
├── README.md               # Repository documentation
├── css/
│   └── main.css            # Global design tokens and layout stylesheet
├── js/
│   ├── hub.js              # Launcher hub script
│   └── shared/             # Common utilities & data fetchers
├── apps/
│   ├── conjugation/        # Verb Conjugation Trainer
│   ├── gender/             # Grammatical Gender Classifier
│   ├── verb-tables/        # Verb Matrix Viewer
│   └── vocab-explorer/     # Monolingual Vocabulary Inspector
└── data/                   # Shared linguistic datasets
    ├── verbs.json
    ├── nouns_gender.json
    ├── languages.json
    └── vocabulary.json
```
