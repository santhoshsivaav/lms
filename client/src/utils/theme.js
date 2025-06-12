// Theme constants for consistent styling across the app

export const COLORS = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
    success: '#2ecc71',
    light: '#f5f5f5',
    dark: '#2c3e50',
    white: '#ffffff',
    black: '#000000',
    gray: '#7f8c8d',
    lightGray: '#ecf0f1',
    darkGray: '#34495e',
    transparent: 'transparent',
};

export const SIZES = {
    // Font sizes
    xSmall: 10,
    small: 12,
    medium: 14,
    large: 16,
    xLarge: 18,
    xxLarge: 20,
    heading: 24,
    title: 30,

    // Spacing
    padding: {
        small: 8,
        medium: 16,
        large: 24,
        xLarge: 32,
    },
    margin: {
        small: 8,
        medium: 16,
        large: 24,
        xLarge: 32,
    },
    radius: {
        small: 5,
        medium: 10,
        large: 15,
        xLarge: 20,
    },
};

export const FONTS = {
    regular: {
        fontWeight: 'normal',
    },
    medium: {
        fontWeight: '500',
    },
    bold: {
        fontWeight: 'bold',
    },
    light: {
        fontWeight: '300',
    },
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
};

export default {
    COLORS,
    SIZES,
    FONTS,
    SHADOWS,
}; 