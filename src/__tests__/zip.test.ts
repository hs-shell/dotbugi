import { describe, expect, it } from 'vitest';

import { createZip } from '@/lib/zip';

/** jsdom 의 Blob 에는 arrayBuffer() 가 없어 FileReader 로 읽는다 */
function readBlob(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function readZip(blob: Blob) {
  const view = new DataView(await readBlob(blob));
  const decoder = new TextDecoder();
  const eocd = view.byteLength - 22;
  const count = view.getUint16(eocd + 10, true);
  let cd = view.getUint32(eocd + 16, true);
  const files: { name: string; text: string; crc: number }[] = [];
  for (let i = 0; i < count; i++) {
    expect(view.getUint32(cd, true)).toBe(0x02014b50);
    const crc = view.getUint32(cd + 16, true);
    const size = view.getUint32(cd + 20, true);
    const nameLen = view.getUint16(cd + 28, true);
    const local = view.getUint32(cd + 42, true);
    const name = decoder.decode(new Uint8Array(view.buffer, cd + 46, nameLen));
    expect(view.getUint32(local, true)).toBe(0x04034b50);
    const localNameLen = view.getUint16(local + 26, true);
    const text = decoder.decode(new Uint8Array(view.buffer, local + 30 + localNameLen, size));
    files.push({ name, text, crc });
    cd += 46 + nameLen;
  }
  return { files, signature: view.getUint32(eocd, true) };
}

describe('createZip', () => {
  it('여러 파일을 무압축 ZIP 으로 묶고, 중앙 디렉터리로 각 파일 이름·내용을 다시 찾을 수 있다', async () => {
    const enc = new TextEncoder();
    const blob = createZip([
      { name: 'general.txt', data: enc.encode('hello') },
      { name: '한글.json', data: enc.encode('{"a":1}') },
    ]);
    expect(blob.type).toBe('application/zip');

    const { files, signature } = await readZip(blob);
    expect(signature).toBe(0x06054b50);
    expect(files.map(({ name, text }) => ({ name, text }))).toEqual([
      { name: 'general.txt', text: 'hello' },
      { name: '한글.json', text: '{"a":1}' },
    ]);
  });

  it('CRC-32 를 표준 값으로 기록한다', async () => {
    // "123456789" 의 CRC-32 표준 검사값
    const { files } = await readZip(createZip([{ name: 'a', data: new TextEncoder().encode('123456789') }]));
    expect(files[0].crc).toBe(0xcbf43926);
  });

  it('파일이 없으면 끝 레코드(22바이트)만 있는 빈 ZIP', async () => {
    const blob = createZip([]);
    expect(blob.size).toBe(22);
    expect((await readZip(blob)).files).toEqual([]);
  });
});
