import React from 'react';
import { useGrocery } from '../context/GroceryContext';

const Header: React.FC = () => {
  const { items } = useGrocery();
  const pendingItems = items.filter(item => !item.purchased).length;

  return (
    <header className="bg-gray-50 pt-12 pb-4 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lista del Super</h1>
            <p className="text-gray-500 text-sm mt-1">
              {pendingItems} productos por comprar
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar productos..."
            className="w-full bg-white rounded-xl py-2.5 pl-4 pr-10 text-sm border border-gray-200"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;