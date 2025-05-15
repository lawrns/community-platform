"use client";

import { useState, useEffect } from "react";

type LoadingOptions = {
  initialState?: boolean;
  delay?: number;
  duration?: number;
  simulateError?: boolean;
  errorProbability?: number;
};

/**
 * Hook to help manage loading states and simulate loading for demo purposes
 * 
 * @example
 * const { isLoading, error, startLoading, stopLoading } = useLoadingState({
 *   delay: 500,
 *   duration: 2000,
 * });
 * 
 * // Use the states in your component:
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorState error={error} />;
 * 
 * // Trigger loading manually:
 * const handleRefresh = () => {
 *   startLoading();
 * };
 */
export function useLoadingState({
  initialState = false,
  delay = 0,
  duration = 0,
  simulateError = false,
  errorProbability = 0.1,
}: LoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  
  // Helper function to start loading
  const startLoading = (customDuration?: number) => {
    setError(null);
    
    if (delay > 0) {
      setTimeout(() => {
        setIsLoading(true);
      }, delay);
    } else {
      setIsLoading(true);
    }
    
    if (duration > 0 || customDuration) {
      setTimeout(() => {
        if (simulateError && Math.random() < errorProbability) {
          setError(new Error("Simulated error for demo purposes"));
        }
        setIsLoading(false);
      }, customDuration || duration);
    }
  };
  
  // Helper function to stop loading
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  // Helper function to reset error
  const resetError = () => {
    setError(null);
  };
  
  // If initialState is true, start loading automatically
  useEffect(() => {
    if (initialState) {
      startLoading();
    }
  }, []);
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    resetError,
    setError,
  };
}

export default useLoadingState;