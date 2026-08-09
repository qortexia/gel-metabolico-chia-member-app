# Login por código OTP de 6 dígitos (design)

Status: design aprovado, pronto para virar plano de implementação.
Data: 2026-08-09

## Contexto e urgência

O fluxo de magic link atual (`SuccessScreen.tsx` → `signInWithOtp` com `emailRedirectTo` →
`/auth/callback`) falha de forma silenciosa e intermitente: o link do email aponta primeiro para
o próprio endpoint `/auth/v1/verify` do Supabase, que é **de uso único**. Se qualquer coisa
(scanner de segurança de email corporativo tipo Outlook Safe Links, pré-visualização automática,
ou simplesmente um segundo clique) consumir esse token antes do usuário completar o fluxo, a tela
mostra "No pudimos completar tu acceso" sem nenhuma forma de recuperação — o usuário tem que
recomeçar o cadastro do zero.

**Confirmado em produção, hoje**: Vinícius (parceiro, testando o app) recebeu exatamente esse erro
ao tentar entrar após se cadastrar — não é só uma preocupação teórica.

A correção — recomendação oficial do Supabase para esse problema — é trocar o link clicável por um
**código numérico de 6 dígitos que o usuário digita manualmente**. Sem link, nada para um scanner
pré-visitar.

## Decisões tomadas (brainstorming 2026-08-09)

| Pergunta | Decisão |
|---|---|
| Onde entra a tela de código | Estende o `SuccessScreen` existente com um novo estado — sem tela/rota nova. |
| Formato do campo | Um único campo de texto (6 dígitos, `inputMode="numeric"`), não 6 caixinhas separadas. |
| Verificação | `supabase.auth.verifyOtp({ email, token, type: 'email' })` — estabelece sessão direto no navegador, sem redirect. |
| Criação de perfil + navegação | Extraída para uma função compartilhada, reaproveitável. |
| `/auth/callback` | Deletado (página + teste) — vira código morto, nada mais aponta para ele. |
| Reenvio | Link simples "¿No llegó? Reenviar código", só chama `signInWithOtp` de novo. Sem cooldown customizado — deixa o rate-limit do Supabase aparecer como erro se for o caso. |
| Página de destino após login | `/app/recipe` (Receta), não `/app` (Início) — tanto para perfil novo quanto perfil existente. |
| Template de email (Supabase dashboard) | Eduardo edita manualmente depois da implementação, removendo o link clicável e deixando só `{{ .Token }}`. Conteúdo de referência incluído abaixo. |

## Arquitetura

### `SuccessScreen.tsx` — máquina de estados estendida

Estados: `idle` (formulário de email) → `sending` → **`code-sent`** (novo) → `verifying` (novo,
enquanto confirma o código) → `code-error` (novo, código errado/expirado, mantém o formulário
disponível) | `error` (falha ao enviar o email, como já existe hoje).

Nos estados `code-sent` e `verifying`, a tela mostra:
- Um campo de texto para o código (`type="text"`, `inputMode="numeric"`, `maxLength={6}`,
  `aria-label="Código de 6 dígitos"`), desabilitado durante `verifying`.
- Botão "Confirmar" — texto vira "Confirmando…" e fica desabilitado durante `verifying` (mesmo
  padrão já usado no botão de envio: `status === 'sending' ? 'Enviando…' : ...`).
- Link/botão "¿No llegó? Reenviar código" — chama `signInWithOtp` de novo com o mesmo email já
  digitado, volta para `sending` → `code-sent`.

No estado `code-error`, a mesma tela de `code-sent` reaparece (campo + botões), com a mensagem de
erro adicional abaixo do campo.

Ao confirmar:
```ts
const { data, error } = await supabase.auth.verifyOtp({
  email: email.trim(),
  token: code.trim(),
  type: 'email',
});
```
- Se `error`: estado `code-error`, mostra "Código incorrecto o expirado. Intenta de nuevo.", mantém
  o campo de código editável (não limpa o email nem obriga a recomeçar).
- Se sucesso: `data.user` já vem na resposta — chama a função compartilhada de conclusão de login
  (ver abaixo) passando esse usuário, sem precisar de `getUser()` extra.

### Função compartilhada: completar login

Nova função (ex: `src/lib/completeSignIn.ts`), extraída da lógica que hoje vive só em
`callback/page.tsx`:

```ts
export async function completeSignIn(
  supabase: SupabaseClient,
  user: User,
  router: AppRouterInstance
): Promise<{ error: boolean }> {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (existing) {
    router.push('/app/recipe');
    return { error: false };
  }

  const answers = readStoredAnswers(); // localStorage, mesma lógica já existente
  if (!answers) return { error: true };

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    nombre: answers.nombre ?? INITIAL_ONBOARDING_ANSWERS.nombre,
    peso: answers.peso,
    estatura: answers.estatura,
    edad: answers.edad,
    horario_hambre: answers.horarioHambre,
    antojo_dulce: answers.antojoDulce,
    meta_peso: answers.metaPeso,
    hora_despertar: answers.horaDespertar,
  });
  if (insertError) return { error: true };

  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  router.push('/app/recipe');
  return { error: false };
}
```

`SuccessScreen` chama essa função após `verifyOtp` ter sucesso; se ela retornar `{ error: true }`,
mostra a mesma mensagem de erro genérica ("No pudimos completar tu acceso...") no lugar do
formulário, mantendo o padrão visual já usado no app.

### O que é removido

- `src/app/auth/callback/page.tsx` e `page.test.tsx` — deletados. Nenhum outro lugar do app aponta
  para `/auth/callback` depois dessa mudança (o `emailRedirectTo` também deixa de ser passado para
  `signInWithOtp`, já que não há mais redirect nenhum no fluxo).
- As Redirect URLs configuradas no Supabase (`/auth/callback`) ficam sem uso mas inofensivas — não
  é necessário remover, só deixar de depender delas.

## Conteúdo de referência para o template de email (Supabase dashboard)

Para Eduardo colar em **Authentication → Email Templates → Magic Link**, removendo o botão/link
`{{ .ConfirmationURL }}` e deixando só o código:

```
Assunto: Tu código para entrar — {{ .Token }}

Corpo:
¡Hola!

Tu código para entrar a tu Protocolo Gel Metabólico de Chía es:

{{ .Token }}

Ingresa este código en la app. El código expira en unos minutos — si no lo usaste a tiempo,
puedes pedir uno nuevo desde la app.

Si no solicitaste este código, puedes ignorar este correo.
```

## Testes

Mesmo padrão já usado no resto do projeto — Vitest + Testing Library, mock de
`supabase.auth.signInWithOtp` e `supabase.auth.verifyOtp`, mock de `next/navigation`. Casos a
cobrir em `SuccessScreen.test.tsx`:
- Envio do código (estado `idle` → `code-sent`), mostrando o campo de código.
- Reenvio de código a partir de `code-sent`.
- Confirmação com código correto → chama `completeSignIn`, navega para `/app/recipe`.
- Código errado → mostra erro, mantém o campo editável.
- `completeSignIn` retornando erro (ex: sem dados de onboarding salvos) → mostra erro.

`completeSignIn` ganha seu próprio arquivo de teste (`completeSignIn.test.ts`), cobrindo os casos
que hoje estão espalhados em `callback/page.test.tsx`: perfil já existe, perfil novo criado com
sucesso, falha ao criar perfil (não apaga o localStorage).

## Fora de escopo (YAGNI)

- Cooldown/temporizador customizado para reenvio — deixa o rate-limit nativo do Supabase aparecer
  como erro.
- UI de 6 caixinhas separadas para o código — um campo de texto único é suficiente e mais simples.
- Suporte a login por magic link como alternativa ao código (fica só o código, ponto — é
  justamente o link que causa o problema).
