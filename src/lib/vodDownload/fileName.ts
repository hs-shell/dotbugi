const FORBIDDEN_CHARS = /[\\/:*?"<>|\p{Cc}]/gu;
const MAX_PART_LENGTH = 80;
const FALLBACK_NAME = 'vod';

/** `<과목>-<주차>-<강의명>.mp4` — OS 가 거부하는 문자를 바꾸고 부분마다 길이를 자른다 */
export function toVodFileName(parts: string[]): string {
  const cleaned = parts
    .map((part) =>
      part
        .replace(FORBIDDEN_CHARS, '_')
        .replace(/\s+/g, ' ')
        .trim()
        // Windows 는 끝의 점을 지워 확장자가 어긋날 수 있다
        .replace(/^\.+|\.+$/g, '')
        .slice(0, MAX_PART_LENGTH)
    )
    .filter(Boolean);
  return `${cleaned.join('-') || FALLBACK_NAME}.mp4`;
}
