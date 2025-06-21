import React, { useState } from 'react';
import { Plus, X, Wifi, WifiOff } from 'lucide-react';
import { useGrocery } from '../context/GroceryContext';
import GroceryItem from './GroceryItem';
import ItemForm from './ItemForm';

const GroceryList: React.FC = () => {
  const { filteredItems, isLoading, error } = useGrocery();
  const [isAddingItem, setIsAddingItem] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando productos...</span>
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

      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fadeIn">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 z-50 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Agregar Producto</h2>
              <button 
                onClick={() => setIsAddingItem(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <ItemForm onSubmit={() => setIsAddingItem(false)} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">No hay productos en tu lista</p>
            <p className="text-sm text-gray-500">Agrega tu primer producto para comenzar</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GroceryItem item={item} />
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={() => setIsAddingItem(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Agregar nuevo producto"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default GroceryList;