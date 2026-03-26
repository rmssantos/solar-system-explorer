/**
 * Mascot System - "Astro" the space kid guide
 * Shows animated mascot with speech bubbles for tips, celebrations, and guidance
 */
import { i18n } from './i18n.js';

export class Mascot {
    constructor(app) {
        this.app = app;
        this.container = null;
        this.isVisible = false;
        this.hideTimeout = null;
        this.currentPose = null;

        // Message queue to avoid popup bombardment
        this.messageQueue = [];
        this.isProcessingQueue = false;

        // Map pose names to image files (in public/mascot folder)
        this.poses = {
            neutral: '/mascot/1.png',      // Waving hello
            celebrate: '/mascot/2.png',    // Victory jump
            curious: '/mascot/3.png',      // Exploring
            pointRight: '/mascot/4.png',   // Pointing right
            pointLeft: '/mascot/5.png',    // Pointing left
            surprised: '/mascot/6.png',    // Wow! Discovery
            encourage: '/mascot/7.png',    // Thumbs up, try again
            thinking: '/mascot/8.png'      // Thinking/loading
        };

        // Preload images
        this.preloadedImages = {};
        this.preloadImages();

        this.createUI();
        this.setupEventListeners();
    }

    preloadImages() {
        Object.entries(this.poses).forEach(([name, url]) => {
            const img = new Image();
            img.src = url;
            this.preloadedImages[name] = img;
        });
    }

    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'mascot-container';
        this.container.innerHTML = `
            <div class="mascot-bubble">
                <div class="mascot-text"></div>
                <div class="mascot-bubble-tail"></div>
            </div>
            <div class="mascot-character">
                <img src="${this.poses.neutral}" alt="Astro" />
            </div>
        `;

        document.body.appendChild(this.container);

        this.bubbleEl = this.container.querySelector('.mascot-bubble');
        this.textEl = this.container.querySelector('.mascot-text');
        this.characterEl = this.container.querySelector('.mascot-character');
        this.imgEl = this.container.querySelector('.mascot-character img');
    }

    setupEventListeners() {
        // Listen for game events to trigger mascot
        window.addEventListener('app:visit', (e) => this.onPlanetVisit(e.detail));
        window.addEventListener('app:mission-complete', (e) => this.onMissionComplete(e.detail));
        window.addEventListener('app:achievement', (e) => this.onAchievement(e.detail));
        window.addEventListener('app:quiz-correct', () => this.onQuizCorrect());
        window.addEventListener('app:quiz-wrong', () => this.onQuizWrong());
        window.addEventListener('app:easter-egg', (e) => this.onEasterEgg(e.detail));
        window.addEventListener('app:first-visit', () => this.onFirstVisit());

        // Language change
        i18n.onLangChange(() => this.updateTranslations());
    }

    /**
     * Check if any blocking overlay is visible (celebration, quiz, etc.)
     */
    isOverlayBlocking() {
        // Check for celebration overlay (fixed position, added/removed from DOM)
        const celebration = document.querySelector('.celebration-overlay');
        if (celebration) {
            return true; // If it exists in DOM, it's blocking
        }

        // Check for achievement notification (fixed position)
        const achievement = document.querySelector('.achievement-notification');
        if (achievement && !achievement.classList.contains('fade-out')) {
            return true;
        }

        // Check for other blocking elements
        const otherBlockers = [
            '.quiz-panel:not(.hidden)',
            '.level-up-modal'
        ];

        for (const selector of otherBlockers) {
            const el = document.querySelector(selector);
            if (el && el.offsetParent !== null) {
                return true;
            }
        }
        return false;
    }

    /**
     * Queue a message to show (with smart timing)
     * @param {string} message - Text to display
     * @param {string} pose - Pose name
     * @param {object} options - Additional options
     */
    show(message, pose = 'neutral', options = {}) {
        // Add to queue
        this.messageQueue.push({ message, pose, options });

        // Start processing if not already
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }

    /**
     * Process the message queue
     */
    processQueue() {
        if (this.messageQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }

        this.isProcessingQueue = true;

        // If overlay is blocking, wait and retry
        if (this.isOverlayBlocking()) {
            setTimeout(() => this.processQueue(), 500);
            return;
        }

        // If mascot is currently visible, wait for it to hide
        if (this.isVisible) {
            setTimeout(() => this.processQueue(), 500);
            return;
        }

        // Get next message and show it
        const { message, pose, options } = this.messageQueue.shift();
        this.showImmediate(message, pose, options);
    }

    /**
     * Actually show the mascot (internal)
     */
    showImmediate(message, pose = 'neutral', options = {}) {
        const {
            duration = 5000,
            position = 'center',
            animate = true,
            hideBubble = false
        } = options;

        // Clear any existing timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // Set pose
        this.currentPose = pose;
        if (this.poses[pose]) {
            this.imgEl.src = this.poses[pose];
        }

        // Set message
        if (hideBubble || !message) {
            this.bubbleEl.classList.add('hidden');
        } else {
            this.bubbleEl.classList.remove('hidden');
            this.textEl.textContent = message;
        }

        // Set position - always bottom-right to avoid overlapping centered info panel
        this.container.classList.remove('position-left', 'position-right', 'position-center', 'position-beside-panel');

        // Always use right position (auto = right)
        const finalPosition = (position === 'auto') ? 'right' : position;

        if (finalPosition !== 'center') {
            this.container.classList.add(`position-${finalPosition}`);
        }

        // Set animation class
        this.characterEl.classList.remove('celebrating', 'thinking');
        if (pose === 'celebrate') {
            this.characterEl.classList.add('celebrating');
        } else if (pose === 'thinking') {
            this.characterEl.classList.add('thinking');
        }

        // Show
        this.isVisible = true;
        this.container.classList.add('visible');

        // Auto-hide and process next in queue
        if (duration > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
                // Small delay before processing next message
                setTimeout(() => this.processQueue(), 300);
            }, duration);
        }
    }

    /**
     * Hide mascot
     */
    hide() {
        this.isVisible = false;
        this.container.classList.remove('visible');
        this.characterEl.classList.remove('celebrating', 'thinking');

        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    // Event handlers
    onPlanetVisit(planetName) {
        // Only show for first-time visits (occasional tips)
        if (Math.random() > 0.3) return; // 30% chance to show tip

        const tips = i18n.lang === 'pt' ? [
            `${planetName}! Clica para ver mais informações!`,
            `Sabias que podes usar o scroll para fazer zoom?`,
            `Carrega em M para pilotar a nave!`
        ] : [
            `${planetName}! Click to see more info!`,
            `Did you know you can scroll to zoom?`,
            `Press M to fly the ship!`
        ];

        const tip = tips[Math.floor(Math.random() * tips.length)];
        this.show(tip, 'curious', { duration: 4000, position: 'auto' });
    }

    onMissionComplete(mission) {
        // Don't show mascot - celebration overlay already handles this
        // Avoid duplicate celebrations that overlap
    }

    onAchievement(achievement) {
        // Don't show mascot - achievement notification already handles this
        // Avoid duplicate notifications that overlap
    }

    onQuizCorrect() {
        const messages = i18n.lang === 'pt' ? [
            'Correto! És muito inteligente!',
            'Isso mesmo! Boa resposta!',
            'Acertaste! Continua assim!'
        ] : [
            'Correct! You\'re so smart!',
            'That\'s right! Great answer!',
            'You got it! Keep it up!'
        ];

        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.show(msg, 'celebrate', { duration: 3000, position: 'auto' });
    }

    onQuizWrong() {
        const messages = i18n.lang === 'pt' ? [
            'Quase! Tenta outra vez!',
            'Não foi desta, mas não desistas!',
            'Continua a tentar, vais conseguir!'
        ] : [
            'Almost! Try again!',
            'Not this time, but don\'t give up!',
            'Keep trying, you\'ll get it!'
        ];

        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.show(msg, 'encourage', { duration: 4000, position: 'auto' });
    }

    onEasterEgg(name) {
        const msg = i18n.lang === 'pt'
            ? `Uau! Descobriste um segredo: ${name}!`
            : `Wow! You found a secret: ${name}!`;
        this.show(msg, 'surprised', { duration: 5000, position: 'auto' });
    }

    onFirstVisit() {
        const msg = i18n.lang === 'pt'
            ? 'Olá! Sou o Astro, o teu guia espacial! Vamos explorar o Sistema Solar!'
            : 'Hello! I\'m Astro, your space guide! Let\'s explore the Solar System!';
        this.show(msg, 'neutral', { duration: 6000, position: 'auto' });
    }

    /**
     * Show a tip (can be called from anywhere)
     */
    showTip(message, pose = 'neutral') {
        this.show(message, pose, { duration: 5000, position: 'auto' });
    }

    /**
     * Show thinking/loading state
     */
    showThinking(message) {
        const msg = message || (i18n.lang === 'pt' ? 'A pensar...' : 'Thinking...');
        this.show(msg, 'thinking', { duration: 0, position: 'auto' }); // No auto-hide
    }

    updateTranslations() {
        // Re-translate if currently showing
        // (messages are set dynamically, so no persistent keys to update)
    }

    destroy() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.container?.remove();
    }
}
