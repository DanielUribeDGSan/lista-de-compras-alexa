import { GroceryItem } from '../types/grocery';

const STORAGE_KEY = 'groceryList';

export const saveToLocalStorage = (items: GroceryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): GroceryItem[] => {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      // Convert string dates back to Date objects
      return parsedItems.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};