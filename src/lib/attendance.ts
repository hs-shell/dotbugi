export function isAttended(value: string) {
  return value.toLowerCase().trim() === 'o';
}

export function isAbsent(value: string) {
  return value.toUpperCase().startsWith('X');
}
