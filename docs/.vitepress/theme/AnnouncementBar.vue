<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

const dismissed = ref(false);
const bar = ref<HTMLElement | null>(null);
const { lang } = useData();

const messages: Record<string, { text: string; link: string; linkText: string }> = {
  'ko-KR': {
    text: 'LMS 출석 인정 관련 공지사항:',
    link: '/dotbugi/guide/notice',
    linkText: '돋부기는 배속 프로그램이 아닙니다. 자세히 알아보기 →',
  },
  'en-US': {
    text: 'Notice regarding LMS attendance:',
    link: '/dotbugi/en/guide/notice',
    linkText: 'Dotbugi is NOT a speed-up program. Learn more →',
  },
  'ja-JP': {
    text: 'LMS出席認定に関するお知らせ:',
    link: '/dotbugi/ja/guide/notice',
    linkText: 'ドットブギは倍速プログラムではありません。詳細はこちら →',
  },
  'zh-CN': {
    text: 'LMS出勤认定相关公告:',
    link: '/dotbugi/zh/guide/notice',
    linkText: '돋부기不是倍速程序。了解详情 →',
  },
};

const msg = computed(() => messages[lang.value] || messages['ko-KR']);

let observer: IntersectionObserver | null = null;
const barHeight = ref(0);

function setOffset(visible: boolean) {
  const h = visible ? barHeight.value : 0;
  document.documentElement.style.setProperty('--vp-layout-top-height', `${h}px`);
}

function dismiss() {
  dismissed.value = true;
  setOffset(false);
}

function updateBarHeight() {
  if (bar.value) {
    barHeight.value = bar.value.offsetHeight;
  }
}

onMounted(() => {
  if (!bar.value) return;
  updateBarHeight();
  setOffset(true);
  window.addEventListener('resize', updateBarHeight);

  observer = new IntersectionObserver(
    ([entry]) => setOffset(entry.isIntersecting),
    { threshold: 0 },
  );
  observer.observe(bar.value);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBarHeight);
  observer?.disconnect();
  setOffset(false);
});
</script>

<template>
  <div v-if="!dismissed" ref="bar" class="announcement-bar">
    <div class="announcement-content">
      <span class="announcement-text">{{ msg.text }}</span>
      <a :href="msg.link" class="announcement-link">{{ msg.linkText }}</a>
    </div>
    <button class="announcement-close" @click="dismiss" aria-label="Close">&times;</button>
  </div>
</template>

<style scoped>
.announcement-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: #fff;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  z-index: 30;
}

.announcement-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.announcement-text {
  font-weight: 600;
}

.announcement-link {
  color: #bfdbfe;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.announcement-link:hover {
  color: #fff;
}

.announcement-close {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #93c5fd;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.announcement-close:hover {
  color: #fff;
}
</style>
