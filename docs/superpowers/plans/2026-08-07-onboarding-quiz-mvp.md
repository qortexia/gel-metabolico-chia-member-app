# Onboarding Quiz (Phase 1 of Member App) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `member-app` Next.js project and build the complete 8-step onboarding
quiz (single-page, local-only state) ending in a processing animation and a placeholder success
screen — a fully working, demoable flow with zero backend dependency.

**Architecture:** Next.js 14 App Router + TypeScript, single client page that renders one step
component at a time based on an index held in a Zustand store (`persist` to localStorage). Each
step is its own small presentational component; a thin orchestrator (`OnboardingFunnel`) owns
navigation. No Supabase, no auth, no routes-per-step — all of that is out of scope for this plan
and will be designed in a follow-up plan once this phase's code exists to build on.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Zustand (`persist` middleware), Vitest +
Testing Library. Same stack as the sibling `quiz-app` project in this repo, minus Framer Motion
(not needed until check-in confetti in a later phase) and Supabase (later phase).

## Global Constraints

- Idioma: português (Brasil) — único locale, sem i18n (fonte: `app-membro-design.md`).
- Paleta: fundo bege/creme, dourado/mostarda como cor de destaque/ação principal, verde para
  confirmação positiva (fonte: `app.md`, seção "Notas de design/estilo").
- Tipografia: títulos em serifada elegante (Playfair Display), corpo/subtítulos em sans-serif
  (fonte: `app.md`).
- Onboarding tem exatamente 8 etapas, single-page multi-step, sem rotas por etapa (fonte:
  `app-membro-design.md`, seção "Rotas": `/onboarding` é single-page).
- Sem backend/Supabase nesta fase — as respostas ficam só no Zustand `persist` (localStorage) até
  a fase de auth (fonte: `app-membro-design.md`, seção "Fluxo de auth", passo 1).
- Cada componente tem seu arquivo de teste ao lado (`Componente.test.tsx`), mesmo padrão do
  `quiz-app` (fonte: `app-membro-design.md`, seção "Testes").
- Todo texto visível ao usuário é o texto exato de `app.md` (títulos, subtítulos, placeholders,
  labels de opção) — não parafrasear.

---

## File Structure

```
member-app/
├── package.json
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── .gitignore
├── README.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── types/
│   │   └── onboarding.ts          # OnboardingAnswers type + INITIAL_ONBOARDING_ANSWERS
│   ├── lib/
│   │   ├── store.ts                # useOnboardingStore (Zustand + persist)
│   │   └── store.test.ts
│   └── components/
│       └── onboarding/
│           ├── ProgressBar.tsx
│           ├── ProgressBar.test.tsx
│           ├── OnboardingStep.tsx  # shared shell: progress bar, back button, title, footer
│           ├── OnboardingStep.test.tsx
│           ├── NameStep.tsx        # step 1/8
│           ├── NameStep.test.tsx
│           ├── NumberStepper.tsx   # reusable +/- stepper with suffix
│           ├── NumberStepper.test.tsx
│           ├── WeightStep.tsx      # step 2/8
│           ├── WeightStep.test.tsx
│           ├── HeightStep.tsx      # step 3/8
│           ├── HeightStep.test.tsx
│           ├── AgeStep.tsx         # step 4/8
│           ├── AgeStep.test.tsx
│           ├── IconChoiceCard.tsx  # reusable icon+title+description choice row
│           ├── IconChoiceCard.test.tsx
│           ├── HungerTimeStep.tsx  # step 5/8
│           ├── HungerTimeStep.test.tsx
│           ├── CravingSlider.tsx   # reusable 0-10 slider with emoji
│           ├── CravingSlider.test.tsx
│           ├── CravingStep.tsx     # step 6/8
│           ├── CravingStep.test.tsx
│           ├── WeightGoalGrid.tsx  # reusable 2x2 option grid
│           ├── WeightGoalGrid.test.tsx
│           ├── WeightGoalStep.tsx  # step 7/8
│           ├── WeightGoalStep.test.tsx
│           ├── WakeTimePicker.tsx  # reusable time input
│           ├── WakeTimePicker.test.tsx
│           ├── WakeTimeStep.tsx    # step 8/8
│           ├── WakeTimeStep.test.tsx
│           ├── ProcessingScreen.tsx
│           ├── ProcessingScreen.test.tsx
│           ├── SuccessPlaceholder.tsx
│           ├── SuccessPlaceholder.test.tsx
│           ├── OnboardingFunnel.tsx
│           └── OnboardingFunnel.test.tsx
```

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: `member-app/package.json`
- Create: `member-app/tsconfig.json`
- Create: `member-app/next.config.js`
- Create: `member-app/postcss.config.js`
- Create: `member-app/tailwind.config.ts`
- Create: `member-app/vitest.config.ts`
- Create: `member-app/vitest.setup.ts`
- Create: `member-app/.gitignore`
- Create: `member-app/README.md`

**Interfaces:**
- Produces: the `@/*` → `src/*` path alias, the `brand`/`background`/`foreground`/`success`
  Tailwind colors, and the `font-serif`/`font-sans` Tailwind font families every later task's
  components rely on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "gel-metabolico-chia-member-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.15",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.9",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.19",
    "vitest": "^2.0.5",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

`dev` is pinned to port 3100 (not 3000) so it can run alongside `quiz-app`'s dev server without
port conflicts.

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF6EE',
        foreground: '#2B2013',
        brand: {
          DEFAULT: '#C9A227',
          light: '#E4C158',
          dark: '#A8841C',
        },
        success: '#15803D',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 7: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
.next
out
.env*.local
*.tsbuildinfo
next-env.d.ts
.DS_Store
```

- [ ] **Step 9: Create `README.md`**

```markdown
# Gel Metabólico de Chia — App de Membro (onboarding)

App pós-compra: onboarding de 8 etapas + (em fases futuras) painel diário do protocolo de 21
dias. Ver `docs/superpowers/plans/` para o plano de implementação e
`../app-membro-design.md` para o design completo.

## Desenvolvimento

\`\`\`bash
npm install
npm run dev
\`\`\`

Sobe em `http://localhost:3100` (porta diferente do `quiz-app`, que usa 3000).

## Testes

\`\`\`bash
npm test
\`\`\`
```

- [ ] **Step 10: Install dependencies**

Run: `cd member-app && npm install`
Expected: completes with no errors, `node_modules/` created.

- [ ] **Step 11: Initialize git and commit**

```bash
cd member-app
git init
git add -A
git commit -m "chore: scaffold member-app project (Next.js + TS + Tailwind + Vitest)"
```

---

### Task 2: Onboarding types + Zustand store

**Files:**
- Create: `member-app/src/types/onboarding.ts`
- Create: `member-app/src/lib/store.ts`
- Create: `member-app/src/lib/store.test.ts`

**Interfaces:**
- Produces: `OnboardingAnswers` type, `INITIAL_ONBOARDING_ANSWERS`, and `useOnboardingStore` with
  state `{ currentIndex: number, answers: OnboardingAnswers }` and actions `setAnswer(key, value)`,
  `goNext()`, `goBack()`, `goToIndex(index)`, `reset()` — every later task's step components read
  `answers.<field>` and call these actions.

- [ ] **Step 1: Create the answers type**

`member-app/src/types/onboarding.ts`:

```ts
export interface OnboardingAnswers {
  nome: string | null;
  peso: number;
  altura: number;
  idade: number;
  horarioFome: string | null;
  vontadeDoce: number;
  metaPeso: string | null;
  horarioAcorda: string;
}

export const INITIAL_ONBOARDING_ANSWERS: OnboardingAnswers = {
  nome: null,
  peso: 65,
  altura: 165,
  idade: 32,
  horarioFome: null,
  vontadeDoce: 5,
  metaPeso: null,
  horarioAcorda: '07:00',
};
```

- [ ] **Step 2: Write the failing store test**

`member-app/src/lib/store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from './store';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('starts at index 0 with the default answers', () => {
    const state = useOnboardingStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.answers.nome).toBeNull();
    expect(state.answers.peso).toBe(65);
  });

  it('setAnswer updates only the given field', () => {
    useOnboardingStore.getState().setAnswer('nome', 'Valentina');
    expect(useOnboardingStore.getState().answers.nome).toBe('Valentina');
    expect(useOnboardingStore.getState().answers.peso).toBe(65);
  });

  it('goNext advances the index and goBack never goes below 0', () => {
    useOnboardingStore.getState().goNext();
    useOnboardingStore.getState().goNext();
    expect(useOnboardingStore.getState().currentIndex).toBe(2);
    useOnboardingStore.getState().goBack();
    expect(useOnboardingStore.getState().currentIndex).toBe(1);
    useOnboardingStore.getState().goBack();
    useOnboardingStore.getState().goBack();
    expect(useOnboardingStore.getState().currentIndex).toBe(0);
  });

  it('goToIndex jumps directly to the given step', () => {
    useOnboardingStore.getState().goToIndex(5);
    expect(useOnboardingStore.getState().currentIndex).toBe(5);
  });

  it('reset clears the index and answers', () => {
    useOnboardingStore.getState().setAnswer('nome', 'Valentina');
    useOnboardingStore.getState().goToIndex(3);
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().currentIndex).toBe(0);
    expect(useOnboardingStore.getState().answers.nome).toBeNull();
  });

  describe('rehidratação desde localStorage com um esquema anterior', () => {
    it('preenche com os valores por padrão os campos ausentes num guardado mais antigo', () => {
      const merge = useOnboardingStore.persist.getOptions().merge!;
      const current = useOnboardingStore.getState();
      const { vontadeDoce, ...answersSemVontadeDoce } = current.answers;
      const merged = merge({ answers: answersSemVontadeDoce }, current) as typeof current;
      expect(merged.answers.vontadeDoce).toBe(5);
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- store.test.ts`
Expected: FAIL — `Cannot find module './store'` (the file doesn't exist yet).

- [ ] **Step 4: Implement the store**

`member-app/src/lib/store.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_ONBOARDING_ANSWERS, OnboardingAnswers } from '@/types/onboarding';

interface OnboardingState {
  currentIndex: number;
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  goNext: () => void;
  goBack: () => void;
  goToIndex: (index: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentIndex: 0,
      answers: INITIAL_ONBOARDING_ANSWERS,
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      goNext: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
      goBack: () => set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
      goToIndex: (index) => set({ currentIndex: index }),
      reset: () => set({ currentIndex: 0, answers: INITIAL_ONBOARDING_ANSWERS }),
    }),
    {
      name: 'gel-chia-member-onboarding',
      // Answers saved before a future OnboardingAnswers shape change (new
      // field, or a field's type changing) must not silently overwrite
      // fresh defaults with `undefined`. Merge onto current.answers
      // field-by-field instead of letting the persisted `answers` object
      // fully replace it — see quiz-app/src/lib/store.ts for the same fix
      // applied after a real production crash there.
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<OnboardingState>;
        const persistedAnswers = (persistedState.answers ?? {}) as Partial<OnboardingAnswers>;
        return {
          ...current,
          ...persistedState,
          answers: { ...current.answers, ...persistedAnswers },
        };
      },
    }
  )
);
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- store.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/types/onboarding.ts src/lib/store.ts src/lib/store.test.ts
git commit -m "feat: add onboarding answers type and Zustand store"
```

---

### Task 3: ProgressBar component

**Files:**
- Create: `member-app/src/components/onboarding/ProgressBar.tsx`
- Test: `member-app/src/components/onboarding/ProgressBar.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<ProgressBar current={number} total={number} />` — used by `OnboardingStep` (Task 4).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('reflete o progresso atual em aria-valuenow', () => {
    render(<ProgressBar current={2} total={8} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProgressBar.test.tsx`
Expected: FAIL — `Cannot find module './ProgressBar'`.

- [ ] **Step 3: Implement**

```tsx
'use client';

type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div
      className="h-1.5 w-full bg-neutral-200"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-brand transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProgressBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/ProgressBar.tsx src/components/onboarding/ProgressBar.test.tsx
git commit -m "feat: add ProgressBar component"
```

---

### Task 4: OnboardingStep shared shell

**Files:**
- Create: `member-app/src/components/onboarding/OnboardingStep.tsx`
- Test: `member-app/src/components/onboarding/OnboardingStep.test.tsx`

**Interfaces:**
- Consumes: `ProgressBar` (Task 3).
- Produces: `<OnboardingStep current total title subtitle? onBack? footer? children>` — every step
  component from Task 5 onward wraps its content in this.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingStep } from './OnboardingStep';

describe('OnboardingStep', () => {
  it('muestra el título, subtítulo y los children', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título" subtitle="Sub">
        <p>Conteúdo</p>
      </OnboardingStep>
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('no muestra el botón de volver cuando no se pasa onBack', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título">
        <p>x</p>
      </OnboardingStep>
    );
    expect(screen.queryByLabelText('Voltar')).not.toBeInTheDocument();
  });

  it('llama a onBack al hacer clic en el botón de volver', async () => {
    const onBack = vi.fn();
    render(
      <OnboardingStep current={2} total={8} title="Título" onBack={onBack}>
        <p>x</p>
      </OnboardingStep>
    );
    await userEvent.click(screen.getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renderiza el footer cuando se pasa', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título" footer={<button>Ir</button>}>
        <p>x</p>
      </OnboardingStep>
    );
    expect(screen.getByText('Ir')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- OnboardingStep.test.tsx`
Expected: FAIL — `Cannot find module './OnboardingStep'`.

- [ ] **Step 3: Implement**

```tsx
'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { ProgressBar } from './ProgressBar';

type OnboardingStepProps = {
  current: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingStep({
  current,
  total,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: OnboardingStepProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground">
      <div className="flex w-full max-w-sm flex-1 flex-col">
        <ProgressBar current={current} total={total} />
        <div className="flex items-center px-4 py-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-xl"
            >
              ←
            </button>
          ) : (
            <span className="min-h-[44px] min-w-[44px]" />
          )}
        </div>
        <div className="flex-1 px-5 pb-6">
          <h1 ref={titleRef} tabIndex={-1} className="font-serif text-2xl font-bold leading-tight outline-none">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-base text-neutral-600">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="sticky bottom-0 border-t border-neutral-200 bg-background p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- OnboardingStep.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/OnboardingStep.tsx src/components/onboarding/OnboardingStep.test.tsx
git commit -m "feat: add OnboardingStep shared shell"
```

---

### Task 5: Step 1/8 — NameStep

**Files:**
- Create: `member-app/src/components/onboarding/NameStep.tsx`
- Test: `member-app/src/components/onboarding/NameStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<NameStep value onChange onContinue onBack? current total />` — wired into
  `OnboardingFunnel` at `currentIndex === 0` (Task 12).

**Exact copy (from `app.md`, step 1/8):**
- Título: "Qual seu nome?"
- Subtítulo: "Vamos personalizar tudo pra você ✨"
- Placeholder: "Seu primeiro nome"
- Botão: "CONTINUAR"

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameStep } from './NameStep';

describe('NameStep', () => {
  it('muestra el título, subtítulo y placeholder exactos', () => {
    render(<NameStep value="" onChange={() => {}} onContinue={() => {}} current={1} total={8} />);
    expect(screen.getByText('Qual seu nome?')).toBeInTheDocument();
    expect(screen.getByText('Vamos personalizar tudo pra você ✨')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu primeiro nome')).toBeInTheDocument();
  });

  it('deshabilita Continuar cuando el valor está vacío', () => {
    render(<NameStep value="" onChange={() => {}} onContinue={() => {}} current={1} total={8} />);
    expect(screen.getByText('CONTINUAR')).toBeDisabled();
  });

  it('llama a onChange al escribir y a onContinue al hacer clic con un valor válido', async () => {
    const onChange = vi.fn();
    const onContinue = vi.fn();
    render(<NameStep value="Ana" onChange={onChange} onContinue={onContinue} current={1} total={8} />);
    await userEvent.type(screen.getByPlaceholderText('Seu primeiro nome'), 'x');
    expect(onChange).toHaveBeenCalled();
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- NameStep.test.tsx`
Expected: FAIL — `Cannot find module './NameStep'`.

- [ ] **Step 3: Implement**

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';

type NameStepProps = {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function NameStep({ value, onChange, onContinue, onBack, current, total }: NameStepProps) {
  const isValid = value.trim().length > 0;
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual seu nome?"
      subtitle="Vamos personalizar tudo pra você ✨"
      onBack={onBack}
      footer={
        <button
          type="button"
          disabled={!isValid}
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white disabled:opacity-40"
        >
          CONTINUAR
        </button>
      }
    >
      <input
        type="text"
        value={value}
        placeholder="Seu primeiro nome"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-neutral-300 px-4 py-3 text-lg"
      />
    </OnboardingStep>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- NameStep.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding/NameStep.tsx src/components/onboarding/NameStep.test.tsx
git commit -m "feat: add step 1/8 (NameStep)"
```

---

### Task 6: NumberStepper + Steps 2-4/8 (Weight, Height, Age)

**Files:**
- Create: `member-app/src/components/onboarding/NumberStepper.tsx`
- Test: `member-app/src/components/onboarding/NumberStepper.test.tsx`
- Create: `member-app/src/components/onboarding/WeightStep.tsx`
- Test: `member-app/src/components/onboarding/WeightStep.test.tsx`
- Create: `member-app/src/components/onboarding/HeightStep.tsx`
- Test: `member-app/src/components/onboarding/HeightStep.test.tsx`
- Create: `member-app/src/components/onboarding/AgeStep.tsx`
- Test: `member-app/src/components/onboarding/AgeStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<NumberStepper value onChange suffix min max step? />`; `<WeightStep>`,
  `<HeightStep>`, `<AgeStep>` (same prop shape: `value, onChange, onContinue, onBack?, current,
  total`) — wired into `OnboardingFunnel` at `currentIndex` 1, 2, 3 (Task 12).

**Exact copy (from `app.md`, steps 2-4/8):**
- Peso: título "Qual seu peso atual hoje?", subtítulo "Usamos pra calcular sua dose ideal",
  sufixo "kg", placeholder/padrão 65.
- Altura: título "Qual sua altura?", subtítulo "Vai compor seu IMC e meta", sufixo "cm",
  placeholder/padrão 165.
- Idade: título "Qual sua idade?", sem subtítulo, sufixo "anos", placeholder/padrão 32.

- [ ] **Step 1: Write the failing NumberStepper test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberStepper } from './NumberStepper';

describe('NumberStepper', () => {
  it('muestra el valor y el sufijo', () => {
    render(<NumberStepper value={65} onChange={() => {}} suffix="kg" min={30} max={250} />);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('incrementa y decrementa el valor dentro de los límites', async () => {
    const onChange = vi.fn();
    render(<NumberStepper value={65} onChange={onChange} suffix="kg" min={30} max={250} />);
    await userEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(66);
    await userEvent.click(screen.getByLabelText('Diminuir'));
    expect(onChange).toHaveBeenCalledWith(64);
  });

  it('no pasa del mínimo ni del máximo', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberStepper value={30} onChange={onChange} suffix="kg" min={30} max={31} />);
    await userEvent.click(screen.getByLabelText('Diminuir'));
    expect(onChange).toHaveBeenCalledWith(30);
    rerender(<NumberStepper value={31} onChange={onChange} suffix="kg" min={30} max={31} />);
    await userEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(31);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- NumberStepper.test.tsx`
Expected: FAIL — `Cannot find module './NumberStepper'`.

- [ ] **Step 3: Implement NumberStepper**

```tsx
'use client';

type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  min: number;
  max: number;
  step?: number;
};

export function NumberStepper({ value, onChange, suffix, min, max, step = 1 }: NumberStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => onChange(clamp(value - step))}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl text-foreground"
      >
        −
      </button>
      <div className="flex min-w-[120px] items-baseline justify-center gap-1">
        <span className="text-4xl font-bold text-foreground">{value}</span>
        <span className="text-lg text-neutral-500">{suffix}</span>
      </div>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => onChange(clamp(value + step))}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl text-foreground"
      >
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- NumberStepper.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing WeightStep/HeightStep/AgeStep tests**

`WeightStep.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightStep } from './WeightStep';

describe('WeightStep', () => {
  it('muestra el título, subtítulo y el valor con sufijo kg', () => {
    render(<WeightStep value={65} onChange={() => {}} onContinue={() => {}} current={2} total={8} />);
    expect(screen.getByText('Qual seu peso atual hoje?')).toBeInTheDocument();
    expect(screen.getByText('Usamos pra calcular sua dose ideal')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('llama a onContinue al hacer clic en Continuar', async () => {
    const onContinue = vi.fn();
    render(<WeightStep value={65} onChange={() => {}} onContinue={onContinue} current={2} total={8} />);
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
```

`HeightStep.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeightStep } from './HeightStep';

describe('HeightStep', () => {
  it('muestra el título, subtítulo y el valor con sufijo cm', () => {
    render(<HeightStep value={165} onChange={() => {}} onContinue={() => {}} current={3} total={8} />);
    expect(screen.getByText('Qual sua altura?')).toBeInTheDocument();
    expect(screen.getByText('Vai compor seu IMC e meta')).toBeInTheDocument();
    expect(screen.getByText('cm')).toBeInTheDocument();
  });
});
```

`AgeStep.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgeStep } from './AgeStep';

describe('AgeStep', () => {
  it('muestra el título y el valor con sufijo anos, sin subtítulo', () => {
    render(<AgeStep value={32} onChange={() => {}} onContinue={() => {}} current={4} total={8} />);
    expect(screen.getByText('Qual sua idade?')).toBeInTheDocument();
    expect(screen.getByText('anos')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npm test -- WeightStep.test.tsx HeightStep.test.tsx AgeStep.test.tsx`
Expected: FAIL — modules don't exist yet.

- [ ] **Step 7: Implement WeightStep, HeightStep, AgeStep**

`WeightStep.tsx`:

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type WeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WeightStep({ value, onChange, onContinue, onBack, current, total }: WeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual seu peso atual hoje?"
      subtitle="Usamos pra calcular sua dose ideal"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <NumberStepper value={value} onChange={onChange} suffix="kg" min={30} max={250} />
    </OnboardingStep>
  );
}
```

`HeightStep.tsx`:

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type HeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function HeightStep({ value, onChange, onContinue, onBack, current, total }: HeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual sua altura?"
      subtitle="Vai compor seu IMC e meta"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <NumberStepper value={value} onChange={onChange} suffix="cm" min={130} max={220} />
    </OnboardingStep>
  );
}
```

`AgeStep.tsx`:

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type AgeStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function AgeStep({ value, onChange, onContinue, onBack, current, total }: AgeStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual sua idade?"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <NumberStepper value={value} onChange={onChange} suffix="anos" min={16} max={100} />
    </OnboardingStep>
  );
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- WeightStep.test.tsx HeightStep.test.tsx AgeStep.test.tsx`
Expected: PASS (4 tests total: 2 + 1 + 1).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/NumberStepper.tsx src/components/onboarding/NumberStepper.test.tsx src/components/onboarding/WeightStep.tsx src/components/onboarding/WeightStep.test.tsx src/components/onboarding/HeightStep.tsx src/components/onboarding/HeightStep.test.tsx src/components/onboarding/AgeStep.tsx src/components/onboarding/AgeStep.test.tsx
git commit -m "feat: add NumberStepper and steps 2-4/8 (weight, height, age)"
```

---

### Task 7: IconChoiceCard + Step 5/8 (HungerTimeStep)

**Files:**
- Create: `member-app/src/components/onboarding/IconChoiceCard.tsx`
- Test: `member-app/src/components/onboarding/IconChoiceCard.test.tsx`
- Create: `member-app/src/components/onboarding/HungerTimeStep.tsx`
- Test: `member-app/src/components/onboarding/HungerTimeStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<IconChoiceCard icon title description selected onSelect />`;
  `<HungerTimeStep value onSelect onBack? current total />` — wired into `OnboardingFunnel` at
  `currentIndex === 4` (Task 12). Selecting an option both saves the answer and advances (no
  separate Continuar button on this step, matching `app.md`).

**Exact copy (from `app.md`, step 5/8):**
- Título: "Quando a fome ansiosa mais bate em você?"
- Opções: 🌅 De manhã / antes do almoço (`manha`) · ☁️ À tarde / entre 14h e 17h (`tarde`) ·
  🌙 À noite / depois do jantar (`noite`) · 🙁 O dia inteiro / sem parar (`dia-inteiro`)

- [ ] **Step 1: Write the failing IconChoiceCard test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconChoiceCard } from './IconChoiceCard';

describe('IconChoiceCard', () => {
  it('muestra el ícono, título y descripción', () => {
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected={false} onSelect={() => {}} />
    );
    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText('De manhã')).toBeInTheDocument();
    expect(screen.getByText('antes do almoço')).toBeInTheDocument();
  });

  it('marca aria-pressed cuando está seleccionado', () => {
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected onSelect={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('llama a onSelect al hacer clic', async () => {
    const onSelect = vi.fn();
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected={false} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- IconChoiceCard.test.tsx`
Expected: FAIL — `Cannot find module './IconChoiceCard'`.

- [ ] **Step 3: Implement IconChoiceCard**

```tsx
'use client';

type IconChoiceCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function IconChoiceCard({ icon, title, description, selected, onSelect }: IconChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-card border-2 bg-white p-4 text-left transition-transform active:scale-[0.98] ${
        selected ? 'border-brand bg-brand/5' : 'border-neutral-200'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block text-sm text-neutral-500">{description}</span>
      </span>
      {selected ? (
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">
          ✓
        </span>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- IconChoiceCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing HungerTimeStep test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HungerTimeStep } from './HungerTimeStep';

describe('HungerTimeStep', () => {
  it('muestra el título y las 4 opciones exactas', () => {
    render(<HungerTimeStep value={null} onSelect={() => {}} current={5} total={8} />);
    expect(screen.getByText('Quando a fome ansiosa mais bate em você?')).toBeInTheDocument();
    expect(screen.getByText('De manhã')).toBeInTheDocument();
    expect(screen.getByText('À tarde')).toBeInTheDocument();
    expect(screen.getByText('À noite')).toBeInTheDocument();
    expect(screen.getByText('O dia inteiro')).toBeInTheDocument();
  });

  it('llama a onSelect con el valor correcto al elegir una opción', async () => {
    const onSelect = vi.fn();
    render(<HungerTimeStep value={null} onSelect={onSelect} current={5} total={8} />);
    await userEvent.click(screen.getByText('À noite'));
    expect(onSelect).toHaveBeenCalledWith('noite');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- HungerTimeStep.test.tsx`
Expected: FAIL — `Cannot find module './HungerTimeStep'`.

- [ ] **Step 7: Implement HungerTimeStep**

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { IconChoiceCard } from './IconChoiceCard';

const OPTIONS = [
  { value: 'manha', icon: '🌅', title: 'De manhã', description: 'antes do almoço' },
  { value: 'tarde', icon: '☁️', title: 'À tarde', description: 'entre 14h e 17h' },
  { value: 'noite', icon: '🌙', title: 'À noite', description: 'depois do jantar' },
  { value: 'dia-inteiro', icon: '🙁', title: 'O dia inteiro', description: 'sem parar' },
];

type HungerTimeStepProps = {
  value: string | null;
  onSelect: (value: string) => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function HungerTimeStep({ value, onSelect, onBack, current, total }: HungerTimeStepProps) {
  return (
    <OnboardingStep current={current} total={total} title="Quando a fome ansiosa mais bate em você?" onBack={onBack}>
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <IconChoiceCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            description={opt.description}
            selected={value === opt.value}
            onSelect={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </OnboardingStep>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- HungerTimeStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/IconChoiceCard.tsx src/components/onboarding/IconChoiceCard.test.tsx src/components/onboarding/HungerTimeStep.tsx src/components/onboarding/HungerTimeStep.test.tsx
git commit -m "feat: add IconChoiceCard and step 5/8 (hunger time)"
```

---

### Task 8: CravingSlider + Step 6/8 (CravingStep)

**Files:**
- Create: `member-app/src/components/onboarding/CravingSlider.tsx`
- Test: `member-app/src/components/onboarding/CravingSlider.test.tsx`
- Create: `member-app/src/components/onboarding/CravingStep.tsx`
- Test: `member-app/src/components/onboarding/CravingStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<CravingSlider value onChange />`; `<CravingStep value onChange onContinue onBack?
  current total />` — wired into `OnboardingFunnel` at `currentIndex === 5` (Task 12).

**Exact copy (from `app.md`, step 6/8):**
- Título: "Em escala de 0 a 10, quão descontrolada é sua vontade de doce?"
- Componente: slider 0–10, emoji muda conforme o valor, número grande no centro, valor padrão 5.
- Labels nas pontas: "controlada" (esquerda) / "descontrolada" (direita).

Emoji-by-value isn't specified exactly in `app.md` beyond "muda conforme o valor" — this plan
defines a concrete 5-tier mapping: 0–2 `😌`, 3–4 `🙂`, 5–6 `😅`, 7–8 `😩`, 9–10 `🤯`.

- [ ] **Step 1: Write the failing CravingSlider test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CravingSlider } from './CravingSlider';

describe('CravingSlider', () => {
  it('muestra el valor grande y las etiquetas de los extremos', () => {
    render(<CravingSlider value={5} onChange={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('controlada')).toBeInTheDocument();
    expect(screen.getByText('descontrolada')).toBeInTheDocument();
  });

  it('muestra el emoji correcto según el rango del valor', () => {
    const { rerender } = render(<CravingSlider value={0} onChange={() => {}} />);
    expect(screen.getByText('😌')).toBeInTheDocument();
    rerender(<CravingSlider value={7} onChange={() => {}} />);
    expect(screen.getByText('😩')).toBeInTheDocument();
    rerender(<CravingSlider value={10} onChange={() => {}} />);
    expect(screen.getByText('🤯')).toBeInTheDocument();
  });

  it('llama a onChange con el nuevo valor al mover el slider', () => {
    const onChange = vi.fn();
    render(<CravingSlider value={5} onChange={onChange} />);
    const slider = screen.getByLabelText('Nível de vontade de doce, de 0 a 10');
    Object.defineProperty(slider, 'value', { value: '8', writable: true });
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CravingSlider.test.tsx`
Expected: FAIL — `Cannot find module './CravingSlider'`.

- [ ] **Step 3: Implement CravingSlider**

```tsx
'use client';

function emojiForValue(value: number): string {
  if (value <= 2) return '😌';
  if (value <= 4) return '🙂';
  if (value <= 6) return '😅';
  if (value <= 8) return '😩';
  return '🤯';
}

type CravingSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function CravingSlider({ value, onChange }: CravingSliderProps) {
  return (
    <div>
      <div className="text-center">
        <span className="text-5xl">{emojiForValue(value)}</span>
        <p className="mt-2 text-4xl font-bold text-foreground">{value}</p>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 w-full accent-brand"
        aria-label="Nível de vontade de doce, de 0 a 10"
      />
      <div className="mt-2 flex justify-between text-sm text-neutral-500">
        <span>controlada</span>
        <span>descontrolada</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- CravingSlider.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing CravingStep test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CravingStep } from './CravingStep';

describe('CravingStep', () => {
  it('muestra el título exacto', () => {
    render(<CravingStep value={5} onChange={() => {}} onContinue={() => {}} current={6} total={8} />);
    expect(
      screen.getByText('Em escala de 0 a 10, quão descontrolada é sua vontade de doce?')
    ).toBeInTheDocument();
  });

  it('llama a onContinue al hacer clic en Continuar', async () => {
    const onContinue = vi.fn();
    render(<CravingStep value={5} onChange={() => {}} onContinue={onContinue} current={6} total={8} />);
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- CravingStep.test.tsx`
Expected: FAIL — `Cannot find module './CravingStep'`.

- [ ] **Step 7: Implement CravingStep**

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { CravingSlider } from './CravingSlider';

type CravingStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function CravingStep({ value, onChange, onContinue, onBack, current, total }: CravingStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Em escala de 0 a 10, quão descontrolada é sua vontade de doce?"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <CravingSlider value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- CravingStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/CravingSlider.tsx src/components/onboarding/CravingSlider.test.tsx src/components/onboarding/CravingStep.tsx src/components/onboarding/CravingStep.test.tsx
git commit -m "feat: add CravingSlider and step 6/8 (sweet craving scale)"
```

---

### Task 9: WeightGoalGrid + Step 7/8 (WeightGoalStep)

**Files:**
- Create: `member-app/src/components/onboarding/WeightGoalGrid.tsx`
- Test: `member-app/src/components/onboarding/WeightGoalGrid.test.tsx`
- Create: `member-app/src/components/onboarding/WeightGoalStep.tsx`
- Test: `member-app/src/components/onboarding/WeightGoalStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<WeightGoalGrid options selected onSelect />`; `<WeightGoalStep value onSelect
  onBack? current total />` — wired into `OnboardingFunnel` at `currentIndex === 6` (Task 12).
  Selecting an option both saves the answer and advances, same as `HungerTimeStep`.

**Exact copy (from `app.md`, step 7/8):**
- Título: "Quantos quilos você quer eliminar?"
- Grid 2x2, sem ícones: Até 5 kg (`ate-5`) · 5 a 10 kg (`5-10`) · 10 a 20 kg (`10-20`) · Mais de
  20 kg (`mais-20`)

- [ ] **Step 1: Write the failing WeightGoalGrid test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightGoalGrid } from './WeightGoalGrid';

const OPTIONS = [
  { value: 'ate-5', label: 'Até 5 kg' },
  { value: '5-10', label: '5 a 10 kg' },
];

describe('WeightGoalGrid', () => {
  it('muestra todas las opciones', () => {
    render(<WeightGoalGrid options={OPTIONS} selected={null} onSelect={() => {}} />);
    expect(screen.getByText('Até 5 kg')).toBeInTheDocument();
    expect(screen.getByText('5 a 10 kg')).toBeInTheDocument();
  });

  it('marca aria-pressed en la opción seleccionada', () => {
    render(<WeightGoalGrid options={OPTIONS} selected="5-10" onSelect={() => {}} />);
    expect(screen.getByText('5 a 10 kg')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Até 5 kg')).toHaveAttribute('aria-pressed', 'false');
  });

  it('llama a onSelect con el value correcto', async () => {
    const onSelect = vi.fn();
    render(<WeightGoalGrid options={OPTIONS} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Até 5 kg'));
    expect(onSelect).toHaveBeenCalledWith('ate-5');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- WeightGoalGrid.test.tsx`
Expected: FAIL — `Cannot find module './WeightGoalGrid'`.

- [ ] **Step 3: Implement WeightGoalGrid**

```tsx
'use client';

type WeightGoalOption = { value: string; label: string };

type WeightGoalGridProps = {
  options: WeightGoalOption[];
  selected: string | null;
  onSelect: (value: string) => void;
};

export function WeightGoalGrid({ options, selected, onSelect }: WeightGoalGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          aria-pressed={selected === opt.value}
          className={`rounded-card border-2 bg-white px-4 py-6 text-center font-semibold transition-transform active:scale-[0.98] ${
            selected === opt.value ? 'border-brand bg-brand/5 text-brand' : 'border-neutral-200 text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- WeightGoalGrid.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing WeightGoalStep test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightGoalStep } from './WeightGoalStep';

describe('WeightGoalStep', () => {
  it('muestra el título y las 4 opciones exactas', () => {
    render(<WeightGoalStep value={null} onSelect={() => {}} current={7} total={8} />);
    expect(screen.getByText('Quantos quilos você quer eliminar?')).toBeInTheDocument();
    expect(screen.getByText('Até 5 kg')).toBeInTheDocument();
    expect(screen.getByText('5 a 10 kg')).toBeInTheDocument();
    expect(screen.getByText('10 a 20 kg')).toBeInTheDocument();
    expect(screen.getByText('Mais de 20 kg')).toBeInTheDocument();
  });

  it('llama a onSelect con el value correcto', async () => {
    const onSelect = vi.fn();
    render(<WeightGoalStep value={null} onSelect={onSelect} current={7} total={8} />);
    await userEvent.click(screen.getByText('Mais de 20 kg'));
    expect(onSelect).toHaveBeenCalledWith('mais-20');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- WeightGoalStep.test.tsx`
Expected: FAIL — `Cannot find module './WeightGoalStep'`.

- [ ] **Step 7: Implement WeightGoalStep**

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { WeightGoalGrid } from './WeightGoalGrid';

const OPTIONS = [
  { value: 'ate-5', label: 'Até 5 kg' },
  { value: '5-10', label: '5 a 10 kg' },
  { value: '10-20', label: '10 a 20 kg' },
  { value: 'mais-20', label: 'Mais de 20 kg' },
];

type WeightGoalStepProps = {
  value: string | null;
  onSelect: (value: string) => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WeightGoalStep({ value, onSelect, onBack, current, total }: WeightGoalStepProps) {
  return (
    <OnboardingStep current={current} total={total} title="Quantos quilos você quer eliminar?" onBack={onBack}>
      <WeightGoalGrid options={OPTIONS} selected={value} onSelect={onSelect} />
    </OnboardingStep>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- WeightGoalStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/WeightGoalGrid.tsx src/components/onboarding/WeightGoalGrid.test.tsx src/components/onboarding/WeightGoalStep.tsx src/components/onboarding/WeightGoalStep.test.tsx
git commit -m "feat: add WeightGoalGrid and step 7/8 (weight goal)"
```

---

### Task 10: WakeTimePicker + Step 8/8 (WakeTimeStep)

**Files:**
- Create: `member-app/src/components/onboarding/WakeTimePicker.tsx`
- Test: `member-app/src/components/onboarding/WakeTimePicker.test.tsx`
- Create: `member-app/src/components/onboarding/WakeTimeStep.tsx`
- Test: `member-app/src/components/onboarding/WakeTimeStep.test.tsx`

**Interfaces:**
- Consumes: `OnboardingStep` (Task 4).
- Produces: `<WakeTimePicker value onChange />`; `<WakeTimeStep value onChange onFinish onBack?
  current total />` — wired into `OnboardingFunnel` at `currentIndex === 7` (Task 12). This is
  the last step: its button says "FINALIZAR" (not "CONTINUAR") and calls `onFinish`, not a plain
  `goNext`.

**Exact copy (from `app.md`, step 8/8):**
- Título: "Qual horário você normalmente acorda?"
- Subtítulo: "Pra agendar seus lembretes"
- Componente: seletor de horário, valor padrão 07:00, ícone de relógio, texto "toque pra ajustar".
- Botão: "FINALIZAR"

- [ ] **Step 1: Write the failing WakeTimePicker test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WakeTimePicker } from './WakeTimePicker';

describe('WakeTimePicker', () => {
  it('muestra el valor y el texto auxiliar', () => {
    render(<WakeTimePicker value="07:00" onChange={() => {}} />);
    expect(screen.getByLabelText('Horário que você acorda')).toHaveValue('07:00');
    expect(screen.getByText('toque pra ajustar')).toBeInTheDocument();
  });

  it('llama a onChange con el nuevo valor', () => {
    const onChange = vi.fn();
    render(<WakeTimePicker value="07:00" onChange={onChange} />);
    const input = screen.getByLabelText('Horário que você acorda');
    Object.defineProperty(input, 'value', { value: '08:30', writable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('08:30');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- WakeTimePicker.test.tsx`
Expected: FAIL — `Cannot find module './WakeTimePicker'`.

- [ ] **Step 3: Implement WakeTimePicker**

```tsx
'use client';

type WakeTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function WakeTimePicker({ value, onChange }: WakeTimePickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl">⏰</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Horário que você acorda"
        className="rounded-card border border-neutral-300 px-4 py-3 text-2xl font-bold text-foreground"
      />
      <p className="text-sm text-neutral-500">toque pra ajustar</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- WakeTimePicker.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing WakeTimeStep test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WakeTimeStep } from './WakeTimeStep';

describe('WakeTimeStep', () => {
  it('muestra el título, subtítulo y el botón FINALIZAR', () => {
    render(<WakeTimeStep value="07:00" onChange={() => {}} onFinish={() => {}} current={8} total={8} />);
    expect(screen.getByText('Qual horário você normalmente acorda?')).toBeInTheDocument();
    expect(screen.getByText('Pra agendar seus lembretes')).toBeInTheDocument();
    expect(screen.getByText('FINALIZAR')).toBeInTheDocument();
  });

  it('llama a onFinish al hacer clic en FINALIZAR', async () => {
    const onFinish = vi.fn();
    render(<WakeTimeStep value="07:00" onChange={() => {}} onFinish={onFinish} current={8} total={8} />);
    await userEvent.click(screen.getByText('FINALIZAR'));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- WakeTimeStep.test.tsx`
Expected: FAIL — `Cannot find module './WakeTimeStep'`.

- [ ] **Step 7: Implement WakeTimeStep**

```tsx
'use client';

import { OnboardingStep } from './OnboardingStep';
import { WakeTimePicker } from './WakeTimePicker';

type WakeTimeStepProps = {
  value: string;
  onChange: (value: string) => void;
  onFinish: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WakeTimeStep({ value, onChange, onFinish, onBack, current, total }: WakeTimeStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual horário você normalmente acorda?"
      subtitle="Pra agendar seus lembretes"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onFinish}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          FINALIZAR
        </button>
      }
    >
      <WakeTimePicker value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- WakeTimeStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/WakeTimePicker.tsx src/components/onboarding/WakeTimePicker.test.tsx src/components/onboarding/WakeTimeStep.tsx src/components/onboarding/WakeTimeStep.test.tsx
git commit -m "feat: add WakeTimePicker and step 8/8 (wake time)"
```

---

### Task 11: ProcessingScreen + SuccessPlaceholder

**Files:**
- Create: `member-app/src/components/onboarding/ProcessingScreen.tsx`
- Test: `member-app/src/components/onboarding/ProcessingScreen.test.tsx`
- Create: `member-app/src/components/onboarding/SuccessPlaceholder.tsx`
- Test: `member-app/src/components/onboarding/SuccessPlaceholder.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<ProcessingScreen onComplete durationMs? />`; `<SuccessPlaceholder nome />` — wired
  into `OnboardingFunnel` after step 8 finishes (Task 12).

**Exact copy (from `app.md`, "Tela de processamento" and "Tela de sucesso" — this plan implements
only the loading + name-greeting parts; the "VER MEU PROTOCOLO" button and email capture belong
to the auth phase, not this plan):**
- Processing: "Montando seu protocolo personalizado…" / "Calculando sua dose ideal, horários e
  ritual ✨", duração ~3s.
- Success: "Protocolo pronto, [Nome]!" / "Sua dose, horários e checklist de 21 dias estão
  prontinhos pra você começar agora."

- [ ] **Step 1: Write the failing ProcessingScreen test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingScreen } from './ProcessingScreen';

describe('ProcessingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el texto exacto', () => {
    render(<ProcessingScreen onComplete={() => {}} />);
    expect(screen.getByText('Montando seu protocolo personalizado…')).toBeInTheDocument();
    expect(screen.getByText('Calculando sua dose ideal, horários e ritual ✨')).toBeInTheDocument();
  });

  it('llama a onComplete después de durationMs', () => {
    const onComplete = vi.fn();
    render(<ProcessingScreen onComplete={onComplete} durationMs={3000} />);
    expect(onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProcessingScreen.test.tsx`
Expected: FAIL — `Cannot find module './ProcessingScreen'`.

- [ ] **Step 3: Implement ProcessingScreen**

```tsx
'use client';

import { useEffect } from 'react';

type ProcessingScreenProps = {
  onComplete: () => void;
  durationMs?: number;
};

export function ProcessingScreen({ onComplete, durationMs = 3000 }: ProcessingScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timeout);
  }, [onComplete, durationMs]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"
      aria-live="polite"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute h-20 w-20 animate-spin rounded-full border-4 border-neutral-200 border-t-brand" />
        <span className="text-3xl">✨</span>
      </div>
      <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">Montando seu protocolo personalizado…</h1>
      <p className="mt-2 text-neutral-600">Calculando sua dose ideal, horários e ritual ✨</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ProcessingScreen.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing SuccessPlaceholder test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessPlaceholder } from './SuccessPlaceholder';

describe('SuccessPlaceholder', () => {
  it('muestra el nombre y el texto exacto', () => {
    render(<SuccessPlaceholder nome="Ana" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo pronto/)).toBeInTheDocument();
    expect(
      screen.getByText('Sua dose, horários e checklist de 21 dias estão prontinhos pra você começar agora.')
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- SuccessPlaceholder.test.tsx`
Expected: FAIL — `Cannot find module './SuccessPlaceholder'`.

- [ ] **Step 7: Implement SuccessPlaceholder**

```tsx
type SuccessPlaceholderProps = {
  nome: string;
};

export function SuccessPlaceholder({ nome }: SuccessPlaceholderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        Protocolo pronto, <span className="text-brand">{nome}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Sua dose, horários e checklist de 21 dias estão prontinhos pra você começar agora.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- SuccessPlaceholder.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/ProcessingScreen.tsx src/components/onboarding/ProcessingScreen.test.tsx src/components/onboarding/SuccessPlaceholder.tsx src/components/onboarding/SuccessPlaceholder.test.tsx
git commit -m "feat: add ProcessingScreen and SuccessPlaceholder"
```

---

### Task 12: OnboardingFunnel orchestrator + app shell

**Files:**
- Create: `member-app/src/components/onboarding/OnboardingFunnel.tsx`
- Test: `member-app/src/components/onboarding/OnboardingFunnel.test.tsx`
- Create: `member-app/src/app/layout.tsx`
- Create: `member-app/src/app/page.tsx`
- Create: `member-app/src/app/globals.css`

**Interfaces:**
- Consumes: `useOnboardingStore` (Task 2), every step component from Tasks 5-11.
- Produces: `<OnboardingFunnel />` — the default export of `page.tsx`; nothing later in this plan
  depends on it (this is the last task).

- [ ] **Step 1: Write the failing OnboardingFunnel test**

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFunnel } from './OnboardingFunnel';
import { useOnboardingStore } from '@/lib/store';

describe('OnboardingFunnel', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('renderiza la primera pantalla (nombre)', () => {
    render(<OnboardingFunnel />);
    expect(screen.getByText('Qual seu nome?')).toBeInTheDocument();
  });

  it('avanza de una pantalla a otra al completar cada paso', async () => {
    render(<OnboardingFunnel />);
    await userEvent.type(screen.getByPlaceholderText('Seu primeiro nome'), 'Ana');
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(screen.getByText('Qual seu peso atual hoje?')).toBeInTheDocument();
    expect(useOnboardingStore.getState().answers.nome).toBe('Ana');
  });

  it('recorre las 8 etapas y llega a la pantalla de éxito con el nombre correcto', async () => {
    useOnboardingStore.getState().setAnswer('nome', 'Ana');
    useOnboardingStore.getState().goToIndex(7);
    vi.useFakeTimers();
    render(<OnboardingFunnel />);
    await act(async () => {
      await userEvent.setup({ delay: null }).click(screen.getByText('FINALIZAR'));
    });
    expect(screen.getByText('Montando seu protocolo personalizado…')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo pronto/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- OnboardingFunnel.test.tsx`
Expected: FAIL — `Cannot find module './OnboardingFunnel'`.

- [ ] **Step 3: Implement OnboardingFunnel**

```tsx
'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/lib/store';
import { NameStep } from './NameStep';
import { WeightStep } from './WeightStep';
import { HeightStep } from './HeightStep';
import { AgeStep } from './AgeStep';
import { HungerTimeStep } from './HungerTimeStep';
import { CravingStep } from './CravingStep';
import { WeightGoalStep } from './WeightGoalStep';
import { WakeTimeStep } from './WakeTimeStep';
import { ProcessingScreen } from './ProcessingScreen';
import { SuccessPlaceholder } from './SuccessPlaceholder';

const TOTAL_STEPS = 8;

export function OnboardingFunnel() {
  const { currentIndex, answers, setAnswer, goNext, goBack } = useOnboardingStore();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const showBack = currentIndex > 0 ? goBack : undefined;

  if (done) {
    return <SuccessPlaceholder nome={answers.nome ?? ''} />;
  }

  if (processing) {
    return <ProcessingScreen onComplete={() => setDone(true)} />;
  }

  const commonProps = { current: currentIndex + 1, total: TOTAL_STEPS, onBack: showBack };

  switch (currentIndex) {
    case 0:
      return (
        <NameStep {...commonProps} value={answers.nome ?? ''} onChange={(v) => setAnswer('nome', v)} onContinue={goNext} />
      );
    case 1:
      return <WeightStep {...commonProps} value={answers.peso} onChange={(v) => setAnswer('peso', v)} onContinue={goNext} />;
    case 2:
      return <HeightStep {...commonProps} value={answers.altura} onChange={(v) => setAnswer('altura', v)} onContinue={goNext} />;
    case 3:
      return <AgeStep {...commonProps} value={answers.idade} onChange={(v) => setAnswer('idade', v)} onContinue={goNext} />;
    case 4:
      return (
        <HungerTimeStep
          {...commonProps}
          value={answers.horarioFome}
          onSelect={(v) => {
            setAnswer('horarioFome', v);
            goNext();
          }}
        />
      );
    case 5:
      return (
        <CravingStep {...commonProps} value={answers.vontadeDoce} onChange={(v) => setAnswer('vontadeDoce', v)} onContinue={goNext} />
      );
    case 6:
      return (
        <WeightGoalStep
          {...commonProps}
          value={answers.metaPeso}
          onSelect={(v) => {
            setAnswer('metaPeso', v);
            goNext();
          }}
        />
      );
    case 7:
      return (
        <WakeTimeStep
          {...commonProps}
          value={answers.horarioAcorda}
          onChange={(v) => setAnswer('horarioAcorda', v)}
          onFinish={() => setProcessing(true)}
        />
      );
    default:
      return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- OnboardingFunnel.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Create the app shell**

`member-app/src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  background-color: #faf6ee;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`member-app/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Protocolo Gel Metabólico de Chia — Seu app de acompanhamento',
  description: 'Sua receita, seu horário e seu progresso do Protocolo Gel Metabólico de Chia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  );
}
```

`member-app/src/app/page.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const OnboardingFunnel = dynamic(
  () => import('@/components/onboarding/OnboardingFunnel').then((mod) => mod.OnboardingFunnel),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
      </div>
    ),
  }
);

export default function Home() {
  return <OnboardingFunnel />;
}
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file created in Tasks 2-12 passes (32 tests total).

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Manual smoke test**

Run: `npm run dev` (starts on port 3100), open `http://localhost:3100` in a browser, click
through all 8 steps with real input, confirm the processing animation plays for ~3s and the
success screen shows the name you typed. Stop the dev server when done.

- [ ] **Step 9: Commit**

```bash
git add src/components/onboarding/OnboardingFunnel.tsx src/components/onboarding/OnboardingFunnel.test.tsx src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: wire the onboarding funnel and app shell"
```

---

## What this plan deliberately does NOT cover

Out of scope for this plan — each of these needs its own plan, written after this one is built
and merged, so the next plan can reference real files instead of guessing at interfaces:

- Supabase project setup, magic-link auth, `/auth/callback`, and the email-capture step on the
  success screen (currently `SuccessPlaceholder`, no button/email field).
- The authenticated `/app` member area (Início/Receita/Progresso tabs, check-ins, achievements).
- The real dose-calculation formula and its recipe UI (see `app-membro-design.md`, "Regras
  derivadas" section, for the approved weight/craving/age table).
- The daily email reminder (Resend + Supabase `pg_cron`).
- Deploy to Vercel and environment variable configuration.
