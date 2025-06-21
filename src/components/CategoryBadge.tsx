import React from 'react';
import { categoryColors } from '../utils/categories';
import { Category } from '../types/grocery';
import * as LucideIcons from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  small?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, small = false }) => {
  const iconMap: Record<Category, keyof typeof LucideIcons> = {
    produce: 'Apple',
    dairy: 'Milk',
    meat: 'Beef',
    bakery: 'Bread',
    frozen: 'Snowflake',
    pantry: 'ShoppingBag',
    beverages: 'Coffee',
    household: 'Spray',
    other: 'Package'
  };

  const IconComponent = LucideIcons[iconMap[category]];
  const colorClasses = categoryColors[category];
  
  if (small) {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${colorClasses}`}>
        <IconComponent size={12} className="mr-1" />
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colorClasses}`}>
      <IconComponent size={14} className="mr-1" />
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

export default CategoryBadge;