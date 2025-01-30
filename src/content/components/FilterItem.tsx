import React from 'react';
import { Label } from '@/components/ui/label';

interface FilterItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const FilterItem: React.FC<FilterItemProps> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center space-x-3">
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="shadow-md rounded-lg peer h-7 w-7 cursor-pointer appearance-none border border-zinc-800 bg-white checked:border-primary checked:bg-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
      />
      <svg
        className="pointer-events-none absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <Label
      htmlFor={id}
      className="text-xl font-medium text-black cursor-pointer transition-colors line-clamp-1 text-ellipsis"
    >
      {label}
    </Label>
  </div>
);

export default FilterItem;
