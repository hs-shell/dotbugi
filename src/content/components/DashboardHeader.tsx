import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMemo } from 'react';
import { Filters, TAB_TYPE } from '../types';
import { ListFilter, RefreshCw, Search } from 'lucide-react';
import filter from '@/assets/filter.svg';
import { Button } from '@/components/ui/button';
import FilterBadge from './FilterBadge';
import FilterPanel from './FilterPanel';

const TAB_TITLES: Record<TAB_TYPE, string> = {
  VIDEO: '온라인 강의 목록',
  ASSIGN: '과제 목록',
  QUIZ: '퀴즈 목록',
};

const attendanceOptions = ['출석', '결석'];
const submitOptions = [
  { label: '제출완료', value: true },
  { label: '제출필요', value: false },
];

interface DashboardHeaderProps {
  activeTab: TAB_TYPE;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Record<TAB_TYPE, Filters>;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  courseTitlesMap: Record<TAB_TYPE, string[]>;
  onCourseTitleChange: (title: string) => void;
  onAttendanceFilterChange: (status: string) => void;
  onSubmitFilterChange: (isSubmit: boolean) => void;
  onClearFilters: () => void;
  remainingTime: number;
  isPending: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  activeTab,
  searchTerm,
  onSearchChange,
  filters,
  isFilterOpen,
  onFilterToggle,
  courseTitlesMap,
  onCourseTitleChange,
  onAttendanceFilterChange,
  onSubmitFilterChange,
  onClearFilters,
  remainingTime,
  isPending,
  onRefresh,
}: DashboardHeaderProps) {
  const isFilterSet = useMemo(() => {
    const currentFilters = filters[activeTab];
    const { courseTitles, attendanceStatuses, submitStatuses } = currentFilters;
    return (
      (courseTitles && courseTitles.length > 0) ||
      (attendanceStatuses && attendanceStatuses.length > 0) ||
      (submitStatuses && submitStatuses.length > 0)
    );
  }, [filters, activeTab]);

  const refreshDisabled = isPending || remainingTime <= 1;

  return (
    <div className="bg-white w-full rounded-3xl z-10">
      <div className="w-full flex items-center justify-between px-5 pt-8 pb-6">
        <div className="items-center justify-center font-bold text-3xl">{TAB_TITLES[activeTab]}</div>
        <div className="flex justify-center items-center">
          <span
            className={`text-sm px-1 ${remainingTime >= 30 ? 'text-amber-500 font-semibold' : 'text-zinc-400'}`}
          >
            {remainingTime < 60 ? `${Math.round(remainingTime)}분 전` : `${Math.floor(remainingTime / 60)}시간 전`}
          </span>
          <button
            className={`flex rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 p-2 ml-1 ${refreshDisabled && 'cursor-not-allowed'}`}
            disabled={refreshDisabled}
            onClick={onRefresh}
          >
            <RefreshCw className="w-8 h-8 p-0" />
          </button>
        </div>
      </div>
      <div className="mb-2 flex px-5 relative py-0">
        <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="검색"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus={true}
          className="bg-zinc-50 rounded-xl border border-zinc-300 w-full text-lg h-12 pl-12 pr-4 placeholder-gray-400 font-medium py-0 outline-none focus:ring-0 focus:border-zinc-300 focus:bg-slate-50 transition-all duration-200"
        />
      </div>
      <div className="flex w-full items-center pl-5 my-1">
        <div className="whitespace-nowrap space-x-2 overflow-x-auto flex-1 min-w-0 flex overscroll-none">
          {filters[activeTab].courseTitles.map((title) => (
            <FilterBadge key={`course-${title}`} label={title} onRemove={() => onCourseTitleChange(title)} />
          ))}
          {activeTab === 'VIDEO' &&
            filters[activeTab].attendanceStatuses?.map((status) => (
              <FilterBadge
                key={`attendance-${status}`}
                label={status}
                onRemove={() => onAttendanceFilterChange(status)}
              />
            ))}
          {activeTab === 'ASSIGN' &&
            filters[activeTab].submitStatuses?.map((status) => (
              <FilterBadge
                key={`submit-${status}`}
                label={status ? '제출완료' : '제출필요'}
                onRemove={() => onSubmitFilterChange(status)}
              />
            ))}
        </div>
        <div className="flex flex-shrink-0 ml-2">
          <Popover open={isFilterOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={onFilterToggle}
                className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mb-2 mr-5 ml-2 p-2"
              >
                {isFilterSet ? (
                  <img src={filter} className="w-9 h-9 p-0" alt="필터 설정됨" />
                ) : (
                  <ListFilter className="w-9 h-9 p-0" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 shadow-md rounded-xl p-4 space-y-2">
              <FilterPanel
                filters={filters}
                activeTab={activeTab}
                courseTitlesMap={courseTitlesMap}
                handleCourseTitleChange={onCourseTitleChange}
                handleAttendanceFilterChange={onAttendanceFilterChange}
                handleSubmitFilterChange={onSubmitFilterChange}
                attendanceOptions={attendanceOptions}
                submitOptions={submitOptions}
              />
              <Button className="w-full text-xl h-12 font-semibold" variant="outline" onClick={onClearFilters}>
                모두 지우기
              </Button>
              <Button className="w-full text-xl h-12 font-semibold" variant="default" onClick={onFilterToggle}>
                닫기
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
