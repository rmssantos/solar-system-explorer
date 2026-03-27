/**
 * Biblioteca In-App Panel
 * Full-screen overlay for browsing the Solar System library
 * without leaving the 3D scene.
 */
import { BIBLIOTECA_DATA } from './data/bibliotecaData.js';
import { i18n } from './i18n.js';

export class BibliotecaPanel {
    constructor() {
        this.overlay = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.detailObject = null;
    }

    open() {
        if (this.overlay) return;
        this.detailObject = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.createOverlay();
    }

    close() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    /** Return the current language data from BIBLIOTECA_DATA. */
    getData() {
        const lang = i18n.lang || 'pt';
        return BIBLIOTECA_DATA[lang] || BIBLIOTECA_DATA.pt;
    }

    createOverlay() {
        const data = this.getData();

        this.overlay = document.createElement('div');
        this.overlay.className = 'biblioteca-overlay';

        // Header
        const header = document.createElement('div');
        header.className = 'biblioteca-header';

        const title = document.createElement('h2');
        title.textContent = data.ui.library_title;
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'biblioteca-close-btn';
        closeBtn.textContent = i18n.t('biblioteca_close');
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);

        this.overlay.appendChild(header);

        // Controls (search + tabs)
        const controls = document.createElement('div');
        controls.className = 'biblioteca-controls';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'biblioteca-search';
        searchInput.placeholder = i18n.t('biblioteca_search');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderBody();
        });
        controls.appendChild(searchInput);

        const tabs = document.createElement('div');
        tabs.className = 'biblioteca-tabs';

        const categories = [
            { key: 'all', label: data.ui.cat_all },
            { key: 'star', label: data.ui.cat_star },
            { key: 'planets', label: data.ui.cat_planets },
            { key: 'moons', label: data.ui.cat_moons },
            { key: 'dwarfs', label: data.ui.cat_dwarfs },
            { key: 'probes', label: data.ui.cat_probes }
        ];

        categories.forEach(cat => {
            const tab = document.createElement('button');
            tab.className = 'biblioteca-tab' + (cat.key === this.currentCategory ? ' active' : '');
            tab.textContent = cat.label;
            tab.addEventListener('click', () => {
                this.currentCategory = cat.key;
                // Update active state
                tabs.querySelectorAll('.biblioteca-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderBody();
            });
            tabs.appendChild(tab);
        });

        controls.appendChild(tabs);
        this.overlay.appendChild(controls);

        // Body (grid or detail)
        this.bodyContainer = document.createElement('div');
        this.bodyContainer.className = 'biblioteca-body';
        this.overlay.appendChild(this.bodyContainer);

        this.renderBody();

        document.body.appendChild(this.overlay);
    }

    renderBody() {
        if (!this.bodyContainer) return;
        this.bodyContainer.innerHTML = '';

        if (this.detailObject) {
            this.renderDetail();
        } else {
            this.renderGrid();
        }
    }

    getFilteredObjects() {
        const data = this.getData();
        const objects = data.objects;
        return Object.values(objects).filter(obj => {
            // Category filter
            if (this.currentCategory !== 'all' && obj.categoria !== this.currentCategory) {
                return false;
            }
            // Search filter
            if (this.searchQuery) {
                const name = (obj.nome || '').toLowerCase();
                const type = (obj.tipo || '').toLowerCase();
                return name.includes(this.searchQuery) || type.includes(this.searchQuery);
            }
            return true;
        });
    }

    renderGrid() {
        const filtered = this.getFilteredObjects();

        const grid = document.createElement('div');
        grid.className = 'biblioteca-grid';

        filtered.forEach(obj => {
            const card = document.createElement('div');
            card.className = 'biblioteca-card';
            card.addEventListener('click', () => {
                this.detailObject = obj;
                this.renderBody();
            });

            // Show photo if available, otherwise emoji
            if (obj.imagem) {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'biblioteca-card-img';
                const img = document.createElement('img');
                img.src = obj.imagem;
                img.alt = obj.nome;
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            } else {
                const emoji = document.createElement('div');
                emoji.className = 'biblioteca-card-emoji';
                emoji.textContent = obj.emoji || '';
                card.appendChild(emoji);
            }

            const name = document.createElement('div');
            name.className = 'biblioteca-card-name';
            name.textContent = obj.nome;
            card.appendChild(name);

            const type = document.createElement('div');
            type.className = 'biblioteca-card-type';
            type.textContent = obj.tipo || '';
            card.appendChild(type);

            // One random wow fact
            if (obj.factosUau && obj.factosUau.length > 0) {
                const randomFact = obj.factosUau[Math.floor(Math.random() * obj.factosUau.length)];
                const fact = document.createElement('div');
                fact.className = 'biblioteca-card-fact';
                fact.textContent = randomFact;
                card.appendChild(fact);
            }

            grid.appendChild(card);
        });

        this.bodyContainer.appendChild(grid);
    }

    renderDetail() {
        const obj = this.detailObject;
        const data = this.getData();
        const ui = data.ui;

        const detail = document.createElement('div');
        detail.className = 'biblioteca-detail';

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'biblioteca-detail-back';
        backBtn.textContent = i18n.t('biblioteca_detail_back');
        backBtn.addEventListener('click', () => {
            this.detailObject = null;
            this.renderBody();
        });
        detail.appendChild(backBtn);

        // Header with photo (or emoji fallback)
        const header = document.createElement('div');
        header.className = 'biblioteca-detail-header';
        if (obj.imagem) {
            const headerImg = document.createElement('img');
            headerImg.className = 'detail-header-img';
            headerImg.src = obj.imagem;
            headerImg.alt = obj.nome;
            header.appendChild(headerImg);
        }
        const headerText = document.createElement('div');
        headerText.className = 'detail-header-text';
        headerText.innerHTML = `
            <span class="detail-emoji">${obj.emoji || ''}</span>
            <h3>${obj.nome}</h3>
            <div class="detail-type">${obj.tipo || ''}</div>
        `;
        header.appendChild(headerText);
        detail.appendChild(header);

        // Description
        if (obj.descricaoLonga) {
            const section = this.createSection(ui.section_curiosities);
            const p = document.createElement('p');
            p.textContent = obj.descricaoLonga;
            section.appendChild(p);
            detail.appendChild(section);
        }

        // Statistics
        if (obj.estatisticas) {
            const section = this.createSection(ui.section_stats);
            const statMap = {
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
            Object.entries(obj.estatisticas).forEach(([key, value]) => {
                const row = document.createElement('div');
                row.className = 'biblioteca-stat-row';
                const label = document.createElement('span');
                label.className = 'biblioteca-stat-label';
                label.textContent = statMap[key] || key;
                const val = document.createElement('span');
                val.className = 'biblioteca-stat-value';
                val.textContent = value;
                row.appendChild(label);
                row.appendChild(val);
                section.appendChild(row);
            });
            detail.appendChild(section);
        }

        // Curiosities
        if (obj.curiosidades && obj.curiosidades.length > 0) {
            const section = this.createSection(ui.section_curiosities);
            const ul = document.createElement('ul');
            obj.curiosidades.forEach(c => {
                const li = document.createElement('li');
                li.textContent = c;
                ul.appendChild(li);
            });
            section.appendChild(ul);
            detail.appendChild(section);
        }

        // Wow Facts
        if (obj.factosUau && obj.factosUau.length > 0) {
            const section = this.createSection(ui.section_wow_facts);
            const ul = document.createElement('ul');
            obj.factosUau.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                ul.appendChild(li);
            });
            section.appendChild(ul);
            detail.appendChild(section);
        }

        // History
        if (obj.historia) {
            const section = this.createSection(ui.section_history);
            const p = document.createElement('p');
            p.textContent = obj.historia;
            section.appendChild(p);
            detail.appendChild(section);
        }

        // Comparison
        if (obj.comparacao) {
            const section = this.createSection(ui.section_comparison);
            const p = document.createElement('p');
            p.textContent = obj.comparacao;
            section.appendChild(p);
            detail.appendChild(section);
        }

        // Gallery (items can be strings or {url, caption} objects)
        if (obj.galeria && obj.galeria.length > 0) {
            const section = this.createSection(ui.section_gallery || '📸 Gallery');
            const gallery = document.createElement('div');
            gallery.className = 'biblioteca-detail-gallery';
            obj.galeria.forEach(item => {
                const imgUrl = typeof item === 'string' ? item : (item.url || item.src);
                const caption = typeof item === 'string' ? obj.nome : (i18n.lang === 'en' ? (item.captionEN || item.caption) : item.caption);
                const figure = document.createElement('figure');
                figure.className = 'biblioteca-gallery-item';
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = caption || obj.nome;
                img.loading = 'lazy';
                figure.appendChild(img);
                if (caption) {
                    const figcaption = document.createElement('figcaption');
                    figcaption.textContent = caption;
                    figure.appendChild(figcaption);
                }
                gallery.appendChild(figure);
            });
            section.appendChild(gallery);
            detail.appendChild(section);
        }

        this.bodyContainer.appendChild(detail);
    }

    createSection(title) {
        const section = document.createElement('div');
        section.className = 'biblioteca-detail-section';
        const h4 = document.createElement('h4');
        h4.textContent = title;
        section.appendChild(h4);
        return section;
    }
}
