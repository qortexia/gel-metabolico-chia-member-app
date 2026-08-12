# Upsell + downsell pages (design)

Status: design aprovado, pronto para virar plano de implementação.
Data: 2026-08-12

## Contexto

Depois do checkout principal na Kiwify, o cliente hoje vai direto para `/gracias`. Eduardo quer
inserir uma oferta adicional (upsell) e, se recusada, uma oferta mais barata (downsell) antes da
página de obrigado — fluxo clássico de funil pós-compra.

Fluxo final:

```
checkout Kiwify (produto principal)
  → /upsell   (Protocolo 90 Días, $297 MXN)
      "sí, quiero"  → checkout Kiwify do upsell (pay.kiwify.com/RfpEvfO)
      "no, gracias" → /downsell
  → /downsell (Kit de Apoyo, $197 MXN)
      "sí, quiero"  → checkout Kiwify do downsell (pay.kiwify.com/IeqleVF)
      "no, gracias" → /gracias
```

O conteúdo de cada oferta vem dos PDFs reais dos produtos, já escritos:
`Mounjaro de Chia/upsell/protocolo gel de la saciedad/Upsell1_Protocolo_90_Dias.pdf` e
`.../Upsell2_Kit_de_Apoyo.pdf`. As imagens promocionais já existem nessa mesma pasta:
`Upsell_Protocolo_90_dias.png` e `Lista.png`.

## Decisões tomadas (brainstorming 2026-08-11/12)

| Pergunta | Decisão |
|---|---|
| Cobrança do upsell/downsell | Link para um checkout separado da Kiwify (mesmo padrão do funil principal) — não é one-click. |
| Estrutura de código | Componente compartilhado `OfferPage` (título, subtítulo, imagem, preço, benefícios, botão aceitar, botão recusar via props), reaproveitado pelas duas rotas — evita duplicar a mesma estrutura visual duas vezes. |
| Rotas | `/upsell` (Protocolo 90 Días) e `/downsell` (Kit de Apoyo), no member-app (mesmo domínio do `/gracias`). |
| Texto dos botões | "Aceitar" nomeia o produto (ex: "SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS"), nunca "comprar" — mesmo padrão de `SuccessScreen`/`/gracias`. "Recusar" é um link discreto abaixo do botão principal: "No, gracias. Continuar →". |
| Destino do "no, gracias" no `/upsell` | `/downsell` — não pula direto para `/gracias`. |
| Destino do "no, gracias" no `/downsell` | `/gracias` diretamente (já que é a última oferta do funil). |
| Imagens | `next/image` (não `<img>` cru) — arquivos estáticos em `public/upsell/`, servidos localmente. |
| Aviso "Material educativo..." (presente nos PDFs originais) | Fora de escopo por decisão do Eduardo — não entra nas páginas por enquanto. |
| Depois do checkout do upsell/downsell ser pago | Configuração manual na Kiwify (thank you URL de cada checkout apontando para o próximo passo do funil) — fora do código, mesmo padrão já usado para o `/gracias` original. |
| Checkout principal apontar para `/upsell` em vez de `/gracias` | Também configuração manual na Kiwify, fora do código. |

## Conteúdo de cada página

### `/upsell` — Protocolo 90 Días ($297 MXN)

- Título: "PROTOCOLO 90 DÍAS"
- Subtítulo: "Las tres fases: adaptación, resultado y mantenimiento"
- Benefícios (resumidos do PDF `Upsell1_Protocolo_90_Dias.pdf`):
  - "Fase 1 — Adaptación (días 1 a 30): instala el hábito sin esfuerzo."
  - "Fase 2 — Resultado (días 31 a 60): movimiento, estructura de comidas y registro semanal."
  - "Fase 3 — Mantenimiento (días 61 a 90): uso estratégico del gel para sostener el resultado."
- Imagem: `public/upsell/protocolo-90-dias.png` (cópia de
  `Mounjaro de Chia/upsell/protocolo gel de la saciedad/Upsell_Protocolo_90_dias.png`)
- Botão aceitar: "SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS" → `https://pay.kiwify.com/RfpEvfO`
- Botão recusar: "No, gracias. Continuar →" → `/downsell`

### `/downsell` — Kit de Apoyo ($197 MXN)

- Título: "KIT DE APOYO"
- Subtítulo: "Las herramientas para no fallar"
- Benefícios (os 5 itens do PDF `Upsell2_Kit_de_Apoyo.pdf`):
  - "Lista de compras semanal"
  - "Rastreador de 21 días"
  - "Guía para comer fuera"
  - "Las 12 sustituciones"
  - "Recordatorios para imprimir"
- Imagem: `public/upsell/kit-de-apoyo.png` (cópia de
  `Mounjaro de Chia/upsell/protocolo gel de la saciedad/Lista.png`)
- Botão aceitar: "SÍ, QUIERO MI KIT DE APOYO" → `https://pay.kiwify.com/IeqleVF`
- Botão recusar: "No, gracias. Continuar →" → `/gracias`

## Arquitetura

### `src/components/offer/OfferPage.tsx` — componente compartilhado, sem estado

```tsx
type OfferPageProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  priceLabel: string;
  benefits: string[];
  acceptHref: string;
  acceptLabel: string;
  declineHref: string;
  declineLabel: string;
};

export function OfferPage({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  priceLabel,
  benefits,
  acceptHref,
  acceptLabel,
  declineHref,
  declineLabel,
}: OfferPageProps) {
  // layout: título (font-serif, text-foreground) + subtítulo (text-neutral-600)
  // + Image (next/image, width/height fixos, className rounded-card)
  // + lista de benefícios (ul, um <li> por item)
  // + priceLabel em destaque (text-brand, font-bold)
  // + Link acceptHref com className igual aos outros CTAs do app
  //   (rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground)
  // + Link declineHref como texto discreto abaixo
  //   (text-sm text-neutral-500 underline, mesmo padrão de "¿No llegó? Reenviar código")
}
```

Reaproveita os mesmos tokens visuais já usados em `/gracias` e `SuccessScreen`
(`bg-background`, `font-serif`, `text-brand`, `rounded-full bg-brand`), para manter consistência
visual com o resto do funil.

### `src/app/upsell/page.tsx` e `src/app/downsell/page.tsx`

Cada um é um componente de servidor estático (sem `'use client'`, sem estado) que só chama
`<OfferPage {...props} />` com o conteúdo específico listado acima. Usam `next/link` via `href`
absoluto para os links externos da Kiwify e relativo (`/downsell`, `/gracias`) para os internos —
mesmo padrão já usado em `/gracias`.

## Testes

Mesmo padrão do resto do projeto — Vitest + Testing Library, sem mocks (não há estado nem chamada
externa).

`OfferPage.test.tsx`:
- Renderiza título, subtítulo e preço recebidos via props.
- Renderiza todos os itens da lista de benefícios.
- O link de aceitar tem o `href` recebido via prop.
- O link de recusar tem o `href` recebido via prop.

`upsell/page.test.tsx`:
- Título "PROTOCOLO 90 DÍAS" aparece.
- Link "SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS" aponta para `https://pay.kiwify.com/RfpEvfO`.
- Link "No, gracias. Continuar →" aponta para `/downsell`.

`downsell/page.test.tsx`:
- Título "KIT DE APOYO" aparece.
- Link "SÍ, QUIERO MI KIT DE APOYO" aponta para `https://pay.kiwify.com/IeqleVF`.
- Link "No, gracias. Continuar →" aponta para `/gracias`.

## Fora de escopo (YAGNI)

- Aviso "Material educativo..." nas páginas — decisão explícita do Eduardo de deixar de fora por
  agora.
- One-click upsell nativo da Kiwify — cada oferta usa um checkout separado, cliente digita os
  dados de novo.
- Configurar no painel da Kiwify: (1) o checkout principal apontando para `/upsell` em vez de
  `/gracias`; (2) a "thank you URL" dos checkouts de upsell/downsell. Ambos manuais, feitos pelo
  Eduardo depois do deploy.
- Personalização, verificação de compra ou pixels de conversão nessas páginas — mesmo raciocínio
  já aplicado ao `/gracias`.
