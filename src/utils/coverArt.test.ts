import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidImageFile, normalizeTrackDetailsPayload } from './coverArt';

test('isValidImageFile accepts standard MIME types and image filename extensions', () => {
  assert.equal(isValidImageFile({ type: 'image/png', name: 'cover.png' }), true);
  assert.equal(isValidImageFile({ type: 'image/webp', name: 'art' }), true);
  assert.equal(isValidImageFile({ type: '', name: 'album.JPG' }), true);
  assert.equal(isValidImageFile({ type: 'audio/wav', name: 'song.wav' }), false);
  assert.equal(isValidImageFile({ type: 'text/plain', name: 'lyrics.lrc' }), false);
});

test('normalizeTrackDetailsPayload trims strings and applies safe fallbacks', () => {
  const edited = normalizeTrackDetailsPayload(
    {
      title: '  Midnight Groove  ',
      artist: '  Kuroda  ',
      album: '  City Sessions  ',
      customCoverUrl: 'data:image/png;base64,abc',
    },
    { title: 'Old', artist: 'Old Artist', album: 'Old Album' }
  );
  assert.equal(edited.title, 'Midnight Groove');
  assert.equal(edited.artist, 'Kuroda');
  assert.equal(edited.album, 'City Sessions');
  assert.equal(edited.customCoverUrl, 'data:image/png;base64,abc');

  const cleared = normalizeTrackDetailsPayload(
    { title: '   ', artist: '', album: ' ', customCoverUrl: '' },
    { title: 'Fallback Song', artist: 'Fallback Artist', album: '' }
  );
  assert.equal(cleared.title, 'Fallback Song');
  assert.equal(cleared.artist, 'Fallback Artist');
  assert.equal(cleared.album, 'Local Library');
  assert.equal(cleared.customCoverUrl, undefined);
});
