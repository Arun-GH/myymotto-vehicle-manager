import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive ResizeObserver error suppression
// This polyfill prevents ResizeObserver loop errors completely
if (typeof window !== 'undefined') {
  // Store original ResizeObserver
  const OriginalResizeObserver = window.ResizeObserver;
  
  // Create a debounced version to prevent loop errors
  class DebounceResizeObserver extends OriginalResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      let timeoutId: number;
      
      super((entries, observer) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            // Silently handle ResizeObserver callback errors
            if (!(error instanceof Error && error.message.includes('ResizeObserver'))) {
              throw error;
            }
          }
        }, 16); // One frame delay
      });
    }
  }
  
  // Replace the global ResizeObserver
  window.ResizeObserver = DebounceResizeObserver;
}

// Multiple layers of error suppression
const errorHandlers = [
  // Window error handler
  (e: ErrorEvent) => {
    if (e.message?.includes('ResizeObserver loop completed')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  },
  
  // Unhandled rejection handler
  (e: PromiseRejectionEvent) => {
    if (e.reason?.message?.includes('ResizeObserver')) {
      e.preventDefault();
      return false;
    }
  }
];

// Override console methods
const originalMethods = {
  error: console.error,
  warn: console.warn
};

['error', 'warn'].forEach(method => {
  console[method as keyof typeof originalMethods] = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed')) {
      return; // Suppress ResizeObserver warnings
    }
    originalMethods[method as keyof typeof originalMethods].apply(console, args);
  };
});

// Add event listeners
window.addEventListener('error', errorHandlers[0] as EventListener);
window.addEventListener('unhandledrejection', errorHandlers[1] as EventListener);

// Additional global error handler for any missed cases
window.addEventListener('error', (e) => {
  if (e.error?.stack?.includes('ResizeObserver') || 
      e.message?.includes('ResizeObserver loop')) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
