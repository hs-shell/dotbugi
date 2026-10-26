import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// 테스트가 끝나면 마운트한 훅을 모두 내려 리스너·비동기 효과가 다음 테스트로 새지 않게 한다
const mounted = new Set<Root>();
afterEach(async () => {
  for (const root of mounted) await act(async () => root.unmount());
  mounted.clear();
});

/** @testing-library 없이 훅을 마운트한다. result.current 는 커밋된 최신 반환값 */
export async function renderHook<P, R>(hook: (props: P) => R, initialProps: NoInfer<P>) {
  const result = { current: undefined as R };
  function Harness({ props }: { props: P }) {
    const value = hook(props);
    useEffect(() => {
      result.current = value;
    });
    return null;
  }
  const root = createRoot(document.createElement('div'));
  mounted.add(root);
  await act(async () => root.render(<Harness props={initialProps} />));
  return {
    result,
    rerender: (props: P) => act(async () => root.render(<Harness props={props} />)),
  };
}

/** 콜백 기반 chrome.storage.local + onChanged 를 메모리 객체로 흉내 낸다 */
export function stubChromeStorage(store: Record<string, unknown>) {
  const changeListeners = new Set<(changes: Record<string, chrome.storage.StorageChange>) => void>();
  const chromeStub = {
    storage: {
      local: {
        set: (items: Record<string, unknown>) => Object.assign(store, items),
        get: (keys: string[], cb: (r: Record<string, unknown>) => void) =>
          cb(Object.fromEntries(keys.filter((k) => k in store).map((k) => [k, store[k]]))),
      },
      onChanged: {
        addListener: (fn: (changes: Record<string, chrome.storage.StorageChange>) => void) => changeListeners.add(fn),
        removeListener: (fn: (changes: Record<string, chrome.storage.StorageChange>) => void) =>
          changeListeners.delete(fn),
      },
    },
  };
  const emitChange = (changes: Record<string, chrome.storage.StorageChange>) =>
    act(async () => changeListeners.forEach((fn) => fn(changes)));
  return { chromeStub, emitChange };
}
