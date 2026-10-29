# Find4Sport

Plataforma de descoberta e marketplace desportivo: profissionais, espaços, eventos, comunidades e jornadas de utilizadores/gestores. Mercado inicial de referência: Portugal.

> **Estado (29-10-2026): candidato em validação, não aprovado para uma nova release.** A produção em [find4sport.vercel.app](https://find4sport.vercel.app) pode estar num commit anterior ao candidato [PR #34](https://github.com/ist174039/find4sport/pull/34). Não confundir deployment `READY` antigo com aceitação do novo código.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind
- Supabase (Postgres, RLS, Auth e Storage)
- Stripe / Stripe Connect; Vercel; GitHub Actions
- Node.js **24** para CI, testes e build; Playwright (Chromium desktop e mobile)

## Primeiro arranque (desenvolvimento)

1. Obter acesso ao repositório e à documentação do projeto; usar Node.js 24 e npm.
2. `npm ci`
3. Copiar `.env.example` para um ficheiro local de ambiente **não versionado** e configurar apenas valores do ambiente autorizado. A amostra lista o URL Supabase, a chave pública e a chave opcional Google Places. Outros segredos e integrações devem ser fornecidos pelo responsável através do gestor de segredos, nunca por mensagens ou commits.
4. `npm run dev` — desenvolvimento em `http://localhost:8081`.
5. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

Os testes de contrato SQL requerem **PostgreSQL descartável** preparado para testes:
```bash
npm run test:postgres:discovery
npm run test:postgres:profile-grants
npm run test:postgres:event-write-boundary
```
Consultar `.github/workflows/quality.yml` para a configuração verificada de CI. **Não apontar os testes destrutivos à base Supabase existente.**

## E2E e perfis de teste

```bash
npm run test:e2e:desktop
npm run test:e2e:mobile
```

O runner usa `E2E_BASE_URL` (na ausência de valor, o endereço público de produção). Antes de efetuar E2E autenticado, configurar **contas exclusivamente sintéticas e ambiente autorizado**. O workflow `.github/workflows/e2e-smoke.yml` exige credenciais por papel (`ATHLETE`, `PROFESSIONAL`, `VENUE_MANAGER`, `ADMIN`) como GitHub Actions secrets; nunca colocar passwords no código ou em evidências. Não remover o gate para obter um falso verde.

## Estado da base de dados

- Referência de projeto utilizada pelo baseline do repositório: `bqjwsllnhvnxrfojftjb` — confirmar titularidade/organização e autorização antes de alterações.
- Migrações controladas em `supabase/migrations/`; integridade estática em `node scripts/check-migrations.mjs`.
- **`node scripts/check-migrations.mjs --release` só passa quando as condições reais de release estão cumpridas**; um check estático verde não prova migrations aplicadas.
- A restrição de colunas em `20261025221000_restrict_profile_table_select_columns` permanece **`not_applied`** e bloqueia a release. A restrição de escrita direta em eventos foi **aplicada e verificada** no Supabase ligado, versão remota `20261029091404_20261025224500_revoke_browser_event_insert`, com `anon`/`authenticated` sem INSERT e `service_role` com INSERT. Não declarar a validação de todos os fluxos apenas pela ACL.

## Guias essenciais

- [Runbook de produção](docs/PRODUCTION_RUNBOOK.md)
- [Gate de prontidão](docs/production-readiness-gate.md)
- [Dossiê de evidência](docs/MARKET_READINESS_EVIDENCE_2026-10-25.md)
- [Privacidade e continuidade](docs/PRIVACY_CONTINUITY_VALIDATION.md)
- [Limites de código e servidor](docs/CODE_BOUNDARIES.md)
- [Checklist de passagem ao parceiro](docs/PARTNER_HANDOVER_2026-10-29.md)
- [Project Definition & Delivery no Notion](https://app.notion.com/p/3ffbe9392b6081a29f8fea0b5300f9e8)

## Política de release

**NO-GO** enquanto faltarem E2E autenticados em desktop/mobile, confirmação de Auth/RLS/Storage, migrações e proveniência verificadas, testes de pagamentos Stripe em modo de teste, proteção de passwords, recuperação/rollback, privacidade, revisão de acessibilidade e aprovação do responsável.

Não conceder acesso indiscriminado a GitHub, Supabase, Vercel ou Stripe ao parceiro antes do acordo de propriedade, responsabilidades e tratamento de dados. O repositório ser público **não comprova** direitos de transferência da propriedade intelectual.
