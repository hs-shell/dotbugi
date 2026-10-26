/**
 * 페이지를 떠나기 시작하면(beforeunload) 중단되는 signal.
 * 진행 중인 LMS 요청이 같은 호스트의 브라우저 연결을 차지하면 이동 요청이 그 뒤에 줄을 서므로, 이동을 우선하려고 끊는다.
 */
export function abortOnLeave() {
  const controller = new AbortController();
  const abort = () => controller.abort();
  window.addEventListener('beforeunload', abort);
  return { signal: controller.signal, dispose: () => window.removeEventListener('beforeunload', abort) };
}
