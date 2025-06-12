import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({
    title,
    onPress,
    style,
    textStyle,
    loading = false,
    disabled = false,
    type = 'primary'
}) => {
    const getButtonStyle = () => {
        if (type === 'secondary') {
            return [styles.button, styles.secondaryButton, style];
        } else if (type === 'danger') {
            return [styles.button, styles.dangerButton, style];
        }
        return [styles.button, style];
    };

    const getTextStyle = () => {
        if (type === 'secondary') {
            return [styles.buttonText, styles.secondaryButtonText, textStyle];
        }
        return [styles.buttonText, textStyle];
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), disabled && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={type === 'secondary' ? '#3498db' : '#fff'} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#3498db',
    },
    secondaryButtonText: {
        color: '#3498db',
    },
    dangerButton: {
        backgroundColor: '#e74c3c',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default Button; 