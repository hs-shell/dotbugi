import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadVod } from '@/lib/vodDownload/download';
import { extractM3u8Url, toViewerUrl } from '@/lib/vodDownload/extractM3u8';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import { EncryptedHlsError, parsePlaylist } from '@/lib/vodDownload/playlist';
import { toAllowedHlsUrl, toSameHostUrl } from '@/lib/vodDownload/validate';

vi.mock('@/lib/fetchHtml', () => ({ fetchHtml: vi.fn() }));
vi.mock('@/lib/vodDownload/transmux', () => ({
  createTsToMp4: () => (ts: Uint8Array) => [ts],
}));

const CDN = 'https://abc123.edge.naverncp.com';
const M3U8 = `${CDN}/hls/TOKEN/uuid/mp4/uuid.mp4/index.m3u8`;
const base = new URL(M3U8);

const parseDoc = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('toViewerUrl', () => {
  it('view.php 의 숫자 id 로 viewer 주소를 만든다', () => {
    expect(toViewerUrl('https://learn.hansung.ac.kr/mod/vod/view.php?id=123')).toBe(
      'https://learn.hansung.ac.kr/mod/vod/viewer.php?id=123'
    );
    expect(toViewerUrl('https://learn.hansung.ac.kr/mod/vod/view.php?id=1&x=2')).toContain('id=1');
    expect(toViewerUrl('https://learn.hansung.ac.kr/mod/vod/view.php?id=1%26a')).toBeNull();
    expect(toViewerUrl('https://learn.hansung.ac.kr/mod/vod/view.php')).toBeNull();
  });
});

describe('extractM3u8Url', () => {
  it('JW Player sources 설정에서 m3u8 을 꺼낸다', () => {
    const doc = parseDoc(`<script>jwplayer('p').setup({ sources: [{file: '${M3U8}'}], width: '100%' });</script>`);
    expect(extractM3u8Url(doc)).toBe(M3U8);
  });

  it('줄바꿈·큰따옴표도 허용하고 따옴표 짝이 안 맞거나 m3u8 이 아니면 거른다', () => {
    expect(extractM3u8Url(parseDoc(`<script>sources: [\n {\n file: "${M3U8}"\n}]</script>`))).toBe(M3U8);
    expect(extractM3u8Url(parseDoc(`<script>sources: [{file: '${M3U8}"}]</script>`))).toBeNull();
    expect(extractM3u8Url(parseDoc(`<script>sources: [{file: '${CDN}/a.mp4'}]</script>`))).toBeNull();
    expect(
      extractM3u8Url(parseDoc(`<script>sources: [{file: 'http://x.edge.naverncp.com/a.m3u8'}]</script>`))
    ).toBeNull();
    expect(extractM3u8Url(parseDoc(`<div>sources: [{file: '${M3U8}'}]</div>`))).toBeNull();
  });
});

describe('toAllowedHlsUrl / toSameHostUrl', () => {
  it('https + *.edge.naverncp.com 만 허용', () => {
    expect(toAllowedHlsUrl(M3U8)?.href).toBe(M3U8);
    expect(toAllowedHlsUrl(M3U8.replace('https', 'http'))).toBeNull();
    expect(toAllowedHlsUrl('https://edge.naverncp.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://a.b.edge.naverncp.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://abc.edge.naverncp.com.evil.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://abcedge.naverncp.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://evil.com/a.edge.naverncp.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://user@abc.edge.naverncp.com/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('https://abc.edge.naverncp.com:8443/a.m3u8')).toBeNull();
    expect(toAllowedHlsUrl('not a url')).toBeNull();
  });

  it('세그먼트는 상대 경로를 해석하되 재생 목록과 같은 호스트만', () => {
    expect(toSameHostUrl('segment-1-v1-a1.ts', base)?.href).toBe(
      `${CDN}/hls/TOKEN/uuid/mp4/uuid.mp4/segment-1-v1-a1.ts`
    );
    expect(toSameHostUrl('https://other.edge.naverncp.com/s.ts', base)).toBeNull();
    expect(toSameHostUrl('//evil.com/s.ts', base)).toBeNull();
    expect(toSameHostUrl('http://abc123.edge.naverncp.com/s.ts', base)).toBeNull();
  });
});

describe('parsePlaylist', () => {
  const media = (extra = '') =>
    `#EXTM3U\n#EXT-X-TARGETDURATION:10\n${extra}#EXTINF:10,\nsegment-1-v1-a1.ts\n#EXTINF:10,\nsegment-2-v1-a1.ts\n#EXT-X-ENDLIST\n`;

  it('미디어 재생 목록의 세그먼트를 순서대로 돌려준다', () => {
    const result = parsePlaylist(media(), base);
    expect(result.kind).toBe('media');
    if (result.kind === 'media')
      expect(result.segments.map((s) => s.pathname.split('/').pop())).toEqual([
        'segment-1-v1-a1.ts',
        'segment-2-v1-a1.ts',
      ]);
  });

  it('METHOD≠NONE 인 EXT-X-KEY 가 있으면 거부, NONE 은 허용', () => {
    expect(() => parsePlaylist(media('#EXT-X-KEY:METHOD=AES-128,URI="k"\n'), base)).toThrow(EncryptedHlsError);
    expect(() => parsePlaylist(media('#EXT-X-KEY:METHOD=SAMPLE-AES,URI="k"\n'), base)).toThrow(EncryptedHlsError);
    expect(() => parsePlaylist(media('#EXT-X-KEY:URI="k"\n'), base)).toThrow(EncryptedHlsError);
    expect(() => parsePlaylist(`#EXTM3U\n#EXT-X-SESSION-KEY:METHOD=AES-128,URI="k"\n`, base)).toThrow(
      EncryptedHlsError
    );
    expect(parsePlaylist(media('#EXT-X-KEY:METHOD=NONE\n'), base).kind).toBe('media');
  });

  it('다른 호스트 세그먼트가 하나라도 있으면 거부', () => {
    const text = `#EXTM3U\n#EXTINF:10,\nsegment-1.ts\n#EXTINF:10,\nhttps://evil.com/segment-2.ts\n`;
    expect(() => parsePlaylist(text, base)).toThrow();
  });

  it('m3u8 이 아니면 거부', () => {
    expect(() => parsePlaylist('<html></html>', base)).toThrow();
  });

  it('마스터 재생 목록은 같은 호스트 변형 중 대역폭이 가장 큰 것을 고른다', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360',
      'low/index.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=9000000',
      'https://evil.com/high/index.m3u8',
      '#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1,BANDWIDTH=2000000',
      'mid/index.m3u8',
    ].join('\n');
    const result = parsePlaylist(text, base);
    expect(result.kind).toBe('master');
    if (result.kind === 'master') expect(result.variant.pathname).toMatch(/\/mid\/index\.m3u8$/);
  });

  it('같은 호스트 변형이 없으면 거부', () => {
    expect(() => parsePlaylist('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\nhttps://evil.com/a.m3u8\n', base)).toThrow();
  });
});

describe('toVodFileName', () => {
  it('금지 문자를 바꾸고 과목-주차-강의명.mp4 로 만든다', () => {
    expect(toVodFileName(['자료구조', '1주차', '배열 / 리스트: 소개?'])).toBe(
      '자료구조-1주차-배열 _ 리스트_ 소개_.mp4'
    );
    expect(toVodFileName(['a\u0000b', '..\\..', 'c'])).toBe('a_b-_-c.mp4');
    expect(toVodFileName(['', '  ', '...'])).toBe('vod.mp4');
    expect(toVodFileName(['x'.repeat(300)])).toBe(`${'x'.repeat(80)}.mp4`);
  });
});

describe('downloadVod', () => {
  const VOD_URL = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=42';

  const makeHandle = () => {
    const writable = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      abort: vi.fn().mockResolvedValue(undefined),
    };
    const handle = {
      createWritable: vi.fn().mockResolvedValue(writable),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    return { writable, handle: handle as unknown as FileSystemFileHandle, remove: handle.remove };
  };

  const setup = async (playlist: string) => {
    const { fetchHtml } = await import('@/lib/fetchHtml');
    vi.mocked(fetchHtml).mockResolvedValue(parseDoc(`<script>sources: [{file: '${M3U8}'}]</script>`));
    const fetchMock = vi.fn(async (url: URL) =>
      url.pathname.endsWith('.m3u8') ? new Response(playlist) : new Response(new Uint8Array([1, 2, 3]))
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  afterEach(() => vi.unstubAllGlobals());

  const PLAYLIST = '#EXTM3U\n#EXTINF:10,\nsegment-1.ts\n#EXTINF:10,\nsegment-2.ts\n#EXT-X-ENDLIST\n';

  it('세그먼트를 순서대로 받아 쓰고 닫는다 (CDN 요청은 쿠키 없이, 리다이렉트 거부)', async () => {
    const fetchMock = await setup(PLAYLIST);
    const { writable, handle } = makeHandle();
    const progress: number[] = [];

    await downloadVod(VOD_URL, handle, new AbortController().signal, (r) => progress.push(r));

    expect(writable.write).toHaveBeenCalledTimes(2);
    expect(writable.close).toHaveBeenCalled();
    expect(writable.abort).not.toHaveBeenCalled();
    expect(progress).toEqual([0.5, 1]);
    for (const [, init] of fetchMock.mock.calls as unknown as [URL, RequestInit][]) {
      expect(init).toMatchObject({ credentials: 'omit', redirect: 'error' });
    }
  });

  it('취소하면 쓰기를 버리고 파일을 지운다', async () => {
    await setup(PLAYLIST);
    const { writable, handle, remove } = makeHandle();
    const controller = new AbortController();

    const promise = downloadVod(VOD_URL, handle, controller.signal, () => controller.abort());

    await expect(promise).rejects.toThrow();
    expect(writable.abort).toHaveBeenCalled();
    expect(writable.close).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it('암호화된 재생 목록이면 세그먼트를 받지 않고 정리한다', async () => {
    const fetchMock = await setup('#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="k"\n#EXTINF:10,\ns.ts\n');
    const { writable, handle } = makeHandle();

    await expect(downloadVod(VOD_URL, handle, new AbortController().signal, () => {})).rejects.toThrow(
      EncryptedHlsError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(writable.abort).toHaveBeenCalled();
  });
});
