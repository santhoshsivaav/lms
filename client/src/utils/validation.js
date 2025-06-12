// Validation utility functions

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const isRequired = (value) => {
  return value && value.trim().length > 0;
};

// Common validation rules
export const validationRules = {
  email: (value) => {
    if (!isRequired(value)) return 'Email is required';
    if (!isValidEmail(value)) return 'Please enter a valid email';
    return null;
  },
  
  password: (value) => {
    if (!isRequired(value)) return 'Password is required';
    if (!isValidPassword(value)) return 'Password must be at least 6 characters';
    return null;
  },
  
  name: (value) => {
    if (!isRequired(value)) return 'Name is required';
    return null;
  },
  
  confirmPassword: (value, formValues) => {
    if (!isRequired(value)) return 'Please confirm your password';
    if (value !== formValues.password) return 'Passwords do not match';
    return null;
  }
};

export default {
  isValidEmail,
  isValidPassword,
  isRequired,
  validationRules
}; 