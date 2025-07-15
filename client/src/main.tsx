import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress ResizeObserver loop errors (common harmless warnings)
const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
};

// Also handle unhandled rejections and console errors
const unhandledRejectionHandler = (e: PromiseRejectionEvent) => {
  if (e.reason?.message?.includes('ResizeObserver')) {
    e.preventDefault();
    return false;
  }
};

// Override console.error to filter ResizeObserver warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes && args[0].includes('ResizeObserver loop completed')) {
    return; // Suppress the error
  }
  originalConsoleError.apply(console, args);
};

window.addEventListener('error', resizeObserverErrorHandler);
window.addEventListener('unhandledrejection', unhandledRejectionHandler);

createRoot(document.getElementById("root")!).render(<App />);
