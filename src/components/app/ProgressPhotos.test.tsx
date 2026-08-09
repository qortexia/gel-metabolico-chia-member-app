import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressPhotos } from './ProgressPhotos';

const upload = vi.fn();
const insert = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: { from: () => ({ upload: (...args: unknown[]) => upload(...args) }) },
    from: () => ({ insert: (...args: unknown[]) => insert(...args) }),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));
vi.mock('@/lib/resizeImage', () => ({
  resizeImage: () => Promise.resolve(new Blob(['fake'], { type: 'image/jpeg' })),
}));

describe('ProgressPhotos', () => {
  beforeEach(() => {
    upload.mockReset();
    insert.mockReset();
    refresh.mockReset();
  });

  it('muestra el estado vacío sin fotos', () => {
    render(<ProgressPhotos userId="user-1" photos={[]} />);
    expect(screen.getByText(/Aún no tienes fotos de progreso/)).toBeInTheDocument();
  });

  it('con 1 foto, la muestra sola', () => {
    render(<ProgressPhotos userId="user-1" photos={[{ id: '1', takenAt: '2026-08-01', url: 'https://x/1.jpg' }]} />);
    expect(screen.getByAltText('Tu foto de progreso')).toHaveAttribute('src', 'https://x/1.jpg');
  });

  it('con 2+ fotos, muestra la comparación Antes/Ahora', () => {
    render(
      <ProgressPhotos
        userId="user-1"
        photos={[
          { id: '1', takenAt: '2026-08-01', url: 'https://x/1.jpg' },
          { id: '2', takenAt: '2026-08-08', url: 'https://x/2.jpg' },
        ]}
      />
    );
    expect(screen.getByAltText('Foto antes')).toHaveAttribute('src', 'https://x/1.jpg');
    expect(screen.getByAltText('Foto más reciente')).toHaveAttribute('src', 'https://x/2.jpg');
  });

  it('al elegir un archivo, redimensiona, sube, guarda la fila y refresca', async () => {
    upload.mockResolvedValue({ error: null });
    insert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<ProgressPhotos userId="user-1" photos={[]} />);

    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });
    await user.upload(document.querySelector('input[type="file"]')!, file);

    await waitFor(() => expect(upload).toHaveBeenCalled());
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }));
    expect(refresh).toHaveBeenCalled();
  });

  it('muestra el texto de privacidad', () => {
    render(<ProgressPhotos userId="user-1" photos={[]} />);
    expect(screen.getByText(/Solo tú puedes ver tus fotos/)).toBeInTheDocument();
  });

  it('guarda taken_at con la fecha de Ciudad de México, no la fecha UTC', async () => {
    // 2026-08-10T05:00:00Z es 2026-08-09T23:00:00 en Ciudad de México.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-10T05:00:00Z'));
    upload.mockResolvedValue({ error: null });
    insert.mockResolvedValue({ error: null });
    const user = userEvent.setup({ delay: null });
    render(<ProgressPhotos userId="user-1" photos={[]} />);

    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });
    await user.upload(document.querySelector('input[type="file"]')!, file);

    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ taken_at: '2026-08-09' }));
    vi.useRealTimers();
  });
});
