// API service for shopping list operations
import type { 
  ShoppingItem, 
  ShoppingList, 
  Category, 
  User,
  CreateShoppingItemDto,
  UpdateShoppingItemDto
} from '../types/shopping';

const API_BASE_URL = 'http://localhost:3001';

class ShoppingListService {
  // Shopping Items CRUD operations
  async getShoppingItems(listId?: string): Promise<ShoppingItem[]> {
    const url = listId 
      ? `${API_BASE_URL}/shoppingItems?listId=${listId}`
      : `${API_BASE_URL}/shoppingItems`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch shopping items');
    }
    return response.json();
  }

  async createShoppingItem(listId: string, itemData: CreateShoppingItemDto): Promise<ShoppingItem> {
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      listId,
      isCompleted: false,
      priority: itemData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/shoppingItems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });

    if (!response.ok) {
      throw new Error('Failed to create shopping item');
    }
    return response.json();
  }

  async updateShoppingItem(id: string, updates: UpdateShoppingItemDto): Promise<ShoppingItem> {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/shoppingItems/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update shopping item');
    }
    return response.json();
  }

  async deleteShoppingItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/shoppingItems/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete shopping item');
    }
  }

  async toggleItemCompletion(id: string): Promise<ShoppingItem> {
    // First get the current item
    const response = await fetch(`${API_BASE_URL}/shoppingItems/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shopping item');
    }
    const item: ShoppingItem = await response.json();

    // Toggle completion status
    return this.updateShoppingItem(id, { isCompleted: !item.isCompleted });
  }

  // Shopping Lists operations
  async getShoppingLists(userId: string): Promise<ShoppingList[]> {
    const response = await fetch(`${API_BASE_URL}/shoppingLists?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shopping lists');
    }
    return response.json();
  }

  async createShoppingList(userId: string, name: string): Promise<ShoppingList> {
    const newList = {
      id: Date.now().toString(),
      userId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: false
    };

    const response = await fetch(`${API_BASE_URL}/shoppingLists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newList),
    });

    if (!response.ok) {
      throw new Error('Failed to create shopping list');
    }
    return response.json();
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }

  // User operations
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const users: User[] = await response.json();
    return users.length > 0 ? users[0] : null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }

  // Statistics operations
  async getShoppingStats(userId: string): Promise<{
    totalItems: number;
    completedItems: number;
    totalLists: number;
    completedLists: number;
    totalValue: number;
  }> {
    try {
      const [lists, items] = await Promise.all([
        this.getShoppingLists(userId),
        this.getShoppingItems()
      ]);

      const userItems = items.filter(item => 
        lists.some(list => list.id === item.listId)
      );

      const completedItems = userItems.filter(item => item.isCompleted);
      const completedLists = lists.filter(list => list.isCompleted);
      const totalValue = userItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        totalItems: userItems.length,
        completedItems: completedItems.length,
        totalLists: lists.length,
        completedLists: completedLists.length,
        totalValue
      };
    } catch (error) {
      console.error('Failed to fetch shopping stats:', error);
      return {
        totalItems: 0,
        completedItems: 0,
        totalLists: 0,
        completedLists: 0,
        totalValue: 0
      };
    }
  }
}

export const shoppingListService = new ShoppingListService();
