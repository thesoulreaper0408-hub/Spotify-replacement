export interface SliceWavOptions {
  fadeInSec?: number;
  fadeOutSec?: number;
}

function writeAscii(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i += 1) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Slices channel PCM arrays from startSec to endSec, applies optional cosine/linear fades,
 * and encodes a valid 16-bit PCM RIFF/WAVE ArrayBuffer.
 */
export function encodeChannelsSliceToWav(
  channels: Float32Array[],
  sampleRate: number,
  startSec: number,
  endSec: number,
  options: SliceWavOptions = {}
): ArrayBuffer {
  const safeChannels = channels.length > 0 ? channels : [new Float32Array(0)];
  const totalSamples = safeChannels[0].length;
  const safeStart = Math.max(0, Math.floor(startSec * sampleRate));
  const safeEnd = Math.min(totalSamples, Math.max(safeStart + 1, Math.floor(endSec * sampleRate)));
  const sliceLen = Math.max(1, safeEnd - safeStart);
  const numChannels = safeChannels.length;

  const fadeInSamples = Math.min(
    Math.floor(sliceLen / 2),
    Math.max(0, Math.floor((options.fadeInSec ?? 0) * sampleRate))
  );
  const fadeOutSamples = Math.min(
    Math.floor(sliceLen / 2),
    Math.max(0, Math.floor((options.fadeOutSec ?? 0) * sampleRate))
  );

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = sliceLen * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let writeOffset = 44;
  for (let i = 0; i < sliceLen; i += 1) {
    let envelope = 1;
    if (fadeInSamples > 0 && i < fadeInSamples) {
      envelope *= i / fadeInSamples;
    }
    if (fadeOutSamples > 0 && i >= sliceLen - fadeOutSamples) {
      envelope *= (sliceLen - 1 - i) / fadeOutSamples;
    }

    const srcIdx = Math.min(totalSamples - 1, safeStart + i);
    for (let ch = 0; ch < numChannels; ch += 1) {
      const sample = totalSamples > 0 ? safeChannels[ch][srcIdx] * envelope : 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(
        writeOffset,
        clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
        true
      );
      writeOffset += 2;
    }
  }

  return buffer;
}

/**
 * Decodes an audio source URL via Web Audio API and exports the A-B range as a WAV Blob.
 */
export async function exportTrackClipAsWav(
  srcUrl: string,
  startSec: number,
  endSec: number,
  options: SliceWavOptions = {}
): Promise<Blob> {
  const response = await fetch(srcUrl);
  const arrayBuffer = await response.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is unavailable in this browser.');
  }
  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < decoded.numberOfChannels; ch += 1) {
      channels.push(decoded.getChannelData(ch));
    }
    const wavBuffer = encodeChannelsSliceToWav(
      channels,
      decoded.sampleRate,
      startSec,
      endSec,
      options
    );
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } finally {
    await ctx.close().catch(() => undefined);
  }
}
