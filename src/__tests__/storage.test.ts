import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveDataToStorage, loadDataFromStorage, loadAndTransform } from '@/lib/storage';

// chrome.storage.local mock
const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

  vi.stubGlobal('chrome', {
    storage: {
      local: {
        set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
          Object.assign(mockStorage, items);
          cb?.();
        }),
        get: vi.fn((keys: string[], cb: (result: Record<string, unknown>) => void) => {
          const result: Record<string, unknown> = {};
          keys.forEach((key) => {
            if (mockStorage[key] !== undefined) result[key] = mockStorage[key];
          });
          cb(result);
        }),
      },
    },
  });
});

describe('saveDataToStorage', () => {
  it('데이터를 chrome.storage.local에 저장', () => {
    saveDataToStorage('testKey', { value: 42 });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ testKey: { value: 42 } }, expect.any(Function));
    expect(mockStorage['testKey']).toEqual({ value: 42 });
  });

  it('문자열 데이터 저장', () => {
    saveDataToStorage('str', 'hello');
    expect(mockStorage['str']).toBe('hello');
  });

  it('배열 데이터 저장', () => {
    saveDataToStorage('arr', [1, 2, 3]);
    expect(mockStorage['arr']).toEqual([1, 2, 3]);
  });
});

describe('loadDataFromStorage', () => {
  it('저장된 데이터를 콜백으로 반환', () => {
    mockStorage['myKey'] = { name: 'test' };
    const callback = vi.fn();

    loadDataFromStorage('myKey', callback);
    expect(callback).toHaveBeenCalledWith({ name: 'test' });
  });

  it('데이터가 없으면 null 반환', () => {
    const callback = vi.fn();

    loadDataFromStorage('nonExistent', callback);
    expect(callback).toHaveBeenCalledWith(null);
  });
});

describe('loadAndTransform', () => {
  it('JSON 문자열을 파싱하고 변환 함수 적용', () => {
    mockStorage['items'] = JSON.stringify([1, 2, 3]);
    const callback = vi.fn();

    loadAndTransform<number, number>('items', (data) => data.reduce((a, b) => a + b, 0), callback);
    expect(callback).toHaveBeenCalledWith(6);
  });

  it('이미 파싱된 데이터에 변환 함수 적용', () => {
    mockStorage['items'] = [10, 20];
    const callback = vi.fn();

    loadAndTransform<number, number>('items', (data) => data.length, callback);
    expect(callback).toHaveBeenCalledWith(2);
  });

  it('데이터가 없으면 콜백 호출 안 함', () => {
    const callback = vi.fn();

    loadAndTransform('missing', (data) => data, callback);
    expect(callback).not.toHaveBeenCalled();
  });

  it('잘못된 JSON이면 콜백 호출 안 함', () => {
    mockStorage['bad'] = '{invalid json';
    const callback = vi.fn();

    loadAndTransform('bad', (data) => data, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});
