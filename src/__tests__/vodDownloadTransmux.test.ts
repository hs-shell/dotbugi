import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

import { patchInitDuration } from '@/lib/vodDownload/patchDuration';
import { createTsToMp4 } from '@/lib/vodDownload/transmux';

// mux.js 패키지에 들어 있는 영상+음성 TS 샘플 (버전 고정이라 경로가 안정적)
const FIXTURE = 'node_modules/mux.js/test/segments/test-segment.ts';

const boxType = (bytes: Uint8Array) => new TextDecoder().decode(bytes.subarray(4, 8));

/** init 세그먼트에서 type 박스들의 (timescale, duration) 을 찾는다 — 테스트용 단순 탐색 */
function readBoxes(init: Uint8Array, type: string) {
  const view = new DataView(init.buffer, init.byteOffset, init.byteLength);
  const found: { timescale: number; duration: number }[] = [];
  for (let i = 4; i + 4 <= init.byteLength; i++) {
    if (String.fromCharCode(...init.subarray(i, i + 4)) !== type) continue;
    const start = i - 4;
    if (type === 'tkhd') found.push({ timescale: 0, duration: view.getUint32(start + 28) });
    else found.push({ timescale: view.getUint32(start + 20), duration: view.getUint32(start + 24) });
  }
  return found;
}

describe('createTsToMp4', () => {
  it('첫 세그먼트는 init(ftyp)+fragment(moof), 다음 세그먼트는 fragment 만 낸다', () => {
    const ts = new Uint8Array(readFileSync(FIXTURE));
    const toMp4 = createTsToMp4();

    const first = toMp4(ts);
    expect(first).toHaveLength(2);
    expect(boxType(first[0])).toBe('ftyp');
    expect(boxType(first[1])).toBe('moof');

    const second = toMp4(ts);
    expect(second).toHaveLength(1);
    expect(boxType(second[0])).toBe('moof');
  });
});

describe('patchInitDuration', () => {
  it('mux.js 가 0xffffffff 로 둔 mvhd/tkhd/mdhd duration 을 실제 길이로 바꾼다', () => {
    const [init] = createTsToMp4()(new Uint8Array(readFileSync(FIXTURE)));
    expect(readBoxes(init, 'mvhd')[0].duration).toBe(0xffffffff);

    const patched = patchInitDuration(init, 12.5);

    expect(patched.byteLength).toBe(init.byteLength);
    const [mvhd] = readBoxes(patched, 'mvhd');
    expect(mvhd.duration).toBe(12.5 * mvhd.timescale);
    const tkhds = readBoxes(patched, 'tkhd');
    expect(tkhds).toHaveLength(2); // 영상 + 음성
    for (const tkhd of tkhds) expect(tkhd.duration).toBe(12.5 * mvhd.timescale);
    for (const mdhd of readBoxes(patched, 'mdhd')) expect(mdhd.duration).toBe(Math.round(12.5 * mdhd.timescale));
    // 원본은 그대로 둔다
    expect(readBoxes(init, 'mvhd')[0].duration).toBe(0xffffffff);
  });
});
