import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeSignIn } from './completeSignIn';
import { ONBOARDING_STORAGE_KEY } from '@/lib/store';

type MockSupabase = Parameters<typeof completeSignIn>[0];
type MockRouter = Parameters<typeof completeSignIn>[2];

function mockProfilesTable({ existing }: { existing: boolean }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existing ? { id: 'user-1' } : null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ select, insert });
  return { from, insert };
}

const storedAnswers = {
  nombre: 'Ana',
  peso: 70,
  estatura: 165,
  edad: 30,
  horarioHambre: 'tarde',
  antojoDulce: 7,
  metaPeso: '5-10',
  horaDespertar: '07:30',
};

function setStoredAnswers() {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ state: { answers: storedAnswers } }));
}

describe('completeSignIn', () => {
  const push = vi.fn();
  const router = { push } as unknown as MockRouter;

  beforeEach(() => {
    push.mockReset();
    localStorage.clear();
  });

  it('navega a /app/recipe directamente si ya existe un perfil para este usuario', async () => {
    const { from } = mockProfilesTable({ existing: true });
    const supabase = { from } as unknown as MockSupabase;

    const result = await completeSignIn(supabase, { id: 'user-1' }, router);

    expect(result).toEqual({ error: false });
    expect(push).toHaveBeenCalledWith('/app/recipe');
  });

  it('crea el perfil desde localStorage y navega a /app/recipe cuando no existe perfil aún', async () => {
    const { from, insert } = mockProfilesTable({ existing: false });
    const supabase = { from } as unknown as MockSupabase;
    setStoredAnswers();

    const result = await completeSignIn(supabase, { id: 'user-1' }, router);

    expect(insert).toHaveBeenCalledWith({
      id: 'user-1',
      nombre: 'Ana',
      peso: 70,
      estatura: 165,
      edad: 30,
      horario_hambre: 'tarde',
      antojo_dulce: 7,
      meta_peso: '5-10',
      hora_despertar: '07:30',
    });
    expect(result).toEqual({ error: false });
    expect(push).toHaveBeenCalledWith('/app/recipe');
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it('devuelve error si no hay perfil ni datos guardados en localStorage', async () => {
    const { from } = mockProfilesTable({ existing: false });
    const supabase = { from } as unknown as MockSupabase;

    const result = await completeSignIn(supabase, { id: 'user-1' }, router);

    expect(result).toEqual({ error: true });
    expect(push).not.toHaveBeenCalled();
  });

  it('devuelve error si falla la creación del perfil, y no borra las respuestas guardadas', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const insert = vi.fn().mockResolvedValue({ error: { message: 'constraint violation' } });
    const from = vi.fn().mockReturnValue({ select, insert });
    const supabase = { from } as unknown as MockSupabase;
    setStoredAnswers();

    const result = await completeSignIn(supabase, { id: 'user-1' }, router);

    expect(result).toEqual({ error: true });
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).not.toBeNull();
  });
});
