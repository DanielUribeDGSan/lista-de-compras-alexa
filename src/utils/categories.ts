import { CategoryInfo } from '../types/grocery';

export const categoryInfo: CategoryInfo[] = [
  { name: 'produce', displayName: 'Frutas/Verduras', color: 'green' },
  { name: 'dairy', displayName: 'Lácteos', color: 'blue' },
  { name: 'meat', displayName: 'Carnes', color: 'red' },
  { name: 'bakery', displayName: 'Panadería', color: 'yellow' },
  { name: 'frozen', displayName: 'Congelados', color: 'cyan' },
  { name: 'pantry', displayName: 'Despensa', color: 'amber' },
  { name: 'beverages', displayName: 'Bebidas', color: 'purple' },
  { name: 'household', displayName: 'Hogar', color: 'gray' },
  { name: 'other', displayName: 'Otros', color: 'slate' }
];

export const categoryColors = {
  produce: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  meat: 'bg-red-100 text-red-800',
  bakery: 'bg-yellow-100 text-yellow-800',
  frozen: 'bg-cyan-100 text-cyan-800',
  pantry: 'bg-amber-100 text-amber-800',
  beverages: 'bg-purple-100 text-purple-800',
  household: 'bg-gray-100 text-gray-800',
  other: 'bg-slate-100 text-slate-800'
};

export const getUnitOptions = () => [
  { value: '', label: 'Seleccionar unidad' },
  { value: 'pza', label: 'pza' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'paq', label: 'paq' },
];