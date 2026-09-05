/**
 * games/cosy_world/js/player/stats.js
 * Handles player XP gains, levels, and statistics display updates.
 */

export class StatsManager {
    static updatePlayerStats(state) {
        state.citizenLvl = Math.floor(state.xp / 100) + 1;
        const lvlTitles = ['Novice Explorer', 'Town Resident', 'Active Citizen', 'Prominent Polyglot', 'Town Master'];
        const title = lvlTitles[Math.min(state.citizenLvl - 1, lvlTitles.length - 1)];

        const lvlEl = document.getElementById('cw-citizen-lvl');
        const xpEl = document.getElementById('cw-xp-num');
        const fillEl = document.getElementById('cw-xp-fill');
        const coinsEl = document.getElementById('cw-coins-num');

        if (lvlEl) lvlEl.textContent = `${state.citizenLvl} (${title})`;
        if (xpEl) xpEl.textContent = state.xp;
        if (fillEl) fillEl.style.width = `${state.xp % 100}%`;
        if (coinsEl) coinsEl.textContent = state.coins !== undefined ? state.coins : 100;
    }

    static addCoins(state, amount, showToastFn) {
        state.coins = (state.coins || 0) + amount;
        this.updatePlayerStats(state);
        if (showToastFn) showToastFn(`+${amount} Coins Gained! 🪙`);
    }

    static spendCoins(state, amount, showToastFn) {
        if ((state.coins || 0) < amount) {
            if (showToastFn) showToastFn(`Not enough coins! 🪙`);
            return false;
        }
        state.coins -= amount;
        this.updatePlayerStats(state);
        if (showToastFn) showToastFn(`-${amount} Coins spent! 🪙`);
        return true;
    }

    static addXP(state, amount, showToastFn) {
        state.xp += amount;
        this.updatePlayerStats(state);
        if (showToastFn) showToastFn(`+${amount} XP Gained! ⭐`);
    }
}
