/**
 * @param key   chrome.storage에 저장할 때 사용할 key(문자열)
 * @param data  저장할 데이터. 타입은 제네릭 T로 자유롭게 지정 가능
 */
export function saveDataToStorage<T>(key: string, data: T): void {
  chrome.storage.local.set({ [key]: data }, () => {});
}

/**
 * @param key       chrome.storage에 저장된 데이터를 가져올 key(문자열)
 * @param callback  데이터를 가져온 뒤 실행할 콜백 함수.
 *                  만약 데이터가 없다면 null을 반환
 */
export function loadDataFromStorage<T>(key: string, callback: (data: T | null) => void): void {
  chrome.storage.local.get([key], (result) => {
    const data = result[key] as T;
    if (data) {
      callback(data);
    } else {
      callback(null);
    }
  });
}
