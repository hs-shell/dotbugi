import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

import { createTsToMp4 } from '@/lib/vodDownload/transmux';

// mux.js 패키지에 들어 있는 영상+음성 TS 샘플 (버전 고정이라 경로가 안정적)
const FIXTURE = 'node_modules/mux.js/test/segments/test-segment.ts';

const boxType = (bytes: Uint8Array) => new TextDecoder().decode(bytes.subarray(4, 8));

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
