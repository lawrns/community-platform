"use client";

import React, { useState, useEffect } from 'react';
import { MessageDeliveryProvider, useMessageDelivery } from '../../lib/message-delivery/MessageDeliveryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Component to display and interact with messages
const MessageDisplay = () => {
  const { messages, sendMessage, markAsRead, clearMessages } = useMessageDelivery();
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when messages change
  useEffect(() => {
    const count = messages.filter(msg => !msg.read).length;
    setUnreadCount(count);
    
    // Update document title with unread count
    document.title = count > 0 ? `(${count}) Message Delivery Demo` : 'Message Delivery Demo';
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Messages</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No messages yet</p>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={`${message.read ? 'bg-background' : 'bg-primary/5'}`}
            >
              <CardHeader className="py-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Message {message.id.substring(0, 8)}</CardTitle>
                  <CardDescription>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p>{message.content}</p>
              </CardContent>
              <CardFooter className="py-2">
                {!message.read && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAsRead(message.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
      
      {messages.length > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearMessages}
          className="w-full"
        >
          Clear all messages
        </Button>
      )}
    </div>
  );
};

// Main component that wraps the MessageDisplay with the provider
const MessageDeliveryDemo = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Message Delivery Demo</h1>
      <MessageDeliveryProvider>
        <MessageDisplay />
      </MessageDeliveryProvider>
    </div>
  );
};

export default MessageDeliveryDemo;
