/**
 * Enhanced Audio Manager with background music and sound effects.
 * Uses Web Audio API for synthesized sounds and ambient music.
 * Includes unique ambient sounds per celestial body.
 */
export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        // Music gain (separate control)
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.ctx.destination);

        // SFX gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(this.ctx.destination);
        
        // Planet ambient gain (separate from music)
        this.planetAmbientGain = this.ctx.createGain();
        this.planetAmbientGain.gain.value = 0.2;
        this.planetAmbientGain.connect(this.ctx.destination);

        this.isMusicPlaying = false;
        this.musicNodes = [];
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Planet ambient state
        this.currentPlanetAmbient = null;
        this.planetAmbientNodes = [];

        // Timer IDs for cleanup
        this.planetTimers = [];
        
        // Define unique sound profiles for each celestial body
        this.planetSounds = {
            'sun': {
                type: 'solar',
                baseFreq: 40,
                harmonics: [1, 2, 3],
                filterFreq: 200,
                intensity: 0.8,
                color: 'warm'
            },
            'mercury': {
                type: 'rocky',
                baseFreq: 80,
                harmonics: [1, 1.5],
                filterFreq: 300,
                intensity: 0.3,
                color: 'dry'
            },
            'venus': {
                type: 'hellish',
                baseFreq: 55,
                harmonics: [1, 2, 4],
                filterFreq: 150,
                intensity: 0.6,
                color: 'hot'
            },
            'earth': {
                type: 'earthly',
                baseFreq: 65,
                harmonics: [1, 1.5, 2],
                filterFreq: 400,
                intensity: 0.4,
                color: 'alive'
            },
            'moon': {
                type: 'silent',
                baseFreq: 100,
                harmonics: [1],
                filterFreq: 200,
                intensity: 0.15,
                color: 'empty'
            },
            'mars': {
                type: 'dusty',
                baseFreq: 70,
                harmonics: [1, 1.3, 2],
                filterFreq: 250,
                intensity: 0.35,
                color: 'wind'
            },
            'jupiter': {
                type: 'storm',
                baseFreq: 35,
                harmonics: [1, 2, 3, 5],
                filterFreq: 180,
                intensity: 0.7,
                color: 'massive'
            },
            'saturn': {
                type: 'majestic',
                baseFreq: 45,
                harmonics: [1, 1.5, 2, 3],
                filterFreq: 220,
                intensity: 0.5,
                color: 'rings'
            },
            'uranus': {
                type: 'icy',
                baseFreq: 90,
                harmonics: [1, 2],
                filterFreq: 350,
                intensity: 0.3,
                color: 'cold'
            },
            'neptune': {
                type: 'windy',
                baseFreq: 50,
                harmonics: [1, 2, 4],
                filterFreq: 280,
                intensity: 0.45,
                color: 'deep'
            }
        };
    }

    // Play a short tone
    playTone(freq, type, duration, slideTo = null) {
        if (!this.sfxEnabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Sound FX Presets
    playSelect() {
        this.playTone(800, 'sine', 0.1, 1200);
    }

    playHover() {
        this.playTone(400, 'triangle', 0.05);
    }

    playWarp() {
        this.playTone(100, 'sawtooth', 1.5, 600);
    }

    playSuccess() {
        const now = this.ctx.currentTime;
        this.playNote(523.25, 0.1, now);
        this.playNote(659.25, 0.1, now + 0.1);
        this.playNote(783.99, 0.3, now + 0.2);
    }

    playNote(freq, duration, startTime) {
        if (!this.sfxEnabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playMissionComplete() {
        if (!this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        // Fanfare
        this.playNote(392.00, 0.15, now);        // G4
        this.playNote(523.25, 0.15, now + 0.15); // C5
        this.playNote(659.25, 0.15, now + 0.3);  // E5
        this.playNote(783.99, 0.4, now + 0.45);  // G5
    }

    playLevelUp() {
        if (!this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        // Ascending scale
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            this.playNote(freq, 0.12, now + i * 0.08);
        });
    }

    playAchievement() {
        if (!this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        this.playNote(523.25, 0.2, now);
        this.playNote(783.99, 0.2, now + 0.1);
        this.playNote(1046.50, 0.4, now + 0.2);
    }

    playQuizCorrect() {
        if (!this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        this.playNote(523.25, 0.1, now);
        this.playNote(659.25, 0.1, now + 0.1);
        this.playNote(783.99, 0.2, now + 0.2);
    }

    playQuizWrong() {
        if (!this.sfxEnabled) return;
        const now = this.ctx.currentTime;
        this.playNote(200, 0.3, now);
        this.playNote(150, 0.3, now + 0.15);
    }

    // Camera shutter sound for photo mode
    playCameraShutter() {
        if (!this.sfxEnabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const now = this.ctx.currentTime;
        
        // Click sound (high frequency burst)
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1200, now);
        clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        clickGain.gain.setValueAtTime(0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        clickOsc.connect(clickGain);
        clickGain.connect(this.sfxGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.1);
    }

    // Ambient Space Music - Generative
    startAmbientMusic() {
        if (this.isMusicPlaying || !this.musicEnabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.isMusicPlaying = true;

        // Create ambient drone
        this.createDrone(65.41, 'sine');     // C2
        this.createDrone(98.00, 'sine');     // G2
        this.createDrone(130.81, 'triangle'); // C3

        // Create sparkle layer
        this.startSparkles();

        console.log('🎵 Ambient space music started');
    }

    createDrone(freq, type) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.value = freq;

        // Add subtle vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1 + Math.random() * 0.2;
        lfoGain.gain.value = freq * 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        filter.type = 'lowpass';
        filter.frequency.value = 400;

        gain.gain.value = 0.08;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start();

        this.musicNodes.push({ osc, gain, lfo });
    }

    startSparkles() {
        // Random high notes like twinkling stars
        const sparkle = () => {
            if (!this.isMusicPlaying || !this.musicEnabled) return;

            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
            const freq = notes[Math.floor(Math.random() * notes.length)];

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + 2);

            // Next sparkle
            const nextDelay = 2000 + Math.random() * 4000;
            this.sparkleTimeout = setTimeout(sparkle, nextDelay);
        };

        sparkle();
    }

    stopAmbientMusic() {
        this.isMusicPlaying = false;

        // Stop all drones
        this.musicNodes.forEach(node => {
            const now = this.ctx.currentTime;
            node.gain.gain.linearRampToValueAtTime(0, now + 1);
            setTimeout(() => {
                node.osc.stop();
                node.lfo.stop();
            }, 1100);
        });
        this.musicNodes = [];

        // Stop sparkles
        if (this.sparkleTimeout) {
            clearTimeout(this.sparkleTimeout);
        }

        console.log('🎵 Ambient music stopped');
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startAmbientMusic();
        } else {
            this.stopAmbientMusic();
        }
        return this.musicEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    setMusicVolume(value) {
        this.musicGain.gain.value = value;
    }

    setSFXVolume(value) {
        this.sfxGain.gain.value = value;
    }
    
    /**
     * Start playing ambient sound for a specific planet/celestial body
     * @param {string} planetName - Internal name of the planet (e.g., "Sol", "Terra")
     */
    startPlanetAmbient(planetName) {
        // Don't restart if same planet
        if (this.currentPlanetAmbient === planetName) return;
        
        // Stop previous ambient
        this.stopPlanetAmbient();
        
        const profile = this.planetSounds[planetName];
        if (!profile || !this.musicEnabled) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        this.currentPlanetAmbient = planetName;
        const now = this.ctx.currentTime;
        
        // Create ambient based on planet type
        switch (profile.type) {
            case 'solar':
                this.createSolarAmbient(profile);
                break;
            case 'storm':
                this.createStormAmbient(profile);
                break;
            case 'majestic':
                this.createMajesticAmbient(profile);
                break;
            case 'icy':
            case 'windy':
                this.createWindyAmbient(profile);
                break;
            case 'earthly':
                this.createEarthlyAmbient(profile);
                break;
            case 'silent':
                this.createSilentAmbient(profile);
                break;
            case 'hellish':
                this.createHellishAmbient(profile);
                break;
            default:
                this.createGenericAmbient(profile);
        }
        
        console.log(`🔊 Planet ambient: ${planetName}`);
    }
    
    /**
     * Stop current planet ambient sound with fade out
     */
    stopPlanetAmbient() {
        if (!this.currentPlanetAmbient) return;

        // Clear all planet-related timers first
        this.planetTimers.forEach(id => clearTimeout(id));
        this.planetTimers = [];

        const now = this.ctx.currentTime;

        // Fade out all planet ambient nodes
        this.planetAmbientNodes.forEach(node => {
            if (node.gain) {
                node.gain.gain.linearRampToValueAtTime(0, now + 0.5);
            }
            const stopTimer = setTimeout(() => {
                try {
                    if (node.osc) node.osc.stop();
                    if (node.lfo) node.lfo.stop();
                    if (node.noise) node.noise.stop();
                } catch (e) { /* Already stopped */ }
            }, 600);
            this.planetTimers.push(stopTimer);
        });

        this.planetAmbientNodes = [];
        this.currentPlanetAmbient = null;
    }
    
    // Solar ambient - deep rumbling with occasional flares
    createSolarAmbient(profile) {
        // Deep bass drone
        profile.harmonics.forEach((mult, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.value = profile.baseFreq * mult;
            
            // Add slow modulation
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 0.05 + Math.random() * 0.1;
            lfoGain.gain.value = profile.baseFreq * 0.1;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            
            filter.type = 'lowpass';
            filter.frequency.value = profile.filterFreq;
            
            gain.gain.value = profile.intensity * 0.1 / (i + 1);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.planetAmbientGain);
            
            osc.start();
            
            this.planetAmbientNodes.push({ osc, gain, lfo });
        });
        
        // Add crackling/flare effect
        this.addSolarFlares();
    }
    
    addSolarFlares() {
        const flare = () => {
            if (this.currentPlanetAmbient !== 'sun') return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.value = 60 + Math.random() * 100;

            filter.type = 'bandpass';
            filter.frequency.value = 200 + Math.random() * 300;
            filter.Q.value = 2;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.planetAmbientGain);

            osc.start(now);
            osc.stop(now + 0.6);

            // Next flare - store timer for cleanup
            const timerId = setTimeout(flare, 3000 + Math.random() * 5000);
            this.planetTimers.push(timerId);
        };

        const timerId = setTimeout(flare, 1000);
        this.planetTimers.push(timerId);
    }
    
    // Storm ambient (Jupiter) - deep rumbling with thunder
    createStormAmbient(profile) {
        // Base rumble
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = profile.baseFreq;
        
        // Modulate for rumbling effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        filter.type = 'lowpass';
        filter.frequency.value = profile.filterFreq;
        
        gain.gain.value = profile.intensity * 0.15;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        osc.start();
        this.planetAmbientNodes.push({ osc, gain, lfo });
        
        // Add thunder
        this.addThunder();
    }
    
    addThunder() {
        const thunder = () => {
            if (this.currentPlanetAmbient !== 'jupiter') return;

            // White noise burst for thunder
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
            }

            const noise = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            noise.buffer = buffer;
            filter.type = 'lowpass';
            filter.frequency.value = 150;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.planetAmbientGain);

            noise.start(now);

            // Store timer for cleanup
            const timerId = setTimeout(thunder, 4000 + Math.random() * 8000);
            this.planetTimers.push(timerId);
        };

        const timerId = setTimeout(thunder, 2000);
        this.planetTimers.push(timerId);
    }
    
    // Majestic ambient (Saturn) - ethereal with shimmer
    createMajesticAmbient(profile) {
        // Pad sound
        profile.harmonics.forEach((mult, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = profile.baseFreq * mult;
            
            // Slow shimmer
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 0.1 + i * 0.05;
            lfoGain.gain.value = 1;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            
            filter.type = 'lowpass';
            filter.frequency.value = profile.filterFreq;
            
            gain.gain.value = profile.intensity * 0.08 / (i + 1);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.planetAmbientGain);
            
            osc.start();
            this.planetAmbientNodes.push({ osc, gain, lfo });
        });
        
        // Add ring shimmer
        this.addRingShimmer();
    }
    
    addRingShimmer() {
        const shimmer = () => {
            if (this.currentPlanetAmbient !== 'saturn') return;

            const freq = 800 + Math.random() * 1200;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1);

            osc.connect(gain);
            gain.connect(this.planetAmbientGain);

            osc.start(now);
            osc.stop(now + 1.1);

            // Store timer for cleanup
            const timerId = setTimeout(shimmer, 1500 + Math.random() * 3000);
            this.planetTimers.push(timerId);
        };

        shimmer();
    }
    
    // Windy ambient (Neptune, Uranus)
    createWindyAmbient(profile) {
        // Wind noise
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        noise.buffer = buffer;
        noise.loop = true;
        
        filter.type = 'bandpass';
        filter.frequency.value = profile.filterFreq;
        filter.Q.value = 0.5;
        
        // Modulate filter for wind variation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        
        gain.gain.value = profile.intensity * 0.1;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        noise.start();
        this.planetAmbientNodes.push({ noise, gain, lfo });
    }
    
    // Earthly ambient - peaceful with subtle life
    createEarthlyAmbient(profile) {
        // Gentle pad
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = profile.baseFreq;
        
        filter.type = 'lowpass';
        filter.frequency.value = profile.filterFreq;
        
        gain.gain.value = profile.intensity * 0.1;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        osc.start();
        this.planetAmbientNodes.push({ osc, gain });
        
        // Add subtle "life" sounds - bird-like chirps
        this.addLifeSounds();
    }
    
    addLifeSounds() {
        const chirp = () => {
            if (this.currentPlanetAmbient !== 'earth') return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const baseFreq = 1000 + Math.random() * 500;

            const now = this.ctx.currentTime;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.05);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.1);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.015, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(this.planetAmbientGain);

            osc.start(now);
            osc.stop(now + 0.2);

            // Store timer for cleanup
            const timerId = setTimeout(chirp, 3000 + Math.random() * 6000);
            this.planetTimers.push(timerId);
        };

        const timerId = setTimeout(chirp, 2000);
        this.planetTimers.push(timerId);
    }
    
    // Silent ambient (Moon) - almost nothing, just emptiness
    createSilentAmbient(profile) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = profile.baseFreq;
        
        gain.gain.value = profile.intensity * 0.05; // Very quiet
        
        osc.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        osc.start();
        this.planetAmbientNodes.push({ osc, gain });
    }
    
    // Hellish ambient (Venus) - oppressive heat
    createHellishAmbient(profile) {
        // Low rumble
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = profile.baseFreq;
        
        filter.type = 'lowpass';
        filter.frequency.value = profile.filterFreq;
        
        // Pulsing effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        
        gain.gain.value = profile.intensity * 0.12;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        osc.start();
        this.planetAmbientNodes.push({ osc, gain, lfo });
    }
    
    // Generic ambient for planets without specific sound
    createGenericAmbient(profile) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.value = profile.baseFreq;
        
        filter.type = 'lowpass';
        filter.frequency.value = profile.filterFreq;
        
        gain.gain.value = profile.intensity * 0.1;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.planetAmbientGain);
        
        osc.start();
        this.planetAmbientNodes.push({ osc, gain });
    }
    
    /**
     * Set planet ambient volume
     */
    setPlanetAmbientVolume(value) {
        this.planetAmbientGain.gain.value = value;
    }
}
