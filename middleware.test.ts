/**
 * @vitest-environment node
 */
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
