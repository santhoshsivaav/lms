import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import { categoryService } from '../services/categoryService';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

const CategoryPreferences = () => {
    const { user, updateUserPreferences } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (user?.preferredCategories) {
            setSelectedCategories(user.preferredCategories.map(cat => cat._id));
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const success = await updateUserPreferences(selectedCategories);
            if (success) {
                Alert.alert('Success', 'Category preferences updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update category preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            Alert.alert('Error', 'Failed to update category preferences');
        } finally {
            setSaving(false);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategories.includes(item._id) && styles.selectedCategory
            ]}
            onPress={() => toggleCategory(item._id)}
        >
            <Text style={[
                styles.categoryText,
                selectedCategories.includes(item._id) && styles.selectedCategoryText
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Preferred Categories</Text>
            <Text style={styles.subtitle}>
                Select categories that interest you to get personalized course recommendations
            </Text>

            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item._id}
                numColumns={2}
                contentContainerStyle={styles.categoriesList}
            />

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 24,
    },
    categoriesList: {
        paddingVertical: 8,
    },
    categoryItem: {
        flex: 1,
        margin: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCategory: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: 14,
        color: '#2c3e50',
        textAlign: 'center',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CategoryPreferences; 