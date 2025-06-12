import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((field, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [field]: value
        }));

        // Clear error when field is changed
        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: null
            }));
        }
    }, [errors]);

    const handleBlur = useCallback((field) => {
        setTouched(prevTouched => ({
            ...prevTouched,
            [field]: true
        }));

        // Validate field on blur
        if (validationRules[field]) {
            const fieldError = validationRules[field](values[field], values);
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: fieldError
            }));
        }
    }, [values, validationRules]);

    const validate = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        // Validate all fields
        Object.keys(validationRules).forEach(field => {
            const fieldError = validationRules[field](values[field], values);
            if (fieldError) {
                newErrors[field] = fieldError;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validationRules]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        resetForm,
        setValues
    };
};

export default useForm; 