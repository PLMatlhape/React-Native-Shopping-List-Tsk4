// Dashboard Screen for React Native
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddItemModal from '../Components/AddItemModal';
import ShoppingItemCard from '../Components/ShoppingItemCard';
import { AVATAR_OPTIONS, CATEGORIES, COLORS, DEFAULT_AVATAR } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useShoppingList } from '../hooks/useShoppingList';
import { storageService } from '../services/storageService';
import type { CreateShoppingItemDto, DashboardStats, ShoppingItem } from '../types';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { items, addItem, deleteItem, toggleItem, refreshItems } = useShoppingList(user?.id || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [collectedItems, setCollectedItems] = useState<ShoppingItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    completed: 0,
    pending: 0,
    highPriority: 0,
    totalValue: 0,
  });

  // Load collected items from storage
  useEffect(() => {
    const loadCollectedItems = async () => {
      const saved = await storageService.getItem<ShoppingItem[]>('collectedItems');
      if (saved) {
        setCollectedItems(saved);
      }
    };
    loadCollectedItems();
  }, []);

  // Save collected items to storage
  useEffect(() => {
    storageService.setItem('collectedItems', collectedItems);
  }, [collectedItems]);

  // Calculate stats
  useEffect(() => {
    const pendingItems = items.filter(item => !item.isCompleted);
    const completed = collectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const pending = pendingItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const highPriority = pendingItems
      .filter(item => item.priority === 'high')
      .reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalValue = pendingItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    setStats({ completed, pending, highPriority, totalValue });
  }, [items, collectedItems]);

  // Filter items
  const filteredItems = items.filter(item => {
    if (item.isCompleted) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  }, [refreshItems]);

  // Handle toggle item completion
  const handleToggleItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isCompleted) {
      // Move to collected
      setCollectedItems(prev => [...prev, { ...item, isCompleted: true }]);
      await toggleItem(id);
    }
  };

  // Handle add item
  const handleAddItem = async (itemData: CreateShoppingItemDto) => {
    await addItem(itemData);
    setShowAddModal(false);
  };

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteItem(id)
        },
      ]
    );
  };

  // Calculate progress
  const totalQuantity = stats.completed + stats.pending;
  const completionPercentage = totalQuantity === 0 ? 0 : (stats.completed / totalQuantity) * 100;

  // Get user avatar
  const userAvatar = user?.avatar 
    ? AVATAR_OPTIONS.find(a => a.id === user.avatar)?.image || DEFAULT_AVATAR
    : DEFAULT_AVATAR;

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.name && styles.categoryCardActive,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.name ? 'All' : item.name)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.name && styles.categoryNameActive,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={userAvatar} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
            <Text style={styles.subGreeting}>What do you need today?</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your grocery products..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success }]}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning }]}>
              <Ionicons name="time" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.error }]}>
              <Ionicons name="flash" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.currencyIcon}>R</Text>
            </View>
            <Text style={styles.statValue}>R{stats.totalValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Progress: {Math.round(completionPercentage)}% Complete
            </Text>
            <Text style={styles.progressCount}>
              {stats.completed} of {totalQuantity} items
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Shopping List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Shopping List</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateTitle}>No items yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first item to get started
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={() => handleToggleItem(item.id)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        categories={CATEGORIES}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    minWidth: 80,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currencyIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
