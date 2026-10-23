// mux.js 는 타입 정의를 제공하지 않아 사용하는 트랜스먹서 API 만 선언한다
declare module 'mux.js/lib/mp4/transmuxer' {
  export interface TransmuxedSegment {
    initSegment: Uint8Array;
    data: Uint8Array;
  }

  export class Transmuxer {
    constructor(options?: { remux?: boolean });
    on(event: 'data', listener: (segment: TransmuxedSegment) => void): void;
    push(bytes: Uint8Array): void;
    flush(): void;
  }
}
