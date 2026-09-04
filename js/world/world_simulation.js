/**
 * js/world/world_simulation.js
 * Dynamic World Simulation Engine for COSY World.
 * Manages continuous time progression, times of day, seasons, weather dynamics,
 * smooth lighting color blending, automated ambient audio updates, and NPC schedule sync.
 */

export class WorldSimulationEngine {
    /**
     * @param {Object} [options]
     * @param {Object} [options.gameEngine]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.gameEngine = options.gameEngine || null;
        this.eventBus = options.eventBus || (this.gameEngine ? this.gameEngine.eventBus : null);

        // Simulation State
        this.timeOfDay = 'morning'; // 'morning', 'afternoon', 'evening', 'night'
        this.hour = 8;             // 0..23 integer/float
        this.minute = 0;           // 0..59
        this.season = 'spring';    // 'spring', 'summer', 'autumn', 'winter'
        this.weather = 'clear';    // 'rain', 'snow', 'fog', 'clouds', 'clear'

        // Progression controls
        this.timeScale = 60; // 1 real second = 60 simulation seconds (1 min/sec)
        this.isPaused = false;

        // Config data loaded from JSON
        this.config = {
            timeOfDay: {
                morning: { name: 'Morning', icon: '🌅', startHour: 6, color: [254, 243, 199, 0.25], ambientSound: 'morning_birds' },
                afternoon: { name: 'Afternoon', icon: '☀️', startHour: 12, color: [255, 255, 255, 0.0], ambientSound: 'nature' },
                evening: { name: 'Evening', icon: '🌆', startHour: 18, color: [251, 146, 60, 0.28], ambientSound: 'evening_breeze' },
                night: { name: 'Night', icon: '🌙', startHour: 22, color: [30, 41, 59, 0.55], ambientSound: 'night_crickets' }
            },
            seasons: {
                spring: { name: 'Spring', icon: '🌸', tint: [236, 253, 245, 0.1], ambientSound: 'spring_breeze' },
                summer: { name: 'Summer', icon: '🌻', tint: [254, 240, 138, 0.15], ambientSound: 'summer_cicadas' },
                autumn: { name: 'Autumn', icon: '🍁', tint: [254, 215, 170, 0.2], ambientSound: 'autumn_wind' },
                winter: { name: 'Winter', icon: '❄️', tint: [224, 242, 254, 0.25], ambientSound: 'winter_wind' }
            },
            weathers: {
                clear: { name: 'Clear', icon: '☀️', overlayOpacity: 0.0, ambientSound: 'none' },
                rain: { name: 'Rain', icon: '🌧️', overlayOpacity: 0.35, ambientSound: 'rain' },
                snow: { name: 'Snow', icon: '🌨️', overlayOpacity: 0.3, ambientSound: 'winter_wind' },
                fog: { name: 'Fog', icon: '🌫️', overlayOpacity: 0.45, ambientSound: 'fog_horn' },
                clouds: { name: 'Clouds', icon: '☁️', overlayOpacity: 0.2, ambientSound: 'cloud_breeze' }
            }
        };
    }

    /**
     * Load config dictionary from JSON data.
     * @param {Object} jsonConfig
     */
    loadConfigFromJson(jsonConfig) {
        if (!jsonConfig) return;
        if (jsonConfig.timeOfDay) {
            for (const [key, val] of Object.entries(jsonConfig.timeOfDay)) {
                const rgba = this.parseRgbaString(val.color);
                this.config.timeOfDay[key] = { ...val, color: rgba || [255, 255, 255, 0] };
            }
        }
        if (jsonConfig.seasons) {
            for (const [key, val] of Object.entries(jsonConfig.seasons)) {
                const rgba = this.parseRgbaString(val.tint);
                this.config.seasons[key] = { ...val, tint: rgba || [255, 255, 255, 0] };
            }
        }
        if (jsonConfig.weathers) {
            this.config.weathers = { ...this.config.weathers, ...jsonConfig.weathers };
        }
    }

    /**
     * @private
     * Parse "rgba(r, g, b, a)" string to [r, g, b, a] array.
     */
    parseRgbaString(str) {
        if (!str || typeof str !== 'string') return null;
        const matches = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
        if (!matches) return null;
        return [
            parseInt(matches[1], 10),
            parseInt(matches[2], 10),
            parseInt(matches[3], 10),
            matches[4] !== undefined ? parseFloat(matches[4]) : 1.0
        ];
    }

    /**
     * Set specific time of day directly.
     * @param {'morning'|'afternoon'|'evening'|'night'} tod
     */
    setTimeOfDay(tod) {
        if (!this.config.timeOfDay[tod]) return;
        this.timeOfDay = tod;
        this.hour = this.config.timeOfDay[tod].startHour;
        this.minute = 0;
        this.onEnvironmentChanged();
    }

    /**
     * Set specific season.
     * @param {'spring'|'summer'|'autumn'|'winter'} season
     */
    setSeason(season) {
        if (!this.config.seasons[season]) return;
        this.season = season;
        this.onEnvironmentChanged();
    }

    /**
     * Set specific weather condition.
     * @param {'rain'|'snow'|'fog'|'clouds'|'clear'} weather
     */
    setWeather(weather) {
        if (!this.config.weathers[weather]) return;
        this.weather = weather;
        this.onEnvironmentChanged();
    }

    /**
     * Advance simulation time by real delta seconds.
     * @param {number} deltaSeconds
     */
    update(deltaSeconds) {
        if (this.isPaused || deltaSeconds <= 0) return;

        const simSeconds = deltaSeconds * this.timeScale;
        const addMinutes = simSeconds / 60;
        this.minute += addMinutes;

        while (this.minute >= 60) {
            this.minute -= 60;
            this.hour += 1;
            if (this.hour >= 24) {
                this.hour -= 24;
            }
            this.onHourChanged();
        }

        // Determine matching time of day based on current hour
        const newTimeOfDay = this.getTimeOfDayForHour(this.hour);
        if (newTimeOfDay !== this.timeOfDay) {
            this.timeOfDay = newTimeOfDay;
            this.onEnvironmentChanged();
        }
    }

    /**
     * Determine time of day string for a given hour.
     * @param {number} hr
     * @returns {string}
     */
    getTimeOfDayForHour(hr) {
        if (hr >= 22 || hr < 6) return 'night';
        if (hr >= 18) return 'evening';
        if (hr >= 12) return 'afternoon';
        return 'morning';
    }

    /**
     * Format current time as "HH:MM" string.
     * @returns {string}
     */
    getTimeString() {
        const h = Math.floor(this.hour).toString().padStart(2, '0');
        const m = Math.floor(this.minute).toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    /**
     * Get smooth lighting RGBA string based on time of day, season tint, and weather blending.
     * @returns {string} e.g. "rgba(30, 41, 59, 0.45)"
     */
    getLightingRgba() {
        const todConfig = this.config.timeOfDay[this.timeOfDay] || this.config.timeOfDay.afternoon;
        const seasonConfig = this.config.seasons[this.season] || this.config.seasons.spring;
        const weatherConfig = this.config.weathers[this.weather] || this.config.weathers.clear;

        const c1 = todConfig.color || [255, 255, 255, 0];
        const c2 = seasonConfig.tint || [255, 255, 255, 0];

        // Blend colors
        const r = Math.round(c1[0] * 0.7 + c2[0] * 0.3);
        const g = Math.round(c1[1] * 0.7 + c2[1] * 0.3);
        const b = Math.round(c1[2] * 0.7 + c2[2] * 0.3);
        const alpha = Math.min(0.85, (c1[3] + c2[3] * 0.5 + weatherConfig.overlayOpacity * 0.3)).toFixed(2);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Trigger events when the hour ticks, updating NPC schedules.
     */
    onHourChanged() {
        const timeStr = this.getTimeString();
        if (this.gameEngine && this.gameEngine.npcAIEngine) {
            this.gameEngine.npcAIEngine.updateScheduleTick(timeStr);
        }
        if (this.eventBus) {
            this.eventBus.emit('timeHourTick', { hour: this.hour, timeString: timeStr });
        }
    }

    /**
     * Trigger environment change updates for audio, lighting, and rendering.
     */
    onEnvironmentChanged() {
        // Sync Audio Manager
        if (this.gameEngine && this.gameEngine.audioManager) {
            let activeAudio = 'none';
            if (this.weather !== 'clear' && this.config.weathers[this.weather].ambientSound !== 'none') {
                activeAudio = this.config.weathers[this.weather].ambientSound;
            } else if (this.config.timeOfDay[this.timeOfDay]) {
                activeAudio = this.config.timeOfDay[this.timeOfDay].ambientSound;
            }
            this.gameEngine.audioManager.playAmbience(activeAudio);
        }

        // Request viewport re-render if active
        if (this.gameEngine && typeof this.gameEngine.renderWorldViewport === 'function') {
            this.gameEngine.renderWorldViewport();
        }

        if (this.eventBus) {
            this.eventBus.emit('environmentChanged', {
                timeOfDay: this.timeOfDay,
                hour: this.hour,
                season: this.season,
                weather: this.weather,
                timeString: this.getTimeString(),
                lightingRgba: this.getLightingRgba()
            });
        }
    }

    /**
     * Export state object for save manager.
     */
    exportState() {
        return {
            timeOfDay: this.timeOfDay,
            hour: this.hour,
            minute: this.minute,
            season: this.season,
            weather: this.weather
        };
    }

    /**
     * Import state object from save manager.
     */
    importState(state) {
        if (!state) return;
        if (state.timeOfDay) this.timeOfDay = state.timeOfDay;
        if (typeof state.hour === 'number') this.hour = state.hour;
        if (typeof state.minute === 'number') this.minute = state.minute;
        if (state.season) this.season = state.season;
        if (state.weather) this.weather = state.weather;
        this.onEnvironmentChanged();
    }
}
