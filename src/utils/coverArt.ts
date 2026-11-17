export interface TrackDetailsDraft {
  title: string;
  artist: string;
  album: string;
  customCoverUrl?: string;
}

const IMAGE_EXTENSIONS_RE = /\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i;

export function isValidImageFile(file: { type?: string; name?: string }): boolean {
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true;
  if (file.name && IMAGE_EXTENSIONS_RE.test(file.name)) return true;
  return false;
}

export function normalizeTrackDetailsPayload(
  input: TrackDetailsDraft,
  fallback?: { title?: string; artist?: string; album?: string }
): TrackDetailsDraft {
  const cleanTitle =
    input.title.trim() || fallback?.title?.trim() || 'Untitled Track';
  const cleanArtist =
    input.artist.trim() || fallback?.artist?.trim() || 'Local Artist';
  const cleanAlbum =
    input.album.trim() || fallback?.album?.trim() || 'Local Library';

  return {
    title: cleanTitle,
    artist: cleanArtist,
    album: cleanAlbum,
    customCoverUrl: input.customCoverUrl || undefined,
  };
}

function readBlobAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read image file'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and center-crops an uploaded cover image into a compact square data URL
 * (<= maxSize px) so every track picture displays crisply and persists cleanly in localStorage.
 */
export async function resizeCoverImageToDataUrl(file: File, maxSize = 480): Promise<string> {
  if (!isValidImageFile(file)) {
    throw new Error('Please choose a PNG, JPG, WebP, GIF, or SVG image file.');
  }

  // SVGs and very small images can still be converted cleanly via canvas or FileReader
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode image file'));
      el.src = objectUrl;
    });

    const w = img.naturalWidth || maxSize;
    const h = img.naturalHeight || maxSize;
    const side = Math.min(w, h);
    const sx = Math.max(0, Math.floor((w - side) / 2));
    const sy = Math.max(0, Math.floor((h - side) / 2));
    const targetSide = Math.min(maxSize, Math.max(256, side));

    const canvas = document.createElement('canvas');
    canvas.width = targetSide;
    canvas.height = targetSide;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return readBlobAsDataUrl(file);
    }

    ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSide, targetSide);
    return canvas.toDataURL('image/jpeg', 0.88);
  } catch {
    return readBlobAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
