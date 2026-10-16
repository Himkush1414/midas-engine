import { describe, expect, it } from 'vitest';
import { checkDisplayName } from './names';

describe('checkDisplayName', () => {
  it.each(['Ana', 'Rahul K', 'zoë_99', 'Jean-Luc', "O'Neil", 'Grand.Master', '李雷'])('accepts %s', (n) => {
    expect(checkDisplayName(n).ok).toBe(true);
  });

  it('trims and collapses whitespace', () => {
    expect(checkDisplayName('  Big   Brain  ')).toEqual({ ok: true, name: 'Big Brain' });
  });

  it.each(['a', 'x'.repeat(25), '-dash', 'emoji 🙂', '<script>'])('rejects malformed %s', (n) => {
    expect(checkDisplayName(n).ok).toBe(false);
  });

  it.each(['www.spam', 'call 98765432', 'me@mail'])('rejects contact details: %s', (n) => {
    expect(checkDisplayName(n).ok).toBe(false);
  });

  it.each(['Sh1t head', 'F.U.C.K', 'MindtierAdmin', 'n4zi'])('rejects blocked words even when obfuscated: %s', (n) => {
    expect(checkDisplayName(n).ok).toBe(false);
  });
});
