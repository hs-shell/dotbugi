import { useState, useEffect, useCallback } from 'react';
import { saveDataToStorage, loadDataFromStorage } from '@/lib/storage';

const STORAGE_KEY = 'hiddenTaskUrls';

export function useHiddenTasks() {
  const [hiddenUrls, setHiddenUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDataFromStorage<string[]>(STORAGE_KEY, (data) => {
      if (data) setHiddenUrls(new Set(data));
    });
  }, []);

  const persist = useCallback((urls: Set<string>) => {
    saveDataToStorage(STORAGE_KEY, Array.from(urls));
  }, []);

  const hideTask = useCallback((url: string) => {
    setHiddenUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      persist(next);
      return next;
    });
  }, [persist]);

  const hideTasks = useCallback((urls: string[]) => {
    setHiddenUrls((prev) => {
      const next = new Set(prev);
      for (const url of urls) next.add(url);
      persist(next);
      return next;
    });
  }, [persist]);

  const unhideTask = useCallback((url: string) => {
    setHiddenUrls((prev) => {
      const next = new Set(prev);
      next.delete(url);
      persist(next);
      return next;
    });
  }, [persist]);

  const isHidden = useCallback((url: string) => hiddenUrls.has(url), [hiddenUrls]);

  return { hiddenUrls, hideTask, hideTasks, unhideTask, isHidden };
}
