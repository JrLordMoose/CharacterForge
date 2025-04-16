import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/toaster";

// Add Font Awesome
const fontAwesomeScript = document.createElement('script');
fontAwesomeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
fontAwesomeScript.defer = true;
document.head.appendChild(fontAwesomeScript);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
