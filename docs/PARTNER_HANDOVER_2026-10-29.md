# Find4Sport — checklist de passagem e fecho

**Snapshot:** 29/10/2026 · **PDD:** [Notion Find4Sport](https://app.notion.com/p/3ffbe9392b6081a29f8fea0b5300f9e8) · **Dossiê da reunião:** [Notion](https://app.notion.com/p/408be9392b60817bb728c0ffc7ec9827).

Esta checklist permite preparar a delegação/transferência sem declarar a versão de mercado aprovada. Nunca colocar dados pessoais, passwords, chaves Supabase/Stripe ou dumps reais neste ficheiro.

## 1. Estados separados

- **Disponibilidade da versão existente:** `find4sport.vercel.app`, Vercel production `READY` no SHA `36ac94701c62175cd40c601e644edb2687c10ef1` (18/10/2026).
- **Fonte de verdade em desenvolvimento:** `main` SHA `a1e5f85922fc6f747eff082b77f0e9c52a6552dd` (25/10/2026), ainda não é o SHA da produção.
- **Versão candidata:** [PR #34](https://github.com/ist174039/find4sport/pull/34), `feat/mobile-first-hmi-completion` (o SHA evolui com commits). CI `Quality` passou no HEAD `8205c0ff...` antes da atualização documental de 29/10; o check Vercel estava falhado por limitação de builds. Revalidar CI para o SHA final da release.
- **Estado de lançamento:** NO-GO até os gates abaixo ficarem demonstrados. Não implementar novas funcionalidades para preencher lacunas de evidência.

## 2. Gates técnicos obrigatórios

| Prioridade | Gate | Evidência de fecho exigida | Estado em 29/10 |
| --- | --- | --- | --- |
| P0 | Dados públicos e RLS | Contratos negativos `anon/authenticated` com schema real; SELECT mínimo em `professionals` e `sport_spaces`; eventos sem INSERT browser genérico | Migrações preparadas mas `not_applied`; exige ambiente isolado |
| P0 | Consistência migrations | Histórico remoto verificado com fontes suportadas; migrations e checksums correspondem ao release | Gate de release bloqueado; não editar tabela histórica manualmente |
| P0 | E2E autenticado | Passagem em `chromium` e `mobile-chromium` para ATHLETE/PROFESSIONAL/VENUE_MANAGER/ADMIN com contas de teste | Secrets/ambiente autenticado por configurar e executar |
| P0 | Fluxos financeiros | Reservas/checkout/webhooks/Stripe Connect/refunds no **Test Mode**, sem encargos reais | Código e testes unitários não equivalem a transação integrada |
| P0 | Release e domínio | Vercel `READY` para mesmo SHA de `main`, verificação de alias, smoke pós-deploy e sem clusters P0/P1 | Produção está em commit anterior; candidato sem preview correspondente ao HEAD |
| P1 | Segurança Auth | Ativar ou tratar formalmente proteção de passwords comprometidas; revalidar funções e grants sensíveis | Pendente na plataforma |
| P1 | Privacidade e continuidade | T31 e T36 com dados sintéticos, owners, restore/RTO/RPO e evidência | Runbook escrito, exercícios pendentes |
| P1 | Acessibilidade e mobile | Teclado, contraste, 320–430px, zoom/reflow, tecnologias de apoio e testes manuais | Há contratos automatizados; validação manual pendente |
| P1 | Operação | On-call, monitorização, suporte, billing, retenção e autorização GO/NO-GO | Responsáveis e orçamento por definir |

**Não criar branch Supabase paga nem testar de forma destrutiva em produção sem nova decisão expressa do responsável.** O anterior responsável recusou o custo de branch; os contratos PostgreSQL descartáveis são úteis, mas não substituem integração Supabase managed.

## 3. Handover — inventário de ativos e responsabilidades

| Ativo | Titular operacional atual / evidência | Transferência segura |
| --- | --- | --- |
| Código | GitHub `ist174039/find4sport` (repositório público sem ficheiro `LICENSE` identificado no snapshot) | Acordo escrito da PI e direitos de terceiros; collaborator com menor privilégio antes de transferir proprietário |
| Deploy | Vercel projeto `find4sport`; domínio `find4sport.vercel.app` | Estabelecer billing/proprietário, validar transferência e rollout/rollback |
| DB/Storage/Auth | Supabase ref `bqjwsllnhvnxrfojftjb`, conta conectada identificada como `supabase-bronze-magnet` | Validar que é a instância correta e a titularidade; inventário de backups e tratamento de dados |
| Financeiro | Integrações Stripe/Connect e webhooks | Titular da conta, contratos, obrigações de liquidação/refunds; nunca transferir chaves por chat |
| Produto | Notion PDD 00–14, Requirements, Tasks, Tests, Executions, Decisions & Risks | Acesso apenas às páginas do Find4Sport; não expor o workspace pessoal inteiro |
| Identidade/marca | Produto e domínio Vercel verificados, marca/registos jurídicos por apurar | Conferir titularidade, direitos de utilização, nome/domínio e possíveis obrigações |
| Operação | Runbook e workflows CI/E2E; pessoas e custos ainda não atribuídos formalmente | Nomear accountable por produto, segurança, infraestrutura, suporte e dados |

## 4. Modos negociais possíveis — decidir por escrito

1. **Delegação:** parceiro executa roadmap, QA, comercial e suporte; titular mantém IP/contas, concedendo acesso por papel.
2. **Sociedade:** participação económica/governance com vesting, obrigações, investimentos e cláusulas de saída.
3. **Transferência integral:** acordo de cessão, preço/contrapartida, ativos especificados, direitos sobre dados, responsabilidades, período de assistência e aceitação de passivos conhecidos.

Acesso de administrador **não é** cessão da propriedade intelectual. Cópia do código **não transfere** necessariamente serviços, bases de dados, marca, dados ou contratos. Rever termos com aconselhamento jurídico apropriado.

## 5. Procedimento de entrega, quando autorizado

- [ ] Inventário assinado e lista de riscos abertos aceite.
- [ ] Contrato/termo de passagem e DPA ou instruções de proteção de dados conforme aplicável.
- [ ] Backup testado e rollback documentado; não transferir primeiro e testar depois.
- [ ] Criar contas individuais para o parceiro, MFA e papéis mínimos em cada serviço.
- [ ] Validar a versão/SHA e fluxos críticos na infraestrutura de destino.
- [ ] Mover ownership/faturação apenas após cutover ensaiado e autorização.
- [ ] Rodar segredos/tokens e revogar acessos antigos após confirmação de continuidade.
- [ ] Formalizar aceite operacional; registar quem assume incidentes, pagamentos, tratamento de dados e suporte.

## 6. Reunião — decisões a registar

- Modelo de passagem (delegação, sociedade ou venda).
- Contrapartida económica e proteção do investimento no desenvolvimento já efetuado.
- Quem é responsável por corrigir os gates P0; quem financia o ambiente isolado.
- Âmbito MVP de Portugal (serviços, reservas/pagamentos, comunidades e prioridades) — não inventar exclusões.
- Data-alvo, critérios de aceitação e início da responsabilidade operacional.
- Acesso inicial acordado (leitura primeiro, escrita e contas só após contrato).

**Regra:** readiness de transferência documental pode ser concluída antes da readiness comercial; o estado deve continuar identificável como `HANDOVER_PREPARED / RELEASE_NO_GO` até todos os gates críticos serem aceites e verificados.
