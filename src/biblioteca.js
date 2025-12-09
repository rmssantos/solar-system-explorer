import { BIBLIOTECA_DATA } from './data/bibliotecaData.js';

// Estado da aplicação
let currentLang = 'pt';
try {
    currentLang = localStorage.getItem('spaceExplorer_lang') || 'pt';
} catch {
    // Private browsing or storage disabled
}
let currentCategory = 'all';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active lang button
    setLanguage(currentLang);
    // renderContent is called inside setLanguage
});

// Expor funções globalmente para os onclick do HTML
window.setLanguage = setLanguage;
window.filterContent = filterContent;
window.showCategory = showCategory;
window.openModal = openModal;
window.closeModal = closeModal;

// Trocar idioma
function setLanguage(lang) {
    currentLang = lang;
    try {
        localStorage.setItem('spaceExplorer_lang', lang); // Save preference
    } catch {
        // Private browsing or storage disabled
    }

    // Atualizar botões
    document.querySelectorAll('.lang-btn').forEach(btn => {
        // Simple check: if btn text contains flag of lang
        const isPt = lang === 'pt' && btn.textContent.includes('🇵🇹');
        const isEn = lang === 'en' && btn.textContent.includes('🇬🇧');

        // Simpler approach: check the onclick attribute or just toggle classes manually
        // The original HTML uses onclick="setLanguage('pt')"
        if (btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
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
            el.placeholder = ui[key];
        }
    });
}

// Filtrar por categoria
function showCategory(category) {
    currentCategory = category;

    // Atualizar tabs
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('onclick').includes(`'${category}'`));
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
    const searchInput = document.getElementById('searchInput');
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
            obj.nome.toLowerCase().includes(searchTerm) ||
            obj.tipo.toLowerCase().includes(searchTerm) ||
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
        card.onclick = () => openModal(key);

        // Escolher um facto aleatório para mostrar no card
        const randomFact = obj.factosUau ?
            obj.factosUau[Math.floor(Math.random() * obj.factosUau.length)] : '';

        // Accessibility attributes
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${obj.nome} - ${obj.tipo}. ${ui.click_to_learn || 'Clica para saber mais'}`);

        card.innerHTML = `
            <div class="card-image">
                ${obj.imagem ?
                `<img src="${obj.imagem}" alt="${obj.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'emoji-placeholder\\'>${obj.emoji}</span>'">` :
                `<span class="emoji-placeholder">${obj.emoji}</span>`
            }
                <span class="card-type-badge">${obj.tipo}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${obj.emoji} ${obj.nome}</h3>
                <p class="card-subtitle">${obj.tipo}</p>

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

        // Keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(key);
            }
        });

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

    modalBody.innerHTML = `
        <div class="modal-header ${obj.imagem ? 'clickable' : ''}" ${obj.imagem ? `onclick="openLightbox('${obj.imagem}', '${obj.nome} - Foto real da NASA')"` : ''}>
            ${obj.imagem ?
            `<img src="${obj.imagem}" alt="${obj.nome}">
             <div class="modal-header-zoom">🔍 Clica para ampliar</div>` :
            `<div style="background: linear-gradient(135deg, #1a1a3a, #0a0a20); display: flex; align-items: center; justify-content: center; height: 100%;"><span style="font-size: 8rem;">${obj.emoji}</span></div>`
        }
            <div class="modal-header-gradient"></div>
            <div class="modal-header-content">
                <h1 class="modal-title">${obj.emoji} ${obj.nome}</h1>
                <p class="modal-type">${obj.tipo}</p>
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
            <h2 class="section-title">📖 ${obj.nome}</h2>
            <p class="description-text">${obj.descricaoLonga?.replace(/\n\n/g, '</p><p class="description-text">') || ''}</p>
            
            <!-- História -->
            ${obj.historia ? `
                <h2 class="section-title">${ui.section_history}</h2>
                <p class="description-text">${obj.historia.replace(/\n\n/g, '</p><p class="description-text">')}</p>
            ` : ''}
            
            <!-- Curiosidades -->
            ${obj.curiosidades?.length ? `
                <h2 class="section-title">${ui.section_curiosities}</h2>
                <ul class="facts-list">
                    ${obj.curiosidades.map(c => `<li>${c}</li>`).join('')}
                </ul>
            ` : ''}
            
            <!-- Factos Uau -->
            ${obj.factosUau?.length ? `
                <h2 class="section-title">${ui.section_wow_facts}</h2>
                <div class="wow-facts-grid">
                    ${obj.factosUau.map(f => `<div class="wow-fact">${f}</div>`).join('')}
                </div>
            ` : ''}
            
            <!-- Luas -->
            ${obj.luas?.length ? `
                <h2 class="section-title">${ui.section_moons}</h2>
                <div class="moons-grid">
                    ${obj.luas.map(moon => `
                        <div class="moon-chip" onclick="openModal('${moon}')">
                            <div class="moon-name">🌙 ${BIBLIOTECA_DATA[currentLang].objects[moon]?.nome || moon}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Galeria -->
            ${obj.galeria?.length ? (() => {
                // Prepare gallery data for lightbox navigation
                const galleryData = obj.galeria.map(item => {
                    const imgUrl = typeof item === 'string' ? item : (item.url || item.src);
                    const caption = typeof item === 'string' ? obj.nome : (currentLang === 'en' ? (item.captionEN || item.caption) : item.caption);
                    return { src: imgUrl, caption };
                });
                window._currentGallery = galleryData;

                return `
                <h2 class="section-title">${ui.section_gallery}</h2>
                <div class="gallery-grid">
                    ${galleryData.map((item, index) => `
                        <div class="gallery-item" onclick="openLightbox('${item.src}', '${item.caption.replace(/'/g, "\\'")}', window._currentGallery, ${index})" tabindex="0" role="button" aria-label="Ver ${item.caption}">
                            <img src="${item.src}" alt="${item.caption}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;})() : ''}

            <!-- Comparação -->
            ${obj.comparacao ? `
                <h2 class="section-title">${ui.section_comparison}</h2>
                <div class="comparison-box">${obj.comparacao}</div>
            ` : ''}
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
    document.body.style.overflow = '';
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
    if (e.target.classList.contains('modal')) closeModal();
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
        tipo: '⭐',
        composicao: '🧪',
        velocidade: '🏎️',
        lancamento: '🚀',
        tamanho: '📐'
    };
    return icons[key] || '📊';
}

// Formatar label de estatística
function formatStatLabel(key, ui) {
    const labels = {
        raio: ui.stat_radius,
        distancia: ui.stat_distance,
        dia: ui.stat_day,
        ano: ui.stat_year,
        temperatura: ui.stat_temp,
        luas: ui.stat_moons,
        idade: ui.stat_age,
        tipo: ui.stat_type,
        composicao: ui.stat_composition,
        velocidade: ui.stat_speed,
        lancamento: ui.stat_launch,
        tamanho: ui.stat_size
    };
    return labels[key] || key;
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
    lightboxElement.innerHTML = `
        <div class="lightbox-overlay" onclick="closeLightbox()"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()" aria-label="Fechar">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)" aria-label="Anterior">❮</button>
            <img class="lightbox-image" src="" alt="">
            <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)" aria-label="Seguinte">❯</button>
            <div class="lightbox-footer">
                <p class="lightbox-caption"></p>
                <p class="lightbox-counter"></p>
            </div>
        </div>
    `;
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

// Expose lightbox functions globally
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;
