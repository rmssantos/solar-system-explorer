/**
 * Mini-Map - Shows an overhead view of the Solar System
 * Indicates current position and visited planets
 */
import * as THREE from 'three';
import { SOLAR_SYSTEM_DATA } from './data/objectsInfo.js';
import { i18n } from './i18n.js';

export class MiniMap {
    constructor(app) {
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        this.isExpanded = false;
        
        // Planet positions (simplified orbital distances)
        this.planetData = [
            { name: 'Sol', key: 'Sol', distance: 0, color: '#FFD700', size: 8 },
            { name: 'Mercúrio', key: 'Mercurio', distance: 25, color: '#A9A9A9', size: 2 },
            { name: 'Vénus', key: 'Venus', distance: 35, color: '#DEB887', size: 3 },
            { name: 'Terra', key: 'Terra', distance: 45, color: '#4169E1', size: 3 },
            { name: 'Marte', key: 'Marte', distance: 55, color: '#CD5C5C', size: 2.5 },
            { name: 'Júpiter', key: 'Jupiter', distance: 75, color: '#DAA520', size: 6 },
            { name: 'Saturno', key: 'Saturno', distance: 95, color: '#F4C430', size: 5, rings: true },
            { name: 'Úrano', key: 'Urano', distance: 115, color: '#40E0D0', size: 4 },
            { name: 'Neptuno', key: 'Neptuno', distance: 135, color: '#1E90FF', size: 4 }
        ];
        
        this.currentTarget = null;
        this.animationFrame = null;
        this.zoomLevel = 1; // Zoom: 0.5 to 2
        this.orbitTime = 0; // Synchronized time for orbits
        this.isMinimized = false;

        // Hover state
        this.mouseX = -1;
        this.mouseY = -1;
        this.hoveredPlanet = null;

        // Scale for mapping 3D to 2D
        this.mapScale = 1;

        this.createUI();
        this.startAnimation();

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());
    }

    updateTranslations() {
        const title = document.querySelector('.minimap-title');
        const minBtn = document.querySelector('.minimap-minimize');
        const toggleBtn = document.querySelector('.minimap-toggle');
        if (title) title.textContent = `🗺️ ${i18n.t('map')}`;
        if (minBtn) minBtn.title = this.isMinimized ? i18n.t('restore') : i18n.t('minimize');
        if (toggleBtn) toggleBtn.title = this.isExpanded ? i18n.t('reduce') : i18n.t('expand');
    }

    createUI() {
        // Container
        const container = document.createElement('div');
        container.id = 'minimap-container';
        container.className = 'minimap-container';
        
        // Header
        const header = document.createElement('div');
        header.className = 'minimap-header';
        header.innerHTML = `
            <span class="minimap-title">🗺️ ${i18n.t('map')}</span>
            <div class="minimap-buttons">
                <button class="minimap-minimize" title="${i18n.t('minimize')}">−</button>
                <button class="minimap-toggle" title="${i18n.t('expand')}">⊕</button>
            </div>
        `;
        container.appendChild(header);
        
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'minimap-canvas';
        this.canvas.width = 150;
        this.canvas.height = 150;
        container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        document.body.appendChild(container);
        this.container = container;
        
        // Event listeners
        header.querySelector('.minimap-toggle').onclick = (e) => {
            e.stopPropagation();
            this.toggleExpand();
        };
        
        header.querySelector('.minimap-minimize').onclick = (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        };
        
        // Click header to restore when minimized
        header.onclick = () => {
            if (this.isMinimized) {
                this.toggleMinimize();
            }
        };
        
        // Click on map to navigate
        this.canvas.onclick = (e) => this.handleClick(e);

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
        }, { passive: false });

        // Mouse hover for planet highlight
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.updateHoveredPlanet();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = -1;
            this.mouseY = -1;
            this.hoveredPlanet = null;
            this.canvas.style.cursor = 'default';
        });
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.container.classList.toggle('minimized', this.isMinimized);
        
        const minBtn = this.container.querySelector('.minimap-minimize');
        if (minBtn) {
            minBtn.textContent = this.isMinimized ? '+' : '−';
            minBtn.title = this.isMinimized ? i18n.t('restore') : i18n.t('minimize');
        }
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        
        const toggleBtn = this.container.querySelector('.minimap-toggle');
        
        if (this.isExpanded) {
            this.canvas.width = 300;
            this.canvas.height = 300;
            this.container.classList.add('expanded');
            if (toggleBtn) {
                toggleBtn.textContent = '⊖';
                toggleBtn.title = i18n.t('reduce');
            }
        } else {
            this.canvas.width = 150;
            this.canvas.height = 150;
            this.container.classList.remove('expanded');
            if (toggleBtn) {
                toggleBtn.textContent = '⊕';
                toggleBtn.title = i18n.t('expand');
            }
        }
    }

    /**
     * Update which planet is being hovered
     */
    updateHoveredPlanet() {
        if (this.mouseX < 0 || this.mouseY < 0) {
            this.hoveredPlanet = null;
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = this.isExpanded ? 1 : 0.5;

        let closest = null;
        let closestDist = Infinity;

        for (const planet of this.planetData) {
            const pos = this.getPlanetPosition(planet, centerX, centerY, scale);
            const dist = Math.sqrt((this.mouseX - pos.x) ** 2 + (this.mouseY - pos.y) ** 2);

            // Calculate visual size of planet on minimap
            const planetSize = planet.size * scale * this.zoomLevel;
            // Hit radius is visual size + generous margin
            const hitRadius = Math.max(planetSize + 15, 22);

            if (dist < hitRadius && dist < closestDist) {
                closestDist = dist;
                closest = planet;
            }
        }

        this.hoveredPlanet = closest;
        this.canvas.style.cursor = closest ? 'pointer' : 'default';
    }

    /**
     * Calculate planet position on the minimap based on REAL 3D positions
     */
    getPlanetPosition(planet, centerX, centerY, scale) {
        // Get real position from the 3D scene
        const mesh = this.app.solarSystem?.objects?.[planet.key];

        if (!mesh) {
            // Fallback to center for Sun or if mesh not found
            if (planet.distance === 0) {
                return { x: centerX, y: centerY };
            }
            // Fallback animated position if 3D object not available
            const speed = 1 / Math.sqrt(planet.distance);
            const angle = this.orbitTime * speed * 5;
            return {
                x: centerX + Math.cos(angle) * planet.distance * scale * this.zoomLevel,
                y: centerY + Math.sin(angle) * planet.distance * scale * this.zoomLevel
            };
        }

        // Get world position of the planet
        const worldPos = mesh.position;

        // Use the calculated mapScale from draw() or calculate it
        const mapScale = this.mapScale || scale * this.zoomLevel;

        // Convert 3D position to 2D minimap (top-down view: X and Z axes)
        return {
            x: centerX + worldPos.x * mapScale,
            y: centerY + worldPos.z * mapScale  // Z becomes Y in top-down view
        };
    }

    /**
     * Get camera/ship position on minimap
     */
    getCameraPosition(centerX, centerY) {
        const camera = this.app.camera;
        if (!camera) return null;

        const mapScale = this.mapScale || 1;

        return {
            x: centerX + camera.position.x * mapScale,
            y: centerY + camera.position.z * mapScale
        };
    }

    handleClick(e) {
        // Use hoveredPlanet if available (more accurate)
        if (this.hoveredPlanet) {
            this.navigateTo(this.hoveredPlanet.key);
            this.showClickFeedback(this.hoveredPlanet.name);
            return;
        }

        // Fallback: calculate from click position
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = this.isExpanded ? 1 : 0.5;

        // Find closest planet to click
        let closestPlanet = null;
        let closestDistance = Infinity;

        for (const planet of this.planetData) {
            const pos = this.getPlanetPosition(planet, centerX, centerY, scale);

            // Distance from click to planet
            const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
            // Same hit radius calculation as updateHoveredPlanet
            const planetSize = planet.size * scale * this.zoomLevel;
            const hitRadius = Math.max(planetSize + 15, 22);

            if (dist < hitRadius && dist < closestDistance) {
                closestDistance = dist;
                closestPlanet = planet;
            }
        }

        if (closestPlanet) {
            this.navigateTo(closestPlanet.key);
            this.showClickFeedback(closestPlanet.name);
        }
    }

    showClickFeedback(planetName) {
        // Brief visual feedback
        const header = this.container.querySelector('.minimap-title');
        if (header) {
            const originalText = header.textContent;
            header.textContent = `🚀 → ${planetName}`;
            header.style.color = '#4a90e2';

            setTimeout(() => {
                header.textContent = originalText;
                header.style.color = '';
            }, 1500);
        }
    }

    navigateTo(planetKey) {
        // Find planet in navigation list
        if (this.app.uiManager) {
            const navList = this.app.uiManager.navigationList;
            const index = navList.findIndex(item => 
                item.name === planetKey || item.data?.nome === planetKey
            );
            
            if (index !== -1) {
                this.app.uiManager.currentIndex = index - 1;
                this.app.uiManager.navigate(1);
                
                // Play sound
                window.dispatchEvent(new CustomEvent('app:sound', { detail: 'select' }));
            }
        }
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const scale = this.isExpanded ? 1 : 0.5;

        // Update orbit time (fallback for when 3D objects not available)
        this.orbitTime = Date.now() * 0.0001;

        // Clear
        ctx.fillStyle = 'rgba(10, 10, 30, 0.95)';
        ctx.fillRect(0, 0, w, h);

        // Get current target from camera controls
        const currentTarget = this.app.cameraControls?.followingObject;

        // Calculate max distance for scaling (find furthest planet)
        let maxDist = 0;
        for (const planet of this.planetData) {
            const mesh = this.app.solarSystem?.objects?.[planet.key];
            if (mesh) {
                const dist = Math.sqrt(mesh.position.x ** 2 + mesh.position.z ** 2);
                if (dist > maxDist) maxDist = dist;
            }
        }

        // Calculate scale to fit all planets in minimap
        const padding = 15;
        const availableRadius = Math.min(w, h) / 2 - padding;
        this.mapScale = maxDist > 0 ? (availableRadius / maxDist) * this.zoomLevel : scale * this.zoomLevel;

        // Draw orbit circles (based on real distances)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (const planet of this.planetData) {
            const mesh = this.app.solarSystem?.objects?.[planet.key];
            if (mesh && planet.distance > 0) {
                const orbitRadius = Math.sqrt(mesh.position.x ** 2 + mesh.position.z ** 2);
                ctx.beginPath();
                ctx.arc(centerX, centerY, orbitRadius * this.mapScale, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Draw planets
        for (const planet of this.planetData) {
            // Use helper method for consistent positioning
            const pos = this.getPlanetPosition(planet, centerX, centerY, scale);
            const x = pos.x;
            const y = pos.y;
            const planetSize = planet.size * scale * this.zoomLevel;

            // Check states
            const isVisited = this.app.gameManager?.isVisited(planet.name);
            const isCurrent = currentTarget === planet.key || currentTarget === planet.name;
            const isHovered = this.hoveredPlanet === planet;

            // Draw hover highlight ring first (behind planet)
            if (isHovered && !isCurrent) {
                ctx.beginPath();
                ctx.arc(x, y, planetSize + 8, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ffff66';
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Draw planet
            ctx.beginPath();
            ctx.arc(x, y, planetSize, 0, Math.PI * 2);

            if (isCurrent) {
                // Current planet - pulsing glow
                const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
                ctx.shadowColor = '#4a90e2';
                ctx.shadowBlur = 15 * pulse;
                ctx.fillStyle = planet.color;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Selection ring
                ctx.strokeStyle = '#4a90e2';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, planetSize + 4, 0, Math.PI * 2);
                ctx.stroke();
            } else if (isHovered) {
                // Hovered planet - bright with glow
                ctx.shadowColor = '#ffff66';
                ctx.shadowBlur = 12;
                ctx.fillStyle = planet.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (isVisited) {
                // Visited - full color
                ctx.fillStyle = planet.color;
                ctx.fill();
            } else {
                // Not visited - dimmed
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Saturn's rings
            if (planet.rings && this.isExpanded) {
                ctx.strokeStyle = isVisited ? '#D4AF37' : 'rgba(100, 100, 100, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(x, y, planetSize * 2, planetSize * 0.5, 0.3, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Planet name (only in expanded mode or when zoomed in)
            if ((this.isExpanded || this.zoomLevel > 1.2) && planet.distance > 0) {
                ctx.fillStyle = isVisited ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
                ctx.font = `${9 * this.zoomLevel}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(planet.name.substring(0, 3), x, y + planetSize + 10);
            }
        }

        // Draw camera/ship position (real position in 3D space)
        const camPos = this.getCameraPosition(centerX, centerY);
        if (camPos) {
            // Only draw if position is within reasonable bounds
            const distFromCenter = Math.sqrt((camPos.x - centerX) ** 2 + (camPos.y - centerY) ** 2);
            const maxRadius = Math.min(w, h) / 2;

            if (distFromCenter < maxRadius * 1.5) {
                // Draw ship direction indicator (based on camera rotation)
                const camera = this.app.camera;
                if (camera) {
                    // Get camera forward direction
                    const forward = new THREE.Vector3(0, 0, -1);
                    forward.applyQuaternion(camera.quaternion);

                    // Draw direction line
                    const lineLength = 12;
                    ctx.beginPath();
                    ctx.moveTo(camPos.x, camPos.y);
                    ctx.lineTo(
                        camPos.x + forward.x * lineLength,
                        camPos.y + forward.z * lineLength
                    );
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Draw ship icon with glow
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(camPos.x, camPos.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Ship label
                ctx.fillStyle = '#00ffff';
                ctx.font = '8px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('YOU', camPos.x, camPos.y + 12);
            }
        }

        // Legend and zoom indicator
        if (this.isExpanded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('● ' + i18n.t('already_visited').replace('✅ ', ''), 10, h - 25);
            ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            ctx.fillText('○ ' + (i18n.lang === 'en' ? 'To discover' : 'Por descobrir'), 10, h - 10);
        }

        // Zoom indicator
        if (this.zoomLevel !== 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round(this.zoomLevel * 100)}%`, w - 5, h - 5);
        }

        // Hover tooltip (show planet name when hovering in compact mode)
        if (this.hoveredPlanet && !this.isExpanded) {
            const pos = this.getPlanetPosition(this.hoveredPlanet, centerX, centerY, scale);
            const name = this.hoveredPlanet.name;

            // Tooltip background
            ctx.font = '11px sans-serif';
            const textWidth = ctx.measureText(name).width;
            const tooltipX = Math.min(pos.x, w - textWidth - 10);
            const tooltipY = Math.max(pos.y - 20, 15);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.roundRect(tooltipX - 5, tooltipY - 12, textWidth + 10, 16, 4);
            ctx.fill();

            // Tooltip text
            ctx.fillStyle = '#ffff66';
            ctx.textAlign = 'left';
            ctx.fillText(name, tooltipX, tooltipY);
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.container?.remove();
    }
}
