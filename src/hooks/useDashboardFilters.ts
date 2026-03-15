import { useCallback, useEffect, useMemo, useState } from 'react';
import { Assign, Filters, Quiz, TAB_TYPE, Vod } from '@/content/types';
import { filterVods, filterAssigns, filterQuizzes } from '@/lib/filterData';

interface UseDashboardFiltersParams {
  vods: Vod[];
  assigns: Assign[];
  quizzes: Quiz[];
  activeTab: TAB_TYPE;
}

export function useDashboardFilters({ vods, assigns, quizzes, activeTab }: UseDashboardFiltersParams) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<TAB_TYPE, Filters>>({
    VIDEO: { courseTitles: [], attendanceStatuses: [] },
    ASSIGN: { courseTitles: [], submitStatuses: [] },
    QUIZ: { courseTitles: [] },
  });

  useEffect(() => {
    setSearchTerm('');
    setIsFilterOpen(false);
  }, [activeTab]);

  const courseTitlesMap = useMemo(
    () => ({
      VIDEO: Array.from(new Set(vods.map((vod) => vod.courseTitle))),
      ASSIGN: Array.from(new Set(assigns.map((assign) => assign.courseTitle))),
      QUIZ: Array.from(new Set(quizzes.map((quiz) => quiz.courseTitle))),
    }),
    [vods, assigns, quizzes]
  );

  const filteredVods = useMemo(
    () => filterVods(vods, filters[activeTab], searchTerm, 'isAttendance'),
    [vods, filters, activeTab, searchTerm]
  );

  const filteredAssigns = useMemo(
    () => filterAssigns(assigns, filters[activeTab], searchTerm, 'isSubmit'),
    [assigns, filters, activeTab, searchTerm]
  );

  const filteredQuizzes = useMemo(
    () => filterQuizzes(quizzes, filters[activeTab], searchTerm, 'dueDate'),
    [quizzes, filters, activeTab, searchTerm]
  );

  const handleFilterChange = useCallback(
    <K extends keyof Filters>(field: K, value: Filters[K] extends (infer T)[] | undefined ? T : never) => {
      setFilters((prev) => {
        const current = (prev[activeTab][field] as (typeof value)[]) || [];
        const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        return {
          ...prev,
          [activeTab]: { ...prev[activeTab], [field]: updated },
        };
      });
    },
    [activeTab]
  );

  const handleCourseTitleChange = useCallback(
    (title: string) => handleFilterChange('courseTitles', title),
    [handleFilterChange]
  );
  const handleAttendanceFilterChange = useCallback(
    (status: string) => handleFilterChange('attendanceStatuses', status),
    [handleFilterChange]
  );
  const handleSubmitFilterChange = useCallback(
    (isSubmit: boolean) => handleFilterChange('submitStatuses', isSubmit),
    [handleFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: {
        courseTitles: [],
        ...(activeTab === 'VIDEO' ? { attendanceStatuses: [] } : {}),
        ...(activeTab === 'ASSIGN' ? { submitStatuses: [] } : {}),
      },
    }));
  }, [activeTab]);

  return {
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    courseTitlesMap,
    filteredVods,
    filteredAssigns,
    filteredQuizzes,
    handleCourseTitleChange,
    handleAttendanceFilterChange,
    handleSubmitFilterChange,
    clearFilters,
  };
}
