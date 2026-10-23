// 스토어에 올라갈 빌드의 manifest 를 검사한다.
// key 는 로컬 테스트 빌드(--mode localtest)에만 들어가야 한다. 스토어는 key 가 든 업로드를 거부하므로
// 릴리즈·PR 빌드 산출물에 섞여 들어오지 않았는지 업로드 전에 막는다.
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(process.argv[2] ?? 'dist/manifest.json', 'utf8'));

if ('key' in manifest) {
  console.error(
    '::error::릴리즈 빌드 manifest 에 key 가 포함되어 있습니다. 로컬 테스트 빌드 설정이 섞였는지 확인하세요.'
  );
  process.exit(1);
}
console.log('manifest 검사 통과 (key 없음)');
