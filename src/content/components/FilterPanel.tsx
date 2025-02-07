import React from 'react';
import FilterItem from './FilterItem';
import { TAB_TYPE, Filters } from '../types';

interface FilterPanelProps {
  filters: Record<TAB_TYPE, Filters>;
  activeTab: TAB_TYPE;
  courseTitlesMap: Record<TAB_TYPE, string[]>;
  handleCourseTitleChange: (courseTitle: string) => void;
  handleAttendanceFilterChange: (status: string) => void;
  handleSubmitFilterChange: (isSubmit: boolean) => void;
  attendanceOptions: string[];
  submitOptions: { label: string; value: boolean }[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  activeTab,
  courseTitlesMap,
  handleCourseTitleChange,
  handleAttendanceFilterChange,
  handleSubmitFilterChange,
  attendanceOptions,
  submitOptions,
}) => {
  const currentFilters = filters[activeTab];

  return (
    <div className="space-y-3 my-4">
      <div>
        <div className="space-y-3">
          {courseTitlesMap[activeTab].map((courseTitle) => (
            <FilterItem
              key={courseTitle}
              id={`course-${courseTitle}`}
              label={courseTitle}
              checked={currentFilters.courseTitles.includes(courseTitle)}
              onChange={() => handleCourseTitleChange(courseTitle)}
            />
          ))}
        </div>
      </div>

      {activeTab === 'VIDEO' && (
        <div>
          <div className="space-y-3">
            {attendanceOptions.map((option) => (
              <FilterItem
                key={`attendance-${option}`}
                id={`attendance-${option}`}
                label={option}
                checked={currentFilters.attendanceStatuses?.includes(option) ?? false}
                onChange={() => handleAttendanceFilterChange(option)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ASSIGN' && (
        <div>
          <div className="space-y-3">
            {submitOptions.map((option) => (
              <FilterItem
                key={`submit-${option.value}`}
                id={`submit-${option.value}`}
                label={option.label}
                checked={currentFilters.submitStatuses?.includes(option.value) ?? false}
                onChange={() => handleSubmitFilterChange(option.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
