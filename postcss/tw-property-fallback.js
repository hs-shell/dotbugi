/**
 * Tailwind v4는 box-shadow·border·transform 등 다수 유틸리티의 기본값을
 * @property 로 등록한 CSS 변수에 의존한다. 그런데 이 확장의 UI는 Shadow DOM에
 * adoptedStyleSheets(constructed stylesheet)로 주입되는데, 그 환경에서는
 * @property 가 등록되지 않는다(브라우저 사양).
 *
 * @property 가 없으면 두 가지가 깨진다:
 *  1) 변수에 초기값이 없어 box-shadow/transform 등이 무효화된다.
 *  2) `inherits: false` 가 사라져 일반 상속 변수가 된다 → 예: 컨테이너의
 *     border-none(--tw-border-style:none)·shadow-zinc(--tw-shadow-color)이
 *     모든 자식 카드로 상속되어 인디케이터가 사라지거나 그림자가 짙어진다.
 *
 * Tailwind는 @property 미지원 브라우저를 위해, 모든 변수를 초기값으로 리셋하는
 *   @layer properties { @supports(...) { *, ::before, ::after, ::backdrop { ... } } }
 * 폴백을 이미 생성한다. 다만 @supports 조건이 @property 지원 브라우저(Chrome 등)를
 * 제외하므로, Shadow DOM(adoptedStyleSheets) 환경에서도 막혀버린다.
 *
 * 이 플러그인은 그 @supports 게이트만 벗겨 리셋이 항상 적용되게 한다.
 * `*` 리셋이 @property 의 inherits:false 를 에뮬레이트해 상속 누수를 막고,
 * @layer properties 안에 남으므로 유틸리티 우선순위는 그대로 유지된다.
 *
 * 매칭은 조건 문자열이 아니라 "동작"으로 한다(견고성): 유니버설 셀렉터(*)에
 * --tw-* 커스텀 속성을 리셋하는 @supports 블록만 벗긴다. color-mix 등 다른
 * @supports(특정 유틸 클래스 대상)는 건드리지 않는다. Tailwind가 조건 문자열을
 * 바꿔도 동작하며, 대상 블록을 못 찾으면 경고로 회귀를 드러낸다.
 *
 * 참고: https://github.com/tailwindlabs/tailwindcss/discussions/16772
 */
const plugin = () => ({
  postcssPlugin: 'tw-property-fallback',
  OnceExit(root, { result }) {
    let unwrapped = 0;

    root.walkAtRules('supports', (rule) => {
      // 자식 중 유니버설(*) 셀렉터에 --tw-* 를 선언하는 규칙이 있으면 @property 게이트로 본다.
      let isPropertyGate = false;
      rule.walkRules((child) => {
        if (!child.selector.split(',').some((s) => s.trim().startsWith('*'))) return;
        child.walkDecls((decl) => {
          if (decl.prop.startsWith('--tw-')) isPropertyGate = true;
        });
      });

      if (isPropertyGate) {
        rule.replaceWith(rule.nodes);
        unwrapped += 1;
      }
    });

    if (unwrapped === 0) {
      result.warn(
        'tw-property-fallback: @property 폴백 게이트를 못 찾았습니다. Tailwind 출력 구조가 ' +
          '바뀌었을 수 있어 Shadow DOM에서 box-shadow/border 가 다시 깨질 수 있습니다.'
      );
    }
  },
});

plugin.postcss = true;

export default plugin;
