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

        if (lvlEl) lvlEl.textContent = `${state.citizenLvl} (${title})`;
        if (xpEl) xpEl.textContent = state.xp;
        if (fillEl) fillEl.style.width = `${state.xp % 100}%`;
    }

    static addXP(state, amount, showToastFn) {
        state.xp += amount;
        this.updatePlayerStats(state);
        if (showToastFn) showToastFn(`+${amount} XP Gained! ⭐`);
    }
}
