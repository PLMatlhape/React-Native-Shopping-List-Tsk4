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

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  createdAt: string;
}
