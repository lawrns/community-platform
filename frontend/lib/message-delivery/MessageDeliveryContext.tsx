"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our context
type Message = {
  id: string;
  content: string;
  timestamp: number;
  read: boolean;
};

type MessageDeliveryContextType = {
  messages: Message[];
  sendMessage: (content: string) => void;
  markAsRead: (id: string) => void;
  clearMessages: () => void;
};

// Create the context
const MessageDeliveryContext = createContext<MessageDeliveryContextType | undefined>(undefined);

// Provider component
export const MessageDeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Send a new message
  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: Date.now(),
      read: false,
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Mark a message as read
  const markAsRead = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, read: true } : message
      )
    );
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Context value
  const value = {
    messages,
    sendMessage,
    markAsRead,
    clearMessages,
  };

  return (
    <MessageDeliveryContext.Provider value={value}>
      {children}
    </MessageDeliveryContext.Provider>
  );
};

// Custom hook to use the context
export const useMessageDelivery = () => {
  const context = useContext(MessageDeliveryContext);
  
  if (context === undefined) {
    throw new Error('useMessageDelivery must be used within a MessageDeliveryProvider');
  }
  
  return context;
};
