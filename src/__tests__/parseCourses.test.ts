import { describe, it, expect } from 'vitest';
import { parseCoursesFromDOM } from '@/lib/parseCourses';

function setupDOM(html: string) {
  document.body.innerHTML = html;
}

describe('parseCoursesFromDOM', () => {
  it('정상적인 과목 리스트 파싱', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=12345">
            <div class="course-title">
              <h3>프로그래밍 기초</h3>
              <p>김교수</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses).toHaveLength(1);
    expect(courses[0].courseId).toBe('12345');
    expect(courses[0].courseTitle).toBe('프로그래밍 기초');
    expect(courses[0].prof).toBe('김교수');
  });

  it('course_link가 없는 li는 무시', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li><div>빈 항목</div></li>
      </ul>
    `);
    expect(parseCoursesFromDOM()).toEqual([]);
  });

  it('빈 DOM이면 빈 배열', () => {
    setupDOM('');
    expect(parseCoursesFromDOM()).toEqual([]);
  });

  it('커뮤니티(비교과) 과목 식별', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li class="course_label_ec">
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=99">
            <div class="course-title">
              <h3>비교과 활동</h3>
              <p>이교수</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses[0].isCommunity).toBe(true);
  });

  it('일반 과목은 isCommunity가 false', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title">
              <h3>자료구조</h3>
              <p>박교수</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses[0].isCommunity).toBe(false);
  });

  it('제목에서 "new" 텍스트 제거', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title">
              <h3>자료구조new</h3>
              <p>박교수</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses[0].courseTitle).toBe('자료구조');
  });

  it('제목에서 대괄호 제거', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title">
              <h3>[A반] 알고리즘</h3>
              <p>최교수</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses[0].courseTitle).toBe(' 알고리즘');
  });

  it('courseId가 없는 URL은 무시', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php">
            <div class="course-title">
              <h3>과목명</h3>
              <p>교수명</p>
            </div>
          </a>
        </li>
      </ul>
    `);
    expect(parseCoursesFromDOM()).toEqual([]);
  });

  it('교수명이 없는 항목은 무시', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title">
              <h3>과목명</h3>
            </div>
          </a>
        </li>
      </ul>
    `);
    expect(parseCoursesFromDOM()).toEqual([]);
  });

  it('여러 과목 동시 파싱', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=1">
            <div class="course-title"><h3>과목A</h3><p>교수A</p></div>
          </a>
        </li>
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=2">
            <div class="course-title"><h3>과목B</h3><p>교수B</p></div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses).toHaveLength(2);
  });

  it('h1 태그에서도 제목 파싱', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title"><h1>컴파일러</h1><p>정교수</p></div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses).toHaveLength(1);
    expect(courses[0].courseTitle).toBe('컴파일러');
  });

  it('h2 태그에서도 제목 파싱', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title"><h2>네트워크</h2><p>한교수</p></div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses).toHaveLength(1);
    expect(courses[0].courseTitle).toBe('네트워크');
  });

  it('"New" 대문자도 제거 (case insensitive)', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title"><h3>운영체제New</h3><p>교수</p></div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses[0].courseTitle).toBe('운영체제');
  });

  it('제목이 빈 문자열이면 무시 (courseTitle falsy)', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=10">
            <div class="course-title"><h3></h3><p>교수</p></div>
          </a>
        </li>
      </ul>
    `);
    expect(parseCoursesFromDOM()).toEqual([]);
  });

  it('유효한 항목과 무효한 항목 혼합 시 유효한 것만 반환', () => {
    setupDOM(`
      <ul class="my-course-lists">
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=1">
            <div class="course-title"><h3>유효과목</h3><p>교수A</p></div>
          </a>
        </li>
        <li><div>빈 항목</div></li>
        <li>
          <a class="course_link" href="https://learn.hansung.ac.kr/course/view.php">
            <div class="course-title"><h3>ID없음</h3><p>교수B</p></div>
          </a>
        </li>
      </ul>
    `);
    const courses = parseCoursesFromDOM();
    expect(courses).toHaveLength(1);
    expect(courses[0].courseTitle).toBe('유효과목');
  });
});
