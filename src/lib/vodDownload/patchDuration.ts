const CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia']);
const BOX_HEADER_SIZE = 8;
// version 0 기준 오프셋 (mux.js 는 version 0 만 만든다)
const TIMESCALE_OFFSET = 20; // mvhd·mdhd: 헤더 8 + version/flags 4 + 생성·수정 시각 8
const MEDIA_DURATION_OFFSET = 24;
const TKHD_DURATION_OFFSET = 28; // tkhd: 헤더 8 + version/flags 4 + 시각 8 + track_ID 4 + reserved 4
const MAX_UINT32 = 0xffffffff;

/**
 * mux.js 는 길이를 모르는 채로 init 세그먼트를 만들어 mvhd/tkhd/mdhd duration 을 0xffffffff 로 둔다.
 * 다 받은 뒤 실제 길이(초)를 써 넣어야 플레이어가 전체 길이·탐색 막대를 제대로 보여 준다.
 */
export function patchInitDuration(init: Uint8Array, seconds: number): Uint8Array {
  const out = init.slice();
  const view = new DataView(out.buffer);
  let movieTimescale = 0;
  // tkhd 는 movie timescale 을 쓰므로 mvhd 를 먼저 읽어야 한다 (moov 안에서 mvhd 가 trak 보다 앞에 온다)
  const toTicks = (timescale: number) => Math.min(MAX_UINT32 - 1, Math.round(seconds * timescale));

  const walk = (start: number, end: number) => {
    for (let pos = start; pos + BOX_HEADER_SIZE <= end;) {
      const size = view.getUint32(pos);
      if (size < BOX_HEADER_SIZE || pos + size > end) return;
      const type = String.fromCharCode(...out.subarray(pos + 4, pos + 8));
      const isV0 = out[pos + BOX_HEADER_SIZE] === 0;
      if (CONTAINER_BOXES.has(type)) walk(pos + BOX_HEADER_SIZE, pos + size);
      else if (isV0 && (type === 'mvhd' || type === 'mdhd')) {
        const timescale = view.getUint32(pos + TIMESCALE_OFFSET);
        if (type === 'mvhd') movieTimescale = timescale;
        view.setUint32(pos + MEDIA_DURATION_OFFSET, toTicks(timescale));
      } else if (isV0 && type === 'tkhd' && movieTimescale) {
        view.setUint32(pos + TKHD_DURATION_OFFSET, toTicks(movieTimescale));
      }
      pos += size;
    }
  };
  walk(0, out.byteLength);
  return out;
}
