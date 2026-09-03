import React, { useState } from 'react';
import Header from './components/Header';
import GroceryList from './components/GroceryList';
import BottomNav, { TabType } from './components/BottomNav';
import { GroceryProvider } from './context/GroceryContext';
import { TodoProvider } from './context/TodoContext';
import TaskHeader from './components/TaskHeader';
import TaskList from './components/TaskList';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('lists');

  return (
    <GroceryProvider>
      <TodoProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {activeTab === 'lists' && (
            <>
              <Header />
              <main className="flex-grow pb-20">
                <GroceryList />
              </main>
            </>
          )}
          
          {activeTab === 'tasks' && (
            <>
              <TaskHeader />
              <main className="flex-grow pb-20">
                <TaskList />
              </main>
            </>
          )}
          
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </TodoProvider>
    </GroceryProvider>
  );
}

export default App;