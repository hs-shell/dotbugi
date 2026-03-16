/**
 * LMS HTML 파싱에 사용되는 키워드 목록
 *
 * UI 언어 설정과 무관하게, LMS 자체 언어 설정에 따라 HTML에 표시되는 문자열이 달라집니다.
 * 각 키워드 배열에 LMS가 지원하는 모든 언어의 문자열을 추가하면 어떤 언어 설정이든 파싱이 동작합니다.
 *
 * 새 언어를 추가하려면 배열에 해당 언어의 문자열을 추가하면 됩니다.
 */

/** 과제 미제출 상태 텍스트 */
export const NOT_SUBMITTED = [
  '미제출', // ko
  'Not submitted', // en
  '提出なし', // 'ja',
  '没有作业', // 'zh',
];

/** 일괄출석인정 텍스트 (주차 출석 컬럼에 포함되면 출석 처리) */
export const BULK_APPROVED = [
  '일괄출석인정', // ko
  'Batch attendance', // en
  // 'ja',
  // 'zh',
];

/**
 * LMS 날짜 문자열을 JS Date가 파싱 가능한 형식으로 정규화
 *
 * 지원 형식:
 *   ko/en: "2023-04-24 10:50"
 *   zh:    "2023年04月24日 星期一 10:50"
 *   ja:    "2023年 04月 24日(月曜日) 10:50"
 *
 * 결과: "2023-04-24 10:50" (통일)
 */
export function normalizeLmsDate(raw: string | null): string | null {
  if (!raw) return null;
  const str = raw.trim();

  // 이미 ISO-like 형식이면 그대로 반환 (ko/en)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str;

  // ja/zh: "2023年04月24日..." 또는 "2023年 04月 24日..."
  const match = str.match(/(\d{4})年\s*(\d{2})月\s*(\d{2})日.*?(\d{2}:\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]} ${match[4]}`;
  }

  return str;
}

/**
 * LMS VOD range 문자열 정규화 ("시작 ~ 종료" 형태)
 * 각 날짜를 개별적으로 정규화하여 반환
 */
export function normalizeLmsRange(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.includes('~')) return normalizeLmsDate(raw);
  const parts = raw.split('~').map((s) => normalizeLmsDate(s.trim()));
  return parts.join(' ~ ');
}
