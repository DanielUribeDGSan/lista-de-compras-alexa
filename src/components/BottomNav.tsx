import React from 'react';
import { List, CheckSquare } from 'lucide-react';

export type TabType = 'lists' | 'tasks';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => onTabChange('lists')}
            className="flex flex-col items-center space-y-1 px-8 py-2"
          >
            <List size={24} className={activeTab === 'lists' ? 'text-blue-500' : 'text-gray-400'} />
            <span className={`text-xs ${activeTab === 'lists' ? 'text-blue-500' : 'text-gray-600'}`}>
              Listas
            </span>
          </button>
          <button 
            onClick={() => onTabChange('tasks')}
            className="flex flex-col items-center space-y-1 px-8 py-2"
          >
            <CheckSquare size={24} className={activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-400'} />
            <span className={`text-xs ${activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-600'}`}>
              Tareas
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;