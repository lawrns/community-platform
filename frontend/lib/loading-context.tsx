"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingPage } from "@/components/ui/loading-page";
import { AnimatedToast } from "@/components/motion/AnimatedToast";

type LoadingState = {
  isLoading: boolean;
  message?: string;
  isOverlay: boolean;
};

type ToastState = {
  isOpen: boolean;
  variant: "default" | "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  duration?: number;
};

// Define the context shape
type LoadingContextType = {
  loading: LoadingState;
  showLoading: (message?: string, isOverlay?: boolean) => void;
  hideLoading: () => void;
  toast: ToastState;
  showToast: (props: Omit<ToastState, "isOpen">) => void;
  hideToast: () => void;
};

// Create context with default values
const LoadingContext = createContext<LoadingContextType>({
  loading: { isLoading: false, isOverlay: true },
  showLoading: () => {},
  hideLoading: () => {},
  toast: { isOpen: false, variant: "default" },
  showToast: () => {},
  hideToast: () => {},
});

// Hook for components to access the loading state
export const useLoading = () => useContext(LoadingContext);

// Provider component that wraps parts of the app that need loading states
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
    isOverlay: true,
  });

  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    variant: "default",
    title: undefined,
    message: undefined,
    duration: 5000,
  });

  // Functions to show/hide loading states
  const showLoading = (message?: string, isOverlay = true) => {
    setLoading({ isLoading: true, message, isOverlay });
  };

  const hideLoading = () => {
    setLoading({ isLoading: false, isOverlay: true });
  };

  // Functions to show/hide toast notifications
  const showToast = (props: Omit<ToastState, "isOpen">) => {
    setToast({ ...props, isOpen: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  // Value to provide to consumers
  const contextValue = {
    loading,
    showLoading,
    hideLoading,
    toast,
    showToast,
    hideToast,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading.isLoading && (
          <LoadingPage 
            fullscreen={loading.isOverlay} 
            text={loading.message}
          />
        )}
      </AnimatePresence>
      
      {/* Toast Notifications */}
      <AnimatedToast
        open={toast.isOpen}
        onOpenChange={hideToast}
        variant={toast.variant}
        title={toast.title}
        description={toast.message}
        duration={toast.duration}
        position="bottom-right"
      />
    </LoadingContext.Provider>
  );
}