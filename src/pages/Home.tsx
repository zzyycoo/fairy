import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Car, Bus, Flag, ArrowRight, ShieldCheck, Sparkles, Moon, Sun } from 'lucide-react';

const services = [
  { id: 'room', title: 'Room', icon: Bed, color: 'text-violet-500', darkColor: 'text-violet-400', bg: 'bg-violet-500/10', darkBg: 'bg-violet-400/10', desc: 'Hotel booking' },
  { id: 'car', title: 'Car', icon: Car, color: 'text-sky-500', darkColor: 'text-sky-400', bg: 'bg-sky-500/10', darkBg: 'bg-sky-400/10', desc: 'Rental service' },
  { id: 'golf', title: 'Golf', icon: Flag, color: 'text-emerald-500', darkColor: 'text-emerald-400', bg: 'bg-emerald-500/10', darkBg: 'bg-emerald-400/10', desc: 'Course access' },
  { id: 'bus', title: 'Bus', icon: Bus, color: 'text-amber-500', darkColor: 'text-amber-400', bg: 'bg-amber-500/10', darkBg: 'bg-amber-400/10', desc: 'Group transfer' },
];

const movieQuotes = [
  { text: "May the Force be with you.", movie: "Star Wars" },
  { text: "I'll be back.", movie: "The Terminator" },
  { text: "There's no place like home.", movie: "The Wizard of Oz" },
  { text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
  { text: "To infinity and beyond!", movie: "Toy Story" },
  { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather" },
  { text: "You can't handle the truth!", movie: "A Few Good Men" },
  { text: "Here's looking at you, kid.", movie: "Casablanca" },
  { text: "Show me the money!", movie: "Jerry Maguire" },
  { text: "Why so serious?", movie: "The Dark Knight" },
  { text: "I'm the king of the world!", movie: "Titanic" },
  { text: "Hasta la vista, baby.", movie: "Terminator 2" },
  { text: "You talking to me?", movie: "Taxi Driver" },
  { text: "E.T. phone home.", movie: "E.T." },
  { text: "I see dead people.", movie: "The Sixth Sense" },
  { text: "Just keep swimming.", movie: "Finding Nemo" },
  { text: "Houston, we have a problem.", movie: "Apollo 13" },
  { text: "Yippee-ki-yay!", movie: "Die Hard" },
  { text: "Say hello to my little friend!", movie: "Scarface" },
  { text: "I am your father.", movie: "Star Wars" },
  { text: "Bond. James Bond.", movie: "Dr. No" },
  { text: "There's no crying in baseball!", movie: "A League of Their Own" },
  { text: "You're gonna need a bigger boat.", movie: "Jaws" },
  { text: "I love the smell of napalm in the morning.", movie: "Apocalypse Now" },
  { text: "Go ahead, make my day.", movie: "Sudden Impact" },
  { text: "Toto, I've a feeling we're not in Kansas anymore.", movie: "The Wizard of Oz" },
  { text: "I am Groot.", movie: "Guardians of the Galaxy" },
  { text: "My precious.", movie: "The Lord of the Rings" },
  { text: "I feel the need—the need for speed.", movie: "Top Gun" },
  { text: "Carpe diem. Seize the day.", movie: "Dead Poets Society" },
  { text: "Magic Mirror on the wall...", movie: "Snow White" },
];

const getTodayQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return movieQuotes[dayOfYear % movieQuotes.length];
};

// 检测是否为移动设备
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
};

interface HomeProps {
  onSelectService: (id: string) => void;
}

export default function Home({ onSelectService }: HomeProps) {
  const todayQuote = getTodayQuote();
  const mobile = typeof window !== 'undefined' ? isMobile() : false;
  
  // 暗色模式状态
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    // 优先读取 localStorage，其次检测系统偏好
    const saved = localStorage.getItem('fairy-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 切换暗色模式
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('fairy-dark-mode', String(next));
      return next;
    });
  };

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('fairy-dark-mode');
      if (saved === null) setDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden font-sans transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* 背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute w-[500px] h-[500px] rounded-full transition-opacity duration-500 ${
            darkMode ? 'opacity-20' : 'opacity-30 md:opacity-40'
          }`}
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: mobile ? 'blur(100px)' : 'blur(80px)',
            top: '-10%',
            left: '-5%',
          }}
        />
        <div 
          className={`absolute w-[400px] h-[400px] rounded-full transition-opacity duration-500 ${
            darkMode ? 'opacity-15' : 'opacity-20 md:opacity-30'
          }`}
          style={{
            background: darkMode 
              ? 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
            filter: mobile ? 'blur(100px)' : 'blur(60px)',
            bottom: '-5%',
            right: '-5%',
          }}
        />
        {/* 网格纹理 - 仅桌面端 */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,91,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,91,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* 顶部导航 */}
      <nav className="w-full px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-colors duration-300 ${
            darkMode ? 'bg-gradient-to-br from-violet-400 to-indigo-500' : 'bg-gradient-to-br from-violet-500 to-indigo-600'
          }`}>
            <Sparkles size={14} className="md:w-4 md:h-4" />
          </div>
          <span className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            Fairy
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* 暗色模式切换按钮 */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-700/50 text-amber-300 hover:bg-slate-700' 
                : 'bg-white/80 text-slate-600 hover:bg-white'
            } border ${darkMode ? 'border-slate-600' : 'border-slate-200/60'} shadow-sm`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
              : 'bg-white/80 text-slate-500 border-slate-200/60'
          }`}>
            2.1.03
          </span>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 relative z-10 -mt-4 md:-mt-0">
        {/* 标题区 */}
        <div className="text-center mb-6 md:mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 md:mb-5 border shadow-sm transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-800/70 text-violet-300 border-violet-500/30' 
              : 'bg-white/70 text-violet-600 border-violet-200/50'
          }`}>
            <ShieldCheck size={12} />
            <span>Simple email generator</span>
          </div>
          <h1 className={`text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 tracking-tight transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            A KANG <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">TOOLS</span>
          </h1>
          <p className={`text-xs md:text-sm italic px-2 transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            "{todayQuote.text}" <span className="opacity-50 not-italic ml-1">— {todayQuote.movie}</span>
          </p>
        </div>

        {/* 服务卡片 */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-2.5 md:gap-4 w-full max-w-4xl px-2">
          {services.map((s, index) => (
            <motion.button
              key={s.id}
              initial={mobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={mobile ? {} : { delay: index * 0.08, duration: 0.4 }}
              whileHover={mobile ? {} : { scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectService(s.id)}
              className={`group p-3 md:px-6 md:py-5 rounded-xl md:rounded-2xl border flex items-center gap-2.5 md:gap-4 md:min-w-[160px] transition-all duration-300 active:scale-95 ${
                darkMode 
                  ? 'bg-slate-800/70 backdrop-blur-sm border-slate-700/60 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-violet-500/10' 
                  : 'bg-white/80 backdrop-blur-sm border-white/80 shadow-md shadow-slate-200/40 hover:shadow-lg md:hover:shadow-xl'
              }`}
            >
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                darkMode ? s.darkBg : s.bg
              } ${darkMode ? s.darkColor : s.color} group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-indigo-600 group-hover:text-white shadow-sm`}>
                <s.icon size={18} className="md:w-[22px] md:h-[22px]" />
              </div>
              <div className="text-left min-w-0">
                <h3 className={`text-xs md:text-sm font-bold truncate transition-colors duration-300 ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>{s.title}</h3>
                <p className={`text-[10px] md:text-xs hidden md:block transition-colors duration-300 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>{s.desc}</p>
              </div>
              <ArrowRight size={14} className={`ml-auto hidden md:block opacity-0 group-hover:opacity-100 transition-all ${
                darkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-300 group-hover:text-violet-500'
              }`} />
            </motion.button>
          ))}
        </div>

        {/* 快捷操作区 */}
        <div className="mt-6 md:mt-10 flex items-center gap-3 md:gap-4 text-xs">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-800/60 border-slate-700 text-slate-300' 
              : 'bg-white/60 border-white/60 text-slate-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="hidden md:inline">System online</span>
            <span className="md:hidden">Online</span>
          </span>
          <span className={`hidden md:inline ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
          <button className={`hidden md:block px-2 py-1 rounded-lg transition-colors duration-300 ${
            darkMode 
              ? 'text-slate-400 hover:text-violet-400 hover:bg-slate-800/50' 
              : 'text-slate-500 hover:text-violet-600 hover:bg-white/50'
          }`}>View records</button>
          <span className={`hidden md:inline ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
          <button className={`hidden md:block px-2 py-1 rounded-lg transition-colors duration-300 ${
            darkMode 
              ? 'text-slate-400 hover:text-violet-400 hover:bg-slate-800/50' 
              : 'text-slate-500 hover:text-violet-600 hover:bg-white/50'
          }`}>Settings</button>
        </div>
      </main>

      {/* 底部 */}
      <footer className={`w-full py-3 md:py-5 text-center text-xs relative z-10 transition-colors duration-300 ${
        darkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <p>© 2026 Fairy Booking</p>
      </footer>
    </div>
  );
}
