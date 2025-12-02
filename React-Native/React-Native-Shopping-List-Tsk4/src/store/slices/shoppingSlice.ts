// Shopping Slice - Manages shopping list items
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storageService } from '../../services/storageService';
import type { CreateShoppingItemDto, FilterType, ShoppingItem } from '../../types';
import type { RootState, ShoppingState } from '../types';

const initialState: ShoppingState = {
  items: [],
  loading: false,
  error: null,
  activeFilter: 'all',
  selectedCategory: 'All',
  searchTerm: '',
};

// Helper to get storage key for user
const getStorageKey = (userId: string) => `shoppingItems_${userId}`;

// Async thunks
export const loadItems = createAsyncThunk(
  'shopping/loadItems',
  async (userId: string) => {
    const items = await storageService.getItem<ShoppingItem[]>(getStorageKey(userId));
    return items || [];
  }
);

export const addItem = createAsyncThunk(
  'shopping/addItem',
  async ({ userId, item }: { userId: string; item: CreateShoppingItemDto }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentItems = state.shopping.items;

    const newItem: ShoppingItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      listId: userId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      category: item.category,
      priority: item.priority || 'low',
      notes: item.notes,
      image: item.image,
      isCompleted: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = [...currentItems, newItem];
    await storageService.setItem(getStorageKey(userId), updatedItems);

    // Add to history
    dispatch({
      type: 'history/addHistoryEntry',
      payload: {
        item: newItem,
        action: 'added' as const,
        userId,
      },
    });

    return newItem;
  }
);

export const updateItem = createAsyncThunk(
  'shopping/updateItem',
  async (
    { userId, itemId, updates }: { userId: string; itemId: string; updates: Partial<ShoppingItem> },
    { getState }
  ) => {
    const state = getState() as RootState;
    const currentItems = state.shopping.items;

    const updatedItems = currentItems.map((item) =>
      item.id === itemId
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    );

    await storageService.setItem(getStorageKey(userId), updatedItems);
    return { itemId, updates };
  }
);

export const toggleItem = createAsyncThunk(
  'shopping/toggleItem',
  async ({ userId, itemId }: { userId: string; itemId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentItems = state.shopping.items;
    const item = currentItems.find((i) => i.id === itemId);

    if (!item) throw new Error('Item not found');

    const wasCompleted = item.isCompleted;
    const updatedItems = currentItems.map((i) =>
      i.id === itemId
        ? {
            ...i,
            isCompleted: !i.isCompleted,
            completedAt: !i.isCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : i
    );

    await storageService.setItem(getStorageKey(userId), updatedItems);

    // Add to history if marking as completed (purchased)
    if (!wasCompleted) {
      dispatch({
        type: 'history/addHistoryEntry',
        payload: {
          item: { ...item, isCompleted: true },
          action: 'purchased' as const,
          userId,
        },
      });
    }

    return { itemId, isCompleted: !wasCompleted };
  }
);

export const toggleFavorite = createAsyncThunk(
  'shopping/toggleFavorite',
  async ({ userId, itemId }: { userId: string; itemId: string }, { getState }) => {
    const state = getState() as RootState;
    const currentItems = state.shopping.items;

    const updatedItems = currentItems.map((item) =>
      item.id === itemId
        ? { ...item, isFavorite: !item.isFavorite, updatedAt: new Date().toISOString() }
        : item
    );

    await storageService.setItem(getStorageKey(userId), updatedItems);
    const item = currentItems.find((i) => i.id === itemId);
    return { itemId, isFavorite: !item?.isFavorite };
  }
);

export const deleteItem = createAsyncThunk(
  'shopping/deleteItem',
  async ({ userId, itemId }: { userId: string; itemId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentItems = state.shopping.items;
    const item = currentItems.find((i) => i.id === itemId);

    const updatedItems = currentItems.filter((i) => i.id !== itemId);
    await storageService.setItem(getStorageKey(userId), updatedItems);

    // Add to history
    if (item) {
      dispatch({
        type: 'history/addHistoryEntry',
        payload: {
          item,
          action: 'removed' as const,
          userId,
        },
      });
    }

    return itemId;
  }
);

export const clearCompleted = createAsyncThunk(
  'shopping/clearCompleted',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const updatedItems = state.shopping.items.filter((item) => !item.isCompleted);
    await storageService.setItem(getStorageKey(userId), updatedItems);
    return updatedItems;
  }
);

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.activeFilter = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    clearFilters: (state) => {
      state.activeFilter = 'all';
      state.selectedCategory = 'All';
      state.searchTerm = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Items
      .addCase(loadItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load items';
      })
      // Add Item
      .addCase(addItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update Item
      .addCase(updateItem.fulfilled, (state, action) => {
        const { itemId, updates } = action.payload;
        const index = state.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })
      // Toggle Item
      .addCase(toggleItem.fulfilled, (state, action) => {
        const { itemId, isCompleted } = action.payload;
        const index = state.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          state.items[index].isCompleted = isCompleted;
          state.items[index].completedAt = isCompleted ? new Date().toISOString() : undefined;
        }
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { itemId, isFavorite } = action.payload;
        const index = state.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          state.items[index].isFavorite = isFavorite;
        }
      })
      // Delete Item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      // Clear Completed
      .addCase(clearCompleted.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

// Selectors
export const selectFilteredItems = (state: RootState) => {
  const { items, activeFilter, selectedCategory, searchTerm } = state.shopping;

  return items.filter((item) => {
    // Filter by active filter
    if (activeFilter === 'completed' && !item.isCompleted) return false;
    if (activeFilter === 'pending' && item.isCompleted) return false;
    if (activeFilter === 'high' && item.priority !== 'high') return false;
    if (activeFilter === 'favorites' && !item.isFavorite) return false;

    // Filter by category
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Filter by search term
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });
};

export const selectStats = (state: RootState) => {
  const { items } = state.shopping;
  const pendingItems = items.filter((item) => !item.isCompleted);

  return {
    completed: items.filter((item) => item.isCompleted).length,
    pending: pendingItems.length,
    highPriority: pendingItems.filter((item) => item.priority === 'high').length,
    favorites: items.filter((item) => item.isFavorite).length,
    totalValue: pendingItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    total: items.length,
  };
};

export const { setFilter, setCategory, setSearchTerm, clearFilters } = shoppingSlice.actions;
export default shoppingSlice.reducer;
