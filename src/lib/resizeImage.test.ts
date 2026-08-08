import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resizeImage } from './resizeImage';

describe('resizeImage', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = global.Image;
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (this: HTMLCanvasElement, cb: BlobCallback) {
      cb(new Blob(['fake'], { type: 'image/jpeg' }));
    });
  });

  afterEach(() => {
    global.Image = originalImage;
    vi.restoreAllMocks();
  });

  it('resuelve con un Blob cuando la imagen carga correctamente', async () => {
    class FakeImage {
      width = 2000;
      height = 1000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error test stub
    global.Image = FakeImage;

    const file = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const blob = await resizeImage(file);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('rechaza cuando la imagen no puede leerse', async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_v: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    }
    // @ts-expect-error test stub
    global.Image = FakeImage;

    const file = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(resizeImage(file)).rejects.toThrow();
  });
});
