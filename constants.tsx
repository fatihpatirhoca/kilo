
import { UserProfile, Reminder, AppTheme } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Kullanıcı",
  age: 25,
  gender: 'male',
  height: 175,
  currentWeight: 80,
  targetWeight: 70,
  stepGoal: 5000,
  waterGoal: 2000,
  calorieGoal: 2000,
  theme: 'amethyst'
};

export const THEMES: Record<AppTheme, { 
  primary: string, 
  secondary: string, 
  bgStart: string, 
  bgEnd: string, 
  glass: string, 
  text: string, 
  muted: string 
}> = {
  amethyst: { 
    primary: '#a855f7', 
    secondary: '#6366f1', 
    bgStart: '#020617', 
    bgEnd: '#1e1b4b', 
    glass: 'rgba(15, 23, 42, 0.6)', 
    text: '#f8fafc', 
    muted: '#94a3b8' 
  },
  emerald: { 
    primary: '#10b981', 
    secondary: '#059669', 
    bgStart: '#022c22', 
    bgEnd: '#064e3b', 
    glass: 'rgba(6, 78, 59, 0.4)', 
    text: '#ecfdf5', 
    muted: '#6ee7b7' 
  },
  crimson: { 
    primary: '#ef4444', 
    secondary: '#991b1b', 
    bgStart: '#450a0a', 
    bgEnd: '#7f1d1d', 
    glass: 'rgba(127, 29, 29, 0.3)', 
    text: '#fef2f2', 
    muted: '#fca5a5' 
  },
  ocean: { 
    primary: '#0ea5e9', 
    secondary: '#0369a1', 
    bgStart: '#082f49', 
    bgEnd: '#0c4a6e', 
    glass: 'rgba(12, 74, 110, 0.4)', 
    text: '#f0f9ff', 
    muted: '#7dd3fc' 
  },
  gold: { 
    primary: '#f59e0b', 
    secondary: '#b45309', 
    bgStart: '#1c1917', 
    bgEnd: '#44403c', 
    glass: 'rgba(68, 64, 60, 0.5)', 
    text: '#fffbeb', 
    muted: '#fcd34d' 
  }
};

export const EXERCISE_TYPES = [
  { name: 'Koşu', calPerMin: 10, icon: 'Zap' },
  { name: 'Yürüyüş', calPerMin: 4, icon: 'Activity' },
  { name: 'Bisiklet', calPerMin: 8, icon: 'Bike' },
  { name: 'Yüzme', calPerMin: 12, icon: 'Waves' },
  { name: 'Yoga', calPerMin: 3, icon: 'Flower' },
  { name: 'Fitness', calPerMin: 7, icon: 'Dumbbell' }
];

export const FOOD_DATABASE = [
  { name: 'Yumurta (Haşlanmış)', calories: 78, type: 'Kahvaltı' },
  { name: 'Zeytin (5 adet)', calories: 45, type: 'Kahvaltı' },
  { name: 'Peynir (Tam Yağlı)', calories: 95, type: 'Kahvaltı' },
  { name: 'Izgara Tavuk', calories: 165, type: 'Öğle Yemeği' },
  { name: 'Bulgur Pilavı (Porsiyon)', calories: 150, type: 'Öğle Yemeği' },
  { name: 'Salata (Yağsız)', calories: 35, type: 'Öğle Yemeği' },
  { name: 'Mercimek Çorbası', calories: 120, type: 'Akşam Yemeği' },
  { name: 'Izgara Köfte (4 adet)', calories: 240, type: 'Akşam Yemeği' },
  { name: 'Yoğurt (Kase)', calories: 60, type: 'Akşam Yemeği' },
  { name: 'Elma', calories: 52, type: 'Atıştırmalık' },
  { name: 'Ceviz (2 adet)', calories: 65, type: 'Atıştırmalık' },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  { id: '1', time: '09:00', label: 'Sabah Suyu', enabled: true, type: 'water' },
  { id: '2', time: '13:00', label: 'Öğle Yemeği Hatırlatması', enabled: true, type: 'meal' },
  { id: '3', time: '16:00', label: 'Yürüyüş Zamanı', enabled: true, type: 'steps' },
  { id: '4', time: '20:00', label: 'Günlük Kapanış Suyu', enabled: true, type: 'water' },
];
