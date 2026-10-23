import { Transmuxer } from 'mux.js/lib/mp4/transmuxer';

/**
 * TS 세그먼트를 넣을 때마다 fragmented MP4 조각(첫 번째만 init 세그먼트 포함)을 돌려준다.
 * 한 인스턴스를 계속 써야 세그먼트 사이 타임스탬프가 이어진다.
 */
export function createTsToMp4(): (ts: Uint8Array) => Uint8Array[] {
  const transmuxer = new Transmuxer();
  let initWritten = false;
  let pending: Uint8Array[] = [];

  // flush() 안에서 data 이벤트가 동기로 발생하므로 모아 두었다가 돌려준다
  transmuxer.on('data', ({ initSegment, data }) => {
    if (!initWritten) {
      pending.push(initSegment);
      initWritten = true;
    }
    pending.push(data);
  });

  return (ts) => {
    transmuxer.push(ts);
    transmuxer.flush();
    const out = pending;
    pending = [];
    return out;
  };
}
