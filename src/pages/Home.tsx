import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bed, Car, Bus, Flag, Sun, Moon, Sparkles, 
  Upload, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { useStore } from '../store';
import { usePIDSearch } from '../utils';
import type { ServiceType } from '../types';
import { useState, useRef } from 'react';

const services = [
  { id: 'room' as ServiceType, title: 'Room Booking', icon: Bed, desc: 'Hotel reservation', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'car' as ServiceType, title: 'Car Service', icon: Car, desc: 'VIP transport', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { id: 'golf' as ServiceType, title: 'Golf Booking', icon: Flag, desc: 'Course access', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'bus' as ServiceType, title: 'Bus Service', icon: Bus, desc: 'Group transfer', color: 'text-amber-500', bg: 'bg-amber-500/10' },
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

export default function Home() {
  const navigate = useNavigate();
  const { 
    darkMode, 
    toggleDarkMode, 
    booking, 
    toggleService, 
    setOneDayTripMode,
    initOneDayTrip,
  } = useStore();
  
  const { pidDatabase, handleFileUpload } = usePIDSearch();
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const todayQuote = getTodayQuote();
  
  const handleServiceToggle = (serviceId: ServiceType) => {
    toggleService(serviceId);
  };
  
  const handleProceed = () => {
    if (booking.selectedServices.size === 0) {
      alert('Please select at least one service!');
      return;
    }
    
    setOneDayTripMode(false);
    
    navigate('/booking');
  };
  
  const handleOneDayTrip = () => {
    setOneDayTripMode(true);
    initOneDayTrip();
    navigate('/booking');
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      await handleFileUpload(file, (progress) => {
        setImportProgress(progress);
      });
    } catch (error) {
      alert('❌ Error reading Excel file. Please make sure it\'s a valid .xlsx file.');
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* 背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-[-10%] left-[-5%] transition-opacity ${
          darkMode ? 'opacity-20 bg-violet-600' : 'opacity-30 bg-violet-400'
        }`} />
        <div className={`absolute w-[400px] h-[400px] rounded-full blur-3xl bottom-[-5%] right-[-5%] transition-opacity ${
          darkMode ? 'opacity-15 bg-blue-600' : 'opacity-20 bg-blue-400'
        }`} />
      </div>
      
      {/* 顶部栏 */}
      <nav className="relative z-10 w-full px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${
            darkMode ? 'bg-gradient-to-br from-violet-400 to-indigo-500' : 'bg-gradient-to-br from-violet-500 to-indigo-600'
          }`}>
            <Sparkles size={16} />
          </div>
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>Fairy</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* PID 导入状态 */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
              : 'bg-white/80 border-slate-200 text-slate-600'
          }`}>
            {pidDatabase.loaded ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>{pidDatabase.count.toLocaleString()} records</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>No database</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".xlsx,.xls" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="ml-1 text-violet-500 hover:text-violet-600 font-medium"
            >
              {isImporting ? `${importProgress}%` : (pidDatabase.loaded ? 'Re-import' : 'Import')}
            </button>
          </div>
          
          {/* 暗色模式切换 */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors border ${
              darkMode 
                ? 'bg-slate-700/50 text-amber-300 border-slate-600' 
                : 'bg-white/80 text-slate-600 border-slate-200/60'
            }`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            darkMode 
              ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
              : 'bg-white/80 text-slate-500 border-slate-200/60'
          }`}>
            2.2.01
          </span>
        </div>
      </nav>
      
      {/* 主内容 */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4 border ${
            darkMode 
              ? 'bg-slate-800/70 text-violet-300 border-violet-500/30' 
              : 'bg-white/70 text-violet-600 border-violet-200/50'
          }`}>
            <ShieldCheck size={14} />
            <span>Professional Email Generator</span>
          </div>
          
          <h1 className={`text-3xl md:text-5xl font-bold mb-3 tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            A KANG <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">TOOLS</span>
          </h1>
          
          <p className={`text-sm italic ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            "{todayQuote.text}" <span className="opacity-50 not-italic ml-1">— {todayQuote.movie}</span>
          </p>
        </div>
        
        {/* ONE DAY TRIP 特殊入口 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border-2 border-amber-400 cursor-pointer transition-all hover:shadow-lg ${
            darkMode ? 'bg-amber-900/20' : 'bg-amber-50'
          }`}
          onClick={handleOneDayTrip}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                🌅 ONE DAY TRIP — Patron Registration
              </h3>
              <p className={`text-sm ${darkMode ? 'text-amber-400/70' : 'text-amber-700/70'}`}>
                Patron visit without room booking
              </p>
            </div>
            <button className={`px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-md transition-all`}>
              Enter →
            </button>
          </div>
        </motion.div>
        
        {/* 分隔线 */}
        <div className={`text-center text-sm mb-6 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          — OR SELECT OTHER SERVICES —
        </div>
        
        {/* 服务选择网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {services.map((service) => {
            const isSelected = booking.selectedServices.has(service.id);
            return (
              <motion.button
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceToggle(service.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? (darkMode 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : 'border-violet-500 bg-violet-50')
                    : (darkMode 
                        ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' 
                        : 'border-slate-200 bg-white hover:border-violet-300')
                }`}
              >
                {/* 选中标记 */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
                
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${service.bg} ${service.color}`}>
                  <service.icon size={20} />
                </div>
                
                <h3 className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  {service.title}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {service.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
        
        {/* 继续按钮 */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            disabled={booking.selectedServices.size === 0}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all ${
              booking.selectedServices.size === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:shadow-lg'
            }`}
          >
            Continue Booking →
          </motion.button>
        </div>
      </main>
    </div>
  );
}
