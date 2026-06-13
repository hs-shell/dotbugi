export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 한글 제목 길이 여유
    'header-max-length': [2, 'always', 100],
    // 제목 끝 마침표 금지만 유지하고, 대소문자 규칙은 한글 친화적으로 완화
    'subject-case': [0],
  },
};
