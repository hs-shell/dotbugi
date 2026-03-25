/**
 * Minimal ZIP (STORE, no compression) builder.
 * No external dependencies — uses standard Web APIs only.
 */

const CRC_TABLE = /* @__PURE__ */ (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

export interface ZipFile {
  name: string;
  data: Uint8Array;
}

export function createZip(files: ZipFile[]): Blob {
  const encoder = new TextEncoder();
  const entries: { name: Uint8Array; data: Uint8Array; crc: number; offset: number }[] = [];

  // Build local file headers + data
  const localParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);

    // Local file header: 30 bytes + name
    const header = new ArrayBuffer(30);
    const hv = new DataView(header);
    writeU32(hv, 0, 0x04034b50); // signature
    writeU16(hv, 4, 20); // version needed
    writeU16(hv, 8, 0); // compression: STORE
    writeU32(hv, 14, crc);
    writeU32(hv, 18, file.data.length); // compressed size
    writeU32(hv, 22, file.data.length); // uncompressed size
    writeU16(hv, 26, name.length);

    localParts.push(new Uint8Array(header), name, file.data);
    entries.push({ name, data: file.data, crc, offset });
    offset += 30 + name.length + file.data.length;
  }

  // Build central directory
  const centralParts: Uint8Array[] = [];
  let centralSize = 0;

  for (const entry of entries) {
    const cd = new ArrayBuffer(46);
    const cv = new DataView(cd);
    writeU32(cv, 0, 0x02014b50); // signature
    writeU16(cv, 4, 20); // version made by
    writeU16(cv, 6, 20); // version needed
    writeU16(cv, 10, 0); // compression: STORE
    writeU32(cv, 16, entry.crc);
    writeU32(cv, 20, entry.data.length);
    writeU32(cv, 24, entry.data.length);
    writeU16(cv, 28, entry.name.length);
    writeU32(cv, 42, entry.offset);

    centralParts.push(new Uint8Array(cd), entry.name);
    centralSize += 46 + entry.name.length;
  }

  // End of central directory record: 22 bytes
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  writeU32(ev, 0, 0x06054b50);
  writeU16(ev, 4, 0); // disk number
  writeU16(ev, 6, 0); // disk with CD
  writeU16(ev, 8, entries.length);
  writeU16(ev, 10, entries.length);
  writeU32(ev, 12, centralSize);
  writeU32(ev, 16, offset); // offset of CD

  return new Blob([...localParts, ...centralParts, new Uint8Array(eocd)], {
    type: 'application/zip',
  });
}
