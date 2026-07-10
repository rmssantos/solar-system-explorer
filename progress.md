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

## TODO

- Escrever plano de implementação TDD.
- Implementar simulação de voo, input desktop/mobile e câmara follow.
- Substituir command strip anterior/seguinte por controlos de voo e ação contextual.
- Playtest de voo mobile completo, reduced motion e fullscreen.
- Rever legibilidade da Terra e possíveis artefactos de captura durante a transição.
- Executar verificação integral e decidir integração/entrega.
