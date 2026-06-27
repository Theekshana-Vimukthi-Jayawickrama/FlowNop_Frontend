import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface TaskViewToggleProps {
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

export const TaskViewToggle: React.FC<TaskViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex rounded-xl bg-surface p-1 border border-border-color shadow-sm select-none">
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          view === 'table'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:text-text-main hover:bg-background/50'
        }`}
        title="Table view"
      >
        <List className="w-4 h-4" />
        <span>Table</span>
      </button>
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          view === 'cards'
            ? 'bg-primary text-white shadow-sm'
            : 'text-text-muted hover:text-text-main hover:bg-background/50'
        }`}
        title="Card view"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Cards</span>
      </button>
    </div>
  );
};

export default TaskViewToggle;
