import React, { useState, useEffect } from 'react';
import { Calendar, Package, ShoppingCart, TrendingUp, Filter, Search } from 'lucide-react';
import './history.css';

interface HistoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  action: 'added' | 'purchased' | 'removed';
  timestamp: string;
  date: string; // YYYY-MM-DD format
}

interface DailyHistory {
  date: string;
  items: HistoryItem[];
  totalAdded: number;
  totalPurchased: number;
  totalSpent: number;
  itemsAdded: number;
  itemsPurchased: number;
  itemsRemoved: number;
}

interface HistoryProps {
  // No props needed for now
}

const History: React.FC<HistoryProps> = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DailyHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('shoppingHistory');
    if (savedHistory) {
      setHistoryData(JSON.parse(savedHistory));
    }
  }, []);

  // Group history by date and apply filters
  useEffect(() => {
    const groupedByDate = historyData.reduce((acc: { [key: string]: HistoryItem[] }, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {});

    let dailyHistories: DailyHistory[] = Object.entries(groupedByDate).map(([date, items]) => {
      const addedItems = items.filter(item => item.action === 'added');
      const purchasedItems = items.filter(item => item.action === 'purchased');
      const removedItems = items.filter(item => item.action === 'removed');

      return {
        date,
        items,
        totalAdded: addedItems.length,
        totalPurchased: purchasedItems.length,
        totalSpent: purchasedItems.reduce((sum, item) => {
          const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
          const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
          return sum + (price * quantity);
        }, 0),
        itemsAdded: addedItems.length,
        itemsPurchased: purchasedItems.length,
        itemsRemoved: removedItems.length
      };
    });

    // Sort by date (newest first)
    dailyHistories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply filters
    if (selectedDate) {
      dailyHistories = dailyHistories.filter(day => day.date === selectedDate);
    }

    if (filterAction !== 'all') {
      dailyHistories = dailyHistories.map(day => ({
        ...day,
        items: day.items.filter(item => item.action === filterAction)
      })).filter(day => day.items.length > 0);
    }

    if (searchTerm) {
      dailyHistories = dailyHistories.map(day => ({
        ...day,
        items: day.items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(day => day.items.length > 0);
    }

    setFilteredHistory(dailyHistories);
  }, [historyData, selectedDate, filterAction, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added':
        return <ShoppingCart size={16} className="action-icon added" />;
      case 'purchased':
        return <Package size={16} className="action-icon purchased" />;
      case 'removed':
        return <TrendingUp size={16} className="action-icon removed" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'added':
        return 'Added to list';
      case 'purchased':
        return 'Purchased';
      case 'removed':
        return 'Removed from list';
      default:
        return action;
    }
  };

  const totalOverallSpent = filteredHistory.reduce((sum, day) => sum + day.totalSpent, 0);
  const totalOverallItems = filteredHistory.reduce((sum, day) => sum + day.totalPurchased, 0);

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="header-title">
          <Calendar size={24} />
          <h2>Shopping History</h2>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{totalOverallItems}</span>
            <span className="stat-label">Items Purchased</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">R{totalOverallSpent.toFixed(2)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-filter">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search items..."
            title="Search items by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <input
            type="date"
            title="Filter by specific date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="action-filter">
          <Filter size={16} />
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            title="Filter by action type"
          >
            <option value="all">All Actions</option>
            <option value="added">Items Added</option>
            <option value="purchased">Items Purchased</option>
            <option value="removed">Items Removed</option>
          </select>
        </div>

        {(selectedDate || filterAction !== 'all' || searchTerm) && (
          <button 
            className="clear-filters"
            onClick={() => {
              setSelectedDate('');
              setFilterAction('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* History Content */}
      <div className="history-content">
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            <Calendar size={48} color="#ddd" />
            <h3>No history found</h3>
            <p>Start adding and purchasing items to see your shopping history</p>
          </div>
        ) : (
          filteredHistory.map((day) => (
            <div key={day.date} className="daily-history">
              <div className="day-header">
                <div className="day-info">
                  <h3>{formatDate(day.date)}</h3>
                  <span className="day-date">{day.date}</span>
                </div>
                <div className="day-stats">
                  <div className="day-stat">
                    <span className="stat-number">{day.itemsAdded}</span>
                    <span className="stat-label">Added</span>
                  </div>
                  <div className="day-stat">
                    <span className="stat-number">{day.itemsPurchased}</span>
                    <span className="stat-label">Purchased</span>
                  </div>
                  <div className="day-stat">
                    <span className="stat-number">R{day.totalSpent.toFixed(2)}</span>
                    <span className="stat-label">Spent</span>
                  </div>
                </div>
              </div>

              <div className="day-items">
                {day.items.map((item) => (
                  <div key={`${item.id}-${item.timestamp}`} className={`history-item ${item.action}`}>
                    <div className="item-icon">
                      {getActionIcon(item.action)}
                    </div>
                    <div className="item-details">
                      <div className="item-main">
                        <h4 className="item-name">{item.name}</h4>
                        <span className="item-action">{getActionLabel(item.action)}</span>
                      </div>
                      <div className="item-meta">
                        <span className="item-category">{item.category}</span>
                        <span className="item-priority priority-${item.priority}">{item.priority}</span>
                        <span className="item-time">{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                    <div className="item-pricing">
                      <span className="item-price">R{(typeof item.price === 'number' ? item.price : 0).toFixed(2)}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      {item.action === 'purchased' && (
                        <span className="item-total">Total: R{(
                          (typeof item.price === 'number' ? item.price : 0) * (typeof item.quantity === 'number' ? item.quantity : 0)
                        ).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
