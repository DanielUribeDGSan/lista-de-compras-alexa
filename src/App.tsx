import React from 'react';
import Header from './components/Header';
import GroceryList from './components/GroceryList';
import BottomNav from './components/BottomNav';
import { GroceryProvider } from './context/GroceryContext';

function App() {
  return (
    <GroceryProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pb-20">
          <GroceryList />
        </main>
        <BottomNav />
      </div>
    </GroceryProvider>
  );
}

export default App;