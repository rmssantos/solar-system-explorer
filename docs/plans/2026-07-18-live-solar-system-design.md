# Observatório do Tempo — desenho

## Experiência

O jogo já calcula órbitas reais comprimidas, mas o ritmo atual de 0,35 dias simulados por segundo e as rotações muito lentas fazem o céu parecer imóvel. O Observatório do Tempo torna esse sistema legível sem o transformar numa dashboard. Um novo botão de cartão na coluna de ferramentas mostra sempre `Tempo · 10×`. Ao abri-lo, surge uma pequena etiqueta de observatório com a data simulada, uma frase concreta (`1 segundo = 10 dias`) e quatro ações: pausar, 1×, 10× e 100×. Pausar congela apenas planetas, luas e rotação; a nave, som e interface continuam ativos.

A escala inicial é 10× para que o movimento dos planetas interiores seja observável numa sessão curta. Em dispositivos com `prefers-reduced-motion`, começa em 1×. A velocidade escolhida não atribui XP, não altera missões e não é enviada para analytics. O estado textual do jogo inclui data, escala e pausa para QA determinístico.

## Arquitetura

`world/orbitalClock.js` é a fonte de verdade imutável: valida escalas, avança datas e calcula fatores visuais limitados para rotação e satélites. `createPaperScene.js` adapta esse estado ao Three.js: os planetas usam a data do relógio; luas e objetos usam tempo orbital escalado; a rotação própria usa um fator com limite para evitar movimento desconfortável a 100×. A UI DOM recebe snapshots do relógio através de `main.js`, sem guardar regras nos meshes.

## Direção visual e responsiva

O controlo parece uma pequena etiqueta de planetário: azul-noite, papel creme, coral e amarelo-sinal já existentes; `Paper Fredoka` para título e `Field Nunito` para dados. A assinatura é um pequeno sistema orbital recortado que roda apenas quando o tempo avança. Desktop abre o cartão à esquerda da coluna; mobile abre uma faixa compacta abaixo da topbar, respeitando safe areas e alvos de toque de 44px. `prefers-reduced-motion` remove pulsos/transições decorativas, sem esconder os controlos.

