# Find4Sport — validação de privacidade e continuidade

Estado: procedimento operacional preparado; execução bloqueada até existir ambiente isolado e owners aprovados.

## Âmbito

Este runbook suporta F35, V06, T31 e T36. Não substitui parecer jurídico, aprovação do responsável de privacidade ou evidência real de restore. Nunca executar estes exercícios com dados reais de clientes, pagamentos reais ou produção como ambiente de teste.

## Pré-condições comuns

- Ambiente Supabase isolado e descartável.
- Dataset sintético marcado como teste, sem dados pessoais reais.
- SHA/versão candidata identificada.
- Responsável operacional e responsável de privacidade confirmados.
- RTO e RPO aprovados antes do exercício de restore.
- Registo de evidência com data, ambiente, owner, limitações e resultado.

## T31 — pedidos de titular e retenção

Validar, com contas e dados sintéticos, pelo menos: acesso/exportação, retificação, apagamento/anonimização quando aplicável, limitação/oposição quando suportada e retenção.

Para cada pedido:
1. Registar identidade sintética, finalidade do pedido e timestamp.
2. Mapear todas as entidades afetadas antes de executar qualquer ação.
3. Confirmar que dados financeiros/auditoria sujeitos a obrigação legal não são apagados sem decisão documentada.
4. Executar apenas no ambiente isolado.
5. Verificar propagação a base de dados, Storage e fornecedores incluídos no âmbito do teste.
6. Confirmar ausência de dados pessoais ou tokens em logs/evidência.
7. Registar resultado, exceções, owner e follow-up.

Critério de saída: fluxo reproduzível, prazos aprovados, exceções documentadas e evidência técnica suficiente para auditoria.

## T36 — continuidade, restore e rollback

1. Registar estado inicial do dataset sintético: contagens, checksums ou invariantes relevantes.
2. Registar ponto de restauro suportado e timestamps.
3. Simular incidente controlado não financeiro.
4. Executar restore/rollback suportado pelo fornecedor.
5. Medir tempo até serviço funcional e perda de dados face ao ponto de recuperação.
6. Verificar integridade referencial, Auth/Storage quando aplicável e smoke das jornadas críticas.
7. Comparar RTO/RPO observados com limites aprovados.
8. Registar falhas e decisão de rollback versus forward-fix.
9. Resetar/destruir o ambiente de teste conforme procedimento aprovado.

Critério de saída: restore reproduzível, integridade validada e RTO/RPO observados dentro dos limites aprovados.

## Evidência mínima

- SHA/versão candidata.
- Ambiente isolado.
- Dataset sintético.
- Timestamps de início/fim.
- Owner responsável.
- Resultado esperado versus observado.
- Limitações e exceções.
- Links para execução/teste e, quando aplicável, logs sanitizados.

## Bloqueios atuais

A existência deste runbook não fecha V06. Permanecem necessários: ambiente Supabase isolado, owners aprovados, RTO/RPO, execução de T31/T36 e evidência observada. Não declarar RGPD, ISO 27701 ou continuidade como conformes antes desses gates.
