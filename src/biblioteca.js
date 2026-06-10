import { BIBLIOTECA_DATA, STAT_LABEL_KEYS, normalizeGalleryItem } from './data/bibliotecaData.js';

// Estado da aplicação
let currentLang = 'pt';
try {
    currentLang = localStorage.getItem('spaceExplorer_lang') || 'pt';
} catch {
    // Private browsing or storage disabled
}
let currentCategory = 'all';

// Module-scoped gallery state (replaces window._bibliotecaState)
let modalGalleryData = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active lang button
    setLanguage(currentLang);

    // Use addEventListener instead of inline onclick (CSP-safe)
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(/** @type {HTMLElement} */ (btn).dataset.lang));
    });
    document.querySelectorAll('.cat-tab[data-category]').forEach(btn => {
        btn.addEventListener('click', () => showCategory(/** @type {HTMLElement} */ (btn).dataset.category));
    });
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', filterContent);
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    // Event delegation for dynamically generated content in the modal body
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
        modalBody.addEventListener('click', handleModalBodyClick);
    }

    // Event delegation for content grid (cards are generated dynamically)
    const contentGrid = document.getElementById('contentGrid');
    if (contentGrid) {
        contentGrid.addEventListener('click', handleContentGridClick);
        contentGrid.addEventListener('keydown', handleContentGridKeydown);
    }

    // Tell the pre-boot error overlay (public/init.js) the page is healthy.
    window.__appBooted = true;
});

// Event delegation handler for modal body (moon chips, gallery items, header image)
function handleModalBodyClick(e) {
    const target = e.target;

    // Moon chip click -> open modal for that moon
    const moonChip = target.closest('[data-action="open-modal"]');
    if (moonChip) {
        const objectId = moonChip.dataset.objectId;
        if (objectId) openModal(objectId);
        return;
    }

    // Gallery item click -> open lightbox with gallery navigation
    const galleryItem = target.closest('[data-action="open-gallery"]');
    if (galleryItem) {
        const index = parseInt(galleryItem.dataset.galleryIndex, 10);
        const src = galleryItem.dataset.src;
        const caption = galleryItem.dataset.caption;
        openLightbox(src, caption, modalGalleryData, index);
        return;
    }

    // Modal header image click -> open lightbox for single image
    const headerAction = target.closest('[data-action="open-lightbox"]');
    if (headerAction) {
        const src = headerAction.dataset.src;
        const caption = headerAction.dataset.caption;
        openLightbox(src, caption);
        return;
    }
}

// Event delegation handler for content grid (card clicks)
function handleContentGridClick(e) {
    const card = e.target.closest('.object-card[data-id]');
    if (card) {
        openModal(card.dataset.id);
    }
}

// Keyboard support for content grid cards
function handleContentGridKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.object-card[data-id]');
        if (card) {
            e.preventDefault();
            openModal(card.dataset.id);
        }
    }
}

// Trocar idioma
function setLanguage(lang) {
    currentLang = lang;
    try {
        localStorage.setItem('spaceExplorer_lang', lang); // Save preference
    } catch {
        // Private browsing or storage disabled
    }

    // Atualizar botões - use data-lang attribute
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
        btn.classList.toggle('active', /** @type {HTMLElement} */ (btn).dataset.lang === lang);
    });

    // Atualizar UI
    updateUIStrings();

    // Re-renderizar conteúdo
    renderContent();
}

// Atualizar strings da UI
function updateUIStrings() {
    const ui = BIBLIOTECA_DATA[currentLang].ui;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (ui[key]) {
            el.textContent = ui[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (ui[key]) {
            /** @type {HTMLInputElement} */ (el).placeholder = ui[key];
        }
    });
}

// Filtrar por categoria
function showCategory(category) {
    currentCategory = category;

    // Atualizar tabs - use data-category attribute
    document.querySelectorAll('.cat-tab[data-category]').forEach(tab => {
        tab.classList.toggle('active', /** @type {HTMLElement} */ (tab).dataset.category === category);
    });

    // Filtrar cards
    filterCards();
}

// Filtrar por pesquisa
function filterContent() {
    filterCards();
}

// Aplicar filtros aos cards
function filterCards() {
    const searchInput = /** @type {HTMLInputElement} */ (document.getElementById('searchInput'));
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const objects = BIBLIOTECA_DATA[currentLang].objects;

    document.querySelectorAll('.object-card').forEach(card => {
        const objectId = card.getAttribute('data-id');
        const obj = objects[objectId];

        if (!obj) return;

        // Filtro de categoria
        const categoryMatch = currentCategory === 'all' || obj.categoria === currentCategory;

        // Filtro de pesquisa
        const searchMatch = !searchTerm ||
            obj.name.toLowerCase().includes(searchTerm) ||
            obj.type.toLowerCase().includes(searchTerm) ||
            (obj.descricaoLonga && obj.descricaoLonga.toLowerCase().includes(searchTerm));

        card.classList.toggle('hidden', !(categoryMatch && searchMatch));
    });
}

// Renderizar conteúdo
function renderContent() {
    const grid = document.getElementById('contentGrid');
    if (!grid) return;

    const objects = BIBLIOTECA_DATA[currentLang].objects;
    const ui = BIBLIOTECA_DATA[currentLang].ui;

    grid.innerHTML = '';

    for (const [key, obj] of Object.entries(objects)) {
        const card = document.createElement('div');
        card.className = 'object-card';
        card.setAttribute('data-id', key);
        card.setAttribute('data-category', obj.categoria);

        // Escolher um facto aleatório para mostrar no card
        const randomFact = obj.wowFacts ?
            obj.wowFacts[Math.floor(Math.random() * obj.wowFacts.length)] : '';

        // Accessibility attributes
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${obj.name} - ${obj.type}. ${ui.click_to_learn || 'Clica para saber mais'}`);

        card.innerHTML = `
            <div class="card-image">
                ${obj.imagem ?
                `<img src="${obj.imagem}" alt="${obj.name}" loading="lazy">` :
                `<span class="emoji-placeholder">${obj.emoji}</span>`
            }
                <span class="card-type-badge">${obj.type}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${obj.emoji} ${obj.name}</h3>
                <p class="card-subtitle">${obj.type}</p>

                <div class="card-stats">
                    ${obj.estatisticas?.raio ? `
                        <div class="stat">
                            <span class="stat-label">${ui.stat_radius}</span>
                            <span class="stat-value">${obj.estatisticas.raio}</span>
                        </div>
                    ` : ''}
                    ${obj.estatisticas?.temperatura ? `
                        <div class="stat">
                            <span class="stat-label">${ui.stat_temp}</span>
                            <span class="stat-value">${obj.estatisticas.temperatura.split('/')[0]}</span>
                        </div>
                    ` : ''}
                </div>

                ${randomFact ? `<p class="card-fact">${randomFact.replace(/^[^\s]+\s/, '')}</p>` : ''}
            </div>
        `;

        // Broken-image fallback via addEventListener: the previous inline
        // onerror="" attribute is blocked by the production CSP (script-src
        // 'self', no 'unsafe-inline'), so it silently never ran on the live
        // site — and could not be reproduced in dev, where no CSP is served.
        const cardImg = card.querySelector('.card-image img');
        if (cardImg) {
            cardImg.addEventListener('error', () => {
                const span = document.createElement('span');
                span.className = 'emoji-placeholder';
                span.textContent = obj.emoji;
                cardImg.replaceWith(span);
            }, { once: true });
        }

        grid.appendChild(card);
    }

    // Aplicar filtros atuais
    filterCards();
}

// Abrir modal com detalhes
function openModal(objectId) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const obj = BIBLIOTECA_DATA[currentLang].objects[objectId];
    const ui = BIBLIOTECA_DATA[currentLang].ui;

    if (!obj) return;

    // Prepare gallery data for lightbox navigation (module-scoped)
    if (obj.galeria?.length) {
        modalGalleryData = obj.galeria.map(item => normalizeGalleryItem(item, obj.name, currentLang));
    } else {
        modalGalleryData = [];
    }

    modalBody.innerHTML = `
        <div class="modal-header ${obj.imagem ? 'clickable' : ''}" ${obj.imagem ? `data-action="open-lightbox" data-src="${obj.imagem}" data-caption="${escapeAttr(obj.name + ' - ' + ui.nasa_photo)}"` : ''}>
            ${obj.imagem ?
            `<img src="${obj.imagem}" alt="${obj.name}">
             <div class="modal-header-zoom">${ui.zoom_hint}</div>` :
            `<div style="background: linear-gradient(135deg, #1a1a3a, #0a0a20); display: flex; align-items: center; justify-content: center; height: 100%;"><span style="font-size: 8rem;">${obj.emoji}</span></div>`
        }
            <div class="modal-header-gradient"></div>
            <div class="modal-header-content">
                <h1 class="modal-title">${obj.emoji} ${obj.name}</h1>
                <p class="modal-type">${obj.type}</p>
            </div>
        </div>

        <div class="modal-body-content">
            <!-- Estatísticas -->
            ${obj.estatisticas ? `
                <h2 class="section-title">${ui.section_stats}</h2>
                <div class="info-grid">
                    ${Object.entries(obj.estatisticas).map(([key, value]) => `
                        <div class="info-card">
                            <div class="icon">${getStatIcon(key)}</div>
                            <div class="label">${formatStatLabel(key, ui)}</div>
                            <div class="value">${value}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Descrição -->
            <h2 class="section-title">📖 ${obj.name}</h2>
            <p class="description-text">${obj.descricaoLonga?.replace(/\n\n/g, '</p><p class="description-text">') || ''}</p>

            <!-- História -->
            ${obj.historia ? `
                <h2 class="section-title">${ui.section_history}</h2>
                <p class="description-text">${obj.historia.replace(/\n\n/g, '</p><p class="description-text">')}</p>
            ` : ''}

            <!-- Curiosidades -->
            ${obj.trivia?.length ? `
                <h2 class="section-title">${ui.section_curiosities}</h2>
                <ul class="facts-list">
                    ${obj.trivia.map(c => `<li>${c}</li>`).join('')}
                </ul>
            ` : ''}

            <!-- Factos Uau -->
            ${obj.wowFacts?.length ? `
                <h2 class="section-title">${ui.section_wow_facts}</h2>
                <div class="wow-facts-grid">
                    ${obj.wowFacts.map(f => `<div class="wow-fact">${f}</div>`).join('')}
                </div>
            ` : ''}

            <!-- Luas -->
            ${obj.luas?.length ? `
                <h2 class="section-title">${ui.section_moons}</h2>
                <div class="moons-grid">
                    ${obj.luas.map(moon => `
                        <div class="moon-chip" data-action="open-modal" data-object-id="${moon}">
                            <div class="moon-name">🌙 ${BIBLIOTECA_DATA[currentLang].objects[moon]?.name || moon}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Galeria -->
            ${modalGalleryData.length ? `
                <h2 class="section-title">${ui.section_gallery}</h2>
                <div class="gallery-grid">
                    ${modalGalleryData.map((item, index) => `
                        <div class="gallery-item" data-action="open-gallery" data-gallery-index="${index}" data-src="${item.src}" data-caption="${escapeAttr(item.caption)}" tabindex="0" role="button" aria-label="${escapeAttr(ui.view_image + ' ' + item.caption)}">
                            <img src="${item.src}" alt="${escapeAttr(item.caption)}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Comparação -->
            ${obj.comparison ? `
                <h2 class="section-title">${ui.section_comparison}</h2>
                <div class="comparison-box">${obj.comparison}</div>
            ` : ''}
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Dialog semantics + focus management: keyboard users opening a card via
    // Enter/Space used to be left focused on the hidden grid behind the modal.
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    _modalOpener = document.activeElement;
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        // Deferred: the modal is mid visibility-transition this frame and
        // focusing an element whose computed visibility is still hidden
        // silently fails (focus would stay on the card grid behind).
        setTimeout(() => closeBtn.focus(), 60);
    }
}

// Element focused before the modal opened (restored on close)
let _modalOpener = null;

// Escape a string for safe use in HTML attributes
function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Fechar modal
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
    document.body.style.overflow = '';
    if (_modalOpener instanceof HTMLElement && document.contains(_modalOpener)) {
        _modalOpener.focus();
    }
    _modalOpener = null;
}

// Fechar modal com Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeModal();
    }
});

// Fechar modal clicando fora
document.getElementById('detailModal')?.addEventListener('click', (e) => {
    if (/** @type {Element} */ (e.target).classList.contains('modal')) closeModal();
});

// Ícones para estatísticas
function getStatIcon(key) {
    const icons = {
        raio: '📏',
        distancia: '🚀',
        dia: '🌅',
        ano: '📅',
        temperatura: '🌡️',
        luas: '🌙',
        idade: '⏳',
        type: '⭐',
        composicao: '🧪',
        velocidade: '🏎️',
        lancamento: '🚀',
        tamanho: '📐'
    };
    return icons[key] || '📊';
}

// Formatar label de estatística (shared map: see STAT_LABEL_KEYS)
function formatStatLabel(key, ui) {
    return ui[STAT_LABEL_KEYS[key]] || key;
}

// ========== LIGHTBOX ==========
let lightboxElement = null;
let currentGallery = [];
let currentImageIndex = 0;

function createLightbox() {
    if (lightboxElement) return;

    lightboxElement = document.createElement('div');
    lightboxElement.id = 'imageLightbox';
    lightboxElement.className = 'lightbox hidden';
    const ui = BIBLIOTECA_DATA[currentLang].ui;
    lightboxElement.innerHTML = `
        <div class="lightbox-overlay" data-action="close-lightbox"></div>
        <div class="lightbox-content" role="dialog" aria-modal="true">
            <button class="lightbox-close" data-action="close-lightbox" aria-label="${ui.lightbox_close}">✕</button>
            <button class="lightbox-nav lightbox-prev" data-action="lightbox-prev" aria-label="${ui.lightbox_prev}">❮</button>
            <img class="lightbox-image" src="" alt="">
            <button class="lightbox-nav lightbox-next" data-action="lightbox-next" aria-label="${ui.lightbox_next}">❯</button>
            <div class="lightbox-footer">
                <p class="lightbox-caption"></p>
                <p class="lightbox-counter"></p>
            </div>
        </div>
    `;

    // Event delegation for lightbox actions
    lightboxElement.addEventListener('click', (e) => {
        const actionEl = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target).closest('[data-action]'));
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        if (action === 'close-lightbox') {
            closeLightbox();
        } else if (action === 'lightbox-prev') {
            navigateLightbox(-1);
        } else if (action === 'lightbox-next') {
            navigateLightbox(1);
        }
    });

    document.body.appendChild(lightboxElement);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightboxElement?.classList.contains('hidden')) return;
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(imageSrc, caption, gallery = null, index = 0) {
    if (!lightboxElement) createLightbox();

    // Store gallery for navigation
    if (gallery && gallery.length > 0) {
        currentGallery = gallery;
        currentImageIndex = index;
    } else {
        currentGallery = [{ src: imageSrc, caption }];
        currentImageIndex = 0;
    }

    updateLightboxImage();
    lightboxElement.classList.remove('hidden');
}

function updateLightboxImage() {
    const img = lightboxElement.querySelector('.lightbox-image');
    const cap = lightboxElement.querySelector('.lightbox-caption');
    const counter = lightboxElement.querySelector('.lightbox-counter');
    const prevBtn = lightboxElement.querySelector('.lightbox-prev');
    const nextBtn = lightboxElement.querySelector('.lightbox-next');

    const current = currentGallery[currentImageIndex];
    img.src = current.src || current.url;
    cap.textContent = current.caption || '';

    // Show/hide navigation
    const showNav = currentGallery.length > 1;
    prevBtn.style.display = showNav ? 'flex' : 'none';
    nextBtn.style.display = showNav ? 'flex' : 'none';
    counter.textContent = showNav ? `${currentImageIndex + 1} / ${currentGallery.length}` : '';
}

function navigateLightbox(direction) {
    if (currentGallery.length <= 1) return;

    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentGallery.length - 1;
    if (currentImageIndex >= currentGallery.length) currentImageIndex = 0;

    updateLightboxImage();
}

function closeLightbox() {
    if (lightboxElement) {
        lightboxElement.classList.add('hidden');
    }
}
