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
