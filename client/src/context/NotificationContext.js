import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            ...notification,
            timestamp: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            clearNotifications,
            markAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 