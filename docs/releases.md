# Releases e produção

Este repositório usa Semantic Versioning, Release Please e tags imutáveis. Um merge normal em `main` atualiza o Release PR, mas não publica produção. Só o merge desse Release PR cria uma tag `vX.Y.Z`, uma GitHub Release e um deploy Azure de produção.

## Como escolher a versão

Usa Conventional Commits no título/commit de squash do PR:

- `fix: corrigir orientação da nave` → patch (`1.2.3` → `1.2.4`);
- `feat: adicionar controlos touch` → minor (`1.2.3` → `1.3.0`);
- `feat!: substituir o formato do progresso` ou um corpo com `BREAKING CHANGE:` → major (`1.2.3` → `2.0.0`);
- `docs:`, `test:`, `chore:` e `ci:` são registados quando relevante, mas não sobem a versão por si próprios.

O Release Please mantém `CHANGELOG.md`, `package.json`, `package-lock.json` e `.release-please-manifest.json` no mesmo Release PR. Não alteres esses números manualmente fora de uma operação de bootstrap documentada.

## Fluxo normal

1. O PR de produto recebe testes, preview Azure e revisão CodeRabbit.
2. Depois do merge em `main`, `release.yml` cria ou atualiza um único Release PR.
3. Confirma no Release PR a versão proposta, changelog, checks verdes e aprovação CodeRabbit.
4. Faz merge do Release PR. O Release Please cria a tag e a GitHub Release.
5. O job `deploy-production` faz checkout dessa tag, repete testes/lint/typecheck e publica o build identificado em Azure.
6. Confirma no rodapé `vX.Y.Z · <sha>` e os fluxos críticos de `/`, `/jogo/` e `/biblioteca/`.

Não faças deploy de produção a partir de um commit solto de `main`. Os previews de PR permanecem sem Application Insights; a connection string só entra no build de produção.

## Configuração única do repositório

O workflow requer o secret `RELEASE_PLEASE_TOKEN`. Um token de utilizador é intencional: recursos criados pelo `GITHUB_TOKEN` não disparam novos workflows, pelo que o Release PR ficaria sem CI e sem a revisão automática do CodeRabbit.

Para um fine-grained PAT, limita-o a este repositório e concede Metadata read, Contents read/write, Pull requests read/write e Issues read/write. Em alternativa, um classic PAT precisa de `repo`. Guarda-o sem o imprimir:

```powershell
gh auth token | gh secret set RELEASE_PLEASE_TOKEN
gh secret list
```

Em Settings → Actions → General, mantém Workflow permissions compatíveis com criação de PRs. O ambiente GitHub `production` pode receber required reviewers se se pretender uma aprovação humana adicional antes do deploy.

## Rollback / redeploy

Rollback significa voltar a publicar uma tag existente e verificada; não cria nem reescreve história. Escolhe a última release estável na página Releases e executa:

```powershell
gh workflow run release.yml --ref main -f ref=v1.2.3 -f reason='Rollback de v1.3.0 por regressão no arranque'
gh run list --workflow release.yml --limit 3
gh run watch
```

Também podes usar Actions → Release and production deploy → Run workflow e preencher `ref` com a tag. O job volta a correr a gate completa, deriva versão/SHA do ref e publica exatamente esse código.

Depois do rollback:

1. confirma que o workflow terminou verde e que o rodapé mostra a versão antiga esperada;
2. faz smoke de homepage, jogo, biblioteca, privacidade e telemetria;
3. abre um `fix:` para a regressão e produz uma nova patch release;
4. regista motivo, tag anterior, tag restaurada e resultado no incidente/issue.

Nunca apagues nem movas uma tag para “corrigir” uma release. Se uma release está errada, faz rollback para uma tag existente e depois publica uma versão nova.

## Diagnóstico rápido

- Release PR não aparece: abre o run de `release.yml`, confirma `RELEASE_PLEASE_TOKEN` e verifica se houve um `feat:`/`fix:` desde a baseline/tag.
- Release PR sem checks ou CodeRabbit: confirma que o workflow está a usar `RELEASE_PLEASE_TOKEN`, não `GITHUB_TOKEN`.
- GitHub Release existe mas produção não mudou: abre o job `deploy-production`, confirma o ambiente `production`, OIDC e secrets Azure.
- Versão no rodapé não corresponde: confirma `VITE_APP_VERSION`, `VITE_GIT_SHA` e o ref usado pelo checkout no run de deploy.
