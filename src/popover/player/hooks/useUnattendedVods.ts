import { useCallback, useEffect, useState } from 'react';

import type { Vod } from '@/types';
import { loadDataFromStorage } from '@/lib/storage';
import { isAttended, isCurrentDateInRange } from '@/lib/utils';

const skipPlayerFilter = !!import.meta.env.VITE_MOCK_COURSES;
const usePureMock = !!import.meta.env.VITE_MOCK && !import.meta.env.VITE_MOCK_COURSES;

/** 플레이어에 띄울 미시청 영상 목록. 로드는 팝오버 열기(호출 측)와 스토리지 변경 이벤트에서 일어난다. */
export function useUnattendedVods(isPlaying: boolean) {
  const [vods, setVods] = useState<Vod[]>([]);

  const loadUnattendedVods = useCallback(async () => {
    if (usePureMock) {
      const { mockPlayerVodIds } = await import('@/mocks/mockData');
      const BASE = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=';
      setVods(
        mockPlayerVodIds.map((id, i) => ({
          courseId: 'mock',
          courseTitle: 'Player Test',
          prof: '',
          week: i + 1,
          subject: `${i + 1}주차`,
          title: `VOD-${id}`,
          url: `${BASE}${id}`,
          range: null,
          length: '00:00',
          isAttendance: 'X',
          weeklyAttendance: 'X',
        }))
      );
      return;
    }
    loadDataFromStorage<Vod[]>('vod', (data) => {
      if (!data) return;
      loadDataFromStorage<string[]>('hiddenTaskUrls', (hiddenUrls) => {
        const hidden = new Set(hiddenUrls ?? []);
        if (skipPlayerFilter) {
          setVods(data.filter((vod) => !hidden.has(vod.url)));
        } else {
          setVods(
            data.filter(
              (vod) => !hidden.has(vod.url) && isCurrentDateInRange(vod.range) && !isAttended(vod.isAttendance)
            )
          );
        }
      });
    });
  }, []);

  // Dashboard에서 새로고침 시 storage 변경을 감지해서 player 목록 갱신
  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if ((changes.vod || changes.hiddenTaskUrls) && !isPlaying) {
        loadUnattendedVods();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [loadUnattendedVods, isPlaying]);

  return { vods, setVods, loadUnattendedVods };
}
