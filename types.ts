
export type AppTheme = 'amethyst' | 'emerald' | 'crimson' | 'ocean' | 'gold';
export type Gender = 'male' | 'female';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  currentWeight: number; // kg
  targetWeight: number; // kg
  stepGoal: number;
  waterGoal: number; // in ml
  calorieGoal: number;
  theme: AppTheme;
}

export interface WeightLog {
  date: string;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  time: string;
}

export interface DailyStats {
  steps: number;
  water: number; // in ml
  caloriesConsumed: number;
  caloriesBurned: number;
  meals: Meal[];
  exercises: Exercise[];
  weightLogs: WeightLog[];
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  time: string;
  type: 'Kahvaltı' | 'Öğle Yemeği' | 'Akşam Yemeği' | 'Atıştırmalık';
}

export interface Reminder {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  type: 'water' | 'meal' | 'steps';
}
