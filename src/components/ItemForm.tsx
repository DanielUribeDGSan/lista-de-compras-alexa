import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { Category } from '../types/grocery';
import { categoryInfo } from '../utils/categories';

interface ItemFormProps {
  onSubmit?: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ onSubmit }) => {
  const { addItem } = useGrocery();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addItem({
        name: name.trim(),
        category,
        quantity,
        unit,
        estimatedPrice,
        purchased: false,
      });

      // Reset form
      setName('');
      setCategory('other');
      setQuantity(1);
      setUnit('');
      setEstimatedPrice(0);

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          required
          autoFocus
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            placeholder="Cantidad"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <option value="">Unidad</option>
            <option value="pza">pza</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="ml">ml</option>
            <option value="paq">paq</option>
          </select>
        </div>
      </div>

      <div>
        <input
          type="number"
          value={estimatedPrice}
          onChange={(e) => setEstimatedPrice(Number(e.target.value))}
          min="0"
          step="0.01"
          placeholder="Precio estimado"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {categoryInfo.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setCategory(cat.name)}
            disabled={isSubmitting}
            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              category === cat.name
                ? `bg-${cat.color}-100 text-${cat.color}-700 border-${cat.color}-200 scale-95`
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            } border disabled:opacity-50`}
          >
            {cat.displayName}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Agregando...' : 'Agregar Producto'}
      </button>
    </form>
  );
};

export default ItemForm;