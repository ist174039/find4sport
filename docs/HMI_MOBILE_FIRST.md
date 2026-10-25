# Find4Sport — HMI / UX mobile-first contract

Status: implementação incremental. Fonte de verdade funcional: PDD/Requirements e Tasks & Deliverables. Este documento não substitui validação humana de usabilidade nem auditoria WCAG.

## Princípios obrigatórios
- Mobile first: desenhar primeiro para 320–430 px e expandir progressivamente.
- Alvo tátil: controlos primários e repetidos com pelo menos 44 px de altura/largura útil sempre que aplicável.
- Uma ação primária clara por contexto; ações secundárias não competem visualmente.
- Navegação, filtros e formulários funcionam por teclado; foco visível nunca é removido sem substituto equivalente.
- Inputs têm nome acessível; ícones acionáveis têm `aria-label`; estados dinâmicos relevantes usam anúncio acessível.
- Respeitar `prefers-reduced-motion`.
- Texto e mensagens em PT-PT; erros apresentados ao utilizador não expõem mensagens técnicas, dados pessoais, segredos ou respostas brutas de fornecedores.
- Estados obrigatórios por padrão aplicável: loading, vazio, erro, sucesso e disabled.
- Contratos públicos mostram apenas dados explicitamente públicos; HMI não deve depender de campos privados.

## Templates
### Descoberta pública
Ordem mobile: título/contagem → pesquisa → tipos → filtros → resultados → paginação → mapa como vista/ação complementar. Pesquisa usa `role=search`; tipos são escolhas pressionáveis; filtros preservam query e tipo.

### Dashboard autenticado
Ordem mobile: contexto/identidade → estado/plano quando aplicável → ação principal → métricas essenciais → conteúdo operacional. Dados e ações são limitados ao owner/role no servidor; a interface não é controlo de autorização.

## Variantes e tokens
Usar tokens semânticos existentes em `app/globals.css`: background/foreground, card, primary, secondary, muted, accent, destructive, success, warning, info, border, input e ring. Não introduzir cores literais em novos componentes de aplicação salvo integração visual externa justificada.

Raios usam a escala `--radius-*`. Foco usa o ring semântico. Estados de sucesso/aviso/erro usam os respetivos tokens e texto; cor nunca é o único sinal.

## Pilotos
1. Pesquisa/descoberta pública: `/pesquisa`, `PesquisaFiltros`, `SearchBar`.
2. Dashboard autenticado: `/dashboard` e `OverviewDashboard`.

A adoção global só pode ser declarada após inventário e migração auditada dos consumidores. V09 continua a ser a tarefa da jornada pesquisa→ficha→ação e não é duplicada aqui.

## Critérios de evidência
Para promover CODE-QUALITY-04/07/08 ou F4S-36: lint, typecheck, testes e build no mesmo SHA; E2E desktop e mobile dos fluxos críticos; verificação manual de teclado/foco; screenshots nos breakpoints acordados; revisão editorial PT-PT; registo das exceções e evidência no Notion.
