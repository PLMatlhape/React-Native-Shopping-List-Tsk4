// Shopping Item Card Component
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, PRIORITY_COLORS } from '../constants';
import type { ShoppingItem } from '../types';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const priorityColor = PRIORITY_COLORS[item.priority] || COLORS.warning;
  const totalPrice = item.price * item.quantity;

  return (
    <View style={styles.container}>
      {/* Priority Indicator */}
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
      
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          item.isCompleted && styles.checkboxCompleted
        ]}
        onPress={onToggle}
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={16} color={COLORS.white} />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.name,
            item.isCompleted && styles.nameCompleted
          ]}>
            {item.name}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {item.priority}
            </Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="layers-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>R{totalPrice.toFixed(2)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  notes: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  priceContainer: {
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
});

export default ShoppingItemCard;
