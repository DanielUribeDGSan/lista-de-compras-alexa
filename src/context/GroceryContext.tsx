import React, { createContext, useState, useEffect, useContext } from 'react';
import { GroceryItem, Category, FilterType } from '../types/grocery';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { 
  addItemToFirestore, 
  updateItemInFirestore, 
  deleteItemFromFirestore, 
  subscribeToItems 
} from '../services/firestoreService';

interface GroceryContextType {
  items: GroceryItem[];
  addItem: (item: Omit<GroceryItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  togglePurchased: (id: string) => Promise<void>;
  currentFilter: FilterType;
  setFilter: (filter: FilterType) => void;
  filteredItems: GroceryItem[];
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  totalEstimated: number;
  remainingEstimated: number;
  isLoading: boolean;
  error: string | null;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar datos locales primero
    const savedItems = loadFromLocalStorage();
    setItems(savedItems);

    // Suscribirse a cambios de Firestore
    const unsubscribe = subscribeToItems((firestoreItems) => {
      setItems(firestoreItems);
      saveToLocalStorage(firestoreItems);
      setIsLoading(false);
      setError(null);
    });

    // Manejar errores de conexión
    const handleError = () => {
      setError('Error de conexión. Usando datos locales.');
      setIsLoading(false);
    };

    return () => {
      unsubscribe();
    };
  }, []);

  const addItem = async (item: Omit<GroceryItem, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await addItemToFirestore(item);
    } catch (error) {
      setError('Error al agregar producto. Inténtalo de nuevo.');
      // Fallback a localStorage
      const newItem: GroceryItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };
      setItems(prevItems => [newItem, ...prevItems]);
    }
  };

  const updateItem = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      setError(null);
      await updateItemInFirestore(id, updates);
    } catch (error) {
      setError('Error al actualizar producto.');
      // Fallback a localStorage
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setError(null);
      await deleteItemFromFirestore(id);
    } catch (error) {
      setError('Error al eliminar producto.');
      // Fallback a localStorage
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  const togglePurchased = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      await updateItem(id, { purchased: !item.purchased });
    }
  };

  const setFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  // Apply filters and sorting
  const filteredItems = items
    .filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      
      // Status filter
      if (currentFilter === 'pending' && item.purchased) {
        return false;
      }
      if (currentFilter === 'purchased' && !item.purchased) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by category first, then by purchased status, then by creation date
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if (a.purchased !== b.purchased) {
        return a.purchased ? 1 : -1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  // Calculate totals
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const remainingEstimated = items
    .filter(item => !item.purchased)
    .reduce((sum, item) => sum + item.estimatedPrice, 0);

  return (
    <GroceryContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        togglePurchased,
        currentFilter,
        setFilter,
        filteredItems,
        selectedCategory,
        setSelectedCategory,
        totalEstimated,
        remainingEstimated,
        isLoading,
        error
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (context === undefined) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};