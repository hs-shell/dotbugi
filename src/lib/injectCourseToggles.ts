import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { parseCoursesFromDOM } from '@/lib/parseCourses';

const TOGGLE_ATTR = 'data-dotbugi-toggle';

export function injectCourseToggles() {
  const allCourses = parseCoursesFromDOM();
  if (allCourses.length === 0) return;

  loadDataFromStorage<string[]>('trackedCourseIds', (savedIds) => {
    const trackedIds = savedIds ?? allCourses.filter((c) => !c.isCommunity).map((c) => c.courseId);

    if (!savedIds) {
      saveDataToStorage('trackedCourseIds', trackedIds);
    }

    const trackedSet = new Set(trackedIds);
    const listItems = document.querySelectorAll('.my-course-lists > li');

    listItems.forEach((li) => {
      if (li.querySelector(`[${TOGGLE_ATTR}]`)) return;

      const link = li.querySelector('a.course_link') as HTMLAnchorElement | null;
      if (!link) return;

      const courseId = new URL(link.href).searchParams.get('id');
      if (!courseId) return;

      const isTracked = trackedSet.has(courseId);
      const toggle = createToggleElement(isTracked);
      toggle.setAttribute(TOGGLE_ATTR, courseId);

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle(toggle, courseId);
      });

      const courseBox = li.querySelector('.course_box');
      if (courseBox) {
        (courseBox as HTMLElement).style.position = 'relative';
        courseBox.appendChild(toggle);
      }
    });
  });
}

function createToggleElement(isTracked: boolean): HTMLElement {
  const btn = document.createElement('div');
  btn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    background: ${isTracked ? '#3b82f6' : 'rgba(0, 0, 0, 0.4)'};
    border: 2px solid ${isTracked ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)'};
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;

  btn.innerHTML = getCheckSvg(isTracked);
  btn.title = isTracked ? 'Tracking' : 'Not tracking';
  return btn;
}

function getCheckSvg(isTracked: boolean): string {
  if (isTracked) {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
}

function updateToggleVisual(toggle: HTMLElement, isTracked: boolean) {
  toggle.style.background = isTracked ? '#3b82f6' : 'rgba(0, 0, 0, 0.4)';
  toggle.style.borderColor = isTracked ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)';
  toggle.innerHTML = getCheckSvg(isTracked);
  toggle.title = isTracked ? 'Tracking' : 'Not tracking';
}

function handleToggle(toggle: HTMLElement, courseId: string) {
  loadDataFromStorage<string[]>('trackedCourseIds', (currentIds) => {
    if (!currentIds) return;

    const isCurrentlyTracked = currentIds.includes(courseId);
    let newIds: string[];

    if (isCurrentlyTracked) {
      newIds = currentIds.filter((id) => id !== courseId);
    } else {
      newIds = [...currentIds, courseId];
    }

    saveDataToStorage('trackedCourseIds', newIds);
    updateToggleVisual(toggle, !isCurrentlyTracked);
  });
}
