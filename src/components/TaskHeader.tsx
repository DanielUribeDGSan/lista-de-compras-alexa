import React, { useState } from 'react';
import { ClipboardCheck, AlertTriangle, Search, X } from 'lucide-react';
import { useTodo } from '../context/TodoContext';

const TaskHeader: React.FC = () => {
  const { pendingCount, completedCount, deleteAllCompleted, searchQuery, setSearchQuery } = useTodo();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteAll = async () => {
    await deleteAllCompleted();
    setShowConfirmModal(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <header className="bg-gray-50 pt-12 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mis Tareas</h1>
              <p className="text-gray-500 text-sm mt-1">
                {pendingCount} {pendingCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200 text-sm font-medium"
                  title="Limpiar tareas completadas"
                >
                  <ClipboardCheck size={16} />
                  <span>Limpiar</span>
                </button>
              )}
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full bg-white rounded-xl py-2.5 pl-10 pr-10 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scaleIn">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              ¿Eliminar completadas?
            </h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              Se eliminarán {completedCount} tarea{completedCount > 1 ? 's' : ''} completada{completedCount > 1 ? 's' : ''}. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskHeader;
