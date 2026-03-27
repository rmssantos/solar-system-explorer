/**
 * Internationalization (i18n) System
 * Supports Portuguese (PT) and English (EN)
 */

export const TRANSLATIONS = {
    pt: {
        // Welcome Screen
        welcome_title: "Bem-vindo à Aventura Espacial!",
        welcome_subtitle: "Prepara-te para explorar o Sistema Solar",
        captain_name: "Nome do Capitão",
        captain_placeholder: "Ex: Comandante Gonçalo",
        ship_color: "🎨 Cor da tua nave",
        start_mission: "🚀 Iniciar Missão!",
        tip_arrows: "💡 Usa as setas ◀ ▶ para navegar",
        tip_click: "💡 Clica nos planetas para descobrir",

        // UI
        explore: "Explorar",
        recenter: "Recentrar Vista",
        passport_title: "Passaporte Espacial",
        toggle_passport: "Minimizar passaporte",
        expand_passport: "Expandir passaporte",
        discover_btn: "🚀 Descobrir!",
        close_btn: "Fechar",
        already_visited: "✅ Já visitado",
        previous: "Anterior",
        next: "Próximo",
        close: "Fechar",

        // Toolbar
        take_photo: "Tirar Foto Espacial",
        gallery: "Galeria de Fotos",
        compare_planets: "Comparar Planetas",
        compare: "Comparar",
        hide_menu: "Esconder Menu",
        show_menu: "Mostrar Menu",
        collectibles: "Colecionáveis",
        minimize: "Minimizar",
        expand: "Expandir",
        reduce: "Reduzir",
        restore: "Restaurar",
        download: "Descarregar",
        delete: "Apagar",
        map: "Mapa",
        minimap: "Mini-mapa",
        time_control: "Controlo Tempo",
        ui_settings: "Config. UI",
        photo_saved_flash: "Foto Guardada!",
        no_photos_yet: "Ainda não tiraste fotos!",
        explore_capture: "Explora o Sistema Solar e captura os momentos especiais.",
        space_gallery: "Galeria Espacial",
        captain: "Capitão",
        photos: "fotos",
        photo: "Foto",

        // Manual Navigation
        manual_nav: "Navegação Manual (M)",
        manual_nav_tooltip: "🎮 Modo Manual (mais realista)",
        manual_mode: "MODO MANUAL",
        speed_unit_approx: "km/s (aprox.)",
        speed: "Velocidade",
        forward: "Frente",
        backward: "Trás",
        left: "Esquerda",
        right: "Direita",
        up: "Subir",
        down: "Descer",
        boost: "Turbo",
        exit: "Sair",
        warp: "Warp",
        warp_speed: "Velocidade Warp",
        light_speed: "Velocidade da Luz",
        roll: "Rolar",
        brake: "Travão",
        nearby: "PRÓXIMOS",
        go_to: "Ir para",
        autopilot: "AUTO-PILOT",
        cancel: "Cancelar",
        // Short planet names for nav display
        short_sun: "☀️",
        short_mercury: "Mer",
        short_venus: "Vén",
        short_earth: "Ter",
        short_mars: "Mar",
        short_jupiter: "Júp",
        short_saturn: "Sat",
        short_uranus: "Ura",
        short_neptune: "Nep",

        // Collectibles
        collection: "A Minha Coleção",
        collected: "Encontrados",
        earned: "ganhos",
        found: "Encontraste",

        // Controls
        controls_title: "Controlos",
        drag_to_rotate: "Arrastar: Rodar vista",
        scroll_to_zoom: "Roda/Pinça: Zoom",
        click_to_see: "Clique: Ver info",
        library: "Biblioteca",

        // Info Panel
        slide_basic_data: "Dados Básicos",
        slide_real_photo: "Fotografia Real",
        slide_climate_time: "Clima e Tempo",
        slide_about: "Sobre",
        slide_distance: "Distância",
        info_type: "Tipo",
        info_distance: "Distância ao Sol",
        info_day: "Duração do Dia",
        info_year: "Duração do Ano",
        info_moons: "Luas Conhecidas",
        info_main_moons: "Luas Principais",
        info_temp: "Temperatura Média",
        info_curiosities: "Curiosidades",
        info_wow_facts: "🤯 Sabias Que...",

        // Celebration
        congrats_captain: "PARABÉNS CAPITÃO!",
        discovered_planet: "Descobriste o planeta",
        discovered_moon: "Descobriste a lua",
        discovered_dwarf: "Descobriste o planeta anão",
        discovered_probe: "Encontraste a sonda",
        discovered_star: "Visitaste a estrela",
        discovered_asteroid: "Descobriste o asteroide",
        discovered_generic: "Descobriste",
        mission_message: "MENSAGEM DE MISSÃO",

        // Missions
        mission: "MISSÃO",
        mission_reward: "Recompensa",
        see_hint: "💡 Ver dica",
        all_missions_complete: "Todas as Missões Completas!",
        true_explorer: "És um verdadeiro Explorador Espacial!",

        // Time Control
        timeControl: "Tempo",
        paused: "Pausado",
        very_slow: "Muito Lento",
        slow: "Lento",
        normal: "Normal",
        fast: "Rápido",
        very_fast: "Muito Rápido",
        max_speed: "Velocidade Máxima",

        // Photo Mode
        photo_saved: "Foto guardada na galeria!",
        no_photos: "Ainda não tiraste fotos. Começa a explorar!",
        delete_photo: "Apagar foto",
        download_photo: "Descarregar",

        // Planet Comparator
        compare_title: "Comparador de Planetas",
        select_planet: "Escolhe um planeta...",
        select_instruction: "Seleciona dois corpos celestes para comparar!",
        planet_1: "Planeta 1",
        planet_2: "Planeta 2",
        vs: "VS",
        radius: "Raio",
        mass: "Massa",
        distance_sun: "Distância ao Sol",
        day_duration: "Duração do Dia",
        year_duration: "Duração do Ano",
        compare_size: "📏 Tamanho (Raio)",
        compare_temp: "🌡️ Temperatura",
        compare_distance: "☀️ Distância ao Sol",
        compare_moons: "🌙 Número de Luas",
        compare_day: "⏱️ Duração do Dia",
        compare_year: "📅 Duração do Ano",
        closer_note: "Mais perto = barra maior",

        // XP System
        xp: "XP",
        level: "Nível",
        next_level: "Próximo nível",
        max_level: "🌟 Nível Máximo!",
        level_up: "SUBISTE DE NÍVEL!",
        continue: "Continuar",
        continue_adventure: "Continuar Aventura!",

        // Quiz
        quiz_badge: "QUIZ ESPACIAL",
        quiz_correct: "Correto! Excelente!",
        quiz_wrong: "Não foi desta vez...",

        // Achievements
        achievements: "Conquistas",
        achievement_unlocked: "Conquista Desbloqueada!",

        // Settings
        settings: "Definições",
        sound: "Som",
        music: "Música",
        sfx: "Efeitos Sonoros",
        master: "Master",
        volume: "Volume",
        reset_progress: "Reiniciar Progresso",
        confirm_reset: "Tens a certeza? Vais perder TODO o teu progresso!",
        progress: "Progresso",
        planets_discovered: "Planetas descobertos",
        missions_complete: "Missões completas",
        close: "Fechar",

        // Toast
        welcome_back: "Bem-vindo de volta",
        ready_to_explore: "Pronto para mais aventuras!",

        // Colors
        color_red: "Vermelho",
        color_green: "Verde",
        color_blue: "Azul",
        color_yellow: "Amarelo",
        color_pink: "Rosa",
        color_cyan: "Ciano",
        color_orange: "Laranja",
        color_white: "Branco",

        // Planet Types
        type_star: "Estrela",
        type_rocky: "Planeta Rochoso",
        type_gas_giant: "Gigante Gasoso",
        type_ice_giant: "Gigante de Gelo",
        type_moon: "Lua",

        // Mission Titles & Descriptions
        mission_first_flight_title: "🚀 Primeiro Voo",
        mission_first_flight_desc: "Visita o teu primeiro planeta! Começa por Mercúrio, o mais perto do Sol.",
        mission_first_flight_hint: "Usa as setas ◀ ▶ para navegar até Mercúrio!",

        mission_hot_planet_title: "🔥 Planeta Mais Quente",
        mission_hot_planet_desc: "Descobre qual é o planeta mais quente do Sistema Solar. Dica: não é o mais perto do Sol!",
        mission_hot_planet_hint: "O efeito de estufa faz um planeta ficar MUITO quente...",

        mission_home_sweet_home_title: "🏠 Lar Doce Lar",
        mission_home_sweet_home_desc: "Visita o nosso planeta - a Terra! O único com vida conhecida.",
        mission_home_sweet_home_hint: "É o terceiro planeta a contar do Sol.",

        mission_red_planet_title: "🔴 Planeta Vermelho",
        mission_red_planet_desc: "Viaja até Marte, o Planeta Vermelho! Os cientistas querem enviar pessoas para lá.",
        mission_red_planet_hint: "Tem o maior vulcão do Sistema Solar!",

        mission_gas_giant_title: "🌪️ Gigante de Gás",
        mission_gas_giant_desc: "Descobre Júpiter, o maior planeta! É tão grande que cabiam 1300 Terras lá dentro!",
        mission_gas_giant_hint: "Procura a Grande Mancha Vermelha - uma tempestade gigante!",

        mission_ring_master_title: "💍 Senhor dos Anéis",
        mission_ring_master_desc: "Visita Saturno e os seus magníficos anéis! São feitos de gelo e rochas.",
        mission_ring_master_hint: "Este planeta é tão leve que flutuaria em água!",

        mission_sideways_planet_title: "🔄 Planeta Deitado",
        mission_sideways_planet_desc: "Encontra Úrano, o planeta que roda \"deitado\"! O seu eixo está quase na horizontal.",
        mission_sideways_planet_hint: "A sua cor azul-esverdeada vem do metano.",

        mission_windy_world_title: "💨 Mundo dos Ventos",
        mission_windy_world_desc: "Viaja até Neptuno, onde os ventos chegam a 2100 km/h! O mais distante dos planetas.",
        mission_windy_world_hint: "É o planeta mais azul do Sistema Solar.",

        mission_biggest_moon_title: "🏆 Maior Lua",
        mission_biggest_moon_desc: "Visita Ganimedes, a maior lua do Sistema Solar! É maior que Mercúrio!",
        mission_biggest_moon_hint: "Orbita o maior planeta...",

        mission_death_star_title: "⭐ Estrela da Morte",
        mission_death_star_desc: "Encontra Mimas, a lua que parece a Estrela da Morte do Star Wars!",
        mission_death_star_hint: "A cratera Herschel dá-lhe esse aspecto. Orbita Saturno.",

        // Alias keys for missions whose ID doesn't match the key pattern
        mission_sun_seeker_title: "☀️ Caçador do Sol",
        mission_sun_seeker_desc: "Visita o Sol, a nossa estrela! Contém 99,86% de toda a massa do Sistema Solar.",
        mission_sun_seeker_hint: "Está no centro de tudo!",
        mission_our_moon_title: "🌙 A Nossa Lua",
        mission_our_moon_desc: "Visita a Lua, o único satélite natural da Terra! Humanos já caminharam lá.",
        mission_our_moon_hint: "Está a cerca de 384.000 km da Terra.",
        mission_volcanic_moon_title: "🌋 Lua Vulcânica",
        mission_volcanic_moon_desc: "Descobre Io, a lua mais vulcânica do Sistema Solar! Tem centenas de vulcões activos.",
        mission_volcanic_moon_hint: "É uma lua de Júpiter.",
        mission_ocean_moon_title: "🌊 Lua com Oceano",
        mission_ocean_moon_desc: "Encontra Europa! Os cientistas acham que tem um oceano escondido debaixo do gelo.",
        mission_ocean_moon_hint: "Também orbita Júpiter. Pode ter vida alienígena!",
        mission_titan_explorer_title: "🪐 Explorador de Titã",
        mission_titan_explorer_desc: "Descobre Titã, a única lua com atmosfera densa! Tem lagos de metano líquido.",
        mission_titan_explorer_hint: "É a maior lua de Saturno.",
        // Dwarf planet missions (new)
        mission_pluto_explorer_title: "💔 O Ex-Planeta",
        mission_pluto_explorer_desc: "Descobre Plutão, o famoso planeta anão! Foi 'despromovido' em 2006.",
        mission_pluto_explorer_hint: "Está muito além de Neptuno e tem um coração de gelo!",
        mission_ceres_belt_title: "🪨 Rainha dos Asteroides",
        mission_ceres_belt_desc: "Encontra Ceres, o maior objeto no cinturão de asteroides!",
        mission_ceres_belt_hint: "Está entre Marte e Júpiter.",
        mission_eris_discord_title: "😈 Deusa da Discórdia",
        mission_eris_discord_desc: "Viaja até Éris, o planeta anão que causou a 'despromição' de Plutão!",
        mission_eris_discord_hint: "É o mais distante dos planetas anões conhecidos.",
        mission_makemake_easter_title: "🐣 Descoberta Pascal",
        mission_makemake_easter_desc: "Descobre Makemake, o planeta anão descoberto na Páscoa!",
        mission_makemake_easter_hint: "Tem o nome do deus da Ilha de Páscoa.",
        mission_haumea_rugby_title: "🏈 Bola de Rugby Espacial",
        mission_haumea_rugby_desc: "Encontra Haumea, o planeta anão em forma de bola de rugby!",
        mission_haumea_rugby_hint: "Roda tão rápido que esticou!",

        // Language
        language: "Idioma",
        lang_pt: "Português",
        lang_en: "English"
    },

    en: {
        // Welcome Screen
        welcome_title: "Welcome to the Space Adventure!",
        welcome_subtitle: "Get ready to explore the Solar System",
        captain_name: "Captain Name",
        captain_placeholder: "Ex: Commander Alex",
        ship_color: "🎨 Your ship color",
        start_mission: "🚀 Start Mission!",
        tip_arrows: "💡 Use arrows ◀ ▶ to navigate",
        tip_click: "💡 Click on planets to discover",

        // UI
        explore: "Explore",
        recenter: "Recenter View",
        passport_title: "Space Passport",
        toggle_passport: "Minimize passport",
        expand_passport: "Expand passport",
        discover_btn: "🚀 Discover!",
        close_btn: "Close",
        already_visited: "✅ Already visited",
        previous: "Previous",
        next: "Next",
        close: "Close",

        // Toolbar
        take_photo: "Take Space Photo",
        gallery: "Photo Gallery",
        compare_planets: "Compare Planets",
        compare: "Compare",
        hide_menu: "Hide Menu",
        show_menu: "Show Menu",
        collectibles: "Collectibles",
        minimize: "Minimize",
        expand: "Expand",
        reduce: "Reduce",
        restore: "Restore",
        download: "Download",
        delete: "Delete",
        map: "Map",
        minimap: "Minimap",
        time_control: "Time Control",
        ui_settings: "UI Settings",
        photo_saved_flash: "Photo Saved!",
        no_photos_yet: "You haven't taken any photos yet!",
        explore_capture: "Explore the Solar System and capture special moments.",
        space_gallery: "Space Gallery",
        captain: "Captain",
        photos: "photos",
        photo: "Photo",

        // Manual Navigation
        manual_nav: "Manual Navigation (M)",
        manual_nav_tooltip: "🎮 Manual Mode (more realistic)",
        manual_mode: "MANUAL MODE",
        speed_unit_approx: "km/s (approx.)",
        speed: "Speed",
        forward: "Forward",
        backward: "Backward",
        left: "Left",
        right: "Right",
        up: "Up",
        down: "Down",
        boost: "Boost",
        exit: "Exit",
        warp: "Warp",
        warp_speed: "Warp Speed",
        light_speed: "Speed of Light",
        roll: "Roll",
        brake: "Brake",
        nearby: "NEARBY",
        go_to: "Go to",
        autopilot: "AUTO-PILOT",
        cancel: "Cancel",
        // Short planet names for nav display
        short_sun: "☀️",
        short_mercury: "Mer",
        short_venus: "Ven",
        short_earth: "Ear",
        short_mars: "Mar",
        short_jupiter: "Jup",
        short_saturn: "Sat",
        short_uranus: "Ura",
        short_neptune: "Nep",

        // Collectibles
        collection: "My Collection",
        collected: "Found",
        earned: "earned",
        found: "You found",

        // Controls
        controls_title: "Controls",
        drag_to_rotate: "Drag: Rotate view",
        scroll_to_zoom: "Scroll/Pinch: Zoom",
        click_to_see: "Click: See info",
        library: "Library",

        // Info Panel
        slide_basic_data: "Basic Data",
        slide_real_photo: "Real Photo",
        slide_climate_time: "Climate & Time",
        slide_about: "About",
        slide_distance: "Distance",
        info_type: "Type",
        info_distance: "Distance to Sun",
        info_day: "Day Length",
        info_year: "Year Length",
        info_moons: "Known Moons",
        info_main_moons: "Main Moons",
        info_temp: "Average Temperature",
        info_curiosities: "Curiosities",
        info_wow_facts: "🤯 Did You Know...",

        // Celebration
        congrats_captain: "CONGRATULATIONS CAPTAIN!",
        discovered_planet: "You discovered the planet",
        discovered_moon: "You discovered the moon",
        discovered_dwarf: "You discovered the dwarf planet",
        discovered_probe: "You found the probe",
        discovered_star: "You visited the star",
        discovered_asteroid: "You discovered the asteroid",
        discovered_generic: "You discovered",
        mission_message: "MISSION MESSAGE",

        // Missions
        mission: "MISSION",
        mission_reward: "Reward",
        see_hint: "💡 See hint",
        all_missions_complete: "All Missions Complete!",
        true_explorer: "You are a true Space Explorer!",

        // Time Control
        timeControl: "Time",
        paused: "Paused",
        very_slow: "Very Slow",
        slow: "Slow",
        normal: "Normal",
        fast: "Fast",
        very_fast: "Very Fast",
        max_speed: "Maximum Speed",

        // Photo Mode
        photo_saved: "Photo saved to gallery!",
        no_photos: "No photos yet. Start exploring!",
        delete_photo: "Delete photo",
        download_photo: "Download",

        // Planet Comparator
        compare_title: "Planet Comparator",
        select_planet: "Choose a planet...",
        select_instruction: "Select two celestial bodies to compare!",
        planet_1: "Planet 1",
        planet_2: "Planet 2",
        vs: "VS",
        radius: "Radius",
        mass: "Mass",
        distance_sun: "Distance to Sun",
        day_duration: "Day Duration",
        year_duration: "Year Duration",
        compare_size: "📏 Size (Radius)",
        compare_temp: "🌡️ Temperature",
        compare_distance: "☀️ Distance from Sun",
        compare_moons: "🌙 Number of Moons",
        compare_day: "⏱️ Day Length",
        compare_year: "📅 Year Length",
        closer_note: "Closer = larger bar",

        // XP System
        xp: "XP",
        level: "Level",
        next_level: "Next level",
        max_level: "🌟 Max Level!",
        level_up: "LEVEL UP!",
        continue: "Continue",
        continue_adventure: "Continue Adventure!",

        // Quiz
        quiz_badge: "SPACE QUIZ",
        quiz_correct: "Correct! Excellent!",
        quiz_wrong: "Not this time...",

        // Achievements
        achievements: "Achievements",
        achievement_unlocked: "Achievement Unlocked!",

        // Settings
        settings: "Settings",
        sound: "Sound",
        music: "Music",
        sfx: "Sound Effects",
        master: "Master",
        volume: "Volume",
        reset_progress: "Reset Progress",
        confirm_reset: "Are you sure? You will lose ALL your progress!",
        progress: "Progress",
        planets_discovered: "Planets discovered",
        missions_complete: "Missions complete",
        close: "Close",

        // Toast
        welcome_back: "Welcome back",
        ready_to_explore: "Ready for more adventures!",

        // Colors
        color_red: "Red",
        color_green: "Green",
        color_blue: "Blue",
        color_yellow: "Yellow",
        color_pink: "Pink",
        color_cyan: "Cyan",
        color_orange: "Orange",
        color_white: "White",

        // Planet Types
        type_star: "Star",
        type_rocky: "Rocky Planet",
        type_gas_giant: "Gas Giant",
        type_ice_giant: "Ice Giant",
        type_moon: "Moon",

        // Mission Titles & Descriptions
        mission_first_flight_title: "🚀 First Flight",
        mission_first_flight_desc: "Visit your first planet! Start with Mercury, the closest to the Sun.",
        mission_first_flight_hint: "Use arrows ◀ ▶ to navigate to Mercury!",

        mission_hot_planet_title: "🔥 Hottest Planet",
        mission_hot_planet_desc: "Discover the hottest planet in the Solar System. Hint: it's not the closest to the Sun!",
        mission_hot_planet_hint: "The greenhouse effect makes a planet VERY hot...",

        mission_home_sweet_home_title: "🏠 Home Sweet Home",
        mission_home_sweet_home_desc: "Visit our planet - Earth! The only one with known life.",
        mission_home_sweet_home_hint: "It's the third planet from the Sun.",

        mission_red_planet_title: "🔴 Red Planet",
        mission_red_planet_desc: "Travel to Mars, the Red Planet! Scientists want to send people there.",
        mission_red_planet_hint: "It has the largest volcano in the Solar System!",

        mission_gas_giant_title: "🌪️ Gas Giant",
        mission_gas_giant_desc: "Discover Jupiter, the largest planet! It's so big that 1300 Earths could fit inside!",
        mission_gas_giant_hint: "Look for the Great Red Spot - a giant storm!",

        mission_ring_master_title: "💍 Lord of the Rings",
        mission_ring_master_desc: "Visit Saturn and its magnificent rings! They're made of ice and rocks.",
        mission_ring_master_hint: "This planet is so light it would float on water!",

        mission_sideways_planet_title: "🔄 Sideways Planet",
        mission_sideways_planet_desc: "Find Uranus, the planet that rotates \"on its side\"! Its axis is almost horizontal.",
        mission_sideways_planet_hint: "Its blue-green color comes from methane.",

        mission_windy_world_title: "💨 World of Winds",
        mission_windy_world_desc: "Travel to Neptune, where winds reach 2100 km/h! The most distant planet.",
        mission_windy_world_hint: "It's the bluest planet in the Solar System.",

        mission_biggest_moon_title: "🏆 Biggest Moon",
        mission_biggest_moon_desc: "Visit Ganymede, the largest moon in the Solar System! It's bigger than Mercury!",
        mission_biggest_moon_hint: "It orbits the largest planet...",

        mission_death_star_title: "⭐ Death Star",
        mission_death_star_desc: "Find Mimas, the moon that looks like the Death Star from Star Wars!",
        mission_death_star_hint: "The Herschel crater gives it that look. It orbits Saturn.",

        // Alias keys for missions whose ID doesn't match the key pattern
        mission_sun_seeker_title: "☀️ Sun Seeker",
        mission_sun_seeker_desc: "Visit the Sun, our star! It contains 99.86% of all mass in the Solar System.",
        mission_sun_seeker_hint: "It's at the center of everything!",
        mission_our_moon_title: "🌙 Our Moon",
        mission_our_moon_desc: "Visit the Moon, Earth's only natural satellite! Humans have walked there.",
        mission_our_moon_hint: "It's about 384,000 km from Earth.",
        mission_volcanic_moon_title: "🌋 Volcanic Moon",
        mission_volcanic_moon_desc: "Discover Io, the most volcanic moon in the Solar System! It has hundreds of active volcanoes.",
        mission_volcanic_moon_hint: "It's one of Jupiter's moons.",
        mission_ocean_moon_title: "🌊 Ocean Moon",
        mission_ocean_moon_desc: "Find Europa! Scientists believe it has a hidden ocean beneath its ice.",
        mission_ocean_moon_hint: "Also orbits Jupiter. It might have alien life!",
        mission_titan_explorer_title: "🪐 Titan Explorer",
        mission_titan_explorer_desc: "Discover Titan, the only moon with a dense atmosphere! It has lakes of liquid methane.",
        mission_titan_explorer_hint: "It's Saturn's largest moon.",
        // Dwarf planet missions
        mission_pluto_explorer_title: "💔 The Ex-Planet",
        mission_pluto_explorer_desc: "Discover Pluto, the famous dwarf planet! It was 'demoted' in 2006.",
        mission_pluto_explorer_hint: "It's far beyond Neptune and has a heart of ice!",
        mission_ceres_belt_title: "🪨 Queen of the Asteroids",
        mission_ceres_belt_desc: "Find Ceres, the largest object in the asteroid belt!",
        mission_ceres_belt_hint: "It's between Mars and Jupiter.",
        mission_eris_discord_title: "😈 Goddess of Discord",
        mission_eris_discord_desc: "Travel to Eris, the dwarf planet that caused Pluto's 'demotion'!",
        mission_eris_discord_hint: "It's the most distant known dwarf planet.",
        mission_makemake_easter_title: "🐣 Easter Discovery",
        mission_makemake_easter_desc: "Discover Makemake, the dwarf planet discovered at Easter!",
        mission_makemake_easter_hint: "Named after the god of Easter Island.",
        mission_haumea_rugby_title: "🏈 Space Rugby Ball",
        mission_haumea_rugby_desc: "Find Haumea, the rugby ball-shaped dwarf planet!",
        mission_haumea_rugby_hint: "It spins so fast that it stretched!",

        // Language
        language: "Language",
        lang_pt: "Português",
        lang_en: "English"
    }
};

// Planet/Moon data translations
export const PLANET_TRANSLATIONS = {
    pt: {
        "Sol": {
            nome: "Sol",
            tipo: "Estrela"
        },
        "Mercúrio": {
            nome: "Mercúrio",
            tipo: "Planeta Rochoso"
        },
        "Vénus": {
            nome: "Vénus",
            tipo: "Planeta Rochoso"
        },
        "Terra": {
            nome: "Terra",
            tipo: "Planeta Rochoso"
        },
        "Marte": {
            nome: "Marte",
            tipo: "Planeta Rochoso"
        },
        "Júpiter": {
            nome: "Júpiter",
            tipo: "Gigante Gasoso"
        },
        "Saturno": {
            nome: "Saturno",
            tipo: "Gigante Gasoso"
        },
        "Úrano": {
            nome: "Úrano",
            tipo: "Gigante de Gelo"
        },
        "Neptuno": {
            nome: "Neptuno",
            tipo: "Gigante de Gelo"
        }
    },
    en: {
        "Sol": {
            nome: "Sun",
            tipo: "Star"
        },
        "Mercúrio": {
            nome: "Mercury",
            tipo: "Rocky Planet"
        },
        "Vénus": {
            nome: "Venus",
            tipo: "Rocky Planet"
        },
        "Terra": {
            nome: "Earth",
            tipo: "Rocky Planet"
        },
        "Marte": {
            nome: "Mars",
            tipo: "Rocky Planet"
        },
        "Júpiter": {
            nome: "Jupiter",
            tipo: "Gas Giant"
        },
        "Saturno": {
            nome: "Saturn",
            tipo: "Gas Giant"
        },
        "Úrano": {
            nome: "Uranus",
            tipo: "Ice Giant"
        },
        "Neptuno": {
            nome: "Neptune",
            tipo: "Ice Giant"
        },
        // Moons
        "Lua": { nome: "Moon" },
        "Fobos": { nome: "Phobos" },
        "Deimos": { nome: "Deimos" },
        "Io": { nome: "Io" },
        "Europa": { nome: "Europa" },
        "Ganimedes": { nome: "Ganymede" },
        "Calisto": { nome: "Callisto" },
        "Titã": { nome: "Titan" },
        "Encélado": { nome: "Enceladus" },
        "Mimas": { nome: "Mimas" },
        "Titânia": { nome: "Titania" },
        "Oberon": { nome: "Oberon" },
        "Tritão": { nome: "Triton" },
        "Proteu": { nome: "Proteus" },
        "Caronte": { nome: "Charon" },
        "Disnomia": { nome: "Dysnomia" },
        // Dwarf planets
        "Plutão": { nome: "Pluto", tipo: "Dwarf Planet" },
        "Ceres": { nome: "Ceres", tipo: "Dwarf Planet" },
        "Éris": { nome: "Eris", tipo: "Dwarf Planet" },
        "Makemake": { nome: "Makemake", tipo: "Dwarf Planet" },
        "Haumea": { nome: "Haumea", tipo: "Dwarf Planet" },
        // Probes
        "Voyager 1": { nome: "Voyager 1" },
        "Voyager 2": { nome: "Voyager 2" },
        "New Horizons": { nome: "New Horizons" },
        "Pioneer 10": { nome: "Pioneer 10" },
        "Juno": { nome: "Juno" },
        "Cassini": { nome: "Cassini" },
        "Estação Espacial Internacional": { nome: "International Space Station" },
        "Telescópio Espacial Hubble": { nome: "Hubble Space Telescope" },
        "OVNI Misterioso": { nome: "Mysterious UFO" }
    }
};

class I18n {
    constructor() {
        try {
            this.currentLang = localStorage.getItem('spaceExplorer_lang') || 'pt';
        } catch {
            this.currentLang = 'pt';
        }
        this.listeners = [];
    }

    get lang() {
        return this.currentLang;
    }

    setLang(lang) {
        if (lang !== 'pt' && lang !== 'en') return;
        if (lang === this.currentLang) return; // No change needed

        this.currentLang = lang;
        try {
            localStorage.setItem('spaceExplorer_lang', lang);
        } catch (e) {
            console.warn('[i18n] Failed to save language:', e.message);
        }
        this.updateAllTranslations();
        this.notifyListeners();
    }

    toggleLang() {
        this.setLang(this.currentLang === 'pt' ? 'en' : 'pt');
    }

    t(key) {
        return TRANSLATIONS[this.currentLang][key] || TRANSLATIONS['pt'][key] || key;
    }

    getPlanetName(internalName) {
        const trans = PLANET_TRANSLATIONS[this.currentLang][internalName];
        return trans ? trans.nome : internalName;
    }

    onLangChange(callback) {
        this.listeners.push(callback);
    }

    offLangChange(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    clearListeners() {
        this.listeners = [];
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentLang));
    }

    // Update all DOM elements with data-i18n attribute
    updateAllTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translated = this.t(key);
            if (translated !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translated;
                } else {
                    el.textContent = translated;
                }
            }
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            const translated = this.t(key);
            if (translated !== key) {
                el.title = translated;
            }
        });
    }
}

export const i18n = new I18n();
