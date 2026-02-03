
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, Droplet, Utensils, Settings, Bell, 
  Plus, Volume2, Trash2, Dumbbell, Zap, 
  Bike, Waves, Flower2 as Flower, History, 
  TrendingUp, Award, Flame, User, Scale, Ruler, ArrowRight, Info,
  Venus, Mars, Calculator, RefreshCw, ChevronRight, Share2
} from 'lucide-react';
import { UserProfile, DailyStats, Meal, Reminder, Exercise, AppTheme, WeightLog, Gender } from './types';
import { INITIAL_PROFILE, DEFAULT_REMINDERS, FOOD_DATABASE, EXERCISE_TYPES, THEMES } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vitalis_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [stats, setStats] = useState<DailyStats>(() => {
    const saved = localStorage.getItem('vitalis_stats');
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.data;
    }
    return { steps: 0, water: 0, caloriesConsumed: 0, caloriesBurned: 0, meals: [], exercises: [], weightLogs: [] };
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('vitalis_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'meals' | 'exercises' | 'settings'>('home');
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const currentTheme = useMemo(() => THEMES[profile.theme || 'amethyst'], [profile.theme]);

  // Apply CSS Variables globally
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--bg-start', currentTheme.bgStart);
    root.style.setProperty('--bg-end', currentTheme.bgEnd);
    root.style.setProperty('--text-main', currentTheme.text);
    root.style.setProperty('--text-muted', currentTheme.muted);
    root.style.setProperty('--glass', currentTheme.glass);
    document.body.style.background = `linear-gradient(180deg, ${currentTheme.bgStart} 0%, ${currentTheme.bgEnd} 100%)`;
  }, [currentTheme]);

  // PWA Install Prompt Handler
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  const playSound = useCallback((type: 'ping' | 'success' | 'water') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type === 'water' ? 'sine' : 'triangle';
      
      if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.5); // C6
      } else if (type === 'water') {
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      }

      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.log('Audio not supported yet'); }
  }, []);

  // Reminder Checker Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(rem => {
        if (rem.enabled && rem.time === currentTime && now.getSeconds() === 0) {
          playSound('success');
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Hatırlatma!', { body: rem.label, icon: 'favicon.ico' });
          } else {
            alert(rem.label);
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reminders, playSound]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('vitalis_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vitalis_stats', JSON.stringify({ 
      date: new Date().toDateString(), 
      data: stats 
    }));
  }, [stats]);

  const bmi = useMemo(() => {
    const h = profile.height / 100;
    if (h === 0) return 0;
    return parseFloat((profile.currentWeight / (h * h)).toFixed(1));
  }, [profile.currentWeight, profile.height]);

  const bmiStatus = useMemo(() => {
    if (bmi < 18.5) return { label: 'Zayıf', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Fazla Kilolu', color: 'text-orange-400' };
    return { label: 'Obez', color: 'text-red-400' };
  }, [bmi]);

  const addWater = (amount: number) => {
    setStats(prev => ({ ...prev, water: Math.min(prev.water + amount, 5000) }));
    playSound('water');
  };

  const logMeal = (food: { name: string, calories: number, type: string }) => {
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: food.name,
      calories: food.calories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: food.type as any
    };
    setStats(prev => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + food.calories,
      meals: [newMeal, ...prev.meals]
    }));
    setIsAddMealOpen(false);
    playSound('ping');
  };

  const logExercise = (exerciseType: typeof EXERCISE_TYPES[0], duration: number) => {
    const burned = exerciseType.calPerMin * duration;
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseType.name,
      duration: duration,
      caloriesBurned: burned,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setStats(prev => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + burned,
      exercises: [newExercise, ...prev.exercises]
    }));
    setIsAddExerciseOpen(false);
    playSound('ping');
  };

  const netCalories = useMemo(() => {
    return Math.max(0, stats.caloriesConsumed - stats.caloriesBurned);
  }, [stats]);

  const IconMap: Record<string, any> = { Activity, Bike, Waves, Flower, Dumbbell, Zap };

  return (
    <div className="min-h-screen max-w-md mx-auto relative pb-32 overflow-hidden px-4">
      {/* Dynamic Glow Orbs */}
      <div className="absolute top-0 left-0 w-full h-[60vh] -z-10 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: currentTheme.primary }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: currentTheme.secondary }}></div>
      </div>

      <header className="py-8 pt-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-white/20 premium-shadow">
             <Scale size={24} stroke={currentTheme.primary} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tight" style={{ color: currentTheme.text }}>Kilo Kontrolü</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: currentTheme.muted }}>Premium Elite</p>
          </div>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="w-10 h-10 glass rounded-full flex items-center justify-center text-emerald-400 animate-pulse">
              <Share2 size={18} />
            </button>
          )}
          <button onClick={() => setActiveTab('settings')} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <User size={18} style={{ color: currentTheme.text }} />
          </button>
        </div>
      </header>

      <main className="space-y-6 animate-in">
        {activeTab === 'home' && (
          <>
            {/* Health Snapshot */}
            <section className="glass p-6 rounded-[2.5rem] relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">Hedef Yolculuğu</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-serif font-black">{profile.currentWeight}</span>
                    <span className="text-sm font-bold opacity-40">/ {profile.targetWeight} kg</span>
                  </div>
                </div>
                <div className="glass px-3 py-1.5 rounded-full border-white/10">
                  <span className={`text-[10px] font-black uppercase ${bmiStatus.color}`}>{bmiStatus.label}</span>
                </div>
              </div>
              
              <div className="w-full h-2.5 bg-black/30 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 premium-shadow"
                  style={{ 
                    width: `${Math.max(5, Math.min(100, (profile.targetWeight / profile.currentWeight) * 100))}%`,
                    background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentTheme.primary + '20' }}>
                    <ArrowRight size={16} style={{ color: currentTheme.primary }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Kalan</p>
                    <p className="text-sm font-bold">{Math.abs(profile.currentWeight - profile.targetWeight).toFixed(1)} kg</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWeightModalOpen(true)}
                  className="px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] glass hover:bg-white/10 active:scale-95 transition-all"
                >
                  Tartıl
                </button>
              </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="glass p-5 rounded-[2rem] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#3b82f620' }}>
                    <Activity size={20} className="text-blue-400" />
                  </div>
                  <TrendingUp size={14} className="opacity-20" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Adım</h3>
                <p className="text-2xl font-black mt-1">{stats.steps.toLocaleString()}</p>
                <div className="w-full h-1 bg-black/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min((stats.steps / profile.stepGoal) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="glass p-5 rounded-[2rem]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#06b6d420' }}>
                    <Droplet size={20} className="text-cyan-400" />
                  </div>
                  <button onClick={() => addWater(250)} className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">+</button>
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Su</h3>
                <p className="text-2xl font-black mt-1">{(stats.water / 1000).toFixed(1)} <span className="text-xs opacity-40">L</span></p>
                <div className="w-full h-1 bg-black/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${Math.min((stats.water / profile.waterGoal) * 100, 100)}%` }}></div>
                </div>
              </div>
            </section>

            {/* Calorie Stats */}
            <section className="glass p-6 rounded-[2.5rem] flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Net Enerji</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-black">{netCalories}</span>
                  <span className="text-[10px] font-black opacity-40">KCAL</span>
                </div>
                <p className="text-[10px] font-black opacity-40 uppercase">HEDEF: {profile.calorieGoal}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center group">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 glass hover:bg-white/5 transition-all">
                      <Flame size={20} className="text-orange-400" />
                   </div>
                   <p className="text-[10px] font-black opacity-60">-{stats.caloriesBurned}</p>
                </div>
                <div className="text-center group">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 glass hover:bg-white/5 transition-all">
                      <Utensils size={20} className="text-indigo-400" />
                   </div>
                   <p className="text-[10px] font-black opacity-60">+{stats.caloriesConsumed}</p>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsAddMealOpen(true)} className="py-6 glass rounded-[2rem] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="p-3 rounded-2xl bg-indigo-500/10"><Plus size={20} className="text-indigo-400" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Yemek Kaydı</span>
              </button>
              <button onClick={() => setIsAddExerciseOpen(true)} className="py-6 glass rounded-[2rem] flex flex-col items-center gap-2 active:scale-95 transition-all">
                <div className="p-3 rounded-2xl bg-emerald-500/10"><Plus size={20} className="text-emerald-400" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Egzersiz Kaydı</span>
              </button>
            </div>
          </>
        )}

        {/* Other tabs remain similar but with currentTheme enhancements */}
        {activeTab === 'settings' && (
          <div className="space-y-8 pb-32">
            <h3 className="text-3xl font-serif font-black">Elite Ayarlar</h3>
            <div className="space-y-6">
              <div className="glass p-6 rounded-[2.5rem] space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">İsim</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-black/20 p-4 rounded-2xl outline-none border border-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Yaş</label>
                    <input type="number" value={profile.age} onChange={(e) => setProfile({...profile, age: Number(e.target.value)})} className="w-full bg-black/20 p-4 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Boy (cm)</label>
                    <input type="number" value={profile.height} onChange={(e) => setProfile({...profile, height: Number(e.target.value)})} className="w-full bg-black/20 p-4 rounded-2xl outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Görünüm</label>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(THEMES) as AppTheme[]).map(themeKey => (
                    <button 
                      key={themeKey}
                      onClick={() => setProfile({...profile, theme: themeKey})}
                      className={`h-12 rounded-2xl border-4 transition-all ${profile.theme === themeKey ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: THEMES[themeKey].primary }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col items-center pb-20">
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mb-4">Master Developer</p>
              <a href="https://fatihpatir.github.io/web/index.html" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
                <span className="font-serif font-black text-3xl transition-all duration-500 group-hover:scale-105" style={{ color: currentTheme.text }}>Fatih PATIR</span>
                <div className="h-1 w-0 group-hover:w-full transition-all duration-700 mt-2 rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
              </a>
            </div>
          </div>
        )}

        {(activeTab === 'meals' || activeTab === 'exercises') && (
          <div className="space-y-6 pb-32">
            <h3 className="text-3xl font-serif font-black uppercase">{activeTab === 'meals' ? 'Öğünler' : 'Aktiviteler'}</h3>
            <div className="space-y-4">
              {(activeTab === 'meals' ? stats.meals : stats.exercises).map((item: any) => (
                <div key={item.id} className="glass p-5 rounded-[2rem] flex justify-between items-center group border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                      {activeTab === 'meals' ? <Utensils size={24} className="text-indigo-400" /> : <Dumbbell size={24} className="text-emerald-400" />}
                    </div>
                    <div>
                      <p className="text-base font-black">{item.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {item.type || `${item.duration} dk`} • {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`text-lg font-black ${activeTab === 'meals' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                      {activeTab === 'meals' ? `+${item.calories}` : `-${item.caloriesBurned}`}
                    </p>
                    <button onClick={() => {
                       if(activeTab === 'meals') setStats(prev => ({...prev, caloriesConsumed: prev.caloriesConsumed - item.calories, meals: prev.meals.filter(m => m.id !== item.id)}));
                       else setStats(prev => ({...prev, caloriesBurned: prev.caloriesBurned - item.caloriesBurned, exercises: prev.exercises.filter(e => e.id !== item.id)}));
                    }} className="w-10 h-10 glass rounded-full flex items-center justify-center text-red-500/40 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => activeTab === 'meals' ? setIsAddMealOpen(true) : setIsAddExerciseOpen(true)}
              className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] bg-white text-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={20} /> EKLE
            </button>
          </div>
        )}
      </main>

      {/* MODALS */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-8">
          <div className="w-full max-w-sm glass rounded-[3rem] p-10">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif font-black">Yeni Tartım</h3>
                <button onClick={() => setIsWeightModalOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center">X</button>
             </div>
             <div className="flex flex-col items-center mb-10">
                <input 
                  type="number" step="0.1" autoFocus
                  className="bg-transparent text-8xl font-serif font-black text-center outline-none w-full"
                  value={profile.currentWeight}
                  onChange={(e) => setProfile({...profile, currentWeight: Number(e.target.value)})}
                  style={{ color: currentTheme.primary }}
                />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4 opacity-40">KILOGRAM</p>
             </div>
             <button 
                onClick={() => { setIsWeightModalOpen(false); playSound('ping'); }}
                className="w-full py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` }}
             >
               KAYDET
             </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[3rem] p-3 flex justify-around items-center z-40 shadow-2xl border border-white/10">
        {[
          { id: 'home', icon: TrendingUp },
          { id: 'meals', icon: Utensils },
          { id: 'exercises', icon: Dumbbell },
          { id: 'settings', icon: Settings }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)} 
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`}
          >
            <div className={`p-3 rounded-[1.2rem] transition-all duration-500 ${activeTab === item.id ? 'scale-110' : 'hover:bg-white/5'}`} 
                 style={{ backgroundColor: activeTab === item.id ? currentTheme.primary : 'transparent' }}>
              <item.icon size={22} />
            </div>
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes animate-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: animate-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
