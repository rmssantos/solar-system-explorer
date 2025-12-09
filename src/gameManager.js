/**
 * Game Logic for 'Gonçalo Mode'.
 * Tracks visited planets and manages game state.
 */
import * as storage from './utils/storage.js';

export class GameManager {
    constructor() {
        this.visited = new Set();
        this.totalPlanets = 0;
        this.loadProgress();
    }

    loadProgress() {
        const data = storage.getItem('visited', null);
        if (data && data.visited) {
            this.visited = new Set(data.visited);
        }
    }

    saveProgress() {
        const data = {
            visited: Array.from(this.visited)
        };
        storage.setItem('visited', data);
    }

    // Called when we identify how many planets there are
    setTotal(count) {
        this.totalPlanets = count;
    }

    /**
     * Mark a planet as visited.
     * @param {string} name 
     * @returns {boolean} true if this was a NEW discovery
     */
    visit(name) {
        // Sol counts as a special discovery!
        if (!this.visited.has(name)) {
            this.visited.add(name);
            this.saveProgress();
            console.log(`🚀 New Discovery: ${name}!`);
            return true;
        }
        return false;
    }

    isVisited(name) {
        return this.visited.has(name);
    }

    getVisitedList() {
        return Array.from(this.visited);
    }

    getProgress() {
        return {
            current: this.visited.size,
            total: this.totalPlanets
        };
    }
}
