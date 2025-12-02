// Store Type Definitions
import type { DailyHistory, FilterType, ShoppingItem } from '../types';

// Auth State
export interface AuthState {
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    cellNumber: string;
    avatar?: string;
    createdAt: string;
    loginTime?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

// Shopping State
export interface ShoppingState {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  activeFilter: FilterType;
  selectedCategory: string;
  searchTerm: string;
}

// History Entry
export interface HistoryEntry {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  image?: string;
  listId: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  action: 'added' | 'purchased' | 'removed';
  timestamp: string;
  date: string;
}

// History State
export interface HistoryState {
  items: HistoryEntry[];
  dailyHistory: DailyHistory[];
  loading: boolean;
  error: string | null;
  filterAction: 'all' | 'added' | 'purchased' | 'removed';
}

// Combined Root State Type
export interface RootState {
  auth: AuthState;
  shopping: ShoppingState;
  history: HistoryState;
}
