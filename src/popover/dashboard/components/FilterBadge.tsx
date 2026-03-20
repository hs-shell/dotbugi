import React from 'react';

interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, onRemove }) => {
  return (
    <div
      onClick={() => {
        onRemove();
      }}
      className="flex items-center bg-[rgb(232,242,255)] text-zinc-700 font-semibold rounded-3xl px-3 py-0.5 text-base h-12 cursor-pointer"
    >
      <span>{label}</span>
    </div>
  );
};

export default FilterBadge;
