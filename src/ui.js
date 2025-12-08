/**
 * Manages User Interface elements: Window, Panels, HUD.
 */
import { SOLAR_SYSTEM_DATA, getTranslatedObjectData } from './data/objectsInfo.js';
import { i18n } from './i18n.js';

export class UIManager {
    constructor(app) {
        this.app = app;

        // Window Controls
        this.windowContainer = document.getElementById('app-window');
        this.windowBody = document.getElementById('window-body');

        // Panels
        this.infoPanel = document.getElementById('info-panel');
        this.btnCloseInfo = document.getElementById('close-info');
        this.infoTitle = document.getElementById('info-title');
        this.infoContent = document.getElementById('info-content');

        this.btnRecenter = document.getElementById('btn-recenter');

        // Navigation
        this.navigationList = []; // Flattened list of [name, data]
        this.currentIndex = -1;
        this.buildNavigationList();
        this.injectNavigationButtons();

        this.initListeners();
        
        // Listen for language changes to update passport
        i18n.onLangChange(() => this.updatePassportLanguage());
    }

    buildNavigationList() {
        // Flatten the hierarchy: Sun -> Planet -> Its Moons -> Next Planet
        const processObject = (key, data) => {
            this.navigationList.push({ name: key, data: data });

            if (data.moons) {
                data.moons.forEach(moon => {
                    // Use moon.id if available (new format), otherwise fall back to nome
                    const moonId = moon.id || moon.nome;
                    this.navigationList.push({ name: moonId, data: moon });
                });
            }
        };

        // Assume SOLAR_SYSTEM_DATA keys are in order
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            // Skip space probes and easter eggs (add probes at the end)
            if (data.tipo === 'Sonda Espacial') continue;
            if (data.isEasterEgg) continue; // Hide easter eggs from navigation
            processObject(key, data);
        }
        
        // Add space probes at the end
        for (const [key, data] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (data.tipo === 'Sonda Espacial') {
                this.navigationList.push({ name: key, data: data });
            }
        }
    }

    injectNavigationButtons() {
        const hudPanel = document.getElementById('hud-panel');

        const navContainer = document.createElement('div');
        navContainer.className = 'nav-controls';

        // AudioManager trigger
        const playClick = () => {
            const event = new CustomEvent('app:sound', { detail: 'select' });
            window.dispatchEvent(event);
        };

        const btnPrev = document.createElement('button');
        btnPrev.className = 'nav-arrow';
        btnPrev.innerText = '◀';
        btnPrev.onclick = () => { playClick(); this.navigate(-1); };

        const btnNext = document.createElement('button');
        btnNext.className = 'nav-arrow';
        btnNext.innerText = '▶';
        btnNext.onclick = () => { playClick(); this.navigate(1); };

        const label = document.createElement('span');
        label.innerText = i18n.t('explore');
        // label.className = 'nav-label';

        navContainer.appendChild(btnPrev);
        navContainer.appendChild(label); // Just space
        navContainer.appendChild(btnNext);

        // Insert before "Recentrar" button
        hudPanel.insertBefore(navContainer, this.btnRecenter);

        // CREATE PASSPORT BAR
        this.createPassport();
    }

    createPassport() {
        // Create a horizontal scroll bar with planet icons
        const passportContainer = document.createElement('div');
        passportContainer.id = 'passport-panel';
        
        // Toggle button (minimize/expand) - modern chevron icon
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'passport-toggle';
        toggleBtn.title = i18n.t('minimize');
        toggleBtn.onclick = () => this.togglePassport();
        
        // Create chevron icon with CSS
        const chevron = document.createElement('div');
        chevron.className = 'chevron-icon left';
        toggleBtn.appendChild(chevron);
        
        passportContainer.appendChild(toggleBtn);

        const title = document.createElement('div');
        title.className = 'passport-title';
        title.innerText = i18n.t('passport_title');
        passportContainer.appendChild(title);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'passport-items';
        passportContainer.appendChild(itemsContainer);

        // Collectable Types (exclude Sun logic inside visit method, but here we list main planets)
        // IDs are now lowercase English
        const mainBodies = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        // Tell GM total count
        if (this.app.gameManager) this.app.gameManager.setTotal(mainBodies.length);

        mainBodies.forEach(id => {
            const badge = document.createElement('div');
            badge.className = 'passport-badge locked';
            badge.id = `badge-${id}`;

            // Get translated name for tooltip using the data.nome
            const data = SOLAR_SYSTEM_DATA[id];
            const translatedName = data ? (i18n.lang === 'en' ? i18n.getPlanetName(data.nome) : data.nome) : id;
            badge.title = translatedName;

            // Simple Circle Icon
            const icon = document.createElement('div');
            icon.className = 'badge-icon';
            // Set color based on data? default gray
            if (data) icon.style.backgroundColor = '#' + data.cor.toString(16).padStart(6, '0');

            const label = document.createElement('span');
            label.innerText = translatedName.substring(0, 3); // Mer, Ven...

            badge.appendChild(icon);
            badge.appendChild(label);
            itemsContainer.appendChild(badge);
        });

        document.body.appendChild(passportContainer);
        this.passportContainer = passportContainer;
        this.passportExpanded = true;
    }
    
    togglePassport() {
        this.passportExpanded = !this.passportExpanded;
        const panel = document.getElementById('passport-panel');
        const chevron = panel?.querySelector('.passport-toggle .chevron-icon');
        
        if (panel) {
            panel.classList.toggle('hidden-passport', !this.passportExpanded);
        }
        if (chevron) {
            chevron.className = this.passportExpanded ? 'chevron-icon left' : 'chevron-icon right';
        }
        
        const toggleBtn = panel?.querySelector('.passport-toggle');
        if (toggleBtn) {
            toggleBtn.title = this.passportExpanded ? 
                i18n.t('minimize') : 
                i18n.t('expand');
        }
    }
    
    updatePassportLanguage() {
        const panel = document.getElementById('passport-panel');
        if (!panel) return;
        
        // Update title
        const title = panel.querySelector('.passport-title');
        if (title) {
            title.innerText = i18n.t('passport_title');
        }
        
        // Update toggle button tooltip
        const toggleBtn = panel.querySelector('.passport-toggle');
        if (toggleBtn) {
            toggleBtn.title = this.passportExpanded ? 
                i18n.t('minimize') : 
                i18n.t('expand');
        }
        
        // Update badge tooltips and labels
        const mainBodies = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        mainBodies.forEach(id => {
            const badge = document.getElementById(`badge-${id}`);
            if (badge) {
                const data = SOLAR_SYSTEM_DATA[id];
                const translatedName = data ? (i18n.lang === 'en' ? i18n.getPlanetName(data.nome) : data.nome) : id;
                badge.title = translatedName;
                const label = badge.querySelector('span');
                if (label) {
                    label.innerText = translatedName.substring(0, 3);
                }
            }
        });
    }

    updatePassport(name, forceUnlock = false) {
        if (!this.app.gameManager) return;

        // We only update visuals here. Logic is in completeMission or pre-check.
        // Or if we load the app and want to sync state.

        if (this.app.gameManager.isVisited(name) || forceUnlock) {
            const badge = document.getElementById(`badge-${name}`);
            if (badge) {
                badge.classList.remove('locked');
                badge.classList.add('unlocked');
            }
        }
    }

    showCelebration(name) {
        // Get object type to show correct message
        const objectData = SOLAR_SYSTEM_DATA[name];
        let discoveryKey = 'discovered_planet';
        
        if (objectData && objectData.tipo) {
            const tipo = objectData.tipo.toLowerCase();
            if (tipo.includes('lua') || tipo.includes('moon') || tipo.includes('satélite')) {
                discoveryKey = 'discovered_moon';
            } else if (tipo.includes('anão') || tipo.includes('dwarf')) {
                discoveryKey = 'discovered_dwarf';
            } else if (tipo.includes('sonda') || tipo.includes('probe')) {
                discoveryKey = 'discovered_probe';
            } else if (tipo.includes('estrela') || tipo.includes('star')) {
                discoveryKey = 'discovered_star';
            } else if (tipo.includes('asteroide') || tipo.includes('asteroid')) {
                discoveryKey = 'discovered_asteroid';
            }
        }
        
        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';

        const content = document.createElement('div');
        content.className = 'celebration-content';

        const emoji = document.createElement('div');
        emoji.className = 'celebration-emoji';
        emoji.innerText = '🚀';

        const missionTitle = document.createElement('h3');
        missionTitle.innerText = i18n.t('mission_message');
        missionTitle.style.color = '#4a90e2';
        missionTitle.style.marginBottom = '5px';

        const title = document.createElement('h1');
        title.innerHTML = i18n.t('congrats_captain');

        const subTitle = document.createElement('p');
        subTitle.style.fontSize = '1.2rem';
        subTitle.style.color = '#ccc';
        subTitle.innerText = `${i18n.t(discoveryKey)} ${i18n.getPlanetName(name)}!`;

        content.appendChild(emoji);
        content.appendChild(missionTitle);
        content.appendChild(title);
        content.appendChild(subTitle);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Remove after 4 seconds
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 500);
        }, 4000);

        // Trigger Confetti
        this.explodeConfetti();
    }

    explodeConfetti() {
        const colors = ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ffffff'];

        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const duration = (Math.random() * 2 + 1.5) + 's';
            confetti.style.animationDuration = duration;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }

    initListeners() {
        // Info Panel close button
        this.btnCloseInfo.addEventListener('click', () => {
            this.closeInfoPanel();
        });
        
        // Click outside info panel to close (use mousedown to not interfere with orbit controls)
        document.addEventListener('mousedown', (e) => {
            if (!this.infoPanel.classList.contains('hidden')) {
                // Only close if clicking on the canvas background
                if (e.target.tagName === 'CANVAS') {
                    this.closeInfoPanel();
                }
            }
        });

        // Recenter
        this.btnRecenter.addEventListener('click', () => {
            this.app.cameraControls.resetView();
            this.closeInfoPanel();
            this.currentIndex = -1;
        });
    }
    
    closeInfoPanel() {
        this.infoPanel.classList.add('hidden');
        // Stop planet ambient sound when closing info panel
        this.app.audioManager?.stopPlanetAmbient();
    }

    findData(name) {
        // First try to get translated data for main objects
        const translated = getTranslatedObjectData(name);
        if (translated) return translated;
        
        // Fallback for moons - search in navigation list
        const item = this.navigationList.find(x => x.name === name);
        if (item && item.data) {
            // Try to find translated moon data from parent planet
            const parentPlanet = this.findParentPlanet(name);
            if (parentPlanet) {
                const parentData = getTranslatedObjectData(parentPlanet);
                if (parentData && parentData.moons) {
                    const moonData = parentData.moons.find(m => m.nome === name || m.nome === item.data.nome);
                    if (moonData) return { ...item.data, ...moonData };
                }
            }
            return item.data;
        }
        return null;
    }
    
    findParentPlanet(moonName) {
        // Find which planet this moon belongs to
        for (const [planetKey, planetData] of Object.entries(SOLAR_SYSTEM_DATA)) {
            if (planetData.moons) {
                const moon = planetData.moons.find(m => m.nome === moonName);
                if (moon) return planetKey;
            }
        }
        return null;
    }

    navigate(direction) {
        // If nothing selected, start at Sun (index 0)
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex += direction;
        }

        // Loop
        if (this.currentIndex < 0) this.currentIndex = this.navigationList.length - 1;
        if (this.currentIndex >= this.navigationList.length) this.currentIndex = 0;

        const target = this.navigationList[this.currentIndex];
        this.selectObject(target.name);
    }

    selectObject(name) {
        // Logic to select object in 3D scene + Show Info
        // We need reference to SolarSystem objects.
        // Access via app
        const mesh = this.app.solarSystem.objects[name];
        if (mesh) {
            // Highlight the object
            this.app.solarSystem.highlightObject(mesh);
            
            // Use fly-to animation if available, otherwise fallback
            if (this.app.cameraControls.flyToObject) {
                this.app.cameraControls.flyToObject(mesh, name);
            } else {
                this.app.cameraControls.setTarget(mesh);
                this.showInfo(name);
            }
            
            this.updatePassport(name); // Gamification Trigger (Just visual sync here)
            
            // Play planet-specific ambient sound
            this.app.audioManager?.playPlanetAmbient(name);
        }
    }

    showInfo(objectName) {
        const data = this.findData(objectName);
        if (!data) return;

        // Update Index
        const idx = this.navigationList.findIndex(x => x.name === objectName);
        if (idx !== -1) this.currentIndex = idx;

        this.infoTitle.innerText = data.nome;
        this.infoContent.innerHTML = '';
        this.infoPanel.classList.remove('hidden');

        // Setup Slides logic
        this.currentSlideData = data;
        this.currentObjectKey = objectName; // Store the key for discovery tracking
        this.currentSlideIndex = 0;
        this.slides = this.buildSlides(data);

        this.renderSlide();
        
        // Check if this completes any mission (even if previously visited)
        this.checkMissionForPlanet(objectName);
    }
    
    checkMissionForPlanet(planetName) {
        // Dispatch event to check missions
        if (this.app.missionSystem) {
            const completedMission = this.app.missionSystem.onPlanetInfoViewed(planetName);
            if (completedMission) {
                // Award XP for mission
                if (this.app.xpSystem) {
                    setTimeout(() => {
                        const result = this.app.xpSystem.addXP(completedMission.xpReward, `Missão: ${completedMission.title}`);
                        
                        if (result && result.leveledUp) {
                            this.app.audioManager?.playLevelUp();
                            this.app.xpSystem.showLevelUp(result.newRank);
                            this.app.achievementSystem?.checkLevel(result.newLevel);
                        }
                    }, 500);
                }
                
                // Play mission complete sound
                setTimeout(() => {
                    this.app.audioManager?.playMissionComplete();
                }, 1000);
            }
        }
    }

    buildSlides(data) {
        const slides = [];
        const lang = i18n.lang || 'pt';

        // Slide 1: Basic Stats
        slides.push({
            title: lang === 'en' ? 'Basic Data' : 'Dados Básicos',
            content: (container) => {
                if (data.tipo) this.createRow(container, i18n.t('info_type'), data.tipo);
                if (data.distanciaMediaAoSol) this.createRow(container, i18n.t('info_distance'), `${data.distanciaMediaAoSol} M km`);
                if (data.distanciaKm) this.createRow(container, lang === 'en' ? 'Distance' : 'Distância', `${data.distanciaKm} km`);
            }
        });

        // Slide 2: Real Photo (NEW!)
        if (data.imagemReal) {
            slides.push({
                title: lang === 'en' ? 'Real Photo' : 'Fotografia Real',
                content: (container) => {
                    const photoContainer = document.createElement('div');
                    photoContainer.className = 'real-photo-container';
                    
                    // Support for multiple photos (array)
                    const photos = Array.isArray(data.imagemReal) ? data.imagemReal : [data.imagemReal];
                    let currentPhotoIndex = 0;
                    
                    const img = document.createElement('img');
                    img.src = photos[0];
                    img.alt = data.nome;
                    img.className = 'real-photo';
                    img.loading = 'lazy';
                    
                    // Add loading state
                    img.onload = () => {
                        img.classList.add('loaded');
                    };
                    img.onerror = () => {
                        photoContainer.innerHTML = `<p style="color: #888; text-align: center;">${lang === 'en' ? 'Photo not available' : 'Foto não disponível'}</p>`;
                    };
                    
                    photoContainer.appendChild(img);
                    
                    // Add navigation for multiple photos
                    if (photos.length > 1) {
                        const navContainer = document.createElement('div');
                        navContainer.className = 'photo-nav';
                        
                        const prevBtn = document.createElement('button');
                        prevBtn.className = 'photo-nav-btn';
                        prevBtn.innerHTML = '◀';
                        prevBtn.onclick = () => {
                            currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
                            img.classList.remove('loaded');
                            img.src = photos[currentPhotoIndex];
                            counter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
                        };
                        
                        const counter = document.createElement('span');
                        counter.className = 'photo-counter';
                        counter.textContent = `1 / ${photos.length}`;
                        
                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'photo-nav-btn';
                        nextBtn.innerHTML = '▶';
                        nextBtn.onclick = () => {
                            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
                            img.classList.remove('loaded');
                            img.src = photos[currentPhotoIndex];
                            counter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
                        };
                        
                        navContainer.appendChild(prevBtn);
                        navContainer.appendChild(counter);
                        navContainer.appendChild(nextBtn);
                        photoContainer.appendChild(navContainer);
                    }
                    
                    // Add credit
                    const credit = document.createElement('p');
                    credit.className = 'photo-credit';
                    credit.innerHTML = lang === 'en' 
                        ? '📷 Image: NASA/ESA/Wikimedia Commons' 
                        : '📷 Imagem: NASA/ESA/Wikimedia Commons';
                    photoContainer.appendChild(credit);
                    
                    container.appendChild(photoContainer);
                }
            });
        }

        // Slide 3: Climate & Time
        slides.push({
            title: lang === 'en' ? 'Climate & Time' : 'Clima e Tempo',
            content: (container) => {
                if (data.duracaoDia) this.createRow(container, i18n.t('info_day'), data.duracaoDia);
                if (data.duracaoAno) this.createRow(container, i18n.t('info_year'), data.duracaoAno);
                if (data.temperaturaMediaAproximada) this.createRow(container, i18n.t('info_temp'), data.temperaturaMediaAproximada);
            }
        });

        // Slide 3: WOW Facts for Kids! (NEW!)
        if (data.factosUau && data.factosUau.length > 0) {
            slides.push({
                title: i18n.t('info_wow_facts'),
                content: (container) => {
                    const wowContainer = document.createElement('div');
                    wowContainer.className = 'wow-facts';
                    
                    // Show 2 random facts
                    const shuffled = [...data.factosUau].sort(() => Math.random() - 0.5);
                    const factsToShow = shuffled.slice(0, 2);
                    
                    factsToShow.forEach(fact => {
                        const factDiv = document.createElement('div');
                        factDiv.className = 'wow-fact';
                        factDiv.innerHTML = fact;
                        wowContainer.appendChild(factDiv);
                    });

                    // Add comparison if exists
                    if (data.comparacao) {
                        const compDiv = document.createElement('div');
                        compDiv.className = 'wow-comparison';
                        compDiv.innerHTML = `📏 ${data.comparacao}`;
                        wowContainer.appendChild(compDiv);
                    }
                    
                    container.appendChild(wowContainer);
                }
            });
        }

        // Slide 4: Curiosities
        if (data.curiosidades && data.curiosidades.length > 0) {
            slides.push({
                title: i18n.t('info_curiosities'),
                content: (container) => {
                    const ul = document.createElement('ul');
                    ul.className = 'curiosities-list';
                    data.curiosidades.forEach(c => {
                        const li = document.createElement('li');
                        li.innerText = c;
                        ul.appendChild(li);
                    });
                    container.appendChild(ul);
                }
            });
        }

        // Slide 5: Description (Final)
        if (data.descricao) {
            slides.push({
                title: lang === 'en' ? 'About' : 'Sobre',
                content: (container) => {
                    const p = document.createElement('p');
                    p.className = 'info-desc';
                    p.innerText = data.descricao;
                    container.appendChild(p);
                }
            });
        }

        return slides;
    }

    renderSlide() {
        this.infoContent.innerHTML = '';
        const slide = this.slides[this.currentSlideIndex];

        // Object Visual Preview (texture sphere or special image)
        if (this.currentSlideIndex === 0) {
            this.renderObjectPreview();
        }

        // Slide Title
        const h3 = document.createElement('h3');
        h3.innerText = slide.title;
        h3.className = 'slide-title';
        this.infoContent.appendChild(h3);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'slide-content';
        slide.content(contentDiv);
        this.infoContent.appendChild(contentDiv);

        // Buttons
        const controls = document.createElement('div');
        controls.className = 'slide-controls';

        // Prev Button
        if (this.currentSlideIndex > 0) {
            const btnPrev = document.createElement('button');
            btnPrev.className = 'modern-btn slide-btn';
            btnPrev.innerText = i18n.t('previous');
            btnPrev.onclick = () => {
                this.currentSlideIndex--;
                this.renderSlide();
            };
            controls.appendChild(btnPrev);
        }

        // Next/Finish Button
        const btnNext = document.createElement('button');
        btnNext.className = 'modern-btn slide-btn primary';

        const isLast = this.currentSlideIndex === this.slides.length - 1;
        const isVisited = this.app.gameManager ? this.app.gameManager.isVisited(this.currentObjectKey) : false;

        if (isLast) {
            if (isVisited) {
                btnNext.innerText = i18n.t('close');
                btnNext.onclick = () => this.closeInfoPanel();
            } else {
                btnNext.innerText = i18n.t('discover_btn');
                btnNext.onclick = () => this.completeMission();
            }
        } else {
            btnNext.innerText = i18n.t('next') + ' ➡';
            btnNext.onclick = () => {
                this.currentSlideIndex++;
                this.renderSlide();
            };
        }
        controls.appendChild(btnNext);
        this.infoContent.appendChild(controls);

        // Progress Dots
        const dots = document.createElement('div');
        dots.className = 'slide-dots';
        this.slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = `dot ${i === this.currentSlideIndex ? 'active' : ''}`;
            dots.appendChild(dot);
        });
        this.infoContent.appendChild(dots);
    }

    createRow(container, label, value) {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="info-label">${label}</span><span class="info-value">${value}</span>`;
        container.appendChild(div);
    }

    completeMission() {
        if (!this.app.gameManager) return;

        // Use the object key for tracking, not the translated name
        const key = this.currentObjectKey;
        const displayName = this.currentSlideData.nome;
        const isNew = this.app.gameManager.visit(key);

        if (isNew) {
            this.showCelebration(displayName);
            window.dispatchEvent(new CustomEvent('app:visit', { detail: key }));

            // Update passport visual immediately
            this.updatePassport(key, true);

            // Re-render slide to show "Close" button instead of Discover
            this.renderSlide();
        }
    }

    renderObjectPreview() {
        const data = this.currentSlideData;
        if (!data) return;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'object-preview';

        // Special case: Lua - show Apollo mission photos
        if (data.nome === 'Lua' || data.id === 'moon') {
            this.renderMoonGallery(previewContainer);
        } 
        // Special case: ET UFO
        else if (data.nome?.includes('OVNI') || data.tipo === 'Nave Alienígena') {
            this.renderUFOPreview(previewContainer);
        }
        // Default: Show texture as rotating sphere preview
        else if (data.textureUrl) {
            const textureImg = document.createElement('div');
            textureImg.className = 'planet-preview';
            textureImg.innerHTML = `
                <div class="planet-sphere" style="background-image: url('${data.textureUrl}')"></div>
                <div class="planet-glow" style="--planet-color: #${(data.cor || 0x4488ff).toString(16).padStart(6, '0')}"></div>
            `;
            previewContainer.appendChild(textureImg);
        }

        this.infoContent.appendChild(previewContainer);
    }

    renderMoonGallery(container) {
        const apolloPhotos = [
            {
                url: '/textures/apollo/aldrin.jpg',
                caption: 'Buzz Aldrin na Lua - Apollo 11, 1969',
                captionEN: 'Buzz Aldrin on the Moon - Apollo 11, 1969'
            },
            {
                url: '/textures/apollo/bootprint.jpg',
                caption: 'Pegada de astronauta que ainda lá está!',
                captionEN: 'Astronaut footprint that\'s still there!'
            },
            {
                url: '/textures/apollo/rover.jpg',
                caption: 'Carro lunar Apollo - ainda está na Lua!',
                captionEN: 'Apollo lunar rover - still on the Moon!'
            }
        ];

        const lang = i18n.lang || 'pt';
        const galleryTitle = document.createElement('div');
        galleryTitle.className = 'moon-gallery-title';
        galleryTitle.innerHTML = `📸 ${lang === 'en' ? 'Real photos from the Moon!' : 'Fotos reais da Lua!'}`;
        container.appendChild(galleryTitle);

        const gallery = document.createElement('div');
        gallery.className = 'moon-gallery';

        apolloPhotos.forEach((photo, index) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'moon-photo';
            photoDiv.innerHTML = `
                <img src="${photo.url}" alt="${lang === 'en' ? photo.captionEN : photo.caption}" loading="lazy">
                <span class="photo-caption">${lang === 'en' ? photo.captionEN : photo.caption}</span>
            `;
            photoDiv.onclick = () => this.showFullPhoto(photo, lang);
            gallery.appendChild(photoDiv);
        });

        container.appendChild(gallery);
    }

    showFullPhoto(photo, lang) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <img src="${photo.url}" alt="Apollo Mission Photo">
                <p>${lang === 'en' ? photo.captionEN : photo.caption}</p>
                <button class="modern-btn">${lang === 'en' ? 'Close' : 'Fechar'}</button>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal || e.target.tagName === 'BUTTON') {
                modal.remove();
            }
        };
        document.body.appendChild(modal);
    }

    renderUFOPreview(container) {
        const ufoVisual = document.createElement('div');
        ufoVisual.className = 'ufo-preview';
        ufoVisual.innerHTML = `
            <div class="ufo-animation">
                <span class="ufo-emoji">🛸</span>
                <div class="ufo-beam"></div>
            </div>
            <div class="ufo-message">
                <span class="alien-text">👽 ??? </span>
            </div>
        `;
        container.appendChild(ufoVisual);
    }
}
