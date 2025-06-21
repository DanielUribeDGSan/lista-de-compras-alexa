import React from 'react';
import { Check, ShoppingCart, Package } from 'lucide-react';
import { Category, FilterType } from '../types/grocery';
import { useGrocery } from '../context/GroceryContext';
import { categoryInfo } from '../utils/categories';

const FilterBar: React.FC = () => {
  const { 
    currentFilter, 
    setFilter,
    selectedCategory,
    setSelectedCategory 
  } = useGrocery();

  const filters: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'All Items', icon: <Package size={16} /> },
    { type: 'pending', label: 'To Buy', icon: <ShoppingCart size={16} /> },
    { type: 'purchased', label: 'Purchased', icon: <Check size={16} /> },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Status Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => setFilter(filter.type)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              currentFilter === filter.type
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        
        {categoryInfo.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === category.name
                ? `bg-${category.color}-500 text-white`
                : `bg-${category.color}-100 text-${category.color}-700 hover:bg-${category.color}-200`
            }`}
          >
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;