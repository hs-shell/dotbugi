import { useState, useEffect, useCallback } from 'react';
import { Vod, Assign, Quiz, TAB_TYPE } from '@/content/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { requestData } from '@/lib/fetchCourseData';
import { isCurrentDateInRange, isCurrentDateByDate } from '@/lib/utils';

// courses 배열을 받아 vod, assign, quiz 데이터를 관리하는 커스텀 훅
export function useCourseData(courses: any[]) {
  const [vods, setVods] = useState<Vod[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [quizes, setQuizes] = useState<Quiz[]>([]);
  const [refreshTime, setRefreshTime] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isError, setIsError] = useState(false);

  const updateData = useCallback(async () => {
    try {
      setIsError(false);
      setIsPending(true);
      const currentTime = new Date().getTime();

      // 기존 데이터를 유지하면서 새로운 데이터만 추가
      const tempVods: Vod[] = [...vods];
      const tempAssigns: Assign[] = [...assigns];
      const tempQuizes: Quiz[] = [...quizes];

      // Set을 사용하여 중복 방지 (각 데이터 유형별로 title을 기준으로)
      const vodSet = new Set(tempVods.map((vod) => `${vod.courseId}-${vod.title}-${vod.range}-vod`));
      const assignSet = new Set(
        tempAssigns.map((assign) => `${assign.courseId}-${assign.title}-${assign.dueDate}-assign`)
      );
      const quizSet = new Set(tempQuizes.map((quiz) => `${quiz.courseId}-${quiz.title}-${quiz.dueDate}-quiz`));

      await Promise.all(
        courses.map(async (course) => {
          const result = await requestData(course.courseId);

          result.vodDataArray.forEach((vodData) => {
            result.vodAttendanceArray.forEach((vodAttendanceData) => {
              const vodKey = `${vodAttendanceData.title}-${vodAttendanceData.week}`;
              if (vodAttendanceData.title === vodData.title && vodAttendanceData.week === vodData.week) {
                if (!vodSet.has(vodKey)) {
                  vodSet.add(vodKey);
                  tempVods.push({
                    courseId: course.courseId,
                    prof: course.prof,
                    courseTitle: course.courseTitle,
                    week: vodAttendanceData.week,
                    title: vodAttendanceData.title,
                    isAttendance: vodAttendanceData.isAttendance,
                    weeklyAttendance: vodAttendanceData.weeklyAttendance,
                    length: vodData.length,
                    range: vodData.range,
                    subject: vodData.subject,
                    url: vodData.url,
                  });
                }
              }
            });
          });

          result.assignDataArray.forEach((assignData) => {
            if (!assignSet.has(assignData.title)) {
              assignSet.add(assignData.title);
              tempAssigns.push({
                courseId: course.courseId,
                prof: course.prof,
                courseTitle: course.courseTitle,
                subject: assignData.subject,
                title: assignData.title,
                dueDate: assignData.dueDate,
                isSubmit: assignData.isSubmit,
                url: assignData.url,
              });
            }
          });

          result.quizDataArray.forEach((quizData) => {
            if (!quizSet.has(quizData.title)) {
              quizSet.add(quizData.title);
              tempQuizes.push({
                courseId: course.courseId,
                prof: course.prof,
                courseTitle: course.courseTitle,
                subject: quizData.subject,
                title: quizData.title,
                dueDate: quizData.dueDate,
                url: quizData.url,
              });
            }
          });
        })
      );

      setVods(tempVods);
      setAssigns(tempAssigns);
      setQuizes(tempQuizes);

      saveDataToStorage('vod', tempVods);
      saveDataToStorage('assign', tempAssigns);
      saveDataToStorage('quiz', tempQuizes);

      setRefreshTime(new Date(currentTime).toLocaleTimeString());
      setRemainingTime(0);
      localStorage.setItem('lastRequestTime', currentTime.toString());
      saveDataToStorage('lastRequestTime', currentTime.toString());

      setIsPending(false);
    } catch (error) {
      localStorage.removeItem('lastRequestTime');
      setIsError(true);
      setIsPending(false);
    }
  }, [courses, vods, assigns, quizes]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (remainingTime >= 1440) {
      updateData();
    } else {
      timer = setTimeout(() => {
        setRemainingTime((prev) => prev + 1);
      }, 60 * 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [remainingTime, updateData]);

  useEffect(() => {
    if (!courses || courses.length === 0) return;

    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const currentTime = new Date().getTime();
    const oneDay = 60 * 60 * 1000 * 24;

    if (lastRequestTime) setRefreshTime(new Date(parseInt(lastRequestTime, 10)).toLocaleTimeString());
    if (!lastRequestTime || currentTime - parseInt(lastRequestTime, 10) >= oneDay) {
      setIsPending(true);
      updateData();
    } else {
      const minutes = (currentTime - parseInt(lastRequestTime, 10)) / (60 * 1000);
      setRemainingTime(minutes);
      loadDataFromStorage('vod', (data) => {
        setVods((data as Vod[]).filter((vod) => isCurrentDateInRange(vod.range)));
      });
      loadDataFromStorage('assign', (data) => {
        setAssigns((data as Assign[]).filter((assign) => isCurrentDateByDate(assign.dueDate)));
      });
      loadDataFromStorage('quiz', (data) => {
        setQuizes((data as Quiz[]).filter((quiz) => isCurrentDateByDate(quiz.dueDate)));
      });
    }
  }, [courses, updateData]);
  return { vods, assigns, quizes, isPending, remainingTime, refreshTime, isError, updateData, setIsPending };
}
