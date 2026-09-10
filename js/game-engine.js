/**
 * COSY World Core Game Engine Module
 */
export class CosyGameEngine {
  constructor() {
    this.state = {
      character: null,
      language: 'en',
      location: 'Town Square',
      xp: 0,
      level: 1,
      inventory: [],
      completedQuests: [],
      acquiredVocab: []
    };
    this.loadSave();
  }

  loadSave() {
    const raw = localStorage.getItem('cosy_world_save');
    if (raw) {
      try {
        this.state = { ...this.state, ...JSON.parse(raw) };
      } catch (e) {
        console.error('Failed to parse save', e);
      }
    }
  }

  save() {
    localStorage.setItem('cosy_world_save', JSON.stringify(this.state));
  }

  selectCharacter(charKey) {
    this.state.character = charKey;
    this.save();
  }

  selectLanguage(langKey) {
    this.state.language = langKey;
    this.save();
  }

  addXp(amount) {
    this.state.xp += amount;
    if (this.state.xp >= this.state.level * 100) {
      this.state.level += 1;
    }
    this.save();
  }

  completeQuest(questId) {
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      this.addXp(100);
      this.save();
    }
  }

  addVocab(word, translation, context = '') {
    if (!this.state.acquiredVocab.some(v => v.word === word)) {
      this.state.acquiredVocab.push({ word, translation, context, date: new Date().toISOString() });
      this.save();
    }
  }
}

export const gameEngine = new CosyGameEngine();
