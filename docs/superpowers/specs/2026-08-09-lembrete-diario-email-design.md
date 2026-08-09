# Fase 4 — Lembrete diário por email (design)

Status: design aprovado, pronto para virar plano de implementação.
Data: 2026-08-09

Este documento fecha o design da Fase 4 do `app-membro-design.md` ("lembrete diário por email"),
substituindo a versão preliminar daquele doc — que assumia fuso `America/Sao_Paulo` e "produto é
Brasil-only", incorreto: o produto inteiro (onboarding, quiz-app, marketing) é espanhol ES-MX,
voltado a México.

---

## Contexto e propósito

O usuário completa o onboarding, recebe o protocolo personalizado e usa o app por 21 dias
(check-in, receta, progreso). Sem lembrete nenhum, o hábito diário de tomar a dose depende só de o
usuário lembrar sozinho de abrir o app. Este email resolve isso: um lembrete diário, no horário que
o próprio usuário informou no onboarding (`hora_despertar`), com link direto pro app.

---

## Decisões tomadas (brainstorming 2026-08-09)

| Pergunta | Decisão |
|---|---|
| Fuso horário | Fixo: `America/Mexico_City` para todos os usuários — sem captura de fuso no onboarding. Erra por 1-2h para quem mora em Baja California/Quintana Roo (fusos diferentes dentro do México), aceitável para o MVP. |
| Depois do dia 21 | Para de mandar automaticamente — perfis com mais de 21 dias corridos desde `protocol_start_date` são ignorados pela function. |
| Opt-out | Sim — toggle simples no app, coluna nova `reminders_enabled` em `profiles`. |
| Onde fica o toggle | Junto do `ResetProtocolButton`, no topo da aba Início — sem criar rota/página nova. |
| Link do email | Link fixo pro app (`https://www.protocologelmetabolicodechia.com/app`), não um magic link gerado por envio. Sessões do Supabase duram semanas; se expirada, cai na tela de login normal. |
| Mecanismo de agendamento | Supabase Edge Function + `pg_cron` a cada ~15 min (confirma a decisão original do `app-membro-design.md`) — evita o limite do Vercel Cron no plano Hobby (1x/dia) e não introduz custo novo. |

---

## Arquitetura

### Dados

Migration nova `supabase/migrations/0003_reminders_enabled.sql`:

```sql
alter table public.profiles
  add column if not exists reminders_enabled boolean not null default true;
```

Sem RLS nova necessária — a coluna vive na tabela `profiles`, que já tem RLS própria
(`auth.uid() = id`), e a Edge Function acessa via service role (bypassa RLS por design, é
server-to-server).

### Edge Function: `send-daily-reminders`

`supabase/functions/send-daily-reminders/index.ts`, Deno, chamada por `pg_cron` a cada ~15 min.

Fluxo a cada execução:

1. Calcula a hora atual em `America/Mexico_City` (usando `Intl.DateTimeFormat` nativo do Deno, sem
   lib externa).
2. Query em `profiles`: `reminders_enabled = true` E `hora_despertar` cai na janela
   `[agora - 15min, agora)` (ou seja: o horário salvo já passou, mas há no máximo 15 minutos —
   cobre exatamente uma vez cada `hora_despertar`, sem lacuna e sem duplicata entre execuções
   consecutivas do cron) E (`last_reminder_sent_at` é null OU não é hoje) E dias corridos desde
   `protocol_start_date` ≤ 21.
3. Para cada perfil elegível: chama a API REST do Resend (`POST https://api.resend.com/emails`)
   com o template abaixo. Se a resposta for de sucesso, atualiza `last_reminder_sent_at = hoje`
   naquele perfil.
4. Falha no envio de **um** perfil não interrompe o lote — loga o erro (`console.error`, aparece
   nos logs da function no painel Supabase) e segue para o próximo perfil.
5. Falha na query inicial (banco fora do ar, etc.) derruba a execução inteira — sem retry manual
   dentro da function; o próximo ciclo do `pg_cron` (15 min depois) tenta de novo naturalmente.

**Autenticação:** a function usa a **service role key** do Supabase (não a anon key), guardada
como secret da própria function (`supabase secrets set RESEND_SERVICE_ROLE_KEY=...` ou reaproveitando
o secret padrão `SUPABASE_SERVICE_ROLE_KEY` que toda Edge Function já recebe automaticamente do
ambiente Supabase). `RESEND_API_KEY` é outro secret da function, também setado via
`supabase secrets set` — **nunca** vai para o `.env`/Vercel do Next.js, correção do
`app-membro-design.md` original, que colocava essa variável na tabela de env vars do app por
engano (ela nunca é lida pelo lado Next.js).

### Agendamento (`pg_cron`)

```sql
select cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := '<project-ref>.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
  );
  $$
);
```

(Sintaxe exata a confirmar na implementação — depende de como o projeto expõe a service role key
pro `pg_cron` chamar a function via `net.http_post`; é o padrão documentado pelo próprio Supabase
para "Edge Function + Cron".)

**Pré-requisito a verificar antes de implementar:** confirmar que a extensão `pg_cron` está
disponível/habilitada no plano atual do projeto Supabase (geralmente requer plano pago, não o free
tier). Primeiro passo do plano de implementação.

### Toggle de opt-out

Componente novo `src/components/app/RemindersToggle.tsx`, ao lado do `ResetProtocolButton` no topo
de `src/app/app/page.tsx`. Client Component, mesmo padrão dos outros: escreve
`reminders_enabled` via `createClient()` de `@/lib/supabase/client`, chama `router.refresh()`
depois de salvar. Estado inicial vem de `profile.reminders_enabled` (via `getCurrentProfile`, que
precisa incluir a nova coluna no tipo `Profile`).

---

## Conteúdo do email

Remetente: `Protocolo Gel Metabólico de Chía <protocolo@protocologelmetabolicodechia.com>` — mesmo
domínio já verificado no Resend, mesmo usado pro magic link de auth (confirmado funcionando nesta
sessão).

**Assunto:** `Es hora de tu dosis de hoy 🌱`

**Corpo (HTML simples, sem framework de template — string literal na function):**

```
¡Hola, {nombre}!

Es hora de tu dosis de hoy — {hora_despertar}, 30 minutos antes de tu comida.

[Botón: VER MI PROTOCOLO → https://www.protocologelmetabolicodechia.com/app]

💡 Consejo del Dr. Renan: la constancia es lo que hace la diferencia — un día a la vez.

¿Ya no quieres recibir este recordatorio? Puedes desactivarlo desde tu app, en Início.
```

Estilo visual: reaproveita os tokens do app (fundo `#FAF6EE`, dourado `#C9A227` no botão, texto
`#2B2013`) via HTML/CSS inline — email não pode depender do Tailwind do app.

---

## Testes

Edge Functions rodam em Deno, fora do ambiente Vitest do resto do projeto. Divisão proposta:

- **Lógica pura, testável com Vitest** (sem imports do Deno): uma função
  `isEligibleForReminder(profile, nowInMexicoCity)` extraída para `src/lib/reminders.ts` — mesmo
  padrão de `src/lib/dose.ts`/`src/lib/achievements.ts` já usado no resto do app. Cobre: janela de
  15 min ao redor de `hora_despertar`, `last_reminder_sent_at` já é hoje, dia > 21,
  `reminders_enabled = false`. A Edge Function importa essa mesma lógica (Deno consegue importar
  TS puro sem dependência de Node/Deno-específica).
- **A function em si** (query real + chamada HTTP ao Resend): sem teste automatizado, mesma
  filosofia já usada para as migrations SQL deste projeto — verificação manual após deploy.
- **`RemindersToggle.tsx`**: testado normalmente com Vitest + Testing Library, mesmo padrão de
  `ResetProtocolButton.test.tsx`.

---

## Fora de escopo (YAGNI para este MVP)

- Captura de fuso horário por usuário (fuso fixo cobre o MVP).
- Outros canais (push, WhatsApp) — já descartados no brainstorming original do `app-membro-design.md`.
- Link de login automático no email (magic link por envio) — link fixo é suficiente dado que as
  sessões duram semanas.
- Email de "parabéns, completou os 21 dias" — os lembretes simplesmente param; um email de
  conclusão fica para uma iteração futura, se quiserem.
- Retry automático dentro da function em caso de falha do Resend para um usuário — o próximo ciclo
  de 15 min não vai re-tentar esse usuário específico no mesmo dia (já que a lógica de elegibilidade
  é por janela de horário, não por "ainda não recebeu"), então uma falha do Resend nesse dia
  específico significa que aquele usuário simplesmente não recebe o lembrete naquele dia. Aceitável
  para o MVP; vale monitorar a taxa de erro do Resend nos logs se quiser refinar depois.
