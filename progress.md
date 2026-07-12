Original prompt: Criar uma app preview separada para explorar uma experiência cartoon paper style / diorama 2.5D, sem estragar nem ficar dependente do projeto atual.

## 2026-07-10

- Direção aprovada: diorama 2.5D em papel para público 8–12.
- Preview isolada na branch `codex/paper-diorama-preview` e worktree global própria.
- Baseline do repositório: 7 ficheiros / 57 testes passam; npm install sem vulnerabilidades.
- Design: `docs/plans/2026-07-10-paper-diorama-design.md`.
- Estado/mission loop: 6 testes TDD passam.
- Shell Vite independente e UI low-chrome verificados sem overflow em 1440×900 e 390×844.
- Palco Three.js implementado com texturas CanvasTexture, planetas em camadas, estrelas, órbita cosida e nave de cartão.
- Fluxo automatizado Sol → Terra → Saturno → caderno terminou com missão completa e sem erros de consola da app.
- Build da preview: 555,32 KB JS raw / 142,96 KB gzip (Three.js incluído), CSS 6,49 KB raw / 2,27 KB gzip.
- Artefactos desktop: `output/playwright/paper-preview/01-sun-desktop.png` a `05-notebook-desktop.png`.
- Mobile 390×844: 0 overflow, 0 sobreposição objetivo/caderno, controlos dentro do viewport; Escape fecha o caderno e preserva missão completa.
- Feedback do utilizador: estilo aprovado, mas a navegação em rail não oferece a experiência semi-3D do jogo original.
- Evolução aprovada: voo livre 2.5D, câmara follow/drag, profundidade limitada e exploração por proximidade.
- Correção posterior do utilizador: a profundidade limitada não é suficiente; a visão final mantém navegação 3D 360º como o jogo original.
- Nova solução visual: planetas como esculturas de papel volumétricas com meridianos cruzados e fatias horizontais, evitando desaparecer de perfil.
- Voo livre 360º implementado com posição, velocidade e orientação completas (yaw, pitch e roll), aceleração, boost, travão e limites do mundo.
- Controlos equivalentes ao original: W/S, A/D, Space/Ctrl, rato, Shift, R/F, X e G; mobile usa joystick, drag para olhar, subir/descer e boost.
- Câmara chase 3D ligada à orientação da nave; estrelas ocupam volume real e a rota cosida tem paralaxe.
- Nave convertida numa escultura de papel cruzada para conservar uma silhueta legível quando vista por trás.
- Sol, Terra e Saturno têm volumes de colisão; Saturno inclui margem para os anéis e para o comprimento da nave.
- Playtest real por controlos chegou a Saturno, ativou exploração e concluiu a missão sem erros de consola.
- Mobile 390×844 validado com joystick, drag e subida reais: movimento nos três eixos, mudança de yaw/pitch, sem sobreposição dos quatro grupos de HUD.
- Fullscreen entra/sai com G; `prefers-reduced-motion` reduz transições para 0,01 ms.
- Evidência final: `output/playwright/paper-preview/15-flight-360-cross-rocket.png`, `16-flight-360-mobile-initial.png` e `17-flight-360-mobile-controls.png`.
- Feedback posterior: com `W` premido, a inércia mantinha a velocidade no vetor antigo depois de rodar a câmara.
- Causa confirmada: velocidade acumulada em world-space com drag ativo muito baixo; a nova direção só acrescentava aceleração sem orientar o vetor existente.
- Correção TDD: steering arcade-space preserva a magnitude, mas curva a velocidade rapidamente para o forward da câmara enquanto existe input; sem input continua a haver deriva.
- Playtest real: após uma rotação de ~90° durante `W`, alinhamento velocidade/forward = 0,99946, sem erros de consola. Evidência em `output/playwright/paper-preview-steering/camera-relative-turn-clear.png`.
- Direção visual revista para híbrido low-poly + paper: volumes fechados, facetas grandes, paleta curta, contorno grafite e rebordo artesanal.
- Design e plano: `docs/plans/2026-07-10-low-poly-paper-universe-design.md` e `2026-07-10-low-poly-paper-universe-implementation.md`.
- Sol, Terra e Saturno reconstruídos com `IcosahedronGeometry` fechado; desapareceram meridianos/fatias internas expostas.
- Detalhes de silhueta: corona triangular contida, continentes/nuvens/capas polares em peças simples e anel sólido extrudido.
- 7 testes estruturais low-poly passam; focused flight + visual = 19 testes, lint e build paper passam.
- Screenshots: `output/playwright/paper-lowpoly/shot-0.png`, `earth-close.png`, `saturn-close.png`.
- Observação visual para o batch de câmara: em aproximação a Saturno, o anel pode dominar o lado esquerdo; aplicar camera pull-back/focus contextual sem bloquear yaw/pitch/roll.
- Navegação finalmente alinhada com o modelo do jogo original: `camera.quaternion` é a autoridade única; `W/S`, `A/D` e vertical usam os vetores forward/right/up reais da câmara renderizada.
- Removido o `lookAt()` com smoothing independente que fazia a direção vista divergir da direção física. O utilizador confirmou a correção.
- Composição da nave revista: offset vertical da chase camera reduzido de 2,15 para 0,9, colocando a nave a cerca de 35% acima da margem inferior (~65–68% da altura).
- Desktop e mobile 390×844 inspecionados sem conflito com prompts/controlos. Evidência: `output/playwright/ship-layout/shot-0.png` e `mobile-390.png`.

## 2026-07-11

- Utilizador aprovou o novo estilo low-poly dos planetas e pediu nave equivalente + continuação do plano.
- Nave reconstruída como correio espacial low-poly: fuselagem hexagonal fechada, asas coral extrudidas, cockpit azul, barbatana-envelope, rebordo e contorno.
- Dois motores e exhaust proporcional à velocidade, sem bloom; 3 testes estruturais TDD passam.
- Vista traseira, curva/roll e mobile 390×844 inspecionados sem erros de consola. Evidência: `output/playwright/paper-courier/shot-0.png`, `roll-profile.png` e `mobile-390.png`.
- Escopo ampliado pelo utilizador para uma vertical slice completa com aprendizagem, fotos reais, quizzes, NASA/JPL/CelesTrak, satélites e Sistema Solar completo.
- Design/plano: `docs/plans/2026-07-11-paper-solar-explorer-complete-design.md` e `2026-07-11-paper-solar-explorer-complete-implementation.md`.
- Catálogo educativo puro reutiliza `SOLAR_SYSTEM_DATA` e quizzes originais para Sol + 8 planetas; nove fotografias reais locais empacotadas no preview (~0,5 MB).
- Caderno educativo implementado com quatro secções: Descobrir, Medir, Hoje e Desafio; estado puro suporta resposta errada, explicação, retry e conclusão.
- Playtest completo do Sol: fotografia real, medições, resposta errada/retry/correta, pausa/retoma e text-state coerente; 0 erros de consola.
- Mobile 390×844: 0 overflow horizontal, diálogo dentro do viewport e scroll vertical de 42 px no painel mais longo.
- Evidência: `output/playwright/paper-learning/discover-fixed.png`, `measure.png`, `quiz-correct.png`, `mobile-discover.png`.
- Objetivo formal ampliado para jogo completo: Sistema Solar, luas, pequenos corpos, objetos humanos, missões e progresso.
- Serviço científico resiliente implementado para NASA Images, APOD, JPL Horizons e CelesTrak.
- Cache com TTL específico por fonte (2 h a 7 dias), retorno de dados expirados em falha e fallback local preservam o modo offline.
- 6 testes de parsing/cache/fallback passam; lint e build paper passam.
- Catálogo expandido para Sol + 8 planetas, 14 luas, objetos humanos, asteroides, cometas e meteoritos/eventos históricos.
- Planetas completos com identidades low-poly próprias; luas e pequenos corpos orbitam em posições de jogo comprimidas.
- ISS e Hubble usam OMM CelesTrak + propagação SGP4 (`satellite.js`); Tesla/Starman usa a efeméride JPL Horizons `-143205`.
- Proxy local dedicado ao JPL elimina o bloqueio CORS sem depender de proxies públicos; 0 erros de consola após validação.
- Zoom contínuo por roda/pinch/botões e transição para cockpit paper-style implementados; `V` alterna a vista.
- Seis missões encadeadas, progresso persistente, diário de missões, waypoint direcional e APOD diária implementados.
- Evidência visual: `output/playwright/complete-game/mission-log.png`, `earth-system.png`, `jupiter-moons.png`, `neptune-triton.png`, `tesla-notebook.png`.
- QA encontrou e corrigiu prioridade de interação: luas/satélites próximos vencem o raio do planeta-pai; órbitas foram abrandadas para exploração relaxada.
- Fluxos Saturno → missão seguinte, reload persistente, Terra → foto NASA/JPL Hoje → quiz e Europa → foto/caderno foram validados sem erros.
- Mobile 390×844 validado sem overflow horizontal; diário de missões tem scroll interno e cockpit adapta a largura dos pilares.
- Voo real após drag + `W`/boost manteve velocidade alinhada com o forward da câmara; FPS headless medido em ~57 durante 2 s.
- Evidência final adicional: `earth-live-photo.png`, `earth-today-live.png`, `europa-notebook.png`, `mobile-390.png`, `mobile-cockpit-scaled.png`, `flight-camera-relative.png`.

## TODO

- 2026-07-11: feedback final de produção em curso. A ficha Hoje do Sol já não calcula “0 milhões de km do Sol”; apresenta-o como referência central e a fonte visível aponta para a página humana do JPL Horizons, não para JSON/proxy.
- Privacidade removida do playfield e integrada discretamente no rodapé do passaporte. Homepage recebeu header sticky e footer editorial responsivo com mapa do site, feedback e área legal.
- Criados formulários GitHub para bugs, ideias, correções científicas e acessibilidade; Issues em branco ficam desativados.
- Câmara: causa do wobble identificada no smoothing do offset chase completo. O rig agora suaviza apenas a translação e usa slerp de rotação independente do frame rate; drag contínuo validado sem erros de consola.
- Lumi/surpresas: só contam voo ativo, primeiro evento após 90 s de voo, cooldown seguinte de 180–300 s e máximo de 2 interrupções por sessão.
- Pedido seguinte: removidos totalmente os links persistentes de privacidade do passaporte/jogo. O aviso inicial de consentimento continua a existir por obrigação funcional, mas desaparece após a escolha.
- Homepage e biblioteca partilham agora `shared-header.css`: 68 px, largura total, sticky, navegação e ações visualmente idênticas.
- Skins expandidas a luas, pequenos corpos, sondas/estações, Tesla + Starman e nave do jogador através de três famílias de mapas (`moon`, `rocky`, `craft`) com cor específica por objeto.
- QA visual: ambos os headers medem 1440×68 em desktop; jogo sem links persistentes de privacidade nem erros de consola. Capturas em `output/playwright/paper-all-skins/` no workspace principal.
- Evidência atual: `output/playwright/latest-camera/drag-fixed.png`, `sun-today-fixed.png`, `footer-fixed.png` (algumas capturas no workspace principal por causa do cwd do browser REPL).

- Novo self-improvement loop: universo heliocêntrico, homepage, surpresas, guia e gamificação.
- Design/plano: `docs/plans/2026-07-11-heliocentric-explorer-design.md` e `2026-07-11-heliocentric-explorer-implementation.md`.
- Remover a rota diagonal e migrar todos os consumidores para posições dinâmicas antes de construir novos sistemas.

## 2026-07-11 — Heliocentric loop

- Modelo orbital puro implementado com semi-eixo maior, excentricidade, inclinação, nodo, periapsis, anomalia e período para os 8 planetas.
- Compressão logarítmica preserva a ordem real de 0,387–30,061 UA em 11–142 unidades jogáveis.
- Voo, colisões e proximidade passaram a consumir snapshots de posições atuais; testes provam que anchors históricos deixam de afetar colisões.
- Linha cosida/CatmullRom removida. Oito órbitas solares independentes, discretas e ocultáveis substituem-na.
- Planetas movem-se por data simulada; luas seguem a posição dinâmica do planeta-pai; ISS/Hubble usam offsets propagados relativos à Terra móvel.
- Cintura de asteroides reposicionada como anel heliocêntrico; bounds de voo agora são simétricos e cobrem órbitas completas.
- APOD com `DEMO_KEY` produziu 429 no playtest; troca TDD para seleção diária CORS-safe da NASA Images eliminou erros de consola.
- Evidência: `output/playwright/heliocentric-pass1/shot-0.png`, `saturn-dynamic.png`, `orbits-hidden.png`.
- Bug reportado pelo utilizador: “bolha azul” móvel ao afastar-se. Causa confirmada: canto dos bounds + chase camera (~264,5 u) atravessava sky dome de raio 260.
- Fix TDD: sky dome segue a posição da câmara em cada render. Reproduzido no canto `(175, 50, 175)` sem bolha e com 0 erros. Evidência: `sky-corner-fixed.png`.
- Waypoint agora calcula direção a partir da câmara e mostra `u no diorama` + distância científica em UA, sem fingir escala linear.
- Homepage editorial criada em `/` e runtime WebGL isolado em `/jogo.html`: apresentação, públicos família/escola, aprendizagem, missões, prémios e proveniência NASA/JPL/CelesTrak/ESA.
- Direção visual da homepage usa dossier de expedição + observatório em papel, com orrery CSS original, cartões artesanais e CTA persistente para o jogo.
- Desktop 1440×1000 e mobile 390×844 validados: zero overflow, zero erros de consola; CTA carrega o canvas 3D e o jogo oferece regresso ao início.
- Evidência: `output/playwright/homepage/desktop.png`, `mobile.png` e `section-0.png`.
- Passaporte gamificado implementado com XP idempotente por descoberta (+20), quiz (+35), surpresa (+15) e missão (+100), seis níveis e migração do progresso existente.
- Coleção mostra cartões descobertos/por descobrir; sete prémios incluem medalhas e troféu final, sempre derivados de marcos significativos.
- Playtest Saturno confirmou 120 XP exatos, avanço para nível 2, desbloqueio de duas medalhas, persistência e 0 erros de consola.
- Evidência: `output/playwright/progression/missions.png` e `awards.png`.
- Diretor de surpresas implementado com seis eventos, cooldown de 65–105 s, bloqueio durante diálogos, requisito de voo ativo e rotação completa antes de repetir.
- Lumi surge numa transmissão não-modal e dispensável; cada evento tem curiosidade editorial, +15 XP idempotente e efeito 3D de papel temporário.
- Cometa desktop e sinal mobile 390×844 validados com persistência, dismiss e 0 erros; o cartão mobile fica acima dos controlos de voo.
- Evidência: `output/playwright/surprises/lumi-comet.png` e `mobile-signal.png`.
- Arte hero original gerada para o projeto: nave-correio, Lumi e orrery heliocêntrico em low-poly/papel, paleta controlada e espaço editorial para copy.
- Asset WebP otimizado (69 kB) integrado apenas na homepage em `/public/art/paper-expedition-hero.webp`; o jogo conserva geometria 3D nativa e leve.
- Segundo passe visual: legenda hero encurtada para não cortar; posição inicial afastada de 7 para 14 unidades do Sol, revelando mais universo sem perder a partida cinematográfica.
- Enquadramento inicial validado em 1440×900, com waypoint Saturno, nave clara e 0 erros. Evidência: `output/playwright/second-pass/opening.png`.
- Audit visual rejeitou o primeiro cockpit revisto: geometria próxima ocupava mais de metade do viewport.
- Cockpit corrigido com moldura 3D fina e painel funcional limitado a ~14,9% desktop / ~13,5% mobile: velocímetro e agulha vivos, radar de missão, alvo móvel, XYZ e horizonte yaw/pitch/roll.
- W + drag + roll alteraram velocidade `0,0→2,9`, agulha `-120°→-91,6°`, coordenadas, radar e atitude; 0 erros. Evidência: `cockpit-compact-dynamic.png` e `mobile-cockpit-compact.png`.
- i18n PT/EN implementado com preferência persistente partilhada entre homepage e jogo; troca atualiza `html[lang]`, HUD, waypoint/UA-AU, caderno, 37 objetos, quizzes, missões, níveis, coleção, prémios e seis surpresas.
- Fluxo real validado EN homepage → jogo → Earth → quiz → Lumi → PT: copy e dados mudaram sem reload, idioma persistiu e houve 0 erros. Evidência: `output/playwright/i18n/homepage-en.png` e `earth-en.png`.
- Legenda hero movida para uma safe area interna mais alta; a posição anterior ainda era cortada pela aresta inclinada do `clip-path`.
- Quatro assets editoriais originais gerados em folha 2×2 e recortados/otimizados: Voa (25,7 kB), Descobre (37,1 kB), Aprende (41,1 kB), Coleciona (47,7 kB).
- Placeholders circulares substituídos por ilustrações paper-style quadradas sem distorção; medalhas e troféu CSS foram também substituídos por recortes da mesma arte (5–7 kB cada).
- Cards desktop e mobile validados sem overflow e com proporção 1:1. Evidência: `output/playwright/assets/steps-desktop-fixed.png`, `steps-mobile.png` e `rewards-paper-fixed.png`.
- Mobile real-pointer audit: joystick mantido moveu `Z 14→10,676`; drag mudou yaw/pitch e novo impulso seguiu a orientação (`X 1,73 / Y 0,796 / Z 3,743`), sem erros.
- Cockpit mobile final ocupa 170×104 px, sem sobrepor joystick/boost; prompt de descoberta sobe acima do painel quando cockpit está ativo. Evidência: `output/playwright/final-audit/mobile-cockpit-real.png`.
- Cockpit recebeu passe material final: base de cartão, módulos creme com sombra coral, velocímetro em camadas, radar teal com anéis tracejados e horizonte físico em papel; mantém 170×104 px no mobile e 0 erros. Evidência: `cockpit-paper-controls.png` e `cockpit-paper-mobile.png`.
- Tesla Roadster reconstruído por TDD como desportivo aberto low-poly: carroceria vermelha afunilada, cockpit rebaixado, para-brisas, quatro rodas com jantes, volante, emblema e Starman sentado com torso, capacete/visor, braços e pernas. Evidência: `roadster-paper-approved.png`.
- Auditoria final de interface adicionou skip link bilingue, foco visível no seletor de idioma, scroll margins, headings balanceados, overscroll contido e touch targets; homepage final visualmente inspecionada sem erros (`homepage-final.png`).
- Biblioteca editorial completa implementada em `/biblioteca/`: 37 entradas PT/EN, pesquisa tolerante a acentos, filtros, detalhe científico, quiz com XP idempotente e prateleira de prémios; desktop/mobile validados.
- Fotografias secundárias corrigidas na fonte: 14 luas, 5 objetos humanos e 9 pequenos corpos usam 28 imagens próprias em `/learning/objects/`, com atribuições NASA/JPL/Wikimedia; contacto visual em `output/playwright/product-loop/object-photo-contact-sheet.jpg`.
- Caderno, Passaporte e detalhe da Biblioteca fecham agora por `Esc`, botão ou clique no backdrop; clique dentro do conteúdo é preservado. Teste puro e playtest browser passam.
- Sete medalhas/troféus paper-style únicos gerados, recortados e integrados em homepage, jogo e Biblioteca; contacto em `output/playwright/product-loop/award-contact-sheet.jpg`.
- Piloto de papel implementado: hover identifica o objeto, clique curto inicia viagem automática em arco, drag não seleciona, input manual cancela, chegada para no raio de exploração e rasto de fragmentos acompanha a nave.
- Regressão crítica do piloto: quaternion do renderer usa sinal de yaw oposto ao fallback matemático; corrigido. Alinhamento visual frente/velocidade medido em `0,9975`. Evidência: `output/playwright/autopilot-facing-fixed/shot-0.png`.
- Rota automática para a Terra passou de reta para arco exterior e mantém distância superior ao volume de colisão do Sol.
- Teste visual de materiais gerados aplicado à Terra, Marte e Saturno; texturas paper equiretangulares conservam iluminação facetada, contorno e detalhes 3D. Comparação: `output/playwright/texture-pilot/comparison.jpg`.
- Documento permanente para novas sessões criado em `SELF-IMPROVEMENT.md`, com visão, arquitetura, workflow, critérios, roadmap e prompt de arranque.
- Texturas paper expandidas, após aprovação, aos nove mundos primários: Sol, Mercúrio, Vénus, Terra, Marte, Júpiter, Saturno, Urano e Neptuno. Assets otimizados em `public/art/textures/` e auditoria 3×3 em `output/playwright/all-paper-worlds-fixed/comparison.jpg`.
- Nuvens/polos elevados da Terra passaram a usar o mapa fibroso creme do runtime; luas geladas/rochosas usam papel creme/cartão.
- O círculo saliente em Marte tinha duas causas: crater rings geométricos e trânsito de Fobos. Crater rings são agora omitidos quando existe textura; Fobos/Deimos foram reduzidos e afastados.
- Regra de composição `moonLegibility` preserva o raio orbital mas desloca luas em trânsito para fora da silhueta quando a câmara está próxima. Marte final mostra Fobos separado e “Explorar Marte”, sem erros: `mars-legible.png`.

## 2026-07-12 — Soundscape reativo

- Pedido: acrescentar SFX e som de fundo, estudando os momentos certos, com chave ElevenLabs guardada no `.env` do checkout principal.
- Direção e plano: `docs/plans/2026-07-12-paper-soundscape-design.md` e `2026-07-12-paper-soundscape-implementation.md`.
- `.env` e `.env.*` foram adicionados ao `.gitignore`, preservando apenas a possibilidade de um `.env.example`; a chave nunca entra no bundle nem é impressa pelo pipeline.
- Pipeline ElevenLabs criado em `scripts/generate-paper-audio.mjs`: usa `POST /v1/sound-generation`, `eleven_text_to_sound_v2`, escrita atómica e skip-existing para evitar gastos repetidos.
- A primeira chamada ElevenLabs falhou antes de gerar áudio com `401 payment_issue` / fatura incompleta. Nenhum MP3 atual é apresentado como output ElevenLabs.
- Para não deixar a feature partida durante o bloqueio inicial, foram criados nove fallbacks sintetizados e reprodutíveis em `scripts/generate-paper-audio-fallback.mjs`: ambiente 30 s, motor 12 s, fold, piloto start/arrive, quiz correct/wrong, reward e Lumi.
- Mixer puro e diretor browser implementados em `paper-preview/src/audio/`: áudio começa apenas após gesto, escolha on/off persiste, volumes fazem easing, motor acompanha velocidade/boost, diálogos fazem ducking, tab oculta pausa e falhas de `play()` nunca bloqueiam o jogo.
- O botão “Som/Sound” vive no stack de ferramentas como disco-rádio de papel, usa `aria-pressed` e labels dinâmicos PT/EN. QA encontrou e corrigiu uma colisão entre o label persistido e `data-i18n-aria`; regressão incluída.
- Sinais integrados apenas em transições semânticas: abrir/fechar caderno, piloto start/arrive, quiz certo/errado, recompensa e transmissão Lumi. Hover, drag, teclas comuns e zoom não disparam one-shots; boost altera o motor contínuo.
- `render_game_to_text` expõe enabled/unlocked/visible, volumes, playback rate, last cue e contagem ativa. Browser confirmou `lumi-signal`, `autopilot-start`, `paper-fold`, `reward-chime` e `quiz-wrong` nos fluxos reais.
- Evidência visual inspecionada: `output/playwright/paper-audio-desktop-active/shot-0.png`, `output/playwright/paper-audio-mobile-active.png` e `output/playwright/paper-audio-mobile-muted-390.png`. O controlo fica legível em desktop e 390×844, com 0 overflow horizontal e 0 erros de consola.
- Verificação desta iteração: 59 ficheiros / 257 testes passam; lint, typecheck, build paper e `git diff --check` passam. `/`, `/jogo/`, `/biblioteca/` e assets áudio auditados com HTTP 200 e `audio/mpeg`.
- Após atualização da subscrição, `node scripts/generate-paper-audio.mjs --force` gerou com sucesso os nove MP3 atuais via ElevenLabs. `ffprobe` confirmou 1,2–30 s, ~128–134 kbps e cerca de 923 kB no total; `volumedetect` confirmou sinal não silencioso em todos os clips.
- Smoke do cliente oficial com os assets ElevenLabs: gesto de voo desbloqueou áudio, nave chegou a 5,109 u/s, ambiente ficou em 0,197, motor em 0,199 e playback rate em 1,140; sem erros de consola. Evidência: `output/playwright/elevenlabs-audio-smoke/shot-0.png` e `state-0.json`.
- TODO real: fazer audição humana dos nove resultados em colunas e auscultadores, desktop e telemóvel, e ajustar apenas níveis do mixer se algum sinal competir com o ambiente.
