import React, { createContext, useState, useContext, useEffect } from 'react';
import LiveNotification from '../components/LiveNotification';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 'init-1', type: 'system', title: 'Welcome to Nexus!', message: 'Explore our premium events and book your first workshop today.', time: new Date().toISOString(), read: false }
  ]);

  const showNotification = (message, type = 'info') => {
    setToast({ message, type });
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now().toString(),
      type,
      title,
      message,
      time: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, addNotification, notifications, markAllAsRead }}>
      {children}
      <LiveNotification notification={toast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
