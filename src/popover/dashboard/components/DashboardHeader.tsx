import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMemo } from 'react';
import { Filters, TAB_TYPE } from '@/types';
import { EllipsisVertical, ListFilter, RefreshCw, Search, Settings } from 'lucide-react';
import GoogleCalendar from '@/assets/calendar.webp';
import filter from '@/assets/filter.svg';
import { Button } from '@/components/ui/button';
import FilterBadge from './FilterBadge';
import FilterPanel from './FilterPanel';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const attendanceValues = ['attended', 'absent'] as const;
const submitOptions = [
  { value: true, internalLabel: 'done' as const },
  { value: false, internalLabel: 'needed' as const },
];

export interface FilterHandlers {
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
}

export interface HeaderActions {
  remainingTime: number;
  isPending: boolean;
  onRefresh: () => void;
  onOpenSetting: () => void;
  isCalendarConnected: boolean;
  onCalendarSync: () => void;
}

interface DashboardHeaderProps {
  activeTab: TAB_TYPE;
  filter: FilterHandlers;
  actions: HeaderActions;
}

export default function DashboardHeader({ activeTab, filter: f, actions: a }: DashboardHeaderProps) {
  const { t } = useTranslation(['popover', 'common']);

  const TAB_TITLES: Record<TAB_TYPE, string> = {
    VIDEO: t('header.vodList'),
    ASSIGN: t('header.assignList'),
    QUIZ: t('header.quizList'),
    SETTING: t('header.setting'),
  };

  const attendanceOptions = attendanceValues.map((v) => t(`common:attendance.${v}`));
  const submitOptionsTranslated = submitOptions.map((o) => ({
    label: t(`common:submit.${o.internalLabel}`),
    value: o.value,
  }));

  const isFilterSet = useMemo(() => {
    const currentFilters = f.filters[activeTab];
    const { courseTitles, attendanceStatuses, submitStatuses } = currentFilters;
    return (
      (courseTitles && courseTitles.length > 0) ||
      (attendanceStatuses && attendanceStatuses.length > 0) ||
      (submitStatuses && submitStatuses.length > 0)
    );
  }, [f.filters, activeTab]);

  const refreshDisabled = a.isPending;

  return (
    <div className="bg-white w-full rounded-3xl z-10">
      <div className="w-full flex items-center justify-between px-5 pt-8 pb-6">
        <div className="items-center justify-center font-bold text-3xl">{TAB_TITLES[activeTab]}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex rounded-lg bg-white hover:bg-zinc-100 transition-all duration-200 p-2">
              <EllipsisVertical className="w-7 h-7" />
              {a.remainingTime >= (import.meta.env.VITE_MOCK ? 1 : 5) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl min-w-0 w-[100px]">
            <DropdownMenuItem
              onClick={a.onRefresh}
              disabled={refreshDisabled}
              className="text-xl py-3 gap-3 cursor-pointer [&>svg]:size-5"
            >
              <RefreshCw />
              <span className="flex-1">{t('common:refresh')}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.remainingTime >= (import.meta.env.VITE_MOCK ? 1 : 5) ? 'bg-red-500' : 'bg-green-500'}`}
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={a.onOpenSetting} className="text-xl py-3 gap-3 cursor-pointer [&>svg]:size-5">
              <Settings />
              {t('common:setting')}
            </DropdownMenuItem>
            {a.isCalendarConnected && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={a.onCalendarSync} className="text-xl py-3 gap-3 cursor-pointer [&>svg]:size-5">
                  <img src={GoogleCalendar} className="w-5 h-5" alt="" />
                  {t('common:calendar.syncShort')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {activeTab !== 'SETTING' && (
        <>
          <div className="mb-2 flex px-5 relative py-0">
            <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('common:search')}
              value={f.searchTerm}
              onChange={(e) => f.onSearchChange(e.target.value)}
              autoFocus={true}
              className="bg-zinc-50 rounded-xl border border-zinc-300 w-full text-lg h-12 pl-12 pr-4 placeholder-gray-400 font-medium py-0 outline-none focus:ring-0 focus:border-zinc-300 focus:bg-slate-50 transition-all duration-200"
            />
          </div>
          <div className="flex w-full items-center pl-5 my-1">
            <div className="whitespace-nowrap space-x-2 overflow-x-auto flex-1 min-w-0 flex overscroll-none">
              {f.filters[activeTab].courseTitles.map((title) => (
                <FilterBadge key={`course-${title}`} label={title} onRemove={() => f.onCourseTitleChange(title)} />
              ))}
              {activeTab === 'VIDEO' &&
                f.filters[activeTab].attendanceStatuses?.map((status) => (
                  <FilterBadge
                    key={`attendance-${status}`}
                    label={status}
                    onRemove={() => f.onAttendanceFilterChange(status)}
                  />
                ))}
              {(activeTab === 'ASSIGN' || activeTab === 'QUIZ') &&
                f.filters[activeTab].submitStatuses?.map((status) => (
                  <FilterBadge
                    key={`submit-${status}`}
                    label={status ? t('common:submit.done') : t('common:submit.needed')}
                    onRemove={() => f.onSubmitFilterChange(status)}
                  />
                ))}
            </div>
            <div className="flex flex-shrink-0 ml-2">
              <Popover open={f.isFilterOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={f.onFilterToggle}
                    className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mb-2 mr-5 ml-2 p-2"
                  >
                    {isFilterSet ? (
                      <img src={filter} className="w-9 h-9 p-0" alt={t('common:filterSet')} />
                    ) : (
                      <ListFilter className="w-9 h-9 p-0" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 shadow-md rounded-xl p-4 space-y-2">
                  <FilterPanel
                    filters={f.filters}
                    activeTab={activeTab}
                    courseTitlesMap={f.courseTitlesMap}
                    handleCourseTitleChange={f.onCourseTitleChange}
                    handleAttendanceFilterChange={f.onAttendanceFilterChange}
                    handleSubmitFilterChange={f.onSubmitFilterChange}
                    attendanceOptions={attendanceOptions}
                    submitOptions={submitOptionsTranslated}
                  />
                  <Button className="w-full text-xl h-12 font-semibold" variant="outline" onClick={f.onClearFilters}>
                    {t('common:clearAll')}
                  </Button>
                  <Button className="w-full text-xl h-12 font-semibold" variant="default" onClick={f.onFilterToggle}>
                    {t('common:close')}
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
