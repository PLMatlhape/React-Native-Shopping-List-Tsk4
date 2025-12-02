// Shopping list related type definitions

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface CreateShoppingItemDto {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  image?: string;
}

export interface UpdateShoppingItemDto extends Partial<CreateShoppingItemDto> {
  isCompleted?: boolean;
}

// Authentication related type definitions

export interface SignUpFormData {
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  password: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  password?: string;
  avatar?: string;
  createdAt: string;
  loginTime?: string;
}

export interface DashboardStats {
  completed: number;
  pending: number;
  highPriority: number;
  totalValue: number;
}

export interface HistoryItem {
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

export interface DailyHistory {
  date: string;
  items: HistoryItem[];
  totalAdded: number;
  totalPurchased: number;
  totalSpent: number;
  itemsAdded: number;
  itemsPurchased: number;
  itemsRemoved: number;
}
