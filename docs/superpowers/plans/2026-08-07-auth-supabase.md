# Auth con Supabase (Phase 2 of Member App) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the completed onboarding (Phase 1) to Supabase magic-link auth: capture email on
the success screen, create a `profiles` row from the locally-stored onboarding answers once the
user clicks their magic link, and protect a new `/app` area behind a real session.

**Architecture:** `@supabase/ssr` browser client for the email-capture form and the callback page
(both need `localStorage` and must run client-side); a server client + Next.js `middleware.ts`
for route protection. The callback is a **client** page, not a server route handler — Supabase's
magic-link flow completes session exchange in the browser via `detectSessionInUrl`, and only the
browser has access to the onboarding answers sitting in `localStorage` from Phase 1. No server
route handler can read the browser's `localStorage`, so this is not a style choice.

**Tech Stack:** Adds `@supabase/supabase-js` + `@supabase/ssr` to the existing Next.js 14 +
TypeScript + Tailwind + Zustand + Vitest stack from Phase 1.

## Global Constraints

- Idioma: español (ES-MX) — todo texto visible al usuario en español, mismo locale del resto del
  app (fuente: sesión anterior, corrección del locale de todo el proyecto).
- Control de acceso: **abierto por ahora** — cualquier email puede pedir el magic link y crear su
  cuenta/protocolo; integración con Kiwify (verificar compra) queda para después (fuente:
  `app-membro-design.md`, "Decisões tomadas no brainstorming").
- Cada componente tiene su archivo de test al lado (`Componente.test.tsx`), mismo patrón de
  Phase 1 y de `quiz-app`.
- Nombres de campo en español, consistentes con `OnboardingAnswers` de Phase 1: `nombre`, `peso`,
  `estatura`, `edad`, `horarioHambre` (columna SQL: `horario_hambre`), `antojoDulce` (columna SQL:
  `antojo_dulce`), `metaPeso` (columna SQL: `meta_peso`), `horaDespertar` (columna SQL:
  `hora_despertar`).
- Todas las tablas con row-level security: cada usuario solo lee/escribe sus propias filas
  (`auth.uid() = id`) (fuente: `app-membro-design.md`, sección "RLS").

---

## Prerequisito manual (antes de empezar — no es una Task de este plan)

Ningún agente de este plan puede hacer esto por ti: requiere tu cuenta de Supabase, y no hay
herramienta en esta sesión con acceso a la API de Supabase ni a los archivos `.env*` (bloqueados
por permisos). Completa esto antes de la Task 4 (antes de eso, todo se implementa y prueba con
mocks, sin necesitar credenciales reales):

1. Si aún no existe, crea un proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → API**, copia la **Project URL** y la **anon public key**.
3. Crea `member-app/.env.local` (no lo commitees — ya está en `.gitignore` desde Phase 1) con:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<tu Project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu anon key>
   ```
4. En **Authentication → URL Configuration → Redirect URLs**, agrega
   `http://localhost:3100/auth/callback` (y luego la URL de producción cuando exista un deploy).
5. En **Authentication → Providers → Email**, confirma que "Enable Email provider" esté activo —
   el magic link (OTP) usa este provider por defecto, no necesita configuración extra.
6. Corre el SQL de la Task 2 de este plan (`supabase/migrations/0001_profiles.sql`) en
   **SQL Editor** una vez que exista (créalo tú mismo en el dashboard, copiando el contenido del
   archivo que la Task 2 deja en el repo).

---

## File Structure

```
member-app/
├── supabase/
│   └── migrations/
│       └── 0001_profiles.sql       # NEW — RLS-protected profiles table
├── .env.local.example               # NEW
├── middleware.ts                    # NEW — protects /app/*
├── middleware.test.ts               # NEW
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts            # NEW — browser client
│   │       └── server.ts            # NEW — server client (middleware, server components)
│   ├── components/
│   │   └── onboarding/
│   │       ├── SuccessScreen.tsx        # RENAMED from SuccessPlaceholder.tsx, extended
│   │       ├── SuccessScreen.test.tsx   # RENAMED + extended
│   │       ├── OnboardingFunnel.tsx     # MODIFIED — uses SuccessScreen
│   │       └── OnboardingFunnel.test.tsx # MODIFIED
│   └── app/
│       ├── auth/
│       │   └── callback/
│       │       ├── page.tsx         # NEW — client page, session + profile creation
│       │       └── page.test.tsx    # NEW
│       └── app/
│           ├── page.tsx             # NEW — minimal authenticated placeholder
│           └── page.test.tsx        # NEW
```

`SuccessPlaceholder.tsx`/`.test.tsx` are deleted as part of the rename in Task 3 (it's no longer a
placeholder — it now does real work).

---

### Task 1: Supabase client helpers + env scaffolding

**Files:**
- Modify: `package.json` (add `@supabase/supabase-js`, `@supabase/ssr`)
- Create: `.env.local.example`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

**Interfaces:**
- Produces: `createClient()` from `@/lib/supabase/client` (browser, for Task 3 and Task 4) and
  `createClient()` from `@/lib/supabase/server` (server, for Task 5's middleware). Both read
  `process.env.NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **Step 1: Add dependencies to `package.json`**

Add to the `dependencies` block (alongside the existing `next`/`react`/`react-dom`/`zustand`):

```json
"@supabase/ssr": "^0.5.1",
"@supabase/supabase-js": "^2.45.4",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes with no errors.

- [ ] **Step 3: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Create the browser client**

`src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 5: Create the server client**

`src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — middleware (Task 5) is what
            // actually refreshes the session cookie on every request; a Server
            // Component is read-only here and can't set cookies itself. Safe to ignore.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (No live Supabase project is needed for this — the `!` non-null assertions
mean this only fails at runtime if the env vars are genuinely missing, not at compile time.)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.local.example src/lib/supabase/client.ts src/lib/supabase/server.ts
git commit -m "feat: add Supabase client helpers and env scaffolding"
```

---

### Task 2: `profiles` table migration (SQL, checked in but not auto-executed)

**Files:**
- Create: `supabase/migrations/0001_profiles.sql`

**Interfaces:**
- Produces: the `profiles` table shape that Task 4's callback page and Task 6's `/app` page
  read/write: columns `id, nombre, peso, estatura, edad, horario_hambre, antojo_dulce, meta_peso,
  hora_despertar, protocol_start_date, last_reminder_sent_at, created_at`.

No subagent can execute this against a live database — there is no Supabase API access in this
environment. This task's deliverable is the file existing, correct, and committed; running it is
the human's job (see "Prerequisito manual" above).

- [ ] **Step 1: Write the migration**

`supabase/migrations/0001_profiles.sql`:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  peso numeric not null,
  estatura numeric not null,
  edad integer not null,
  horario_hambre text,
  antojo_dulce integer not null,
  meta_peso text,
  hora_despertar text not null,
  protocol_start_date date not null default current_date,
  last_reminder_sent_at date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);
```

- [ ] **Step 2: Verify it's valid SQL (static check, not execution)**

There's no live database to run this against yet. Read the file back and confirm: every `create
policy` references `auth.uid() = id` (not some other column), the table name is `public.profiles`
consistently, and there's no trailing syntax error (unbalanced parens, missing semicolons). This
is a manual read-through, not a command.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_profiles.sql
git commit -m "feat: add profiles table migration with RLS policies"
```

---

### Task 3: `SuccessScreen` — email capture (renamed from `SuccessPlaceholder`)

**Files:**
- Delete: `src/components/onboarding/SuccessPlaceholder.tsx`
- Delete: `src/components/onboarding/SuccessPlaceholder.test.tsx`
- Create: `src/components/onboarding/SuccessScreen.tsx`
- Create: `src/components/onboarding/SuccessScreen.test.tsx`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/client` (Task 1).
- Produces: `<SuccessScreen nombre={string} />` — wired into `OnboardingFunnel` in Task 7,
  replacing `<SuccessPlaceholder nombre={...} />`.

This screen keeps the exact "Protocolo listo" copy from Phase 1, and adds an email field + button
in front of it (matching `app-membro-design.md`: "antes do botão 'VER MEU PROTOCOLO', pede o
email"). Four visual states: idle (form), sending (button disabled + "Enviando…"), sent (success
message, form replaced), error (inline error message, form still usable to retry).

**Exact copy:**
- Título / subtítulo: igual a Phase 1 — "¡Protocolo listo, [nombre]!" / "Tu dosis, horarios y
  checklist de 21 días ya están listos para que empieces ahora."
- Email input: placeholder "tu@email.com", `aria-label` "Correo electrónico"
- Botón: "VER MI PROTOCOLO"
- Texto de ayuda bajo el form (estado idle): "Te enviaremos un enlace mágico para entrar."
- Estado "sending": el botón muestra "Enviando…" y queda `disabled`
- Estado "sent" (reemplaza el form entero): "Revisa tu correo — te enviamos un enlace para
  entrar a tu protocolo."
- Estado "error" (además del form, que sigue visible): "No pudimos enviar el enlace. Intenta de
  nuevo."

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuccessScreen } from './SuccessScreen';

const signInWithOtp = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithOtp: (...args: unknown[]) => signInWithOtp(...args) },
  }),
}));

describe('SuccessScreen', () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
  });

  it('muestra el nombre y el texto exacto de éxito', () => {
    render(<SuccessScreen nombre="Ana" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo listo/)).toBeInTheDocument();
    expect(
      screen.getByText('Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.')
    ).toBeInTheDocument();
  });

  it('muestra el formulario de email con el botón VER MI PROTOCOLO', () => {
    render(<SuccessScreen nombre="Ana" />);
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('VER MI PROTOCOLO')).toBeInTheDocument();
  });

  it('llama a signInWithOtp con el email y el redirectTo correctos, y muestra el estado enviado', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    render(<SuccessScreen nombre="Ana" />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByText('VER MI PROTOCOLO'));
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
    });
    expect(await screen.findByText(/Revisa tu correo/)).toBeInTheDocument();
  });

  it('muestra un error si signInWithOtp falla, y deja el formulario disponible para reintentar', async () => {
    signInWithOtp.mockResolvedValue({ error: { message: 'network error' } });
    render(<SuccessScreen nombre="Ana" />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByText('VER MI PROTOCOLO'));
    expect(await screen.findByText(/No pudimos enviar el enlace/)).toBeInTheDocument();
    expect(screen.getByText('VER MI PROTOCOLO')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SuccessScreen.test.tsx`
Expected: FAIL — `Cannot find module './SuccessScreen'`.

- [ ] **Step 3: Implement**

`src/components/onboarding/SuccessScreen.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SuccessScreenProps = {
  nombre: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function SuccessScreen({ nombre }: SuccessScreenProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async () => {
    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? 'error' : 'sent');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        ¡Protocolo listo, <span className="text-brand">{nombre}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.
      </p>

      {status === 'sent' ? (
        <p className="mt-6 max-w-xs text-neutral-700">
          Revisa tu correo — te enviamos un enlace para entrar a tu protocolo.
        </p>
      ) : (
        <div className="mt-6 w-full max-w-xs">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Correo electrónico"
            className="w-full rounded-card border border-neutral-300 px-4 py-3 text-lg"
          />
          {status === 'error' ? (
            <p className="mt-2 text-sm text-danger">No pudimos enviar el enlace. Intenta de nuevo.</p>
          ) : null}
          <button
            type="button"
            disabled={status === 'sending' || email.trim().length === 0}
            onClick={handleSubmit}
            className="mt-3 min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
          >
            {status === 'sending' ? 'Enviando…' : 'VER MI PROTOCOLO'}
          </button>
          <p className="mt-2 text-sm text-neutral-500">Te enviaremos un enlace mágico para entrar.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- SuccessScreen.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Delete the old placeholder**

```bash
git rm src/components/onboarding/SuccessPlaceholder.tsx src/components/onboarding/SuccessPlaceholder.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/SuccessScreen.tsx src/components/onboarding/SuccessScreen.test.tsx
git commit -m "feat: replace SuccessPlaceholder with SuccessScreen (email capture)"
```

---

### Task 4: `/auth/callback` page

**Files:**
- Create: `src/app/auth/callback/page.tsx`
- Create: `src/app/auth/callback/page.test.tsx`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/client` (Task 1); reads `localStorage` key
  `gel-chia-member-onboarding` (the Zustand `persist` key from Phase 1's `src/lib/store.ts` —
  do not change that key, this task only reads it).
- Produces: nothing later depends on this page directly — it's a terminal redirect target.

**Behavior (in order):**
1. On mount, wait for Supabase to establish the session from the magic-link URL (the browser
   client does this automatically via `detectSessionInUrl`; poll `supabase.auth.getUser()` or
   subscribe to `onAuthStateChange` until a user is present, with a timeout).
2. Once a user exists, check whether a `profiles` row already exists for `user.id`.
3. If it exists, redirect to `/app` (returning user, e.g. they clicked an old magic link again).
4. If it doesn't exist, read `localStorage.getItem('gel-chia-member-onboarding')`, parse the
   Zustand-persisted JSON (`{ state: { answers: {...} } }`), and `insert` a `profiles` row built
   from those answers (`id: user.id`, plus every `OnboardingAnswers` field mapped to its
   snake_case column from Task 2's migration). Then redirect to `/app`.
5. If there's no session after the timeout, or there's a session but no localStorage answers and
   no existing profile (can't build one), show an inline error with a link back to `/` — do not
   silently redirect in this case, the user needs to know something went wrong.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CallbackPage from './page';

const getUser = vi.fn();
const from = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: () => getUser() },
    from: (...args: unknown[]) => from(...args),
  }),
}));

function mockProfilesTable({ existing }: { existing: boolean }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existing ? { id: 'user-1' } : null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const insert = vi.fn().mockResolvedValue({ error: null });
  from.mockReturnValue({ select, insert });
  return { insert };
}

describe('CallbackPage', () => {
  beforeEach(() => {
    push.mockReset();
    from.mockReset();
    getUser.mockReset();
    localStorage.clear();
  });

  it('redirige a /app directamente si ya existe un perfil para este usuario', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfilesTable({ existing: true });
    render(<CallbackPage />);
    await waitFor(() => expect(push).toHaveBeenCalledWith('/app'));
  });

  it('crea el perfil desde localStorage y redirige a /app cuando no existe perfil aún', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { insert } = mockProfilesTable({ existing: false });
    localStorage.setItem(
      'gel-chia-member-onboarding',
      JSON.stringify({
        state: {
          answers: {
            nombre: 'Ana',
            peso: 70,
            estatura: 165,
            edad: 30,
            horarioHambre: 'tarde',
            antojoDulce: 7,
            metaPeso: '5-10',
            horaDespertar: '07:30',
          },
        },
      })
    );
    render(<CallbackPage />);
    await waitFor(() => expect(insert).toHaveBeenCalledWith({
      id: 'user-1',
      nombre: 'Ana',
      peso: 70,
      estatura: 165,
      edad: 30,
      horario_hambre: 'tarde',
      antojo_dulce: 7,
      meta_peso: '5-10',
      hora_despertar: '07:30',
    }));
    expect(push).toHaveBeenCalledWith('/app');
  });

  it('muestra un error si no hay sesión ni datos guardados', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    render(<CallbackPage />);
    expect(await screen.findByText(/No pudimos completar tu acceso/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/auth/callback/page.test.tsx`
Expected: FAIL — `Cannot find module './page'`.

- [ ] **Step 3: Implement**

`src/app/auth/callback/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_ONBOARDING_ANSWERS, type OnboardingAnswers } from '@/types/onboarding';

const ONBOARDING_STORAGE_KEY = 'gel-chia-member-onboarding';

function readStoredAnswers(): OnboardingAnswers | null {
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.answers ?? null;
  } catch {
    return null;
  }
}

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setError(true);
        return;
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        router.push('/app');
        return;
      }

      const answers = readStoredAnswers();
      if (!answers) {
        if (!cancelled) setError(true);
        return;
      }

      await supabase.from('profiles').insert({
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

      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      router.push('/app');
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-neutral-700">No pudimos completar tu acceso. Intenta de nuevo desde el inicio.</p>
        <a href="/" className="mt-4 font-bold text-brand">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/auth/callback/page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/callback/page.tsx src/app/auth/callback/page.test.tsx
git commit -m "feat: add auth callback page (session + profile creation)"
```

---

### Task 5: `middleware.ts` — protect `/app/*`

**Files:**
- Create: `middleware.ts` (repo root, alongside `package.json` — Next.js requires this exact
  location, not under `src/`)
- Test: `middleware.test.ts` (repo root, alongside `middleware.ts`)

**Interfaces:**
- Consumes: `@supabase/ssr`'s `createServerClient` directly (not Task 1's `server.ts` helper —
  middleware runs in the Edge runtime with a `NextRequest`/`NextResponse` cookie interface that
  differs from the Server Component `cookies()` helper Task 1's `server.ts` wraps; duplicating
  the ~10-line client construction here is standard practice for Supabase+Next.js middleware,
  not a DRY violation).
- Produces: redirects unauthenticated requests to `/app/*` back to `/`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

const getUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: () => getUser() },
  }),
}));

describe('middleware', () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it('deja pasar una request a /app cuando hay usuario autenticado', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const request = new NextRequest('http://localhost:3100/app');
    const response = await middleware(request);
    expect(response.status).not.toBe(307);
  });

  it('redirige a / cuando no hay usuario autenticado y la ruta es /app', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest('http://localhost:3100/app');
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3100/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- middleware.test.ts`
Expected: FAIL — `Cannot find module './middleware'`.

- [ ] **Step 3: Implement**

`middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*'],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- middleware.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add middleware.ts middleware.test.ts
git commit -m "feat: protect /app/* routes with Supabase session middleware"
```

---

### Task 6: Minimal authenticated `/app` placeholder page

**Files:**
- Create: `src/app/app/page.tsx`
- Create: `src/app/app/page.test.tsx`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server` (Task 1), to read the logged-in user's
  `profiles.nombre` for a welcome message, server-side.
- Produces: nothing later depends on this — it's explicitly a placeholder. The real Início/
  Receta/Progreso tabs are a future phase (see "What this plan deliberately does NOT cover").

This is a Server Component (not `'use client'`) — it can use Task 1's `server.ts` helper directly
since it only needs to read the session/profile once at render time, no interactivity yet beyond
a logout button.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppPage from './page';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { nombre: 'Ana' } }),
        }),
      }),
    }),
  }),
}));

describe('AppPage', () => {
  it('muestra un saludo con el nombre del perfil', async () => {
    render(await AppPage());
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/app/page.test.tsx`
Expected: FAIL — `Cannot find module './page'`.

- [ ] **Step 3: Implement**

`src/app/app/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user?.id ?? '')
    .single();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        ¡Hola, {profile?.nombre ?? ''}! 👋
      </h1>
      <p className="mt-2 text-neutral-600">
        Tu protocolo está guardado. El panel completo (receta, check-ins, progreso) llega en la
        próxima fase.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/app/page.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/app/app/page.tsx src/app/app/page.test.tsx
git commit -m "feat: add minimal authenticated /app placeholder page"
```

---

### Task 7: Wire `SuccessScreen` into `OnboardingFunnel`

**Files:**
- Modify: `src/components/onboarding/OnboardingFunnel.tsx`
- Modify: `src/components/onboarding/OnboardingFunnel.test.tsx`

**Interfaces:**
- Consumes: `SuccessScreen` (Task 3) instead of the deleted `SuccessPlaceholder`.

- [ ] **Step 1: Update the failing assertion first**

In `OnboardingFunnel.test.tsx`, the existing end-to-end test asserts on the old
`SuccessPlaceholder` text. Since `SuccessScreen` now shows a form instead of ending the visible
text at the subtitle, update the third test's final assertions:

```tsx
    await waitFor(() => {
      expect(screen.getByText('Ana')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.getByText(/Protocolo listo/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
```

(The last line is new — replaces nothing, just extends the existing test to also confirm the
email form now renders after processing completes.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- OnboardingFunnel.test.tsx`
Expected: FAIL — `OnboardingFunnel.tsx` still imports the deleted `SuccessPlaceholder`, so this
won't even compile/render; alternatively if Task 3's `git rm` already broke the import, the error
will be a module-not-found rather than a missing-element assertion. Either failure mode confirms
the wiring isn't done yet.

- [ ] **Step 3: Update the import and usage**

In `OnboardingFunnel.tsx`, change:

```tsx
import { SuccessPlaceholder } from './SuccessPlaceholder';
```

to:

```tsx
import { SuccessScreen } from './SuccessScreen';
```

and change:

```tsx
  if (done) {
    return <SuccessPlaceholder nombre={answers.nombre ?? ''} />;
  }
```

to:

```tsx
  if (done) {
    return <SuccessScreen nombre={answers.nombre ?? ''} />;
  }
```

No other line in this file changes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- OnboardingFunnel.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite, tsc, and lint**

Run: `npm test`
Expected: all tests pass (Task 1 through 7's new/changed tests, plus every Phase 1 test
unaffected by this phase).

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no warnings or errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/OnboardingFunnel.tsx src/components/onboarding/OnboardingFunnel.test.tsx
git commit -m "feat: wire SuccessScreen into the onboarding funnel"
```

---

## What this plan deliberately does NOT cover

- The authenticated `/app` member area beyond the one-line placeholder (Início/Receta/Progreso
  tabs, check-ins, streaks, calendar, achievements) — a future phase.
- The real dose-calculation formula and its recipe UI (approved table already exists in
  `app-membro-design.md`, "Regras derivadas") — a future phase.
- The daily email reminder (Resend + Supabase `pg_cron`) — a future phase.
- Kiwify purchase verification / gating access to only paying customers — explicitly deferred
  per the original design brainstorm ("Aberto por enquanto").
- Deploy to Vercel and production environment variable configuration — the Supabase Redirect URL
  allowlist (prerequisite step 4) will need a second entry added once that happens.
- A logout button or any other interactive element on `/app` beyond the welcome message in
  Task 6 — out of scope for this plan.
