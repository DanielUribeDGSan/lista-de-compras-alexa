import React, { useState } from 'react';
import { List, CheckSquare, Settings } from 'lucide-react';

const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lists');

  return (
    <nav className="bottom-nav">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('lists')}
            className="flex flex-col items-center space-y-1"
          >
            <List size={24} className={activeTab === 'lists' ? 'text-blue-500' : 'text-gray-400'} />
            <span className={`text-xs ${activeTab === 'lists' ? 'text-blue-500' : 'text-gray-600'}`}>
              Listas
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="flex flex-col items-center space-y-1"
          >
            <CheckSquare size={24} className={activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-400'} />
            <span className={`text-xs ${activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-600'}`}>
              Tareas
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center space-y-1"
          >
            <Settings size={24} className={activeTab === 'settings' ? 'text-blue-500' : 'text-gray-400'} />
            <span className={`text-xs ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-600'}`}>
              Ajustes
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;