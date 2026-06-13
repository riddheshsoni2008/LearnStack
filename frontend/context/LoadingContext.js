"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const pathname = usePathname();

  const startLoading = useCallback(() => {
    setTransitioning(true);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setTransitioning(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    stopLoading();
  }, [pathname, stopLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        transitioning,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

export function useTransitionRouter() {
  const router = useRouter();
  const { startLoading } = useLoading();

  const push = useCallback((href, options) => {
    startLoading();
    router.push(href, options);
  }, [router, startLoading]);

  const replace = useCallback((href, options) => {
    startLoading();
    router.replace(href, options);
  }, [router, startLoading]);

  return {
    ...router,
    push,
    replace,
  };
}
