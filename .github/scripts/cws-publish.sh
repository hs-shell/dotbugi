#!/usr/bin/env bash
# Chrome Web Store API v2 로 zip 업로드 후 심사 제출(게시)한다.
# 인증은 워크플로의 google-github-actions/auth(WIF → 서비스 계정)가 발급한
# 단기 액세스 토큰을 쓴다 — 저장소에 장기 비밀(refresh token/키 파일)을 두지 않기 위함.
#
# 사용법: cws-publish.sh <zip 경로>
# 필요 env: ACCESS_TOKEN, CWS_PUBLISHER_ID, CWS_EXTENSION_ID
set -euo pipefail

ZIP="$1"
: "${ACCESS_TOKEN:?}" "${CWS_PUBLISHER_ID:?}" "${CWS_EXTENSION_ID:?}"

API='https://chromewebstore.googleapis.com'
ITEM="publishers/${CWS_PUBLISHER_ID}/items/${CWS_EXTENSION_ID}"
POLL_INTERVAL_SEC=10
POLL_MAX_TRIES=30

cws() {
  curl -sS --fail-with-body -H "Authorization: Bearer ${ACCESS_TOKEN}" "$@"
}

# 재실행 대비: 같은 버전이 이미 심사 중/게시됨이면 아무것도 하지 않는다.
# (스토어는 같은 버전 재제출을 거부하므로 그대로 진행하면 재실행이 항상 실패한다)
# 단, 거절·취소된 제출은 게시된 게 아니므로 성공으로 넘기지 않는다.
VERSION=$(unzip -p "$ZIP" manifest.json | jq -r '.version')
STATE=$(cws "${API}/v2/${ITEM}:fetchStatus" | jq -r --arg v "$VERSION" \
  'first([.submittedItemRevisionStatus, .publishedItemRevisionStatus][]? | select(any(.distributionChannels[]?; .crxVersion == $v)) | .state) // empty')
case "$STATE" in
  '') ;;
  REJECTED | CANCELLED)
    echo "::error::v${VERSION} 제출이 ${STATE} 상태입니다 — 개발자 대시보드에서 사유를 확인하세요 (재제출은 새 버전 필요)"
    exit 1
    ;;
  *)
    echo "v${VERSION} 은 이미 ${STATE} 상태 — 건너뜀"
    exit 0
    ;;
esac

echo "업로드: ${ZIP} (v${VERSION})"
state=$(cws -X POST -T "$ZIP" "${API}/upload/v2/${ITEM}:upload" | tee /dev/stderr | jq -r '.uploadState')

# 큰 패키지는 비동기 처리되어 IN_PROGRESS 로 돌아온다 → fetchStatus 로 완료 대기
tries=0
while [ "$state" = 'IN_PROGRESS' ] && [ "$tries" -lt "$POLL_MAX_TRIES" ]; do
  sleep "$POLL_INTERVAL_SEC"
  tries=$((tries + 1))
  state=$(cws "${API}/v2/${ITEM}:fetchStatus" | jq -r '.lastAsyncUploadState')
  echo "업로드 상태: ${state}"
done

if [ "$state" != 'SUCCEEDED' ]; then
  echo "::error::업로드 실패 (uploadState=${state})"
  exit 1
fi

echo '게시(심사 제출)'
cws -X POST -H 'Content-Type: application/json' -d '{}' "${API}/v2/${ITEM}:publish"
echo
