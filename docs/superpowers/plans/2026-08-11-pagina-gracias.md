# Página de obrigado pós-compra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static `/gracias` page in the member-app that confirms a purchase and links to `/` (the onboarding funnel) so new customers can start setting up their protocol.

**Architecture:** A single stateless Next.js App Router page component, styled with the same Tailwind design tokens already used across the onboarding screens (`bg-background`, `font-serif`, `text-brand`, `rounded-full bg-brand`). No client-side state, no data fetching, no Supabase calls — it's pure presentation with one `next/link`.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest + Testing Library (existing project stack — no new dependencies).

## Global Constraints

- Route slug is `/gracias` (spec: `docs/superpowers/specs/2026-08-11-pagina-gracias-design.md`).
- All user-facing copy is in Spanish (Mexico), matching every other screen in the app.
- CTA links to `/` — the member-app's onboarding funnel root, not a separate login route (none exists).
- No query-string personalization, no purchase verification, no analytics/pixel wiring — explicitly out of scope per the spec.
- Use `next/link`, not a raw `<a>` tag, consistent with the rest of the app.

---

### Task 1: `/gracias` page

**Files:**
- Create: `src/app/gracias/page.tsx`
- Test: `src/app/gracias/page.test.tsx`

**Interfaces:**
- Produces: default-exported React component `GraciasPage` at route `src/app/gracias/page.tsx` (Next.js App Router convention — no explicit function name is imported elsewhere, the file path is the interface).
- Consumes: nothing from other tasks — this plan has only one task.

- [ ] **Step 1: Write the failing test**

Create `src/app/gracias/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraciasPage from './page';

describe('GraciasPage', () => {
  it('muestra el mensaje de confirmación de compra', () => {
    render(<GraciasPage />);
    expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument();
  });

  it('tiene un botón que lleva al inicio del protocolo', () => {
    render(<GraciasPage />);
    expect(screen.getByText('COMENZAR MI PROTOCOLO').closest('a')).toHaveAttribute('href', '/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/gracias/page.test.tsx`
Expected: FAIL — `Cannot find module './page'` (the page doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/app/gracias/page.tsx`:

```tsx
import Link from 'next/link';

export default function GraciasPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">🎉</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-neutral-600">
        Tu protocolo personalizado te espera — solo faltan 2 minutos para configurarlo.
      </p>
      <Link
        href="/"
        className="mt-6 flex min-h-[44px] w-full max-w-xs items-center justify-center rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground"
      >
        COMENZAR MI PROTOCOLO
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/gracias/page.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run full suite + tsc + lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green — confirms nothing else in the app broke.

- [ ] **Step 6: Commit**

```bash
git add src/app/gracias/page.tsx src/app/gracias/page.test.tsx
git commit -m "feat: add post-purchase thank-you page at /gracias"
```

---

## What this plan deliberately does NOT cover

- Configuring the Kiwify checkout's "thank you page" URL to point at `/gracias` — manual step in the Kiwify dashboard, done by Eduardo after this deploys.
- Personalizing the page with the customer's name or order data — no reliable query-string source from Kiwify's native redirect.
- Purchase verification / gating — the page is informational only, safe for anyone to view directly.
- Analytics or ad-conversion pixels (Meta/Google) — no pixel integration exists anywhere in the funnel yet; out of scope for this page.
