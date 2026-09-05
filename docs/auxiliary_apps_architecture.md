# Auxiliary Web Apps Separation & Architecture Proposal

## 1. Overview & Architectural Rationale

As the COSY ecosystem grows, it is essential to maintain clear domain boundaries between the core RPG immersion experience (**COSY World**) and dedicated linguistic practice tools.

- **`COSYworld`** (`https://github.com/cosylanguages/COSYworld`): Focuses on the open-world RPG game engine, inductive direct immersion, SVG stage rendering, NPC simulation, dialogues, and quest progression without translation or grammar drill clutter.
- **`COSYtools`** (`https://github.com/cosylanguages/COSYtools`): Dedicated repository hosting auxiliary web apps and linguistic micro-tools, such as verb conjugation trainers, grammatical gender classifiers, verb reference tables, and vocabulary inspectors.

Separating these auxiliary tools into `COSYtools` achieves:
1. **Repository Decoupling**: Prevents build/bundle bloat in the main RPG engine.
2. **Focused User Experience**: Gamers and RPG learners enjoy an uninterrupted immersion world in `COSYworld`, while learners seeking targeted grammar or drill practice can access lightweight, fast-loading tools in `COSYtools`.
3. **Independent Deployment & Reusability**: Auxiliary micro-apps can be hosted as standalone static web pages, PWA modules, or embedded widgets across educational portals.

---

## 2. Dedicated Repository Target: `COSYtools`

- **Repository URL**: `https://github.com/cosylanguages/COSYtools`
- **Primary Stack**: Vanilla ES6 Modules, HTML5, CSS3, zero heavy external build dependencies.
- **Target Auxiliary Apps Suite**:
  1. **Conjugation Trainer (`apps/conjugation/`)**: Interactive verb tense conjugator and practice quiz for all 14 target languages.
  2. **Grammatical Gender Classifier (`apps/gender/`)**: Noun gender identifier, article trainer (e.g., *el/la*, *der/die/das*, *le/la*), and gender pattern analyzer.
  3. **Verb & Declension Tables (`apps/verb-tables/`)**: Comprehensive paradigm matrix viewer for standard and irregular verbs.
  4. **Vocabulary & Collocation Explorer (`apps/vocab-explorer/`)**: Standalone browser for COSY monolingual vocabulary database datasets.

---

## 3. Directory Layout for `COSYtools`

```
COSYtools/
├── index.html                  # Central hub & launcher for all auxiliary tools
├── css/
│   ├── main.css                # Shared design tokens & responsive navigation bar
│   └── tools.css               # Tool-specific UI components (verb matrices, quiz cards)
├── js/
│   ├── shared/                 # Common data fetchers, audio synthesis, local state
│   └── hub.js                  # Tools launcher script
├── apps/
│   ├── conjugation/            # Verb Conjugation Trainer
│   │   ├── index.html
│   │   ├── conjugation.js
│   │   └── conjugation.css
│   ├── gender/                 # Grammatical Gender Tool
│   │   ├── index.html
│   │   ├── gender.js
│   │   └── gender.css
│   └── verb-tables/            # Verb & Declension Matrix
│       ├── index.html
│       └── verb_tables.js
├── data/                       # Shared linguistic data (or synced from COSYworld)
│   ├── verbs.json
│   ├── nouns_gender.json
│   └── languages.json
└── README.md                   # Setup guide and tool catalog
```

---

## 4. Shared Data Schemas

### Verb Conjugation Schema (`data/verbs.json`)
```json
{
  "verb": "parler",
  "language": "fr",
  "translation_key": "speak",
  "tenses": {
    "present": {
      "je": "parle",
      "tu": "parles",
      "il_elle": "parle",
      "nous": "parlons",
      "vous": "parlez",
      "ils_elles": "parlent"
    }
  }
}
```

### Grammatical Gender Schema (`data/nouns_gender.json`)
```json
{
  "word": "haus",
  "language": "de",
  "gender": "neuter",
  "article": "das",
  "plural": "Häuser",
  "clues": ["-haus ending is neuter"]
}
```

---

## 5. Integration Points with COSY World

1. **Cross-Navigation Links**: `COSYworld` HUD and Pause Menu provide direct external links to `COSYtools` (e.g., `https://cosylanguages.github.io/COSYtools/apps/conjugation/?word=parler`).
2. **URL Parameter Pre-filling**: `COSYtools` apps accept URL search parameters (`?word=...&lang=...`) so players inspect verbs or nouns directly from game hotspots or dialogues.
3. **Data Synchronization**: Shared datasets (e.g. 14 target languages, vocabulary nouns) follow standard JSON schemas compatible across both repositories.

---

## 6. Migration & Setup Instructions for `COSYtools`

To initialize the separated repository on a local machine:

```bash
# Clone the newly created COSYtools repository
git clone https://github.com/cosylanguages/COSYtools.git
cd COSYtools

# Create directory structure
mkdir -p apps/conjugation apps/gender apps/verb-tables css js/shared data

# Launch local preview server
npx http-server -p 8081 .
```

---

## 7. Verification & Maintenance

- Ensure all HTML pages pass standard HTML5 validation.
- Maintain monolingual learning compatibility while offering clear auxiliary practice interface.
- Run continuous integration tests on shared JSON datasets across both `COSYworld` and `COSYtools`.
