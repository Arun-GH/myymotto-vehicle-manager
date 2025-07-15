import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress ResizeObserver loop errors (common harmless warnings)
const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
    return;
  }
};

window.addEventListener('error', resizeObserverErrorHandler);

createRoot(document.getElementById("root")!).render(<App />);
