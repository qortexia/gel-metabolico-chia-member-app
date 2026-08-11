# Página de obrigado pós-compra (design)

Status: design aprovado, pronto para virar plano de implementação.
Data: 2026-08-11

## Contexto

O quiz-app redireciona para o checkout da Kiwify (`pay.kiwify.com`), mas hoje não existe nenhuma
página de pós-compra — nem a Kiwify aponta para lugar nenhum depois do pagamento confirmado. Como
o `/` do member-app já é o funil de onboarding (peso, altura, horários, etc.) que termina na tela
de cadastro por código OTP (`SuccessScreen`), "acessar o protocolo" para um cliente novo significa
começar esse funil — não existe uma tela de "login" separada e mais simples.

## Decisões tomadas (brainstorming 2026-08-11)

| Pergunta | Decisão |
|---|---|
| Onde a página mora | Nova rota dentro do member-app (mesmo domínio `protocologelmetabolicodechia.com`), não no quiz-app nem em projeto separado. |
| Conteúdo | Só confirmação de compra + botão de CTA — sem instruções passo a passo, sem personalização com nome do cliente. |
| Slug da rota | `/gracias` (app é 100% em espanhol para o México, mesmo padrão de `SuccessScreen`). |
| Destino do CTA | `/` — início do funil de onboarding do member-app (não existe rota de "login" separada). |
| Personalização via query string (ex: `?name=`) | Fora de escopo — a Kiwify não garante isso de forma confiável na URL de redirecionamento nativa, sem integração via webhook. |
| Verificação de compra real | Fora de escopo — é uma página informativa, não um gate. Qualquer pessoa pode acessar `/gracias` diretamente, sem consequência (não expõe nem desbloqueia nada). |
| Configuração da Kiwify | Fora do código — Eduardo configura manualmente no painel da Kiwify a "thank you page" apontando para essa URL, depois do deploy. |

## Arquitetura

### Rota: `src/app/gracias/page.tsx`

Componente de servidor estático (sem estado, sem client-side JS necessário — ao contrário de
`SuccessScreen`, que precisa de estado por causa do fluxo de OTP). Reaproveita os mesmos tokens
visuais já usados nas telas de onboarding (`bg-background`, `font-serif`, `text-brand`,
`text-neutral-600`, botão `rounded-full bg-brand`), para parecer parte do mesmo produto.

Conteúdo:
```
🎉

¡Gracias por tu compra!

Tu protocolo personalizado te espera — solo faltan 2 minutos para configurarlo.

[COMENZAR MI PROTOCOLO]  → link para "/"
```

Estrutura de exemplo (classes reaproveitadas de `SuccessScreen.tsx`):
```tsx
export default function GraciasPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">🎉</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        ¡Gracias por tu compra!
      </h1>
      <p className="mt-3 text-neutral-600">
        Tu protocolo personalizado te espera — solo faltan 2 minutos para configurarlo.
      </p>
      <Link
        href="/"
        className="mt-6 min-h-[44px] w-full max-w-xs rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground flex items-center justify-center"
      >
        COMENZAR MI PROTOCOLO
      </Link>
    </div>
  );
}
```

Usa `next/link` (não `<a>`), consistente com o resto do app Next.js.

## Testes

Mesmo padrão do resto do projeto — Vitest + Testing Library. Só precisa cobrir:
- A página renderiza o título de confirmação.
- O botão de CTA é um link (`href="/"`).

Sem mocks necessários — não há chamada a Supabase nem estado.

## Fora de escopo (YAGNI)

- Personalização com nome/dados do cliente vindos de query string.
- Verificação/validação de que uma compra realmente aconteceu.
- Pixel de conversão (Meta/Google Ads) — hoje não existe nenhuma integração de pixel no funil
  (`quiz-app/src/lib/analytics.ts` é um provider vazio, sem `fbq`/`gtag` conectado); adicionar isso
  aqui seria escopo novo, não parte desta página.
- Configurar a URL de "thank you page" no painel da Kiwify — passo manual do Eduardo, fora do código.
