import { saveDataToStorage } from '@/lib/storage';

const AUTO_REFRESH_KEY = 'autoRefresh';

/** 다른 LMS 페이지의 배너에서 요청한 새로고침 — 메인 페이지 대시보드가 읽고 지운다 (탭 단위) */
export const REFRESH_REQUEST_KEY = 'dotbugi_refresh_request';

/** 자동 새로고침 설정. 저장값이 없으면 켜짐 */
export function loadAutoRefresh(): Promise<boolean> {
  // loadDataFromStorage 는 false 를 null 로 바꾸므로 직접 읽는다
  return new Promise((resolve) =>
    chrome.storage.local.get([AUTO_REFRESH_KEY], (result) => {
      // 읽기 실패는 예외 없이 lastError 로만 알린다. 기본값(켜짐)으로 끝내야 배지 주입·초기 로드가 멈추지 않는다
      if (chrome.runtime?.lastError) return resolve(true);
      resolve(result?.[AUTO_REFRESH_KEY] !== false);
    })
  );
}

export function saveAutoRefresh(enabled: boolean): void {
  saveDataToStorage(AUTO_REFRESH_KEY, enabled);
}
