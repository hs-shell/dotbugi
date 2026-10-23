import { describe, it, expect } from 'vitest';

import { CONNECT_MESSAGE_TYPE } from '@/lib/mcpConnect/constants';
import {
  isLmsSender,
  isValidCode,
  isValidPort,
  isValidSession,
  parseConnectHash,
  parseConnectMessage,
  parsePendingTarget,
  readSessionCookie,
} from '@/lib/mcpConnect/validate';

const CODE = 'abcDEF123_-xyz7890';
const SESSION = 'a1b2c3d4e5f6g7h8i9j0k1l2';

describe('isValidPort', () => {
  it('허용 범위 안의 정수만 통과', () => {
    expect(isValidPort(1024)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
    expect(isValidPort(1023)).toBe(false);
    expect(isValidPort(65536)).toBe(false);
    expect(isValidPort(3000.5)).toBe(false);
    expect(isValidPort('3000')).toBe(false);
  });
});

describe('isValidCode / isValidSession', () => {
  it('코드 형식', () => {
    expect(isValidCode(CODE)).toBe(true);
    expect(isValidCode('short')).toBe(false);
    expect(isValidCode('a'.repeat(65))).toBe(false);
    expect(isValidCode('abcdefghijklmnop!')).toBe(false);
    expect(isValidCode(123)).toBe(false);
  });

  it('세션 형식', () => {
    expect(isValidSession(SESSION)).toBe(true);
    expect(isValidSession('a,b-' + 'c'.repeat(20))).toBe(true);
    expect(isValidSession('a'.repeat(19))).toBe(false);
    expect(isValidSession(SESSION + ';x')).toBe(false);
    expect(isValidSession(undefined)).toBe(false);
  });
});

describe('parseConnectHash', () => {
  it('정상 해시 파싱', () => {
    expect(parseConnectHash(`#dotbugi-connect=54321.${CODE}`)).toEqual({ port: 54321, code: CODE });
  });

  it('형식·범위가 틀리면 null', () => {
    expect(parseConnectHash('')).toBeNull();
    expect(parseConnectHash(`#dotbugi-connect=123.${CODE}`)).toBeNull();
    expect(parseConnectHash(`#dotbugi-connect=99999.${CODE}`)).toBeNull();
    expect(parseConnectHash(`#dotbugi-connect=54321.short`)).toBeNull();
    expect(parseConnectHash(`#dotbugi-connect=54321.${CODE}&x=1`)).toBeNull();
    expect(parseConnectHash(`#other=54321.${CODE}`)).toBeNull();
  });
});

describe('parsePendingTarget', () => {
  const now = 1_000_000;
  const raw = (exp: number, extra: object = {}) => JSON.stringify({ port: 54321, code: CODE, exp, ...extra });

  it('만료 전이면 대상 반환', () => {
    expect(parsePendingTarget(raw(now + 1), now)).toEqual({ port: 54321, code: CODE });
  });

  it('만료·형식 오류·손상된 JSON은 null', () => {
    expect(parsePendingTarget(null, now)).toBeNull();
    expect(parsePendingTarget(raw(now), now)).toBeNull();
    expect(parsePendingTarget(raw(now + 1, { port: 80 }), now)).toBeNull();
    expect(parsePendingTarget(raw(now + 1, { code: 'bad' }), now)).toBeNull();
    expect(parsePendingTarget('{not json', now)).toBeNull();
  });
});

describe('readSessionCookie', () => {
  it('MoodleSession 값만 읽는다', () => {
    expect(readSessionCookie(`foo=1; MoodleSession=${SESSION}; bar=2`)).toBe(SESSION);
    expect(readSessionCookie(`MoodleSession=${SESSION}`)).toBe(SESSION);
    expect(readSessionCookie(`MoodleSessionTest=x; foo=1`)).toBeNull();
    expect(readSessionCookie('')).toBeNull();
  });
});

describe('isLmsSender', () => {
  it('LMS 출처만 허용', () => {
    expect(isLmsSender('https://learn.hansung.ac.kr/my/')).toBe(true);
    expect(isLmsSender('https://learn.hansung.ac.kr.evil.com/my/')).toBe(false);
    expect(isLmsSender('http://learn.hansung.ac.kr/my/')).toBe(false);
    expect(isLmsSender('https://evil.com/?https://learn.hansung.ac.kr/')).toBe(false);
    expect(isLmsSender(undefined)).toBe(false);
    expect(isLmsSender('not a url')).toBe(false);
  });
});

describe('parseConnectMessage', () => {
  const valid = { type: CONNECT_MESSAGE_TYPE, port: 54321, code: CODE, session: SESSION };

  it('정상 메시지는 요청으로 변환 (type 제외)', () => {
    expect(parseConnectMessage(valid)).toEqual({ port: 54321, code: CODE, session: SESSION });
  });

  it('타입·필드가 틀리면 null', () => {
    expect(parseConnectMessage(null)).toBeNull();
    expect(parseConnectMessage({ ...valid, type: 'getAuthToken' })).toBeNull();
    expect(parseConnectMessage({ ...valid, port: '54321' })).toBeNull();
    expect(parseConnectMessage({ ...valid, code: 'x' })).toBeNull();
    expect(parseConnectMessage({ ...valid, session: 'x' })).toBeNull();
  });
});
