# 🌍 COSY World — Standalone Open-World Language Learning RPG

> **Learn languages through direct immersion, interactive quest choices, natural NPC dialogues, and realistic world exploration across 14 target languages.**

---

## 🌟 Game Overview & Concept

COSY World is a standalone open-world RPG designed around **Inductive Direct Immersion ("Learn by Living, Not by Translating")**. Instead of passive memorization or grammar drills, players explore COSY Town, interact with local residents (James York, Ella Bronx, Anna), purchase goods in commercial districts, order food in cafes, and complete contextual everyday quests.

---

## 🎮 How to Play Guide

1. **Main Entry & Character Selection (`/index.html`)**:
   - Choose your main character:
     - **James York** (Town Explorer & Historian — Residential District)
     - **Ella Bronx** (Local Artisan & Chef — Commercial District)
     - **Anna** (Cultural Ambassador & Scholar — Cultural District)
   - Select your target language among 14 supported languages.
   - Click **"Start Adventure"** or **"Continue Game"** to load your saved state.

2. **Town Map Exploration (`/game/town-map/index.html`)**:
   - Interact with district hotspots: Residential, Commercial, Cultural.
   - Use fast travel points and view active quest markers.
   - Track your character's position across COSY Town.

3. **Completing Quests & Dialogues**:
   - Access beginner, intermediate, and advanced quests.
   - Interact with dialogue lines featuring Text-to-Speech (TTS) pronunciation.
   - Click highlighted vocabulary terms to view definitions and save them to your notebook.
   - Access direct links to **COSYtools** for grammar references and **COSYgames** for mini-game practice.

4. **Progress Tracking (`/progress/index.html`)**:
   - Review Citizen Level, XP, time spent, completed quests, and acquired vocabulary.
   - Export and backup your progress using the standardized **COSY Passport JSON schema**.
   - Import save files to restore progress across devices or sessions.

---

## 🌐 Supported 14 Target Languages

COSY World natively supports 14 target languages with flag icons, speech synthesis, and vocabulary database integration:

1. 🇬🇧 **English**
2. 🇫🇷 **French**
3. 🇮🇹 **Italian**
4. 🇷🇺 **Russian**
5. 🇬🇷 **Greek**
6. 🇪🇸 **Spanish**
7. 🇩🇪 **German**
8. 🇵🇹 **Portuguese**
9. 🇳🇱 **Dutch**
10. 🇵🇱 **Polish**
11. 🇹🇷 **Turkish**
12. 🇸🇦 **Arabic**
13. 🇨🇳 **Chinese**
14. 🇯🇵 **Japanese**

---

## 🗺️ Quest Roadmap

- **Beginner Quests**:
  - `meet-the-neighbors`: Neighborhood greetings and introduces character profiles in the Residential District.
  - `grocery-shopping`: Market shopping, ordering bread/fruits, and price queries with Ella Bronx in the Commercial District.
  - `cafe-conversation`: Ordering beverages, expressing gratitude, and polite social exchanges at the local coffee shop.
- **Intermediate Quests**:
  - Museum & History Tour, Directions & Transit, Neighborhood Park & Weather.
- **Advanced Quests**:
  - Debate & Cultural Philosophy, Social Events, Town Hall Diplomacy.

---

## 🌐 Part of the COSYlanguages Ecosystem

COSY World is part of the [COSYlanguages ecosystem](https://cosylanguages.github.io/COSYlanguages/), designed to operate standalone while offering rich integration with companion COSY resources:

- 🌐 **COSYlanguages**: [https://cosylanguages.github.io/COSYlanguages/](https://cosylanguages.github.io/COSYlanguages/) — Main ecosystem portal and open learning hub.
- 🧰 **COSYtools**: [https://cosylanguages.github.io/COSYtools/](https://cosylanguages.github.io/COSYtools/) — Interactive grammar tables, verb conjugation matrices, and gender practice.
- 🎮 **COSYgames**: [https://cosylanguages.github.io/COSYgames/](https://cosylanguages.github.io/COSYgames/) — Quick vocabulary mini-games and quiz challenges.

---

## 🏗️ Technical Architecture & Local Development

- **Tech Stack**: Vanilla ES6 Modules, HTML5 SVG graphics, CSS3, Web Speech API (TTS), LocalStorage persistence, Service Worker PWA.
- **Zero Build Tools**: Runs directly in modern web browsers without Node compilation.
- **Local Server**:
  ```bash
  python3 -m http.server 8080
  # or
  npx http-server -p 8080 .
  ```
- Open `http://localhost:8080` in your web browser.
