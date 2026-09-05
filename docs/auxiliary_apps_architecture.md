# 🛠️ Auxiliary Apps Architecture & Repository Migration Strategy

## Executive Summary
This document outlines the architectural recommendation and migration guide for modular web tools (Conjugation Trainer, Grammatical Gender Trainer, and other micro-learning applications) in the COSY ecosystem, hosted at [https://github.com/cosylanguages/COSYtools](https://github.com/cosylanguages/COSYtools).

---

## 🎯 Strategic Objective
Separate standalone web apps and utility tools from the core `COSYworld` RPG repository into **1 dedicated shared auxiliary applications repository** (`COSYtools`).

---

## 🏛️ Architectural Comparison

| Criteria | Strategy A: Single Tools Repo (`COSYtools`) | Strategy B: Monorepo (`COSYworld` + Tools) | Strategy C: N Standalone Repos |
| :--- | :--- | :--- | :--- |
| **Recommendation** | **Recommended** 🏆 | Alternative | Not Recommended |
| **Repo Overhead** | Low (1 Game Repo + 1 Tools Repo) | Medium (Complex build pipeline) | High (Repository sprawl) |
| **Separation of Concerns** | High (Game Engine separated from Web Tools) | Low (Engine & web apps mixed) | High |
| **Code & Style Sharing** | High (Shared CSS tokens & datasets across tools) | High | Low (Duplicated code across repos) |
| **Deployment Simplicity** | High (Independent static web app deployments) | Medium | Low |

---

## 📂 Repository Structure (`COSYtools`)

```
COSYtools/
├── index.html                  # Central hub for all COSY language web tools
├── css/
│   └── shared-ui.css           # Unified COSY design system tokens & styles
├── apps/
│   ├── conjugation/            # Verb Conjugation Trainer & Reference App
│   │   ├── index.html
│   │   └── app.js
│   └── gender/                 # Grammatical Gender Trainer (der/die/das, le/la)
│       ├── index.html
│       └── app.js
├── shared/
│   ├── js/
│   │   ├── tts_helper.js       # Shared Web Speech API voice synthesis
│   │   ├── widget_wrapper.js   # Custom Element / iframe widget wrapper
│   │   └── storage.js          # Shared state & progress management
│   └── data/                   # Shared datasets across tools & target languages
│       ├── conjugations.json   # Verb conjugation tables (14 target languages)
│       └── genders.json        # Noun gender datasets with visual cues
└── README.md                   # Setup & developer contribution guide
```

---

## 💻 Quick Setup & Initialization for `COSYtools`

To populate the `https://github.com/cosylanguages/COSYtools` repository:

1. **Clone the `COSYtools` repository**:
   ```bash
   git clone https://github.com/cosylanguages/COSYtools.git
   cd COSYtools
   ```

2. **Create Core Directory Layout**:
   ```bash
   mkdir -p css apps/conjugation apps/gender shared/js shared/data
   ```

3. **Sample `index.html` (Central Directory Hub)**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>COSY Language Tools</title>
       <link rel="stylesheet" href="css/shared-ui.css">
   </head>
   <body>
       <header class="cosy-header">
           <h1>🌍 COSY Language Tools</h1>
           <p>Direct Immersion Micro-Apps for Conjugation, Noun Gender & Grammar</p>
       </header>
       <main class="cosy-grid">
           <a href="apps/conjugation/" class="cosy-card">
               <h2>🗣️ Conjugation Trainer</h2>
               <p>Practice verb tenses & conjugations across 14 languages.</p>
           </a>
           <a href="apps/gender/" class="cosy-card">
               <h2>🏷️ Noun Gender Trainer</h2>
               <p>Master grammatical articles (der/die/das, le/la, el/la).</p>
           </a>
       </main>
   </body>
   </html>
   ```

4. **Commit & Push to `COSYtools`**:
   ```bash
   git add .
   git commit -m "feat: initialize COSYtools repository structure & apps hub"
   git push origin main
   ```

---

## 🔗 Integration with COSY World (`COSYworld`)

1. **Deep-Linking & Query Parameters**:
   - `COSYworld` NPC dialogues or minigames link directly to specific tools with contextual parameters:
   - Example: `https://tools.cosylanguages.com/conjugation?lang=es&verb=hablar`

2. **Embeddable Widget Support**:
   - Apps in `COSYtools` can be embedded into the main website or `COSYworld` via Custom Web Components or `<iframe>` embeds.

3. **Monolingual Direct Immersion**:
   - Maintains COSY's core **Monolingual Learning Architecture** (no translation cards, direct visual/auditory context across 14 target languages).

4. **Unified Progress & XP Synchronization**:
   - Shares LocalStorage keys (`cosy_player_progress`, `cosy_vocabulary_mastery`) so practice in `COSYtools` rewards XP in `COSYworld`.
