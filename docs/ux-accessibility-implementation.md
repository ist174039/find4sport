# Registo de aplicação UX, UI e acessibilidade

**Data de aplicação das melhorias registadas:** 2026-10-18  
**Âmbito:** interface pública, pesquisa, componentes partilhados e layouts de navegação.

## Referências consideradas

As alterações usam como critérios de trabalho ISO 9241-210 (design centrado nas pessoas), ISO 9241-11 (usabilidade), ISO 9241-110 (princípios de diálogo), ISO 9241-171 (acessibilidade de software), WCAG 2.2 AA, e ISO/IEC 25010, 25023 e 25040 (qualidade e avaliação). A referência a estas normas não declara conformidade certificada.

## Evidência implementada

- Navegação por teclado: ligação para saltar ao conteúdo principal, foco visível global e destinos de conteúdo focáveis nos layouts público, administrativo e `PageShell`.
- Preferências de movimento: redução global de animações/transições quando o sistema pede movimento reduzido; o carrossel deixa de avançar automaticamente nessa condição.
- Alvos e controlos: componentes partilhados de botão, campo e seleção passam a oferecer dimensões táteis maiores; o painel lateral tem nome acessível de fecho.
- Pesquisa: estado de filtros exposto a tecnologias assistivas, contagem anunciada, filtros avançados ocultos semanticamente, consulta reinicia paginação, e datas inválidas ou invertidas são tratadas.
- Reutilização: estado sem resultados usa `EmptyState` partilhado; paginação tem rótulos por página e estados indisponíveis não são links acionáveis.
- Desempenho percebido: imagens do carrossel usam o componente de imagem da aplicação, priorizam a primeira imagem e limitam a montagem à imagem atual e à seguinte.

## Limites e trabalho de avaliação

- Não foi feita avaliação integral de todas as rotas, estados de erro, fluxos autenticados, zoom, leitor de ecrã ou operação apenas por teclado.
- Contraste de todas as combinações de tema e conteúdo CMS deve ser medido; os tokens de cor não foram certificados por ferramenta automatizada.
- Usabilidade ISO 9241-11 requer tarefas e utilizadores representativos, com eficácia, eficiência e satisfação medidas; esses dados não existem neste registo.
- ISO/IEC 25023 requer métricas definidas e medições repetíveis; não há medições de Core Web Vitals/RUM neste registo.
- A avaliação ISO/IEC 25040 e conformidade WCAG devem passar por auditoria independente/manual antes de qualquer declaração formal.
