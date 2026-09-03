import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TodoItem } from '../types/todo';
import { useTodo } from '../context/TodoContext';

interface TaskItemProps {
  todo: TodoItem;
}

const TaskItem: React.FC<TaskItemProps> = ({ todo }) => {
  const { toggleCompleted, deleteTodo } = useTodo();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTodo(todo.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-amber-100 text-amber-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  };

  return (
    <div 
      className={`ios-list-item flex items-center justify-between transition-all duration-200 ${
        isDeleting ? 'opacity-0 transform translate-x-full' : ''
      } ${todo.completed ? 'bg-gray-50' : 'bg-white'}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox */}
        <button
          onClick={() => toggleCompleted(todo.id)}
          className={`ios-checkbox ${todo.completed ? 'checked' : ''}`}
          aria-label={todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {todo.completed && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-900 truncate ${todo.completed ? 'line-through text-gray-400' : ''}`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className={`text-sm truncate ${todo.completed ? 'text-gray-300' : 'text-gray-500'}`}>
              {todo.description}
            </p>
          )}
        </div>
      </div>

      {/* Priority badge and delete button */}
      <div className="flex items-center gap-2 ml-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(todo.priority)}`}>
          {getPriorityLabel(todo.priority)}
        </span>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
          aria-label="Eliminar tarea"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
