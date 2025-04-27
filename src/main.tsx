import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { isPlatform } from '@ionic/react';
import App from './App';
import './index.css';

// ตรวจสอบว่าเป็นการรันบนอุปกรณ์จริงหรือไม่
const isNative = Capacitor.isNativePlatform();
const platform = isPlatform('ios') ? 'iOS' : isPlatform('android') ? 'Android' : 'Web';

// แสดงข้อมูลเกี่ยวกับแพลตฟอร์ม
console.log(`[APP] Running on platform: ${platform}`);
console.log(`[APP] Is native: ${isNative}`);
console.log(`[APP] Is development: ${import.meta.env.DEV}`);

// ฟังก์ชันเริ่มต้นแอพ
const initializeApp = async () => {
  try {
    console.log('[APP] Initializing app...');
    
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูลหรือทำการตั้งค่าอื่นๆ ที่จำเป็น
    
    console.log('[APP] App initialized successfully');
  } catch (error) {
    console.error('[APP] Error initializing app:', error);
  }
};

// เริ่มต้นแอพ
initializeApp().catch(error => {
  console.error('[APP] Failed to initialize app:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
