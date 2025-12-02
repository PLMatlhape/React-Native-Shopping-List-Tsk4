import React, { useState, useEffect } from 'react';
import { useShoppingList } from '../../../hooks/useShoppingList';
import { 
  Search, 
  Calendar, 
  ShoppingCart, 
  Bell, 
  Grid3X3, 
  Heart, 
  Package, 
  History as HistoryIcon, 
  Settings, 
  LogOut,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save,
  Edit3,
  X
} from 'lucide-react';
import AddItemForm from '../../Forms/AddItemForm';
import History from '../../History/History';
import type { CreateShoppingItemDto, Category } from '../../../types/shopping';
import './dashboard.css';

interface DashboardStats {
  completed: number;
  pending: number;
  highPriority: number;
  totalValue: number;
}

import type { ShoppingItem as ShoppingItemFull } from '../../../types/shopping';
type ShoppingItem = ShoppingItemFull;

const Dashboard: React.FC = () => {
  
  const avatarOptions = [
    { id: 'boy', name: 'Boy Avatar', path: '/Image/Boy-avator.png' },
    { id: 'girl', name: 'Girl Avatar', path: '/Image/Girl-avator.png' },
    { id: 'grandpa', name: 'Grandpa Avatar', path: '/Image/Grandpa-avatar.png' },
    { id: 'granny', name: 'Granny Avatar', path: '/Image/Granny-avator.png' }
  ];

    const [activeSection, setActiveSection] = useState('dashboard');
    // --- FAVORITES ---
    const [favoriteItems, setFavoriteItems] = useState<ShoppingItem[]>(() => {
      try {
        const stored = localStorage.getItem('favoriteItems');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    });

    useEffect(() => {
      localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
    }, [favoriteItems]);

    const toggleFavorite = (item: ShoppingItem) => {
      setFavoriteItems(prev => {
        if (prev.some(fav => fav.name === item.name && fav.category === item.category && fav.unit === item.unit)) {
          return prev.filter(fav => !(fav.name === item.name && fav.category === item.category && fav.unit === item.unit));
        } else {
          return [...prev, { ...item }];
        }
      });
    };

    const addFavoriteToShoppingList = async (fav: ShoppingItem) => {
      await addItem({
        name: fav.name,
        quantity: fav.quantity,
        unit: fav.unit,
        price: fav.price,
        category: fav.category,
        priority: fav.priority,
        notes: fav.notes || ''
      });
    };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editedUser, setEditedUser] = useState<{
    name: string;
    surname: string;
    email: string;
    cellNumber: string;
    avatar: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    surname: string;
    avatar: string;
  } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    completed: 0,
    pending: 0,
    highPriority: 0,
    totalValue: 0.00
  });
  
  // Get userId from localStorage userInfo
  const userInfo = localStorage.getItem('userInfo');
  const userId = userInfo ? JSON.parse(userInfo).id : '';
  const {
    items: shoppingItemsAll,
    addItem,
    updateItem,
  } = useShoppingList(userId);
  // Only show items that are not completed in shoppingItems
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  useEffect(() => {
    setShoppingItems(shoppingItemsAll.filter(item => !item.isCompleted));
  }, [shoppingItemsAll]);
  const [collectedItems, setCollectedItems] = useState<ShoppingItem[]>(() => {
    try {
      const stored = localStorage.getItem('collectedItems');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    { name: 'Fruits', icon: '🍎', color: '#ff6b6b' },
    { name: 'Bread', icon: '🍞', color: '#ffa726' },
    { name: 'Vegetables', icon: '🥬', color: '#66bb6a' },
    { name: 'Fish', icon: '🐟', color: '#42a5f5' },
    { name: 'Meat', icon: '🥩', color: '#ef5350' },
    { name: 'Drinks', icon: '🥤', color: '#ff8a65' },
    { name: 'Sea Food', icon: '🦐', color: '#26c6da' },
    { name: 'Ice cream', icon: '🍦', color: '#ab47bc' },
    { name: 'Juice', icon: '🧃', color: '#ffee58' }
  ];

  const sidebarItems = [
  { icon: Grid3X3, label: 'Dashboard', key: 'dashboard' },
  { icon: Heart, label: 'Favourite', key: 'favourite' },
  { icon: ShoppingCart, label: 'Purchased', key: 'orders' },
  { icon: HistoryIcon, label: 'History', key: 'history' },
  { icon: TrendingUp, label: 'Top Deals', key: 'deals' },
  { icon: Settings, label: 'Settings', key: 'settings' }
  ];

  const toggleItemCompletion = (id: string) => {
    // Find the clicked item in shoppingItems
    const shoppingItem = shoppingItems.find(item => item.id === id);
    if (shoppingItem && !shoppingItem.isCompleted) {
      // Remove from shoppingItems (pending) and add to collectedItems (completed)
      setCollectedItems(prevCollected => {
        if (!prevCollected.some(ci => ci.id === shoppingItem.id)) {
          const completedItem = { ...shoppingItem, isCompleted: true };
          addToHistory(completedItem, 'purchased');
          return [...prevCollected, completedItem];
        }
        return prevCollected;
      });
      // Remove from shoppingItems state immediately
      setShoppingItems(prev => prev.filter(item => item.id !== id));
      // Update in localStorage
      updateItem(id, { isCompleted: true });
    } else {
      // Item must be in collected items - move back to shopping items
      const collectedItem = collectedItems.find(item => item.id === id);
      if (collectedItem && collectedItem.isCompleted) {
        const incompleteItem = { ...collectedItem, isCompleted: false };
        addToHistory(incompleteItem, 'removed');
        setCollectedItems(prev => prev.filter(item => item.id !== id));
        // Add back to shoppingItems state immediately
        setShoppingItems(prev => [...prev, incompleteItem]);
        // Update in localStorage
        updateItem(id, { isCompleted: false });
      }
    }
  };

  // History tracking functions
  const addToHistory = (item: ShoppingItem, action: 'added' | 'purchased' | 'removed') => {
    const historyEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      priority: item.priority,
      notes: item.notes || '',
      image: item.image || '',
      listId: item.listId || '',
      isCompleted: item.isCompleted,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      action,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };

    const existingHistory = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
    const updatedHistory = [historyEntry, ...existingHistory];
    localStorage.setItem('shoppingHistory', JSON.stringify(updatedHistory));
  };

  const filteredItems = shoppingItems.filter(item => {
    // Only show incomplete items since completed items are moved to collectedItems
    // Added extra safety check to ensure no completed items slip through
    if (item.isCompleted) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All Priorities' || item.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Progress: based on quantity, not item count
    const totalQuantity = stats.completed + stats.pending;
    const completionPercentage = totalQuantity === 0
      ? 0
      : (stats.completed / totalQuantity) * 100;

  // Update progress bar width
  useEffect(() => {
    const progressBar = document.querySelector('.progress-fill') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${completionPercentage}%`;
    }
  }, [completionPercentage]);

  // Load user data
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setCurrentUser({
        name: parsedUser.name || 'User',
        surname: parsedUser.surname || '',
        avatar: parsedUser.avatar || '/Image/Boy-avator.png'
      });
      setEditedUser({
        name: parsedUser.name || '',
        surname: parsedUser.surname || '',
        email: parsedUser.email || '',
        cellNumber: parsedUser.cellNumber || '',
        avatar: parsedUser.avatar || '/Image/Boy-avator.png'
      });
    }
  }, []);

  // Load shopping items from localStorage on mount
  useEffect(() => {
  // removed savedShoppingItems, handled by hook
    const savedCollectedItems = localStorage.getItem('collectedItems');
    const savedStats = localStorage.getItem('dashboardStats');

    // removed loading shoppingItems from localStorage, handled by hook

    if (savedCollectedItems) {
      try {
        const items = JSON.parse(savedCollectedItems);
        setCollectedItems(items);
      } catch (error) {
        console.error('Error loading collected items:', error);
      }
    }

    if (savedStats) {
      try {
        const loadedStats = JSON.parse(savedStats);
        setStats(loadedStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }, []);

  // Save shopping items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  // Save collected items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('collectedItems', JSON.stringify(collectedItems));
  }, [collectedItems]);

  // Recalculate stats from shoppingItems and collectedItems whenever they change (quantity-based)
  useEffect(() => {
    // Completed: sum of quantity of all items in collectedItems
    const completed = collectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Pending: sum of quantity of all items in shoppingItems
    const pending = shoppingItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // High Priority: sum of quantity of all high priority items in shoppingItems
    const highPriority = shoppingItems
      .filter(item => item.priority === 'high')
      .reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Total Value: sum of price * quantity for all items in shoppingItems
    const totalValue = shoppingItems
      .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const newStats = { completed, pending, highPriority, totalValue };
    setStats(newStats);
    localStorage.setItem('dashboardStats', JSON.stringify(newStats));
  }, [shoppingItems, collectedItems]);

  // Cleanup effect to ensure no completed items remain in shopping list
  useEffect(() => {
    // removed setShoppingItems, handled by hook
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    setShowProfilePanel(!showProfilePanel);
  };

  // Removed toggleFavorite (isFavorite not in type)

  const handleAddItem = async (newItem: CreateShoppingItemDto) => {
    const added = await addItem(newItem);
    if (added) {
      // Add to history
      addToHistory(added, 'added');
    }
  };

  // Removed favoriteItems logic (isFavorite not in type)

  const categoriesForForm: Category[] = categories.map(cat => ({
    id: cat.name.toLowerCase().replace(' ', '-'),
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    description: `${cat.name} category`
  }));

  return (
    <div className="modern-dashboard">
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
        <div className="sidebar-header">
          <div className="logo">
            <img 
              src={currentUser?.avatar || '/Image/Boy-avator.png'} 
              alt="User Avatar" 
              className="user-sidebar-avatar"
            />
            <span className="logo-text">
              {currentUser ? `${currentUser.name} ${currentUser.surname}` : 'User'}
            </span>
          </div>
        </div>


        <nav className="sidebar-nav">
          {sidebarItems.map(({ icon: Icon, label, key }) => (
            <div key={key} className={`sidebar-item-bg${activeSection === key ? ' active' : ''}`}>
              <button
                className={`sidebar-item${activeSection === key ? ' active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="search-section">
            <div className="search-container">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search your grocery products etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="header-actions">
            <button className="header-btn" title="Calendar" aria-label="Calendar">
              <Calendar size={20} />
            </button>
            <button className="header-btn notification" title="Notifications" aria-label="Notifications">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="header-btn notification" title="Shopping Cart" aria-label="Shopping Cart">
              <ShoppingCart size={20} />
              <span className="notification-dot"></span>
            </button>
            <img 
              src={currentUser?.avatar || '/Image/Boy-avator.png'} 
              alt="User" 
              className="user-avatar" 
              title="Go to Profile"
              onClick={handleProfileClick}
            />
          </div>
        </header>

        {/* Dashboard Content */}
        {activeSection === 'dashboard' && (
          <div className="dashboard-content">
            {/* Categories Section */}
            <section className="categories-section">
              <div className="section-header">
                <h2>Categories</h2>
                <div className="section-actions">
                  <button className="filter-btn">
                    <Filter size={16} />
                    Filter
                  </button>
                  <button className="nav-btn" title="Previous" aria-label="Previous">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="nav-btn" title="Next" aria-label="Next">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="categories-grid">
                {categories.map((category, index) => (
                  <div key={index} className="category-card">
                    <div className={`category-icon ${category.name.toLowerCase().replace(' ', '')}`}>
                      <span>{category.icon}</span>
                    </div>
                    <span className="category-name">{category.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Shopping List Section */}
            <section className="shopping-list-section">
              <div className="section-header">
                <h2>My Shopping List</h2>
                <button className="add-item-btn" onClick={() => setShowAddItemForm(true)}>
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="list-subtitle">
                Manage your shopping items efficiently
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card completed">
                  <div className="stat-icon">
                    <div className="icon-circle green">
                      ✓
                    </div>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.completed}</h3>
                    <p>Completed</p>
                  </div>
                </div>

                <div className="stat-card pending">
                  <div className="stat-icon">
                    <div className="icon-circle yellow">
                      ⏱
                    </div>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.pending}</h3>
                    <p>Pending</p>
                  </div>
                </div>

                <div className="stat-card priority">
                  <div className="stat-icon">
                    <div className="icon-circle red">
                      ⚡
                    </div>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.highPriority}</h3>
                    <p>High Priority</p>
                  </div>
                </div>

                <div className="stat-card total">
                  <div className="stat-icon">
                    <div className="icon-circle blue">
                      R
                    </div>
                  </div>
                  <div className="stat-content">
                    <h3>R{stats.totalValue.toFixed(2)}</h3>
                    <p>Total Value</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress: {Math.round(completionPercentage)}% Complete</span>
                  <span>
                    {totalQuantity === 0 ? '0 of 0 items' : `${stats.completed} of ${totalQuantity} items`}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    data-progress={completionPercentage}
                  ></div>
                </div>
              </div>

              {/* Filters */}
              <div className="filters-section">
                <div className="search-filter">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                  title="Filter by category"
                  aria-label="Filter by category"
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>

                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-select"
                  title="Filter by priority"
                  aria-label="Filter by priority"
                >
                  <option value="All Priorities">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    title="Show completed items"
                    aria-label="Show completed items"
                  />
                  <span className="checkmark"></span>
                  Show Completed
                </label>
              </div>

              {/* Items List */}
              <div className="items-list">
                {filteredItems.length === 0 ? (
                  <div className="empty-shopping-list">
                    <ShoppingCart size={48} color="#ddd" />
                    <h3>Your shopping list is empty</h3>
                    <p>Add items to get started with your shopping</p>
                    <button 
                      className="add-first-item-btn"
                      onClick={() => setShowAddItemForm(true)}
                    >
                      <Plus size={16} />
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className={`item-card ${item.isCompleted ? 'completed' : ''}`}>
                      <div className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          disabled={item.isCompleted}
                          onChange={() => toggleItemCompletion(item.id)}
                          title={`Mark ${item.name} as ${item.isCompleted ? 'incomplete' : 'complete'}`}
                          aria-label={`Mark ${item.name} as ${item.isCompleted ? 'incomplete' : 'complete'}`}
                        />
                        {item.isCompleted && <span className="checkbox-checkmark">✓</span>}
                      </div>
                      <div className="item-content">
                        <h4 className="item-name">{item.name}</h4>
                        <div className="item-details">
                          <span className="item-category">{item.category}</span>
                          <span className={`item-priority ${item.priority}`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="item-quantity">
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="item-price">
                        <span>R{item.price.toFixed(2)}</span>
                        <small>{item.unit}</small>
                      </div>
                      <div className="item-unit">
                        <span>{item.unit}</span>
                      </div>
                      <button
                        className="favorite-btn"
                        title={favoriteItems.some(fav => fav.name === item.name && fav.category === item.category && fav.unit === item.unit) ? 'Unmark as favorite' : 'Mark as favorite'}
                        onClick={() => toggleFavorite(item)}
                      >
                        {favoriteItems.some(fav => fav.name === item.name && fav.category === item.category && fav.unit === item.unit)
                          ? <Heart fill="#e53e3e" color="#e53e3e" size={22} />
                          : <Heart color="#aaa" size={22} />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Favourites Main Content */}
        {activeSection === 'favourite' && (
          <div className="dashboard-content">
            <section className="collected-section">
              <div className="section-header">
                <h2>Favorite Items</h2>
                <p className="section-subtitle">Your frequently purchased items for quick access</p>
              </div>

              {favoriteItems.length === 0 ? (
                <div className="empty-collected">
                  <Heart size={48} color="#ddd" />
                  <h3>No favorite items yet</h3>
                  <p>Mark items as favorites for quick access and re-ordering</p>
                </div>
              ) : (
                <>
                  <div className="collected-stats">
                    <div className="stat-card">
                      <h3>{favoriteItems.length}</h3>
                      <p>Favorite Items</p>
                    </div>
                  </div>

                  <div className="collected-grid">
                    {favoriteItems.map((fav, index) => (
                      <div key={fav.name + fav.category + fav.unit + index} className="collected-item-card">
                        <div className="collected-item-header">
                          <h3>{fav.name}</h3>
                          <button 
                            className="remove-favorite-btn"
                            onClick={() => toggleFavorite(fav)}
                            title="Remove from favorites"
                          >
                            <Heart fill="#e53e3e" color="#e53e3e" size={20} />
                          </button>
                        </div>
                        <div className="collected-item-details">
                          <div className="detail-row">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{fav.category}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Priority:</span>
                            <span className={`priority-badge ${fav.priority}`}>
                              {fav.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Quantity:</span>
                            <input 
                              type="number" 
                              min="1"
                              defaultValue={fav.quantity}
                              className="favorite-input-qty"
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                setFavoriteItems(prev => 
                                  prev.map(item => 
                                    item.name === fav.name && item.category === fav.category && item.unit === fav.unit
                                      ? { ...item, quantity: newQty }
                                      : item
                                  )
                                );
                              }}
                            />
                            <span>{fav.unit}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Price:</span>
                            <span className="price-input-wrapper">
                              R<input 
                                type="number" 
                                min="0"
                                step="0.01"
                                defaultValue={fav.price.toFixed(2)}
                                className="favorite-input-price"
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  setFavoriteItems(prev => 
                                    prev.map(item => 
                                      item.name === fav.name && item.category === fav.category && item.unit === fav.unit
                                        ? { ...item, price: newPrice }
                                        : item
                                    )
                                  );
                                }}
                              />
                            </span>
                          </div>
                        </div>
                        <button 
                          className="add-to-list-btn"
                          onClick={() => addFavoriteToShoppingList(fav)}
                        >
                          <Plus size={16} />
                          Add to Shopping List
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* Collected/Purchased Section */}
        {activeSection === 'orders' && (
          <div className="dashboard-content">
            <section className="collected-section">
              <div className="section-header">
                <h2>Collected/Purchased Items</h2>
                <p className="section-subtitle">Items you have successfully collected</p>
              </div>

              {collectedItems.length === 0 ? (
                <div className="empty-collected">
                  <Package size={48} color="#ddd" />
                  <h3>No collected items yet</h3>
                  <p>Items will appear here when you mark them as completed</p>
                </div>
              ) : (
                <div className="collected-stats">
                  <div className="stat-card">
                    <h3>{collectedItems.length}</h3>
                    <p>Items Collected</p>
                  </div>
                  <div className="stat-card">
                    <h3>R{collectedItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</h3>
                    <p>Total Spent</p>
                  </div>
                </div>
              )}

              {collectedItems.length > 0 && (
                <div className="collected-grid">
                  {collectedItems.map((item) => (
                    <div key={item.id} className="collected-item-card">
                      <div className="collected-item-header">
                        <h4 className="item-name">{item.name}</h4>
                        <div className="completion-badge">✓ Completed</div>
                      </div>
                      <div className="item-details">
                        <span className="item-category">{item.category}</span>
                        <span className={`item-priority ${item.priority}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="item-pricing">
                        <span className="item-price">R{item.price.toFixed(2)}</span>
                        <small className="item-unit">{item.unit}</small>
                      </div>
                      <div className="item-actions">
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="total-cost">Total: R{(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          className="uncomplete-btn"
                          onClick={() => toggleItemCompletion(item.id)}
                          title="Mark as incomplete"
                        >
                          ↩ Move Back
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* History Section */}
        {activeSection === 'history' && (
          <div className="dashboard-content">
            <History />
          </div>
        )}
      </main>

      {/* Profile Side Panel */}
      {showProfilePanel && (
        <div className="profile-panel-overlay" onClick={() => setShowProfilePanel(false)}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="profile-panel-header">
              <h2>Profile Settings</h2>
              <button 
                className="close-panel-btn" 
                onClick={() => setShowProfilePanel(false)}
                title="Close Profile Panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-panel-content">
              {/* Avatar Section */}
              <div className="profile-avatar-section">
                <div className="avatar-container">
                  <img 
                    src={currentUser?.avatar || '/Image/Boy-avator.png'} 
                    alt="User Avatar" 
                    className="profile-main-avatar"
                  />
                  <button 
                    className="avatar-edit-btn"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    title="Change Avatar"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {showAvatarSelector && (
                  <div className="avatar-selector">
                    <h4>Choose Avatar</h4>
                    <div className="avatar-options">
                      {avatarOptions.map((avatar) => (
                        <div 
                          key={avatar.id}
                          className={`avatar-option ${currentUser?.avatar === avatar.path ? 'selected' : ''}`}
                          onClick={() => {
                            const userInfo = localStorage.getItem('userInfo');
                            if (userInfo) {
                              const user = JSON.parse(userInfo);
                              user.avatar = avatar.path;
                              localStorage.setItem('userInfo', JSON.stringify(user));
                              setCurrentUser(prev => prev ? {...prev, avatar: avatar.path} : null);
                            }
                            setShowAvatarSelector(false);
                          }}
                        >
                          <img src={avatar.path} alt={avatar.name} />
                          <span>{avatar.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info Section */}
              <div className="profile-info-section">
                <div className="profile-field">
                  <div className="field-header">
                    <User size={16} />
                    <span>Name</span>
                    <button 
                      className="edit-field-btn"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      title="Edit Profile"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                  {isEditingProfile ? (
                    <div className="edit-field-group">
                      <input 
                        type="text" 
                        value={editedUser?.name || currentUser?.name || ''} 
                        onChange={(e) => setEditedUser(prev => ({
                          ...prev!,
                          name: e.target.value
                        }))}
                        placeholder="First Name"
                      />
                      <input 
                        type="text" 
                        value={editedUser?.surname || currentUser?.surname || ''} 
                        onChange={(e) => setEditedUser(prev => ({
                          ...prev!,
                          surname: e.target.value
                        }))}
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <p>{`${currentUser?.name || ''} ${currentUser?.surname || ''}`}</p>
                  )}
                </div>

                <div className="profile-field">
                  <div className="field-header">
                    <Mail size={16} />
                    <span>Email</span>
                  </div>
                  {isEditingProfile ? (
                    <input 
                      type="email" 
                      value={editedUser?.email || ''} 
                      onChange={(e) => setEditedUser(prev => ({
                        ...prev!,
                        email: e.target.value
                      }))}
                      placeholder="Email Address"
                    />
                  ) : (
                    <p>{editedUser?.email || 'No email provided'}</p>
                  )}
                </div>

                <div className="profile-field">
                  <div className="field-header">
                    <Phone size={16} />
                    <span>Phone</span>
                  </div>
                  {isEditingProfile ? (
                    <input 
                      type="tel" 
                      value={editedUser?.cellNumber || ''} 
                      onChange={(e) => setEditedUser(prev => ({
                        ...prev!,
                        cellNumber: e.target.value
                      }))}
                      placeholder="Phone Number"
                    />
                  ) : (
                    <p>{editedUser?.cellNumber || 'No phone provided'}</p>
                  )}
                </div>

                {isEditingProfile && (
                  <div className="profile-actions">
                    <button 
                      className="save-profile-btn"
                      onClick={() => {
                        // Save profile changes
                        if (editedUser && currentUser) {
                          const userInfo = localStorage.getItem('userInfo');
                          if (userInfo) {
                            const user = JSON.parse(userInfo);
                            const updatedUser = { ...user, ...editedUser };
                            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                            setCurrentUser({
                              name: editedUser.name,
                              surname: editedUser.surname,
                              avatar: currentUser.avatar
                            });
                          }
                        }
                        setIsEditingProfile(false);
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                    <button 
                      className="cancel-edit-btn"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditedUser(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Form Modal */}
      {showAddItemForm && (
        <AddItemForm
          categories={categoriesForForm}
          onAddItem={handleAddItem}
          onCancel={() => setShowAddItemForm(false)}
        />
      )}

    </div>
  );
}

export default Dashboard;
