import { useState, useEffect, useCallback } from 'react';
import { Vod, Assign, Quiz } from '@/content/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { requestData } from '@/lib/fetchCourseData';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';

const makeVodKey = (courseId: string, title: string, week: number) => `${courseId}-${title}-${week}`;
const makeAssignKey = (courseId: string, title: string, dueDate: string) => `${courseId}-${title}-${dueDate}`;
const makeQuizKey = (courseId: string, title: string, dueDate: string) => `${courseId}-${title}-${dueDate}`;

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

      const vodSet = new Set<string>();
      const assignSet = new Set<string>();
      const quizSet = new Set<string>();

      await Promise.all(
        courses.map(async (course) => {
          const result = await requestData(course.courseId);

          result.vodDataArray.forEach((vodData) => {
            result.vodAttendanceArray.forEach((vodAttendanceData) => {
              const vodKey = makeVodKey(course.courseId, vodData.title, vodData.week);
              if (vodAttendanceData.week === vodData.week) {
                if (!vodSet.has(vodKey)) {
                  vodSet.add(vodKey);
                  tempVods.push({
                    courseId: course.courseId,
                    prof: course.prof,
                    courseTitle: course.courseTitle,
                    week: vodAttendanceData.week,
                    title: vodData.title,
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
            const assignKey = makeAssignKey(course.courseId, assignData.title, assignData.dueDate);
            if (!assignSet.has(assignKey)) {
              assignSet.add(assignKey);
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
            const quizKey = makeQuizKey(course.courseId, quizData.title, quizData.dueDate);
            if (!quizSet.has(quizKey)) {
              quizSet.add(quizKey);
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
        if (!data) return;
        setVods((data as Vod[]).filter((vod) => isCurrentDateInRange(vod.range)));
        // setVods((data as Vod[]) || []);
      });
      loadDataFromStorage('assign', (data) => {
        if (!data) return;
        setAssigns((data as Assign[]).filter((assign) => isCurrentDateByDate(assign.dueDate)));
        // setAssigns((data as Assign[]) || []);
      });
      loadDataFromStorage('quiz', (data) => {
        if (!data) return;
        setQuizes((data as Quiz[]).filter((quiz) => isCurrentDateByDate(quiz.dueDate)));
        // setQuizes((data as Quiz[]) || []);
      });
    }
  }, [courses, updateData]);
  return { vods, assigns, quizes, isPending, remainingTime, refreshTime, isError, updateData, setIsPending };
}
