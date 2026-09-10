/**
 * COSY World Standalone Game Engine Module
 * Manages player state, movement, quest progression, inventory, dialogues,
 * language target configuration, audio TTS, and localStorage persistence.
 */

export const LANGUAGES = [
  { code: "english", name: "English", flag: "🇬🇧", native: "English" },
  { code: "french", name: "French", flag: "🇫🇷", native: "Français" },
  { code: "italian", name: "Italian", flag: "🇮🇹", native: "Italiano" },
  { code: "russian", name: "Russian", flag: "🇷🇺", native: "Русский" },
  { code: "greek", name: "Greek", flag: "🇬🇷", native: "Ελληνικά" },
  { code: "spanish", name: "Spanish", flag: "🇪🇸", native: "Español" },
  { code: "german", name: "German", flag: "🇩🇪", native: "Deutsch" },
  { code: "portuguese", name: "Portuguese", flag: "🇵🇹", native: "Português" },
  { code: "dutch", name: "Dutch", flag: "🇳🇱", native: "Nederlands" },
  { code: "polish", name: "Polish", flag: "🇵🇱", native: "Polski" },
  { code: "turkish", name: "Turkish", flag: "🇹🇷", native: "Türkçe" },
  { code: "arabic", name: "Arabic", flag: "🇸🇦", native: "العربية" },
  { code: "chinese", name: "Chinese", flag: "🇨🇳", native: "中文" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵", native: "日本語" }
];

export const CHARACTERS = {
  "james-york": {
    id: "james-york",
    name: "James York",
    role: "Town Explorer & Historian",
    avatar: "/shared/assets/james-york.svg",
    bio: "Passionate about culture, city histories, and social dialogues. James loves guiding newcomers through COSY Town's districts.",
    voiceLang: "en-US",
    startingDistrict: "residential"
  },
  "ella-bronx": {
    id: "ella-bronx",
    name: "Ella Bronx",
    role: "Local Artisan & Chef",
    avatar: "/shared/assets/ella-bronx.svg",
    bio: "Master baker and community socialite. Ella introduces players to everyday culinary terms, shopping, and market conversations.",
    voiceLang: "en-US",
    startingDistrict: "commercial"
  },
  "anna": {
    id: "anna",
    name: "Anna",
    role: "Cultural Ambassador & Scholar",
    avatar: "/shared/assets/anna.svg",
    bio: "Enthusiastic linguist and traveler. Anna helps learners master nuances, grammar structures, and immersive situational quests.",
    voiceLang: "en-US",
    startingDistrict: "cultural"
  }
};

export class GameEngine {
  constructor() {
    this.storageKey = 'cosyworld_standalone_save';
    this.sessionStartTime = Date.now();
    this.state = this.getInitialState();
    this.listeners = [];
  }

  getInitialState() {
    return {
      characterId: 'james-york',
      targetLanguage: 'french',
      citizenLevel: 1,
      xp: 0,
      timeSpentMinutes: 0,
      currentDistrict: 'residential',
      position: { x: 100, y: 150 },
      inventory: [
        { id: 'town_map', name: 'COSY Town Map', icon: '🗺️', desc: 'Interactive guide to districts and quest markers.' },
        { id: 'notebook', name: 'Language Notebook', icon: '📓', desc: 'Stores acquired vocabulary and phrases.' }
      ],
      completedQuests: [],
      activeQuests: ['meet-the-neighbors'],
      questObjectives: {
        'meet-the-neighbors': {
          greet_residents: false,
          introduce_self: false
        },
        'grocery-shopping': {
          visit_market: false,
          buy_fresh_bread: false
        },
        'cafe-conversation': {
          order_coffee: false,
          thank_barista: false
        }
      },
      vocabulary: [
        { word: 'Bonjour', translation: 'Hello / Good day', language: 'french', mastered: true },
        { word: 'Café', translation: 'Coffee', language: 'french', mastered: false }
      ],
      achievements: [
        { id: 'first_steps', name: 'First Steps', desc: 'Arrived in COSY Town', unlocked: true }
      ]
    };
  }

  init() {
    this.loadGame();
    this.startTimer();
    return this;
  }

  /* --- Persistence & State --- */

  saveGame() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.notifyListeners('save', this.state);
      return true;
    } catch (e) {
      console.error('Failed to save COSY World state:', e);
      return false;
    }
  }

  loadGame() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...this.getInitialState(), ...parsed };
        this.notifyListeners('load', this.state);
        return true;
      }
    } catch (e) {
      console.error('Failed to load COSY World save:', e);
    }
    return false;
  }

  hasSave() {
    return !!localStorage.getItem(this.storageKey);
  }

  exportPassport() {
    const passportData = {
      app: 'COSYworld',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      character: this.state.characterId,
      targetLanguage: this.state.targetLanguage,
      level: this.state.citizenLevel,
      xp: this.state.xp,
      completedQuests: this.state.completedQuests,
      vocabularyCount: this.state.vocabulary.length,
      timeSpentMinutes: this.state.timeSpentMinutes
    };
    return JSON.stringify(passportData, null, 2);
  }

  importPassport(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.xp !== undefined) this.state.xp = data.xp;
      if (data.level !== undefined) this.state.citizenLevel = data.level;
      if (Array.isArray(data.completedQuests)) {
        this.state.completedQuests = [...new Set([...this.state.completedQuests, ...data.completedQuests])];
      }
      this.saveGame();
      return true;
    } catch (e) {
      console.error('Invalid Passport format:', e);
      return false;
    }
  }

  /* --- Character & Language Selection --- */

  selectCharacter(charId) {
    if (CHARACTERS[charId]) {
      this.state.characterId = charId;
      this.state.currentDistrict = CHARACTERS[charId].startingDistrict;
      this.saveGame();
      this.notifyListeners('characterChange', charId);
    }
  }

  setLanguage(langCode) {
    this.state.targetLanguage = langCode;
    this.saveGame();
    this.notifyListeners('languageChange', langCode);
  }

  /* --- Movement System --- */

  moveTo(districtId, coords = null) {
    this.state.currentDistrict = districtId;
    if (coords) {
      this.state.position = coords;
    }
    this.saveGame();
    this.notifyListeners('move', { district: districtId, position: this.state.position });
  }

  /* --- Inventory System --- */

  addItem(item) {
    if (!this.state.inventory.some(i => i.id === item.id)) {
      this.state.inventory.push(item);
      this.saveGame();
      this.notifyListeners('inventoryUpdate', this.state.inventory);
    }
  }

  removeItem(itemId) {
    this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
    this.saveGame();
    this.notifyListeners('inventoryUpdate', this.state.inventory);
  }

  /* --- Quest System --- */

  completeObjective(questId, objectiveKey) {
    if (this.state.questObjectives[questId]) {
      this.state.questObjectives[questId][objectiveKey] = true;
      this.notifyListeners('objectiveCompleted', { questId, objectiveKey });

      // Check if quest fully completed
      const allDone = Object.values(this.state.questObjectives[questId]).every(val => val === true);
      if (allDone && !this.state.completedQuests.includes(questId)) {
        this.completeQuest(questId);
      } else {
        this.saveGame();
      }
    }
  }

  completeQuest(questId, xpReward = 100) {
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      this.state.activeQuests = this.state.activeQuests.filter(q => q !== questId);
      this.addXP(xpReward);
      this.saveGame();
      this.notifyListeners('questCompleted', questId);
    }
  }

  addXP(amount) {
    this.state.xp += amount;
    const oldLevel = this.state.citizenLevel;
    this.state.citizenLevel = Math.floor(this.state.xp / 200) + 1;
    if (this.state.citizenLevel > oldLevel) {
      this.notifyListeners('levelUp', this.state.citizenLevel);
    }
    this.saveGame();
  }

  /* --- Vocabulary Integration --- */

  learnWord(word, translation) {
    if (!this.state.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase())) {
      this.state.vocabulary.push({
        word,
        translation,
        language: this.state.targetLanguage,
        mastered: false
      });
      this.addXP(25);
      this.saveGame();
      this.notifyListeners('wordLearned', { word, translation });
    }
  }

  /* --- Text-to-Speech Dialogue Helper --- */

  speak(text, langCode = null) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode || this.state.targetLanguage || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  /* --- Utility & Events --- */

  startTimer() {
    setInterval(() => {
      this.state.timeSpentMinutes += 1;
      this.saveGame();
    }, 60000);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(event, payload) {
    this.listeners.forEach(fn => fn(event, payload, this.state));
  }
}

export const gameEngine = new GameEngine();
