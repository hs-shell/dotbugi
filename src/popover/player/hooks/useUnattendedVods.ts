import { useCallback, useEffect, useState } from 'react';

import type { Vod } from '@/types';
import { isLmsUrl, urlOriginForLog } from '@/lib/lmsUrl';
import { logger } from '@/lib/logger';
import { loadDataFromStorage } from '@/lib/storage';
import { isAttended, isCurrentDateInRange } from '@/lib/utils';

const skipPlayerFilter = !!import.meta.env.VITE_MOCK_COURSES;
const usePureMock = !!import.meta.env.VITE_MOCK && !import.meta.env.VITE_MOCK_COURSES;

/** 플레이어 iframe 에 LMS 출처만 띄운다. 걸러낸 항목은 디버깅용으로 출처만 남긴다 */
function isPlayableUrl(url: string): boolean {
  if (isLmsUrl(url)) return true;
  logger.player.warn('LMS 출처가 아닌 영상을 플레이어 목록에서 제외:', urlOriginForLog(url));
  return false;
}

/** 스토리지에서 미시청 영상을 읽어 onLoad 로 넘긴다 (비동기 콜백이라 effect 에서 불러도 렌더 중 setState 가 아니다) */
async function readUnattendedVods(onLoad: (vods: Vod[]) => void): Promise<void> {
  if (usePureMock) {
    const { mockPlayerVodIds } = await import('@/mocks/mockData');
    const BASE = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=';
    onLoad(
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
        onLoad(data.filter((vod) => !hidden.has(vod.url) && isPlayableUrl(vod.url)));
      } else {
        onLoad(
          data.filter(
            (vod) =>
              !hidden.has(vod.url) &&
              isCurrentDateInRange(vod.range) &&
              !isAttended(vod.isAttendance) &&
              isPlayableUrl(vod.url)
          )
        );
      }
    });
  });
}

/** 플레이어에 띄울 미시청 영상 목록. 로드는 마운트, 팝오버 열기(호출 측), 스토리지 변경 이벤트에서 일어난다. */
export function useUnattendedVods(isPlaying: boolean) {
  const [vods, setVods] = useState<Vod[]>([]);

  const loadUnattendedVods = useCallback(() => readUnattendedVods(setVods), []);

  // 첫 열기 때 "영상 없음" 이 먼저 보이지 않도록 마운트 시 미리 불러 둔다
  useEffect(() => {
    readUnattendedVods(setVods);
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
