import React, { createContext, useState, useEffect, useContext } from 'react';
import { TodoItem, TodoFilterType } from '../types/todo';
import { 
  addTodoToFirestore, 
  updateTodoInFirestore, 
  deleteTodoFromFirestore, 
  subscribeToTodos 
} from '../services/todoService';

interface TodoContextType {
  todos: TodoItem[];
  addTodo: (item: Omit<TodoItem, 'id' | 'createdAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoItem>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteAllCompleted: () => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  currentFilter: TodoFilterType;
  setFilter: (filter: TodoFilterType) => void;
  filteredTodos: TodoItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pendingCount: number;
  completedCount: number;
  isLoading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState<TodoFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Suscribirse a cambios de Firestore
    const unsubscribe = subscribeToTodos((firestoreTodos) => {
      setTodos(firestoreTodos);
      setIsLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addTodo = async (item: Omit<TodoItem, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await addTodoToFirestore(item);
    } catch (error) {
      setError('Error al agregar tarea. Inténtalo de nuevo.');
      // Fallback a estado local
      const newTodo: TodoItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };
      setTodos(prevTodos => [newTodo, ...prevTodos]);
    }
  };

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    try {
      setError(null);
      await updateTodoInFirestore(id, updates);
    } catch (error) {
      setError('Error al actualizar tarea.');
      // Fallback a estado local
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await deleteTodoFromFirestore(id);
    } catch (error) {
      setError('Error al eliminar tarea.');
      // Fallback a estado local
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
  };

  const toggleCompleted = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  const deleteAllCompleted = async () => {
    try {
      setError(null);
      const completedTodos = todos.filter(todo => todo.completed);
      // Eliminar de Firestore
      for (const todo of completedTodos) {
        await deleteTodoFromFirestore(todo.id);
      }
    } catch (error) {
      setError('Error al eliminar tareas completadas.');
    }
    // Actualizar estado local
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  };

  const setFilter = (filter: TodoFilterType) => {
    setCurrentFilter(filter);
  };

  // Apply filters and sorting
  const filteredTodos = todos
    .filter(todo => {
      if (currentFilter === 'pending' && todo.completed) {
        return false;
      }
      if (currentFilter === 'completed' && !todo.completed) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = todo.title.toLowerCase().includes(query);
        const descMatch = todo.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descMatch) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by completed status first (pending items on top), then by creation date
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const pendingCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        deleteAllCompleted,
        toggleCompleted,
        currentFilter,
        setFilter,
        filteredTodos,
        searchQuery,
        setSearchQuery,
        pendingCount,
        completedCount,
        isLoading,
        error
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
