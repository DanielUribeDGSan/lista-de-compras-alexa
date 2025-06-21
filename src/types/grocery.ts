export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  purchased: boolean;
  estimatedPrice: number;
  quantity: number;
  unit: string;
  createdAt: Date;
}

export type Category = 
  | 'produce' 
  | 'dairy' 
  | 'meat' 
  | 'bakery' 
  | 'frozen' 
  | 'pantry' 
  | 'beverages' 
  | 'household' 
  | 'other';

export interface CategoryInfo {
  name: Category;
  displayName: string;
  color: string;
}

export type FilterType = 'all' | 'pending' | 'purchased';