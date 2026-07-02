/* ============================================================================
   SISTEMA SOLAR — cosmic-icons.js
   Conjunto de ícones próprio (substitui emojis de interface por ícones limpos).

   O que faz:
   - Expõe window.cosmicIcon(nome, tamanho) -> string SVG, p/ usares onde quiseres.
   - Substitui automaticamente os ícones de CHROME (fechar, definições, foto,
     galeria, dica) por ícones próprios, mesmo em elementos criados depois
     (via MutationObserver).
   NÃO mexe nos emojis de CONTEÚDO (títulos de missão, conquistas) — esses são
   distintos e fazem parte do encanto. Para os trocares também, ver NOTA no fim.

   Carregado como <script type="module"> em index.html e biblioteca.html
   (type="module" é necessário para o Vite incluir o ficheiro no build).

   Ícones disponíveis (nomes p/ cosmicIcon):
   rocket planet target sparkle medal book radar camera compass lock check x
   bolt sound globe sun chevron play home flag sliders images bulb compare
   share mascot
   ============================================================================ */
(function () {
    if (window.__cosmicIconsLoaded) return;
    window.__cosmicIconsLoaded = true;

    var SYMBOLS = {
        rocket: '<path d="M12 3.2c2.3 2.2 3.5 5 3.5 8.1 0 2-.5 3.9-1.5 5.6h-4c-1-1.7-1.5-3.6-1.5-5.6 0-3.1 1.2-5.9 3.5-8.1Z"/><circle cx="12" cy="9.6" r="1.7"/><path d="M9.6 14.8C7.9 15.6 6.8 17.3 6.8 19.3c1.5-.3 2.6-.8 3.3-1.4"/><path d="M14.4 14.8c1.7.8 2.8 2.5 2.8 4.5-1.5-.3-2.6-.8-3.3-1.4"/><path d="M10.5 19.1c.3 1.3.8 2.3 1.5 3 .7-.7 1.2-1.7 1.5-3"/>',
        planet: '<circle cx="11" cy="11" r="6.1"/><ellipse cx="11" cy="13" rx="10.2" ry="3.4" transform="rotate(-22 11 13)"/>',
        target: '<circle cx="12" cy="12" r="7.2"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22"/>',
        sparkle: '<path d="M12 3.4c.7 3.8 1.8 4.9 5.6 5.6-3.8.7-4.9 1.8-5.6 5.6-.7-3.8-1.8-4.9-5.6-5.6 3.8-.7 4.9-1.8 5.6-5.6Z"/><path d="M18.2 14.5c.3 1.6.8 2.1 2.4 2.4-1.6.3-2.1.8-2.4 2.4-.3-1.6-.8-2.1-2.4-2.4 1.6-.3 2.1-.8 2.4-2.4Z"/>',
        medal: '<path d="M8.4 4 11 11M15.6 4 13 11"/><circle cx="12" cy="15.4" r="4.6"/><path d="M12 12.8c.3 1.6.7 2 2.3 2.3-1.6.3-2 .7-2.3 2.3-.3-1.6-.7-2-2.3-2.3 1.6-.3 2-.7 2.3-2.3Z"/>',
        book: '<path d="M12 6.6C10.5 5.4 8.2 4.9 5.4 5.3v11.8c2.8-.4 5.1.1 6.6 1.3 1.5-1.2 3.8-1.7 6.6-1.3V5.3c-2.8-.4-5.1.1-6.6 1.3Z"/><path d="M12 6.6V18.4"/>',
        radar: '<circle cx="12" cy="12" r="7.4"/><circle cx="12" cy="12" r="3.4"/><path d="M12 12 18.2 7.6"/><circle cx="14.6" cy="14.6" r="1" fill="currentColor" stroke="none"/>',
        camera: '<path d="M4 8.6h3l1.3-2.1h7.4L17 8.6h3A1.6 1.6 0 0 1 21.6 10.2v8A1.6 1.6 0 0 1 20 19.8H4A1.6 1.6 0 0 1 2.4 18.2v-8A1.6 1.6 0 0 1 4 8.6Z"/><circle cx="12" cy="13.4" r="3.3"/>',
        compass: '<circle cx="12" cy="12" r="8.2"/><path d="M15.3 8.7 13 13 8.7 15.3 11 11Z"/><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none"/>',
        lock: '<path d="M8.3 10.2V8a3.7 3.7 0 0 1 7.4 0v2.2"/><rect x="5.6" y="10.2" width="12.8" height="9.6" rx="2.2"/><path d="M12 13.8v2.6"/>',
        check: '<path d="M5 12.6 10 17.6 19.2 7"/>',
        x: '<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>',
        bolt: '<path d="M13 2.5 5.5 13H11l-1 8.5L18.5 11H13l0-8.5Z"/>',
        sound: '<path d="M4 9.5h3l4-3.4v11.8l-4-3.4H4Z"/><path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.6 7a7.2 7.2 0 0 1 0 10"/>',
        globe: '<circle cx="12" cy="12" r="8.2"/><ellipse cx="12" cy="12" rx="3.6" ry="8.2"/><path d="M4 9.6h16M4 14.4h16"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7"/>',
        chevron: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
        play: '<path d="M8 6.2 18 12 8 17.8Z"/>',
        home: '<path d="M4 11.5 12 4.5l8 7"/><path d="M5.8 10v9.5h12.4V10"/>',
        flag: '<path d="M6 21V4.5"/><path d="M6 5.2c3-2 6 2 9 0v7.6c-3 2-6-2-9 0"/>',
        sliders: '<path d="M4 7.5h16M4 12h16M4 16.5h16"/><circle cx="15" cy="7.5" r="2.1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="2.1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="16.5" r="2.1" fill="currentColor" stroke="none"/>',
        images: '<rect x="3.4" y="6.6" width="12.6" height="11" rx="2.4"/><path d="M8 17.6h9.6A2 2 0 0 0 19.6 15.6V9"/><circle cx="7.2" cy="10.2" r="1.3"/><path d="M3.8 15 7.5 12l3.2 2.6"/>',
        bulb: '<path d="M9 16.5a5.5 5.5 0 1 1 6 0c-.6.4-1 .9-1 1.6v.4h-4v-.4c0-.7-.4-1.2-1-1.6Z"/><path d="M9.7 21h4.6"/>',
        compare: '<path d="M5 20h14"/><rect x="6.8" y="10" width="3.6" height="9" rx="1"/><rect x="13.6" y="5.5" width="3.6" height="13.5" rx="1"/>',
        share: '<circle cx="6.8" cy="12" r="2.5"/><circle cx="17.2" cy="6" r="2.5"/><circle cx="17.2" cy="18" r="2.5"/><path d="M9 10.9 15 7.1M9 13.1 15 16.9"/>',
        mascot: '<circle cx="24" cy="23" r="12.5"/><ellipse cx="24" cy="26" rx="20.5" ry="5.6" transform="rotate(-18 24 26)"/><circle cx="19.5" cy="21" r="1.8" fill="currentColor" stroke="none"/><circle cx="28.5" cy="21" r="1.8" fill="currentColor" stroke="none"/><path d="M20 25.5c1.8 2 6.2 2 8 0"/>'
    };

    /* Devolve uma string SVG inline para o ícone pedido. */
    function cosmicIcon(name, size, strokeWidth) {
        size = size || 22;
        var shapes = SYMBOLS[name] || '';
        var vb = name === 'mascot' ? '0 0 48 48' : '0 0 24 24';
        return '<svg viewBox="' + vb + '" width="' + size + '" height="' + size +
            '" fill="none" stroke="currentColor" stroke-width="' + (strokeWidth || 2.1) +
            '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:middle">' +
            shapes + '</svg>';
    }
    window.cosmicIcon = cosmicIcon;

    /* Botões de CHROME: troca o conteúdo (emoji) por ícone próprio.
       [selector, ícone, tamanho]  */
    var SWAPS = [
        /* botões de fechar */
        ['#close-info', 'x', 18],
        ['.close-info-btn', 'x', 18],
        ['.achievements-close', 'x', 18],
        ['.modal-close', 'x', 18],
        ['.gallery-close', 'x', 18],
        ['.lightbox-close', 'x', 20],
        ['.viewer-close', 'x', 20],
        ['.comparator-close', 'x', 18],
        ['.ui-settings-close', 'x', 16],
        ['.mission-hint-btn', 'bulb', 16],
        /* barra de ferramentas lateral (toolbar.js) — IDs estáveis */
        ['#toolbar-photo', 'camera', 23],
        ['#toolbar-gallery', 'images', 23],
        ['#toolbar-compare', 'compare', 22],
        ['#toolbar-achievements', 'medal', 23],
        ['#toolbar-library', 'book', 22],
        ['#toolbar-share', 'share', 22],
        ['#toolbar-settings', 'sliders', 22]
    ];

    function swapEl(el, name, size) {
        if (el.getAttribute('data-cosmic')) return;
        el.setAttribute('data-cosmic', '1');
        /* O SVG é aria-hidden: sem isto, botões cujo único conteúdo era texto
           ("×"/"✕") ficavam sem nome acessível depois do swap. */
        if (!el.getAttribute('aria-label') && !el.getAttribute('title')) {
            var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
            el.setAttribute('aria-label', name === 'x' ? (en ? 'Close' : 'Fechar') : name);
        }
        el.innerHTML = cosmicIcon(name, size);
    }

    function applySwaps(root) {
        if (!root || !root.querySelectorAll) return;
        for (var i = 0; i < SWAPS.length; i++) {
            var sel = SWAPS[i][0], name = SWAPS[i][1], size = SWAPS[i][2];
            /* querySelectorAll só apanha descendentes — o próprio root também
               pode ser o botão (ex.: appendChild direto do elemento). */
            if (root.matches && root.matches(sel)) swapEl(root, name, size);
            var nodes = root.querySelectorAll(sel);
            for (var j = 0; j < nodes.length; j++) {
                swapEl(nodes[j], name, size);
            }
        }
    }

    function start() {
        applySwaps(document);
        var mo = new MutationObserver(function (muts) {
            for (var i = 0; i < muts.length; i++) {
                var added = muts[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) applySwaps(added[j]);
                }
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* ------------------------------------------------------------------------
       NOTA — trocar TAMBÉM emojis de conteúdo (ex.: ⭐ recompensa, 🏆 cabeçalhos):
       podes usar cosmicIcon() diretamente nos módulos. Exemplos:
         missionSystem.js  ->  <span>${cosmicIcon('sparkle',15)} ${i18n.t('mission_reward')}: ...</span>
         achievementSystem.js (cabeçalho) -> <h2>${cosmicIcon('medal',22)} ${...}</h2>
       Mantém os emojis distintos de cada missão/conquista — dão variedade e cor.
       ------------------------------------------------------------------------ */
})();
