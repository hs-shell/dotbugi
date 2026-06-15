import tailwindcss from '@tailwindcss/postcss';
import twPropertyFallback from './postcss/tw-property-fallback.js';

// twPropertyFallback 은 Tailwind가 생성한 @property 를 Shadow DOM에서도 쓰도록
// :root,:host 폴백으로 변환하므로 반드시 tailwindcss 다음에 실행돼야 한다.
export default {
  plugins: [tailwindcss(), twPropertyFallback()],
};
