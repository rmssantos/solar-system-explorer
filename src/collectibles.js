/**
 * Collectibles System - Hidden items scattered around the solar system
 * Easter eggs and special items for kids to discover!
 */

import * as THREE from 'three';
import { i18n } from './i18n.js';

export class CollectiblesSystem {
    constructor(app) {
        this.app = app;
        this.collectibles = [];
        this.collected = this.loadCollected();
        
        this.collectibleTypes = this.getCollectibleTypes();
        
        this.createCollectibles();
        this.createUI();
    }
    
    getCollectibleTypes() {
        return {
            star: {
                emoji: '⭐',
                name: { pt: 'Estrela Dourada', en: 'Golden Star' },
                xp: 50,
                color: 0xffd700
            },
            crystal: {
                emoji: '💎',
                name: { pt: 'Cristal Espacial', en: 'Space Crystal' },
                xp: 75,
                color: 0x00ffff
            },
            alien: {
                emoji: '👽',
                name: { pt: 'Amigo Alien', en: 'Alien Friend' },
                xp: 100,
                color: 0x00ff00
            },
            rocket: {
                emoji: '🚀',
                name: { pt: 'Mini Foguetão', en: 'Mini Rocket' },
                xp: 60,
                color: 0xff6600
            },
            moon: {
                emoji: '🌙',
                name: { pt: 'Lua Mágica', en: 'Magic Moon' },
                xp: 80,
                color: 0xffffcc
            },
            comet: {
                emoji: '☄️',
                name: { pt: 'Pedaço de Cometa', en: 'Comet Piece' },
                xp: 90,
                color: 0x88ccff
            },
            ufo: {
                emoji: '🛸',
                name: { pt: 'OVNI Secreto', en: 'Secret UFO' },
                xp: 150,
                color: 0xff00ff
            },
            planet: {
                emoji: '🪐',
                name: { pt: 'Mini Planeta', en: 'Mini Planet' },
                xp: 70,
                color: 0xffaa00
            }
        };
    }
    
    getCollectibleLocations() {
        // Use fixed positions far from the sun to avoid visual clutter
        // Positions are in outer solar system areas
        return [
            // Far from planets - hidden treasures
            { type: 'star', position: { x: 120, y: 25, z: 80 } },      // Between Mars and Jupiter
            { type: 'crystal', position: { x: 180, y: -15, z: -90 } }, // Asteroid belt area
            { type: 'rocket', position: { x: 280, y: 40, z: 120 } },   // Near Jupiter orbit
            { type: 'moon', position: { x: 400, y: -25, z: -150 } },   // Near Saturn orbit
            { type: 'alien', position: { x: 550, y: 35, z: 200 } },    // Between Saturn and Uranus
            { type: 'crystal', position: { x: 750, y: -20, z: -180 } },// Near Uranus orbit
            { type: 'star', position: { x: 950, y: 45, z: 140 } },     // Between Uranus and Neptune
            { type: 'ufo', position: { x: 1200, y: -30, z: -220 } },   // Near Neptune orbit
            
            // Hidden spots in deep space (harder to find)
            { type: 'comet', position: { x: 300, y: 80, z: -250 } },   // Above solar plane
            { type: 'planet', position: { x: -200, y: -60, z: 300 } }, // Behind sun
            { type: 'alien', position: { x: 600, y: 100, z: -350 } },  // High above Saturn
            { type: 'star', position: { x: -350, y: 50, z: -200 } },   // Opposite side of system
            
            // Far away treasures (for advanced explorers)
            { type: 'crystal', position: { x: 1800, y: 70, z: 400 } }, // Beyond Neptune
            { type: 'ufo', position: { x: 2500, y: -80, z: -500 } },   // Deep space
        ];
    }
    
    createCollectibles() {
        if (!this.app.scene) return; // Safety check
        
        const locations = this.getCollectibleLocations();
        
        locations.forEach((loc, index) => {
            const id = `collectible_${index}`;
            
            // Skip if already collected
            if (this.collected.includes(id)) return;
            
            const typeInfo = this.collectibleTypes[loc.type];
            if (!typeInfo) return; // Safety check
            
            let position = new THREE.Vector3();
            
            if (loc.position) {
                position.set(loc.position.x, loc.position.y, loc.position.z);
            } else {
                return; // Skip invalid locations
            }
            
            try {
                const collectible = this.createCollectibleMesh(id, loc.type, typeInfo, position);
                this.collectibles.push(collectible);
                this.app.scene.add(collectible.group);
            } catch (e) {
                console.warn('Failed to create collectible:', id, e);
            }
        });
    }
    
    createCollectibleMesh(id, type, typeInfo, position) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Create glowing sphere
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);
        
        // Create glow effect
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: typeInfo.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        // Create orbiting particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 8;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            positions[i * 3] = Math.cos(angle) * 1.2;
            positions[i * 3 + 1] = Math.sin(angle) * 1.2;
            positions[i * 3 + 2] = 0;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            color: typeInfo.color,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        group.add(particles);
        
        return {
            id,
            type,
            typeInfo,
            group,
            sphere,
            glow,
            particles,
            collected: false,
            time: Math.random() * Math.PI * 2
        };
    }
    
    createUI() {
        // Collection counter button
        this.counterBtn = document.createElement('button');
        this.counterBtn.className = 'collectibles-counter';
        this.counterBtn.innerHTML = `🎁 <span id="collected-count">${this.collected.length}</span>/${this.getCollectibleLocations().length}`;
        this.counterBtn.style.cssText = `
            position: fixed;
            bottom: 380px;
            left: 20px;
            background: linear-gradient(135deg, rgba(255, 180, 0, 0.9), rgba(255, 100, 50, 0.9));
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            z-index: 600;
            box-shadow: 0 4px 15px rgba(255, 150, 0, 0.4);
        `;
        this.counterBtn.addEventListener('click', () => this.showCollection());
        document.body.appendChild(this.counterBtn);
        
        // Collection modal
        this.modal = document.createElement('div');
        this.modal.className = 'collectibles-modal';
        this.modal.innerHTML = `
            <div class="collectibles-content">
                <div class="collectibles-header">
                    <h2>🎁 ${i18n.t('collection', 'A Minha Coleção')}</h2>
                    <button class="collectibles-close">&times;</button>
                </div>
                <div class="collectibles-grid" id="collectibles-grid"></div>
                <div class="collectibles-stats">
                    <p id="collection-progress"></p>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        
        this.modal.querySelector('.collectibles-close').addEventListener('click', () => {
            this.modal.classList.remove('active');
        });
        
        // Pickup notification
        this.notification = document.createElement('div');
        this.notification.className = 'collectible-notification';
        document.body.appendChild(this.notification);
    }
    
    showCollection() {
        const grid = this.modal.querySelector('#collectibles-grid');
        const types = Object.entries(this.collectibleTypes);
        const lang = i18n.lang;
        
        grid.innerHTML = types.map(([key, info]) => {
            const count = this.collected.filter(id => {
                const loc = this.getCollectibleLocations().find((l, i) => `collectible_${i}` === id);
                return loc && loc.type === key;
            }).length;
            const total = this.getCollectibleLocations().filter(l => l.type === key).length;
            const found = count > 0;
            
            return `
                <div class="collectible-item ${found ? 'found' : 'not-found'}">
                    <span class="collectible-emoji">${found ? info.emoji : '❓'}</span>
                    <span class="collectible-name">${found ? info.name[lang] : '???'}</span>
                    <span class="collectible-count">${count}/${total}</span>
                </div>
            `;
        }).join('');
        
        const progress = this.modal.querySelector('#collection-progress');
        const total = this.getCollectibleLocations().length;
        const percent = Math.round((this.collected.length / total) * 100);
        progress.innerHTML = `
            ${i18n.t('collected', 'Encontrados')}: ${this.collected.length}/${total} (${percent}%)
            <br>
            <span style="color: #ffd700">+${this.getTotalXP()} XP ${i18n.t('earned', 'ganhos')}</span>
        `;
        
        this.modal.classList.add('active');
    }
    
    getTotalXP() {
        return this.collected.reduce((sum, id) => {
            const index = parseInt(id.split('_')[1]);
            const loc = this.getCollectibleLocations()[index];
            if (loc) {
                return sum + this.collectibleTypes[loc.type].xp;
            }
            return sum;
        }, 0);
    }
    
    update(deltaTime) {
        const cameraPos = this.app.camera.position;
        
        this.collectibles.forEach(c => {
            if (c.collected) return;
            
            // Update animation
            c.time += deltaTime * 2;
            
            // Bobbing animation
            c.group.position.y += Math.sin(c.time * 3) * 0.002;
            
            // Rotate particles
            c.particles.rotation.z += deltaTime;
            c.particles.rotation.x = Math.sin(c.time) * 0.3;
            
            // Pulse glow
            c.glow.scale.setScalar(1 + Math.sin(c.time * 2) * 0.2);
            c.glow.material.opacity = 0.2 + Math.sin(c.time * 3) * 0.1;
            
            // Check for collection (player proximity)
            const distance = cameraPos.distanceTo(c.group.position);
            if (distance < 3) {
                this.collectItem(c);
            }
        });
    }
    
    collectItem(collectible) {
        collectible.collected = true;
        this.collected.push(collectible.id);
        this.saveCollected();
        
        // Remove from scene with animation
        const startScale = collectible.group.scale.x;
        const animate = () => {
            collectible.group.scale.multiplyScalar(1.1);
            collectible.sphere.material.opacity -= 0.05;
            collectible.glow.material.opacity -= 0.03;
            
            if (collectible.sphere.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.app.scene.remove(collectible.group);
            }
        };
        animate();
        
        // Show notification
        const lang = i18n.lang;
        this.notification.innerHTML = `
            <span class="notif-emoji">${collectible.typeInfo.emoji}</span>
            <span class="notif-text">
                ${i18n.t('found')} ${collectible.typeInfo.name[lang]}!
                <br>
                <span class="notif-xp">+${collectible.typeInfo.xp} XP</span>
            </span>
        `;
        this.notification.classList.add('active');
        
        setTimeout(() => {
            this.notification.classList.remove('active');
        }, 3000);
        
        // Award XP
        if (this.app.xpSystem) {
            this.app.xpSystem.addXP(collectible.typeInfo.xp, 'collectible');
        }
        
        // Play sound
        window.dispatchEvent(new CustomEvent('app:sound', { detail: 'success' }));
        
        // Trigger particles
        if (this.app.particleEffects) {
            this.app.particleEffects.burst(collectible.typeInfo.color);
        }
        
        // Update counter
        document.getElementById('collected-count').textContent = this.collected.length;
        
        // Check for collection achievements
        this.checkAchievements();
    }
    
    checkAchievements() {
        const total = this.getCollectibleLocations().length;
        
        // First collectible
        if (this.collected.length === 1 && this.app.achievementSystem) {
            // Achievement for first collectible would be here
        }
        
        // Halfway there
        if (this.collected.length === Math.floor(total / 2)) {
            // Achievement for half collection
        }
        
        // Complete collection
        if (this.collected.length === total && this.app.achievementSystem) {
            // Achievement for complete collection
        }
    }
    
    loadCollected() {
        try {
            return JSON.parse(localStorage.getItem('solarCollectibles') || '[]');
        } catch {
            return [];
        }
    }
    
    saveCollected() {
        localStorage.setItem('solarCollectibles', JSON.stringify(this.collected));
    }
    
    // Reset collection (for testing)
    resetCollection() {
        this.collected = [];
        this.saveCollected();
        location.reload();
    }
}
