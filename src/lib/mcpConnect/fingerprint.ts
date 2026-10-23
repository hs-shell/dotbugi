import { FINGERPRINT_LENGTH } from './constants';

/**
 * 일회용 코드의 확인용 지문 (예: aB3dEf... → AB3-DEF).
 * 남이 만든 연결 요청에 속아 승인하지 않도록, CLI 가 터미널에 보여 준 값과 사용자가 눈으로 비교한다.
 * 대소문자를 잃어도 괜찮다 — 시각 확인용이며 코드 전체는 CLI 가 따로 검증한다.
 */
export function toFingerprint(code: string): string {
  const head = code.slice(0, FINGERPRINT_LENGTH).toUpperCase();
  const half = FINGERPRINT_LENGTH / 2;
  return `${head.slice(0, half)}-${head.slice(half)}`;
}
