// Add Item Modal Component
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, PRIORITIES, UNITS } from '../constants';
import type { CreateShoppingItemDto } from '../types';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: CreateShoppingItemDto) => Promise<void>;
  categories: { id: string; name: string; icon: string; color: string }[];
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onAdd,
  categories,
}) => {
  const [formData, setFormData] = useState<CreateShoppingItemDto>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    price: 0,
    category: '',
    priority: 'medium',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: 'pieces',
      price: 0,
      category: '',
      priority: 'medium',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (formData.quantity <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      resetForm();
    } catch {
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedCategory = categories.find(c => c.name === formData.category);
  const selectedUnit = UNITS.find(u => u.value === formData.unit);
  const selectedPriority = PRIORITIES.find(p => p.value === formData.priority);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add New Item</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Item Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter item name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !formData.category && styles.placeholderText
                  ]}>
                    {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : 'Select a category'}
                  </Text>
                  <Ionicons 
                    name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={styles.pickerOptions}>
                    <ScrollView style={styles.optionsScroll} nestedScrollEnabled>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.optionItem,
                            formData.category === cat.name && styles.optionItemSelected
                          ]}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, category: cat.name }));
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text style={styles.optionEmoji}>{cat.icon}</Text>
                          <Text style={styles.optionText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Quantity and Unit Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Quantity *</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setFormData(prev => ({ 
                        ...prev, 
                        quantity: Math.max(1, prev.quantity - 1) 
                      }))}
                    >
                      <Ionicons name="remove" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={formData.quantity.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        setFormData(prev => ({ ...prev, quantity: num }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setFormData(prev => ({ 
                        ...prev, 
                        quantity: prev.quantity + 1 
                      }))}
                    >
                      <Ionicons name="add" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Unit</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowUnitPicker(!showUnitPicker)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {selectedUnit?.label || 'Select'}
                    </Text>
                    <Ionicons 
                      name={showUnitPicker ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                  {showUnitPicker && (
                    <View style={styles.pickerOptions}>
                      {UNITS.map((unit) => (
                        <TouchableOpacity
                          key={unit.value}
                          style={[
                            styles.optionItem,
                            formData.unit === unit.value && styles.optionItemSelected
                          ]}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, unit: unit.value }));
                            setShowUnitPicker(false);
                          }}
                        >
                          <Text style={styles.optionText}>{unit.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Price and Priority Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (R)</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currencySymbol}>R</Text>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textSecondary}
                      value={formData.price > 0 ? formData.price.toString() : ''}
                      onChangeText={(text) => {
                        const num = parseFloat(text) || 0;
                        setFormData(prev => ({ ...prev, price: num }));
                      }}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Priority</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                  >
                    <View style={styles.priorityDisplay}>
                      <View style={[
                        styles.priorityDot,
                        { backgroundColor: selectedPriority?.color || COLORS.warning }
                      ]} />
                      <Text style={styles.pickerButtonText}>
                        {selectedPriority?.label || 'Medium'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={showPriorityPicker ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                  {showPriorityPicker && (
                    <View style={styles.pickerOptions}>
                      {PRIORITIES.map((priority) => (
                        <TouchableOpacity
                          key={priority.value}
                          style={[
                            styles.optionItem,
                            formData.priority === priority.value && styles.optionItemSelected
                          ]}
                          onPress={() => {
                            setFormData(prev => ({ 
                              ...prev, 
                              priority: priority.value as 'low' | 'medium' | 'high' 
                            }));
                            setShowPriorityPicker(false);
                          }}
                        >
                          <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                          <Text style={styles.optionText}>{priority.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Add any additional notes..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Adding...' : 'Add Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  inputGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  pickerOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsScroll: {
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    padding: 12,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySymbol: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: COLORS.text,
  },
  priorityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AddItemModal;
