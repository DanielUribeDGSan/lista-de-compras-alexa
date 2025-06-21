import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { GroceryItem as GroceryItemType } from '../types/grocery';
import { useGrocery } from '../context/GroceryContext';

interface GroceryItemProps {
  item: GroceryItemType;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ item }) => {
  const { togglePurchased, deleteItem } = useGrocery();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setIsDeleting(true);
      try {
        await deleteItem(item.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`ios-list-item transition-all duration-300 ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => togglePurchased(item.id)}
          className={`ios-checkbox ${item.purchased ? 'checked' : 'border-gray-300'}`}
          disabled={isDeleting}
        >
          {item.purchased && <Check size={16} className="text-white" />}
        </button>
        <div className="flex-grow">
          <h3 className={`text-base transition-all duration-200 ${item.purchased ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {item.name}
          </h3>
          <p className="text-sm text-gray-500">
            {item.quantity} {item.unit}
            {item.estimatedPrice > 0 && ` • $${item.estimatedPrice.toFixed(2)}`}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50"
          aria-label="Eliminar producto"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default GroceryItem;