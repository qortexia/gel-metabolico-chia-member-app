# Upsell + downsell pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Insert two post-checkout offer pages (`/upsell` for "Protocolo 90 Días", `/downsell` for "Kit de Apoyo") between the main Kiwify checkout and `/gracias`, each with an accept link to its own Kiwify checkout and a decline link that advances the funnel.

**Architecture:** A single stateless, prop-driven `OfferPage` component holds the shared visual structure (title, subtitle, image, benefits list, price, accept/decline links). Two thin route pages (`/upsell`, `/downsell`) each call it with their own copy and links — no duplication of markup or styling between the two offers.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, `next/image`, `next/link`, Vitest + Testing Library (existing project stack — no new dependencies).

## Global Constraints

- Route slugs are `/upsell` and `/downsell` exactly (spec: `docs/superpowers/specs/2026-08-12-upsell-downsell-design.md`).
- All user-facing copy is in Spanish (Mexico).
- Accept-button copy always names the product (e.g. "SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS") — never the word "comprar".
- Decline-link copy is exactly "No, gracias. Continuar →" on both pages, styled as a discreet text link below the accept button (not a second full-size button).
- `/upsell`'s decline link goes to `/downsell`. `/downsell`'s decline link goes to `/gracias`.
- Images are served via `next/image` from local files in `public/upsell/`, not a raw `<img>` tag.
- No medical/educational disclaimer text on these pages — explicitly decided against.
- No query-string personalization, no purchase verification, no analytics/pixel wiring.

---

### Task 1: `OfferPage` shared component

**Files:**
- Create: `src/components/offer/OfferPage.tsx`
- Test: `src/components/offer/OfferPage.test.tsx`

**Interfaces:**
- Produces: named export `OfferPage(props: OfferPageProps)` from `src/components/offer/OfferPage.tsx`, where:
  ```ts
  type OfferPageProps = {
    title: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
    imageWidth: number;
    imageHeight: number;
    priceLabel: string;
    benefits: string[];
    acceptHref: string;
    acceptLabel: string;
    declineHref: string;
    declineLabel: string;
  };
  ```
  Tasks 2 and 3 import `{ OfferPage }` from `@/components/offer/OfferPage` and pass all twelve props.
- Consumes: nothing from other tasks — this is the first task.

- [ ] **Step 1: Write the failing test**

Create `src/components/offer/OfferPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferPage } from './OfferPage';

const baseProps = {
  title: 'PROTOCOLO 90 DÍAS',
  subtitle: 'Las tres fases: adaptación, resultado y mantenimiento',
  imageSrc: '/upsell/protocolo-90-dias.png',
  imageAlt: 'Protocolo 90 Días',
  imageWidth: 1024,
  imageHeight: 1536,
  priceLabel: '$297 MXN',
  benefits: ['Fase 1 — Adaptación', 'Fase 2 — Resultado', 'Fase 3 — Mantenimiento'],
  acceptHref: 'https://pay.kiwify.com/RfpEvfO',
  acceptLabel: 'SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS',
  declineHref: '/downsell',
  declineLabel: 'No, gracias. Continuar →',
};

describe('OfferPage', () => {
  it('muestra el título, subtítulo y precio', () => {
    render(<OfferPage {...baseProps} />);
    expect(screen.getByText('PROTOCOLO 90 DÍAS')).toBeInTheDocument();
    expect(
      screen.getByText('Las tres fases: adaptación, resultado y mantenimiento')
    ).toBeInTheDocument();
    expect(screen.getByText('$297 MXN')).toBeInTheDocument();
  });

  it('muestra todos los beneficios', () => {
    render(<OfferPage {...baseProps} />);
    baseProps.benefits.forEach((benefit) => {
      expect(screen.getByText(benefit)).toBeInTheDocument();
    });
  });

  it('el enlace de aceptar apunta al href recibido', () => {
    render(<OfferPage {...baseProps} />);
    expect(
      screen.getByText('SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS').closest('a')
    ).toHaveAttribute('href', 'https://pay.kiwify.com/RfpEvfO');
  });

  it('el enlace de rechazar apunta al href recibido', () => {
    render(<OfferPage {...baseProps} />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/downsell'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/offer/OfferPage.test.tsx`
Expected: FAIL — `Cannot find module './OfferPage'` (the component doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/components/offer/OfferPage.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';

type OfferPageProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
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
  imageWidth,
  imageHeight,
  priceLabel,
  benefits,
  acceptHref,
  acceptLabel,
  declineHref,
  declineLabel,
}: OfferPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10 text-center">
      <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 text-neutral-600">{subtitle}</p>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        className="mt-6 h-auto w-full max-w-xs rounded-card"
      />
      <ul className="mt-6 w-full max-w-xs list-none text-left text-neutral-600">
        {benefits.map((benefit) => (
          <li key={benefit} className="mt-2">
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-2xl font-bold text-brand">{priceLabel}</p>
      <Link
        href={acceptHref}
        className="mt-4 flex min-h-[44px] w-full max-w-xs items-center justify-center rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground"
      >
        {acceptLabel}
      </Link>
      <Link href={declineHref} className="mt-3 text-sm text-neutral-500 underline">
        {declineLabel}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/offer/OfferPage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Run full suite + tsc + lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/components/offer/OfferPage.tsx src/components/offer/OfferPage.test.tsx
git commit -m "feat: add shared OfferPage component for upsell/downsell"
```

---

### Task 2: `/upsell` page — Protocolo 90 Días

**Files:**
- Create: `public/upsell/protocolo-90-dias.png` (binary copy, see Step 1)
- Create: `src/app/upsell/page.tsx`
- Test: `src/app/upsell/page.test.tsx`

**Interfaces:**
- Consumes: `OfferPage` from `@/components/offer/OfferPage` (Task 1) — imports and renders it with the twelve props defined there.
- Produces: default-exported React component `UpsellPage` at route `src/app/upsell/page.tsx` — Task 3 does not depend on this, but the human partner's Kiwify dashboard configuration (out of scope) will point the main checkout here.

- [ ] **Step 1: Copy the image asset**

The source file lives outside the repo, in the shared project folder:

```bash
mkdir -p public/upsell
cp "../upsell/protocolo gel de la saciedad/Upsell_Protocolo_90_dias.png" public/upsell/protocolo-90-dias.png
```

Run this from the `member-app` repo root. If the relative path doesn't resolve (working directory
differs), use the absolute path:
`H:\Second_Brain\03-Dev\Projetos_Pessoal\Mounjaro de Chia\upsell\protocolo gel de la saciedad\Upsell_Protocolo_90_dias.png`.
Confirm the copy worked: `ls -la public/upsell/protocolo-90-dias.png` should show a ~2.3MB file.

- [ ] **Step 2: Write the failing test**

Create `src/app/upsell/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UpsellPage from './page';

describe('UpsellPage', () => {
  it('muestra el título de la oferta', () => {
    render(<UpsellPage />);
    expect(screen.getByText('PROTOCOLO 90 DÍAS')).toBeInTheDocument();
  });

  it('el botón de aceptar lleva al checkout del upsell', () => {
    render(<UpsellPage />);
    expect(
      screen.getByText('SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS').closest('a')
    ).toHaveAttribute('href', 'https://pay.kiwify.com/RfpEvfO');
  });

  it('el botón de rechazar lleva al downsell', () => {
    render(<UpsellPage />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/downsell'
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/app/upsell/page.test.tsx`
Expected: FAIL — `Cannot find module './page'` (the page doesn't exist yet).

- [ ] **Step 4: Write minimal implementation**

Create `src/app/upsell/page.tsx`:

```tsx
import { OfferPage } from '@/components/offer/OfferPage';

export default function UpsellPage() {
  return (
    <OfferPage
      title="PROTOCOLO 90 DÍAS"
      subtitle="Las tres fases: adaptación, resultado y mantenimiento"
      imageSrc="/upsell/protocolo-90-dias.png"
      imageAlt="Protocolo 90 Días — las tres fases"
      imageWidth={1024}
      imageHeight={1536}
      priceLabel="$297 MXN"
      benefits={[
        'Fase 1 — Adaptación (días 1 a 30): instala el hábito sin esfuerzo.',
        'Fase 2 — Resultado (días 31 a 60): movimiento, estructura de comidas y registro semanal.',
        'Fase 3 — Mantenimiento (días 61 a 90): uso estratégico del gel para sostener el resultado.',
      ]}
      acceptHref="https://pay.kiwify.com/RfpEvfO"
      acceptLabel="SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS"
      declineHref="/downsell"
      declineLabel="No, gracias. Continuar →"
    />
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/upsell/page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Run full suite + tsc + lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add public/upsell/protocolo-90-dias.png src/app/upsell/page.tsx src/app/upsell/page.test.tsx
git commit -m "feat: add /upsell page (Protocolo 90 Días)"
```

---

### Task 3: `/downsell` page — Kit de Apoyo

**Files:**
- Create: `public/upsell/kit-de-apoyo.png` (binary copy, see Step 1)
- Create: `src/app/downsell/page.tsx`
- Test: `src/app/downsell/page.test.tsx`

**Interfaces:**
- Consumes: `OfferPage` from `@/components/offer/OfferPage` (Task 1) — same as Task 2, different props.
- Produces: default-exported React component `DownsellPage` at route `src/app/downsell/page.tsx`. Task 2's `/upsell` page already links here (`declineHref="/downsell"`) — this task makes that link resolve to a real page instead of a 404.

- [ ] **Step 1: Copy the image asset**

```bash
mkdir -p public/upsell
cp "../upsell/protocolo gel de la saciedad/Lista.png" public/upsell/kit-de-apoyo.png
```

Run this from the `member-app` repo root (the `public/upsell` directory already exists after
Task 2, `mkdir -p` is a no-op if so). If the relative path doesn't resolve, use the absolute path:
`H:\Second_Brain\03-Dev\Projetos_Pessoal\Mounjaro de Chia\upsell\protocolo gel de la saciedad\Lista.png`.
Confirm the copy worked: `ls -la public/upsell/kit-de-apoyo.png` should show a ~2.3MB file.

- [ ] **Step 2: Write the failing test**

Create `src/app/downsell/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DownsellPage from './page';

describe('DownsellPage', () => {
  it('muestra el título de la oferta', () => {
    render(<DownsellPage />);
    expect(screen.getByText('KIT DE APOYO')).toBeInTheDocument();
  });

  it('el botón de aceptar lleva al checkout del downsell', () => {
    render(<DownsellPage />);
    expect(screen.getByText('SÍ, QUIERO MI KIT DE APOYO').closest('a')).toHaveAttribute(
      'href',
      'https://pay.kiwify.com/IeqleVF'
    );
  });

  it('el botón de rechazar lleva a la página de obrigado', () => {
    render(<DownsellPage />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/gracias'
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/app/downsell/page.test.tsx`
Expected: FAIL — `Cannot find module './page'` (the page doesn't exist yet).

- [ ] **Step 4: Write minimal implementation**

Create `src/app/downsell/page.tsx`:

```tsx
import { OfferPage } from '@/components/offer/OfferPage';

export default function DownsellPage() {
  return (
    <OfferPage
      title="KIT DE APOYO"
      subtitle="Las herramientas para no fallar"
      imageSrc="/upsell/kit-de-apoyo.png"
      imageAlt="Kit de Apoyo — las cinco herramientas"
      imageWidth={1536}
      imageHeight={1024}
      priceLabel="$197 MXN"
      benefits={[
        'Lista de compras semanal',
        'Rastreador de 21 días',
        'Guía para comer fuera',
        'Las 12 sustituciones',
        'Recordatorios para imprimir',
      ]}
      acceptHref="https://pay.kiwify.com/IeqleVF"
      acceptLabel="SÍ, QUIERO MI KIT DE APOYO"
      declineHref="/gracias"
      declineLabel="No, gracias. Continuar →"
    />
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/downsell/page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Run full suite + tsc + lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add public/upsell/kit-de-apoyo.png src/app/downsell/page.tsx src/app/downsell/page.test.tsx
git commit -m "feat: add /downsell page (Kit de Apoyo)"
```

---

## What this plan deliberately does NOT cover

- Configuring the Kiwify dashboard: (1) making the main product checkout redirect to `/upsell`
  instead of `/gracias`; (2) setting the "thank you" URL for the upsell and downsell checkouts
  themselves. Both are manual steps in the Kiwify dashboard, done by Eduardo after this deploys.
- The "Material educativo..." disclaimer — explicitly declined during brainstorming.
- One-click upsell / re-using the original payment method — each offer links to its own full
  Kiwify checkout.
- Personalization, purchase verification, or analytics/pixel wiring on either page — no pixel
  integration exists anywhere in the funnel yet.
