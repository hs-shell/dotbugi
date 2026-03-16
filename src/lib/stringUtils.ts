import i18n from '@/i18n';

export function removeSquareBrackets(str: string) {
  return str.replace(/\[[^\]]*\]/g, '');
}

export function formatDateString(input: string | null) {
  if (!input) return i18n.t('date.noDeadline', { ns: 'common' });
  const regex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2} ~ (\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2}/;

  return input.replace(
    regex,
    (_, y1, m1, d1, t1, y2, m2, d2, t2) =>
      `${y1.slice(2)}.${m1}.${d1} ${t1} ~ ${y2.slice(2)}.${m2}.${d2} ${t2}`
  );
}
