import React, { useState } from 'react';
import { Plus, WifiOff } from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import BottomSheet from './BottomSheet';

const TaskList: React.FC = () => {
  const { filteredTodos, isLoading, error } = useTodo();
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando tareas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
          <WifiOff size={16} className="text-yellow-600" />
          <span className="text-sm text-yellow-800">{error}</span>
        </div>
      )}

      <BottomSheet
        isOpen={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        title="Nueva Tarea"
      >
        <TaskForm onSubmit={() => setIsAddingTask(false)} />
      </BottomSheet>

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">No hay tareas pendientes</p>
            <p className="text-sm text-gray-500">Agrega tu primera tarea para comenzar</p>
          </div>
        ) : (
          filteredTodos.map((todo, index) => (
            <div 
              key={todo.id} 
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskItem todo={todo} />
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={() => setIsAddingTask(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Agregar nueva tarea"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default TaskList;
