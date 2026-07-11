# Paper Explorer Product Loop Design

## Objetivo

Transformar os sistemas já existentes mas pouco visíveis — XP, níveis, coleção e prémios — num loop de produto compreensível, acrescentar uma Biblioteca educativa PT/EN e adotar URLs públicas sem extensões, mantendo a linguagem de diorama artesanal aprovada.

## Decisão de produto

A experiência passa a ter três espaços claros:

1. **Apresentação (`/`)** — explica o jogo, mostra arte e progresso recente, e conduz para jogar ou aprender.
2. **Expedição (`/jogo/`)** — voo 3D, missões, descobertas e feedback imediato de XP/prémios.
3. **Arquivo (`/biblioteca/`)** — catálogo educativo pesquisável, fichas de objetos, fotografias reais, fontes e estado de descoberta.

As rotas usam diretórios com `index.html`. Isto remove extensões no browser sem exigir um backend ou regras específicas de alojamento. A barra de navegação usa sempre os mesmos nomes e destinos nas três superfícies.

## Direção visual

**Paleta:** espaço `#0b132b`, papel `#f1e4bb`, papel claro `#fff6d8`, sol `#f4bd4f`, coral `#e7634f`, teal `#72aaa2`.

**Tipografia:** Fredoka para títulos e patente; Nunito para leitura; monospace apenas para dados científicos.

**Assinatura:** a Biblioteca parece uma mesa de arquivo astronómico. Cada corpo é uma ficha de expedição com selo de descoberta, não um card genérico. Os prémios parecem selos físicos aplicados ao passaporte.

O Caderno de Campo da homepage recebe a nova ilustração original de Saturno e Cassini. A imagem ocupa o espaço editorial principal; a pergunta e resposta mantêm-se como anotação física abaixo dela.

## Progressão visível

O modelo existente permanece como fonte única: eventos idempotentes atribuem XP por descoberta, quiz, surpresa e missão. A mudança é de apresentação:

- um **chip de patente** persistente no HUD mostra nível, título, XP e progresso;
- cada evento mostra um **recibo de XP** curto e não bloqueante;
- subir de nível ou desbloquear um prémio gera uma **transmissão de conquista**;
- o Passaporte abre diretamente a partir do chip e mantém Missões, Coleção e Prémios;
- homepage e Biblioteca leem o mesmo progresso guardado e mostram continuidade entre sessões.

Badges não são consumíveis nem dão XP adicional: representam marcos derivados do estado, evitando loops duplicados.

## Biblioteca

A Biblioteca usa `WORLD_OBJECTS`, o catálogo de aprendizagem, traduções e progresso existentes. Não replica conteúdo. Inclui:

- pesquisa por nome/facto;
- filtros Todos, Planetas, Luas, Exploração humana e Pequenos corpos;
- contagem descoberta/total e patente atual;
- fichas com ilustração/miniatura, tipo, facto e selo Descoberto/Por descobrir;
- detalhe em dialog com fotografia real, texto, medidas, fonte e quiz disponível;
- atalhos para regressar à homepage ou continuar a expedição.

Objetos ainda não descobertos continuam legíveis para fins educativos, mas o selo e a coleção distinguem exploração in-game de consulta livre.

## Dados, falhas e acessibilidade

O conteúdo editorial local é sempre suficiente. Pedidos NASA/JPL/CelesTrak enriquecem a ficha, mas uma falha de rede não bloqueia a Biblioteca. Imagens têm fallback local. Pesquisa e filtros funcionam por teclado; dialogs têm título, fecho explícito e Escape; motion respeita `prefers-reduced-motion`; PT/EN persistem entre páginas.

## Critérios de aceitação

- Nenhum link público contém `.html`.
- `/`, `/jogo/` e `/biblioteca/` carregam diretamente em dev e no build estático.
- A homepage mostra a nova arte de Saturno sem o antigo planeta CSS.
- XP, nível e progresso são visíveis durante o voo sem abrir o Caderno.
- Descoberta/quiz/missão produzem feedback de XP; níveis e prémios produzem feedback distinto.
- A Biblioteca lista o catálogo completo, pesquisa/filtra, abre fichas e muda integralmente PT/EN.
- Desktop e 390×844 não têm overflow ou sobreposição crítica.
- Testes, lint, builds e playtests terminam sem erros da aplicação.
