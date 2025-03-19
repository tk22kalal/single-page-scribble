
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add AdSense script to the document head
const addAdSenseScript = () => {
  const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  
  if (!existingScript) {
    const adScript = document.createElement('script');
    adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5920367457745298`;
    adScript.async = true;
    adScript.crossOrigin = 'anonymous';
    document.head.appendChild(adScript);
    console.log('AdSense script added to head');
  }
};

// Initialize ads
const initializeAds = () => {
  // Check if running in browser environment
  if (typeof window !== 'undefined') {
    addAdSenseScript();
  }
};

// Initialize immediately for browser environment
initializeAds();

// Also listen for deviceready event for Capacitor/Cordova
document.addEventListener('deviceready', initializeAds, false);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(<App />);
