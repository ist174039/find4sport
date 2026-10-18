# Avaliação RGPD — Find4Sport

**Revisão técnica:** 2026-10-18  
**Estado:** avaliação de implementação e plano de fecho; não é parecer jurídico nem declaração de conformidade.

## Âmbito e evidência

Revisão baseada no código local, migrations versionadas e registos de gate do Supabase/Vercel/Stripe disponíveis nesta sessão. O estado de produção, contratos com subcontratantes, configurações completas de fornecedores e organização responsável não puderam ser confirmados. A política publicada anteriormente via CMS não foi assumida como evidência, porque pode não estar publicada ou pode estar desatualizada.

## Inventário preliminar de tratamentos (art. 30)

| Tratamento | Dados observáveis | Finalidade operacional | Base legal candidata — validar com responsável | Destinatários / sistemas |
| --- | --- | --- | --- | --- |
| Conta e autenticação | Email, nome, identificador, avatar, tipo de perfil, sessão, eventos de autenticação | Criar e proteger conta; prestar o serviço | Execução de contrato (6.º/1/b); segurança pode requerer interesse legítimo (6.º/1/f) | Supabase Auth/DB; Google/Facebook se a pessoa escolher OAuth |
| Perfil/listagem pública | Nome, foto, biografia, contactos profissionais, localização do espaço, conteúdo publicado | Descoberta e contratação de profissionais/espaços | Contrato e/ou interesse legítimo; elementos opcionais e exposição pública exigem análise de necessidade e transparência | Supabase, utilizadores da plataforma |
| Reservas, eventos e mensagens | Participantes, datas, mensagens, estado e histórico da reserva, pedidos de alteração/denúncias | Gestão do serviço, suporte, segurança e resolução de litígios | Execução de contrato; obrigação legal e/ou interesse legítimo para prova e segurança | Supabase, partes da reserva, suporte autorizado |
| Pagamentos e marketplace | IDs Stripe, montantes, estado, reembolsos, disputas, referências financeiras; dados de pagamento podem ser recolhidos diretamente pelo Stripe | Cobrança, pagamentos a prestadores, reconciliação e obrigações contabilísticas | Contrato e obrigação legal; períodos e responsabilidades devem ser confirmados | Stripe, Supabase (ledger e referências) |
| Conteúdo social e moderação | Publicações, comentários, imagens, membros, denúncias, decisões de moderação | Comunidade, segurança e moderação | Contrato e/ou interesse legítimo; avaliar retenção e risco de conteúdo sensível | Supabase Storage/DB, membros e moderadores autorizados |
| Localização de proximidade | Coordenadas do dispositivo arredondadas a 5 casas decimais, guardadas em cookie próprio por 30 minutos após ação explícita | Ordenar resultados por proximidade | Consentimento/permissão explícita para acesso ao dispositivo; confirmar análise e mecanismo de retirada | Browser; coordenadas são lidas pelo servidor para pesquisa |
| Segurança e operação | Logs, identificadores técnicos, eventos de webhook e auditoria | Segurança, prevenção de fraude/abuso, diagnóstico e cumprimento de obrigações | Interesse legítimo e/ou obrigação legal; minimizar conteúdo e definir retenção | Vercel, Supabase, Stripe, CI |
| Medição de utilização | Vercel Analytics ativado em produção | Métricas de utilização | Indeterminada até confirmar configuração, dados, cookies e opção de consentimento | Vercel |

Não se identificou tratamento intencional de categorias especiais do art. 9.º no âmbito desta revisão. Conteúdo livre (mensagens, perfis, publicações e imagens) pode, no entanto, revelar dados sensíveis; avaliar avisos, moderação, minimização e resposta a pedidos.

## Medidas técnicas executadas nesta revisão

- Removida a obtenção automática da geolocalização em páginas públicas. Continua disponível por ação explícita “Perto de mim”.
- O cookie de localização é temporário (30 minutos), `SameSite=Lax` e agora `Secure`; não contém identificador de conta. O valor continua acessível ao servidor e ao JavaScript da mesma origem por necessidade funcional.
- A rota `/privacidade` e `/cookies` apresenta conteúdo informativo de fallback quando CMS não tem página publicada, em vez de esconder a informação.
- O fallback identifica os campos jurídicos ainda por preencher; não inventa nome de responsável, contacto, prazos ou bases legais como definitivos.
- O fluxo de conta já permite desativação, eliminação imediata sem histórico financeiro e pedido de eliminação controlada quando há reservas/transações/subscrição. O processo de pedidos pendentes e retenção/anomização continua sem evidência de conclusão.

## Direitos dos titulares (arts. 12.º–22.º)

| Direito | Estado observado | Fecho necessário |
| --- | --- | --- |
| Informação transparente (arts. 12.º–14.º) | Fallback inicial criado; identidade, contactos, bases, retenção e destinatários internacionais por preencher | Responsável legal aprova e publica aviso completo antes de produção |
| Acesso e cópia (art. 15.º) | Não foi localizada exportação integral self-service | Criar fluxo autenticado de pedido, verificação de identidade, recolha de dados por categoria e resposta segura |
| Retificação (art. 16.º) | Edição de perfil existe; alcance completo não verificado | Mapear campos, permitir correção em entidades ligadas e auditar pedidos |
| Apagamento (art. 17.º) | Eliminação de Auth sem histórico; pedido controlado com dados financeiros | Definir fluxo para apagar/anonimizar entidades relacionadas, arquivos, backups e fornecedores; justificar exceções legais e executar backlog |
| Limitação/oposição (arts. 18.º/21.º) | Não foi localizado fluxo geral | Criar canal e estado de pedido com triagem por finalidade e tratamento |
| Portabilidade (art. 20.º) | Exportação integral não localizada | Definir elegibilidade/escopo e fornecer formato estruturado para dados fornecidos pelo titular tratados por contrato/consentimento |
| Retirar consentimento (art. 7.º) | Geolocalização pode ser recusada/revogada no browser; sem gestão de analytics identificada | Implementar retirada central/consentimento de tecnologias não essenciais quando aplicável |
| Decisões automatizadas (art. 22.º) | Não foi identificada decisão exclusivamente automatizada com efeito significativo; existem recomendações/ordenação e automações operacionais | Confirmar com produto, documentar lógica/impacto e garantir contestação se aplicável |

## Cookies e tecnologias semelhantes

O inventário de código encontrou cookies de sessão Supabase; `f4s_geo` (30 minutos, após ação explícita); chave `f4s_geo_updated_at` no `localStorage`; Vercel Analytics carregado em produção; e fornecedor de tema que pode persistir preferência. A qualificação legal/configuração real de Analytics e tema precisa de inspeção no browser de produção. Não foi localizada plataforma de gestão de consentimento. Não ativar cookies/identificadores não estritamente necessários antes de concluir essa avaliação e, se necessário, obter consentimento prévio.

## Retenção, apagamento e minimização

O repositório não contém um calendário aprovado de retenção por categoria. O responsável deve definir prazos e fundamento para: contas inativas; perfis e imagens; mensagens; reservas; ledger, faturas, reembolsos e disputas; denúncias e auditoria; logs; backups; dados nos subcontratantes. Obrigações contabilísticas, prevenção de fraude e defesa de direitos podem justificar retenção limitada, mas não retenção indiscriminada. Criar rotinas verificáveis de eliminação/anonimização e registos sem conservar desnecessariamente o conteúdo apagado.

## Subcontratantes e transferências (arts. 28.º/44.º–49.º)

Fornecedores observados: Supabase (identidade, base de dados, storage); Vercel (hosting, logs e analytics); Stripe (pagamentos/Connect); Google e Facebook (OAuth opcional); GitHub (CI e secrets de teste). A localização do projeto Supabase observada anteriormente era região UE; confirmar região e cópia/backup. Recolher DPA, lista de subcontratantes, localização por serviço, mecanismos de transferência, SCC/TIA quando necessário, retenção e eliminação contratual. Não assumir que OAuth transfere dados apenas para a UE.

## Segurança, incidentes e DPIA

Controlos observados incluem RLS/migrations, callbacks com destino same-origin, erros genéricos em fluxos críticos e gestão de conta. Pendências incluem proteção de palavra-passe comprometida desativada no Supabase, revisão de função `SECURITY DEFINER`, políticas permissivas, evidência de MFA/acesso administrativo, retenção de logs, backups/restauro e confirmação de gestão de chaves. O responsável deve documentar avaliação de risco e screening DPIA (art. 35.º), designar EPD quando exigido, definir deteção/escalonamento e capacidade de notificar CNPD em 72 horas quando aplicável (art. 33.º), além de comunicação a titulares quando exigida (art. 34.º).

## Plano de fecho com evidência necessária

1. **Responsável pelo tratamento:** confirmar entidade, morada, contacto, EPD/DPO e aprovador da política.
2. **Privacidade/jurídico:** validar bases legais por finalidade, interesses legítimos, prazos legais, menores, papéis Marketplace/controller e decisões automatizadas; assinar o aviso e termos.
3. **Operações:** obter DPAs e registo de subcontratantes/transferências para Supabase, Vercel, Stripe, OAuth e GitHub; anexar configurações regionais.
4. **Engenharia:** implementar pedidos autenticados de acesso/cópia, retificação coordenada, oposição/limitação e remoção/anonimização com trilho auditável; provar que os pedidos se propagam a Storage, fornecedores e cópias conforme política.
5. **Cookies:** inspecionar produção com navegador limpo; documentar cookies, localStorage, requests e expiração. Decidir Analytics/tema e instalar CMP com consentimento granular/revogação, caso necessário.
6. **Dados:** aprovar calendário de retenção e executar amostra de eliminação/anonimização em ambiente não produtivo, incluindo reservas financeiras e utilizadores de teste.
7. **Segurança/continuidade:** ativar proteção de palavra-passe comprometida; rever advisors RLS/SECURITY DEFINER; evidenciar MFA/acesso mínimo, backups, restauro e resposta a incidente.
8. **DPIA screening:** documentar decisão fundamentada e realizar DPIA se critérios do art. 35.º forem preenchidos.

**Critério de conclusão:** só marcar RGPD como validado após completar as ações aplicáveis, anexar evidências datadas e obter aprovação do responsável pelo tratamento (e EPD/assessor jurídico, quando aplicável). A alteração de código não constitui essa aprovação.
