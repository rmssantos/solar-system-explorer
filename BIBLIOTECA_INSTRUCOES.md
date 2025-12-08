# 📚 Instruções para Criar a Biblioteca do Sistema Solar

## Contexto do Projeto

Jogo educativo 3D do Sistema Solar para uma criança de 8 anos (Gonçalo).

**Tecnologias:**
- Three.js para renderização 3D
- Vite como bundler
- Vanilla JavaScript (ES6 modules)
- Suporte bilingue PT/EN

---

## ✅ Ficheiros Já Criados

### 1. `biblioteca.html`
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biblioteca do Sistema Solar</title>
    <link rel="stylesheet" href="styles/biblioteca.css">
</head>
<body>
    <div class="stars"></div>
    
    <div class="container">
        <!-- Language Switcher -->
        <div class="language-switcher">
            <button class="lang-btn active" onclick="setLanguage('pt')">🇵🇹 Português</button>
            <button class="lang-btn" onclick="setLanguage('en')">🇬🇧 English</button>
        </div>

        <a href="index.html" class="back-link" data-i18n="back_to_solar">← Voltar ao Sistema Solar</a>
        
        <header>
            <h1 data-i18n="library_title">📚 Biblioteca do Sistema Solar</h1>
            <p class="subtitle" data-i18n="library_subtitle">Explora tudo sobre o nosso vizinhança cósmica!</p>
        </header>

        <!-- Search Bar -->
        <div class="search-container">
            <input type="text" id="searchInput" class="search-input" placeholder="Procurar planetas, luas, sondas..." oninput="filterContent()">
            <span class="search-icon">🔍</span>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
            <button class="cat-tab active" onclick="showCategory('all')">🌌 Todos</button>
            <button class="cat-tab" onclick="showCategory('star')">☀️ Estrela</button>
            <button class="cat-tab" onclick="showCategory('planets')">🪐 Planetas</button>
            <button class="cat-tab" onclick="showCategory('moons')">🌙 Luas</button>
            <button class="cat-tab" onclick="showCategory('dwarfs')">🔴 Anões</button>
            <button class="cat-tab" onclick="showCategory('probes')">🛰️ Sondas</button>
        </div>

        <!-- Content Grid -->
        <div id="contentGrid" class="content-grid">
            <!-- Content will be dynamically generated -->
        </div>

        <!-- Detail Modal -->
        <div id="detailModal" class="modal hidden">
            <div class="modal-content">
                <button class="modal-close" onclick="closeModal()">✕</button>
                <div id="modalBody"></div>
            </div>
        </div>
    </div>

    <script src="src/data/bibliotecaData.js" type="module"></script>
    <script src="src/biblioteca.js" type="module"></script>
</body>
</html>
```

### 2. `styles/biblioteca.css`
CSS completo com:
- Layout responsivo com grid
- Cards para cada objeto
- Modal para detalhes
- Animações suaves
- Tema espacial escuro com estrelas
- Suporte mobile

---

## ❌ Ficheiros Por Criar

### 1. `src/data/bibliotecaData.js`

Estrutura necessária:

```javascript
// Imagens reais disponíveis
const REAL_PHOTOS = {
    sun: '/textures/real/sun_real.jpg',
    mercury: '/textures/real/mercury_real.jpg',
    venus: '/textures/real/venus_real.jpg',
    earth: '/textures/real/earth_real.jpg',
    mars: '/textures/real/mars_real.jpg',
    jupiter: '/textures/real/jupiter_real.jpg',
    saturn: '/textures/real/saturn_real.jpg',
    uranus: '/textures/real/uranus_real.jpg',
    neptune: '/textures/real/neptune_real.jpg',
    pluto: '/textures/real/pluto_real.jpg',
    moon: '/textures/real/moon_real.jpg',
    io: '/textures/real/io_real.jpg',
    europa: '/textures/real/europa_real.jpg',
    ganymede: '/textures/real/ganymede_real.jpg',
    callisto: '/textures/real/callisto_real.jpg',
    titan: '/textures/real/titan_real.jpg',
    enceladus: '/textures/real/enceladus_real.jpg',
    triton: '/textures/real/triton_real.jpg',
    ceres: '/textures/real/ceres_real.jpg',
    eris: '/textures/real/eris_real.jpg',
    makemake: '/textures/real/makemake_real.jpg',
    haumea: '/textures/real/haumea_real.jpg',
    charon: '/textures/real/charon_real.jpg',
    iss: '/textures/real/iss_real.jpg',
    hubble: '/textures/real/hubble_real.jpg',
    voyager: '/textures/real/voyager_real.jpg',
    pioneer: '/textures/real/pioneer_real.jpg',
    cassini: '/textures/real/cassini_real.jpg',
    juno: '/textures/real/juno_real.jpg',
    newhorizons: '/textures/real/newhorizons_real.jpg'
};

export const BIBLIOTECA_DATA = {
    // ===== PORTUGUÊS =====
    pt: {
        // Strings da interface
        ui: {
            back_to_solar: "← Voltar ao Sistema Solar",
            library_title: "📚 Biblioteca do Sistema Solar",
            library_subtitle: "Explora tudo sobre a nossa vizinhança cósmica!",
            search_placeholder: "Procurar planetas, luas, sondas...",
            cat_all: "🌌 Todos",
            cat_star: "☀️ Estrela",
            cat_planets: "🪐 Planetas",
            cat_moons: "🌙 Luas",
            cat_dwarfs: "🔴 Anões",
            cat_probes: "🛰️ Sondas",
            section_stats: "📊 Estatísticas",
            section_curiosities: "🔍 Curiosidades",
            section_wow_facts: "🤯 Factos Uau!",
            section_moons: "🌙 Luas",
            section_history: "📜 História",
            section_comparison: "🌍 Comparação",
            stat_radius: "Raio",
            stat_distance: "Distância ao Sol",
            stat_day: "Duração do Dia",
            stat_year: "Duração do Ano",
            stat_temp: "Temperatura",
            stat_moons: "Luas Conhecidas"
        },
        
        // Dados de cada objeto
        objects: {
            "Sol": {
                id: "sol",
                nome: "Sol",
                tipo: "Estrela",
                categoria: "star",
                emoji: "☀️",
                imagem: REAL_PHOTOS.sun,
                
                // Descrição longa e educativa
                descricaoLonga: `O Sol é a nossa estrela! É uma bola GIGANTE de gás super quente que está sempre a "queimar" (na verdade, faz fusão nuclear). Sem o Sol, não haveria vida na Terra - ele dá-nos luz, calor e energia!

O Sol é TÃO grande que caberiam mais de 1 MILHÃO de Terras lá dentro! E está a 150 milhões de quilómetros de nós - tão longe que a luz demora 8 minutos a chegar cá!`,

                // História da descoberta/conhecimento
                historia: `Os humanos sempre adoraram o Sol! Civilizações antigas como os Egípcios adoravam-no como um deus chamado Rá. Os Gregos chamavam-lhe Hélios e imaginavam que ele atravessava o céu numa carruagem de fogo.

Só no século XVII é que Galileu descobriu que o Sol tinha manchas escuras (manchas solares). E só no século XX é que percebemos que o Sol funciona através de fusão nuclear!`,

                // Estatísticas
                estatisticas: {
                    raio: "696.340 km",
                    temperatura: "5.500°C (superfície) / 15 milhões °C (centro)",
                    idade: "4,6 mil milhões de anos",
                    tipo: "Estrela Anã Amarela (G2V)",
                    composicao: "73% Hidrogénio, 25% Hélio"
                },

                // Curiosidades gerais
                curiosidades: [
                    "O Sol contém 99,86% de toda a massa do Sistema Solar!",
                    "A cada segundo, o Sol converte 600 milhões de toneladas de hidrogénio em hélio.",
                    "O Sol gira sobre si mesmo - demora 25 dias no equador e 35 dias nos polos!",
                    "A luz do Sol que vês agora demorou 8 minutos e 20 segundos a chegar até ti."
                ],

                // Factos Uau! (mais entusiasmantes, com emojis)
                factosUau: [
                    "🔥 O Sol é tão QUENTE que se pudesses ir lá, evaporavas a milhões de km de distância!",
                    "💪 A gravidade do Sol é 28x mais forte que a da Terra - pesarias 2 TONELADAS lá!",
                    "⚡ A energia que o Sol produz num SEGUNDO bastaria para a humanidade durante 500.000 anos!",
                    "🌈 O Sol parece amarelo, mas no espaço é BRANCO! A atmosfera da Terra muda a cor.",
                    "💥 O Sol tem EXPLOSÕES gigantes chamadas erupções solares - algumas são maiores que a Terra!"
                ],

                // Comparação divertida
                comparacao: "Se o Sol fosse uma bola de futebol, a Terra seria do tamanho de uma cabeça de alfinete a 25 metros de distância!"
            },

            "Terra": {
                id: "terra",
                nome: "Terra",
                tipo: "Planeta Rochoso",
                categoria: "planets",
                emoji: "🌍",
                imagem: REAL_PHOTOS.earth,
                
                descricaoLonga: `A Terra é o nosso lar - o único planeta onde sabemos que existe vida! É o terceiro planeta a contar do Sol e tem tudo o que precisamos: ar para respirar, água para beber e uma temperatura perfeita.

A Terra é especial porque tem uma atmosfera que nos protege dos raios perigosos do Sol e de meteoritos. Também tem um campo magnético que funciona como um escudo invisível!`,

                historia: `Durante muito tempo, as pessoas pensavam que a Terra era plana e que estava no centro do Universo! Só há cerca de 500 anos é que percebemos que a Terra gira à volta do Sol.

Em 1961, o cosmonauta russo Yuri Gagarin foi o primeiro humano a ver a Terra do espaço. Ele disse: "A Terra é azul... que maravilha!"`,

                estatisticas: {
                    raio: "6.371 km",
                    distancia: "150 milhões km do Sol",
                    dia: "24 horas",
                    ano: "365,25 dias",
                    temperatura: "-88°C a 58°C",
                    luas: "1 (a nossa Lua!)"
                },

                curiosidades: [
                    "A Terra não é perfeitamente redonda - é ligeiramente achatada nos polos!",
                    "70% da superfície da Terra é coberta por água.",
                    "A Terra gira a 1.670 km/h no equador - estás a voar sem saber!",
                    "O ponto mais profundo do oceano (Fossa das Marianas) tem 11 km de profundidade."
                ],

                factosUau: [
                    "🌊 Se toda a água da Terra coubesse numa garrafa de 1 litro, só UMA GOTA seria água doce disponível!",
                    "⚡ Há cerca de 2.000 TROVOADAS a acontecer na Terra neste preciso momento!",
                    "🦕 A Terra já teve 5 extinções em massa - os dinossauros morreram na última há 66 milhões de anos!",
                    "🧲 O campo magnético da Terra está lentamente a INVERTER - o norte vai virar sul!",
                    "🌍 A Terra é o único planeta que não tem nome de um deus grego ou romano!"
                ],

                comparacao: "Se a Terra fosse do tamanho de uma bola de basquete, a Lua seria do tamanho de uma bola de ténis a 7 metros de distância!",

                luas: ["Lua"]
            },

            // ... CONTINUAR COM TODOS OS OUTROS OBJETOS ...
        }
    },

    // ===== ENGLISH =====
    en: {
        ui: {
            back_to_solar: "← Back to Solar System",
            library_title: "📚 Solar System Library",
            library_subtitle: "Explore everything about our cosmic neighborhood!",
            search_placeholder: "Search planets, moons, probes...",
            cat_all: "🌌 All",
            cat_star: "☀️ Star",
            cat_planets: "🪐 Planets",
            cat_moons: "🌙 Moons",
            cat_dwarfs: "🔴 Dwarfs",
            cat_probes: "🛰️ Probes",
            section_stats: "📊 Statistics",
            section_curiosities: "🔍 Curiosities",
            section_wow_facts: "🤯 Wow Facts!",
            section_moons: "🌙 Moons",
            section_history: "📜 History",
            section_comparison: "🌍 Comparison",
            stat_radius: "Radius",
            stat_distance: "Distance to Sun",
            stat_day: "Day Length",
            stat_year: "Year Length",
            stat_temp: "Temperature",
            stat_moons: "Known Moons"
        },
        
        objects: {
            "Sol": {
                id: "sol",
                nome: "Sun",
                tipo: "Star",
                categoria: "star",
                emoji: "☀️",
                imagem: REAL_PHOTOS.sun,
                
                descricaoLonga: `The Sun is our star! It's a GIANT ball of super hot gas that's always "burning" (actually, it does nuclear fusion). Without the Sun, there would be no life on Earth - it gives us light, warmth and energy!

The Sun is SO big that more than 1 MILLION Earths could fit inside! And it's 150 million kilometers away from us - so far that light takes 8 minutes to reach us!`,

                historia: `Humans have always loved the Sun! Ancient civilizations like the Egyptians worshipped it as a god called Ra. The Greeks called it Helios and imagined it crossing the sky in a chariot of fire.

Only in the 17th century did Galileo discover that the Sun had dark spots (sunspots). And only in the 20th century did we understand that the Sun works through nuclear fusion!`,

                estatisticas: {
                    raio: "696,340 km",
                    temperatura: "5,500°C (surface) / 15 million °C (core)",
                    idade: "4.6 billion years",
                    tipo: "Yellow Dwarf Star (G2V)",
                    composicao: "73% Hydrogen, 25% Helium"
                },

                curiosidades: [
                    "The Sun contains 99.86% of all the mass in the Solar System!",
                    "Every second, the Sun converts 600 million tons of hydrogen into helium.",
                    "The Sun rotates on itself - it takes 25 days at the equator and 35 days at the poles!",
                    "The sunlight you see now took 8 minutes and 20 seconds to reach you."
                ],

                factosUau: [
                    "🔥 The Sun is so HOT that if you could go there, you'd evaporate millions of km away!",
                    "💪 The Sun's gravity is 28x stronger than Earth's - you'd weigh 2 TONS there!",
                    "⚡ The energy the Sun produces in ONE SECOND would be enough for humanity for 500,000 years!",
                    "🌈 The Sun looks yellow, but in space it's WHITE! Earth's atmosphere changes the color.",
                    "💥 The Sun has GIANT explosions called solar flares - some are bigger than Earth!"
                ],

                comparacao: "If the Sun were a soccer ball, Earth would be the size of a pinhead 25 meters away!"
            },

            // ... CONTINUE WITH ALL OTHER OBJECTS IN ENGLISH ...
        }
    }
};

export default BIBLIOTECA_DATA;
```

---

### 2. `src/biblioteca.js`

```javascript
import { BIBLIOTECA_DATA } from './data/bibliotecaData.js';

// Estado da aplicação
let currentLang = 'pt';
let currentCategory = 'all';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderContent();
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
    
    // Atualizar botões
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(lang === 'pt' ? '🇵🇹' : '🇬🇧'));
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
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
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
        
        card.innerHTML = `
            <div class="card-image">
                ${obj.imagem ? 
                    `<img src="${obj.imagem}" alt="${obj.nome}" onerror="this.parentElement.innerHTML='<span class=\\'emoji-placeholder\\'>${obj.emoji}</span>'">` : 
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
        <div class="modal-header">
            ${obj.imagem ? 
                `<img src="${obj.imagem}" alt="${obj.nome}">` : 
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
                            <div class="moon-name">🌙 ${moon}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
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
    if (e.key === 'Escape') closeModal();
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
        composicao: '🧪'
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
        idade: 'Idade',
        tipo: 'Tipo',
        composicao: 'Composição'
    };
    return labels[key] || key;
}
```

---

## 📋 Lista de Objetos a Incluir

### Estrela (1)
- Sol

### Planetas (8)
- Mercúrio
- Vénus
- Terra
- Marte
- Júpiter
- Saturno
- Úrano
- Neptuno

### Planetas Anões (5)
- Plutão
- Ceres
- Éris
- Makemake
- Haumea

### Luas (18+)
- Lua (Terra)
- Fobos, Deimos (Marte)
- Io, Europa, Ganimedes, Calisto (Júpiter)
- Mimas, Encélado, Tétis, Dione, Reia, Titã (Saturno)
- Miranda, Ariel, Titânia (Úrano)
- Tritão (Neptuno)
- Caronte (Plutão)
- Disnomia (Éris)

### Sondas/Estações (8)
- Voyager 1
- Voyager 2
- Pioneer 10
- New Horizons
- Juno
- Cassini
- ISS (Estação Espacial Internacional)
- Hubble (Telescópio Espacial)

---

## ✍️ Estilo de Escrita

### ❌ Evitar (muito técnico):
> "Júpiter tem uma massa de 1.898 × 10²⁷ kg e uma densidade média de 1,326 g/cm³."

### ✅ Preferir (divertido para crianças):
> "🏋️ Júpiter é TÃO pesado que pesa mais do que TODOS os outros planetas juntos! Se pusesses todos os planetas numa balança, Júpiter ainda seria mais pesado!"

### Regras:
1. Usar emojis nos factos Uau!
2. Comparações com coisas do dia-a-dia
3. Tom entusiasmado e de descoberta
4. Números simplificados quando possível
5. Evitar termos muito técnicos
6. Incluir perguntas retóricas ("Sabias que...?")

---

## 🖼️ Imagens Disponíveis

Todas em `public/textures/real/`:

```
sun_real.jpg
mercury_real.jpg
venus_real.jpg
earth_real.jpg
mars_real.jpg
jupiter_real.jpg
saturn_real.jpg
uranus_real.jpg
neptune_real.jpg
pluto_real.jpg
moon_real.jpg
io_real.jpg
europa_real.jpg
ganymede_real.jpg
callisto_real.jpg
titan_real.jpg
enceladus_real.jpg
triton_real.jpg
ceres_real.jpg
eris_real.jpg
makemake_real.jpg
haumea_real.jpg
charon_real.jpg
iss_real.jpg
hubble_real.jpg
voyager_real.jpg
pioneer_real.jpg
cassini_real.jpg
juno_real.jpg
newhorizons_real.jpg
```

---

## 📝 Tarefa

Criar os dois ficheiros completos:

1. **`src/data/bibliotecaData.js`** - Com TODOS os objetos listados acima, em PT e EN
2. **`src/biblioteca.js`** - Já está quase completo acima, só precisa de ajustes finais

Cada objeto deve ter:
- `id`, `nome`, `tipo`, `categoria`, `emoji`, `imagem`
- `descricaoLonga` (2-3 parágrafos educativos)
- `historia` (descoberta e factos históricos)
- `estatisticas` (raio, temperatura, distância, etc.)
- `curiosidades` (4-5 factos interessantes)
- `factosUau` (4-5 factos com emojis, muito entusiasmantes)
- `comparacao` (comparação divertida)
- `luas` (array, só para planetas que têm luas)

**IMPORTANTE:** Tudo deve existir em versão PT e EN!
