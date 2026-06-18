import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffgchakcjqklnsqjhgxc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2NoYWtjanFrbG5zcWpoZ3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTkzNjAsImV4cCI6MjA4NzQ5NTM2MH0.3T9-EsM1RP9OTnXsa2RBG-uKLpOnCrrObZJTXas3OR0';

// Detecta se o localStorage está disponível e funcional (para contornar restrições do Safari privado)
const getSafeStorage = () => {
  try {
    const testKey = '__supabase_test_storage__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('LocalStorage bloqueado ou indisponível. Usando armazenamento em memória RAM.');
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getSafeStorage(),
    persistSession: true,
    detectSessionInUrl: true
  }
});
