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

## TODO

- Executar verificação integral e decidir integração/entrega.
