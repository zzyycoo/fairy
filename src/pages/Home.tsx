import { motion } from 'framer-motion';
import { Bed, Car, Bus, Flag, ArrowRight, ShieldCheck } from 'lucide-react';

const services = [
  { id: 'room', title: 'Room', icon: Bed, color: 'text-stripe-purple', bg: 'bg-stripe-purple/10', desc: 'Hotel booking' },
  { id: 'car', title: 'Car', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Rental service' },
  { id: 'golf', title: 'Golf', icon: Flag, color: 'text-green-600', bg: 'bg-green-600/10', desc: 'Course access' },
  { id: 'bus', title: 'Bus', icon: Bus, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Group transfer' },
];

// 经典电影台词 - 每日轮换
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

// 获取今日台词
const getTodayQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return movieQuotes[dayOfYear % movieQuotes.length];
};

interface HomeProps {
  onSelectService: (id: string) => void;
}

export default function Home({ onSelectService }: HomeProps) {
  const todayQuote = getTodayQuote();

  return (
    <div className="h-screen bg-stripe-bg flex flex-col relative overflow-hidden font-sans">
      {/* 背景装饰 */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-stripe-purple/8 rounded-full blur-3xl opacity-50" />
      
      {/* 顶部导航 */}
      <nav className="w-full px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stripe-purple rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold text-stripe-text text-lg">Fairy</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stripe-gray bg-white px-2.5 py-1 rounded-full border border-stripe-lightGray">v2.2</span>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-4">
        {/* 标题区 */}
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <motion.div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs font-medium text-stripe-purple mb-4 border border-stripe-purple/20">
            <ShieldCheck size={12} />
            <span>Simple email generator</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-stripe-text mb-2 tracking-tight">
            A KANG <span className="text-transparent bg-clip-text bg-gradient-to-r from-stripe-purple to-stripe-blue">TOOLS</span>
          </h1>
          <p className="text-stripe-gray text-sm italic">
            "{todayQuote.text}" <span className="text-xs opacity-60 not-italic">— {todayQuote.movie}</span>
          </p>
        </motion.div>

        {/* 服务卡片 */}
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl">
          {services.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectService(s.id)}
              className="group bg-white px-5 py-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-3 min-w-[140px] transition-all"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg} ${s.color} group-hover:bg-stripe-purple group-hover:text-white shrink-0 transition-colors`}>
                <s.icon size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-stripe-text">{s.title}</h3>
                <p className="text-xs text-stripe-gray">{s.desc}</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-stripe-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>

        {/* 快捷操作区 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center gap-4 text-xs text-stripe-gray"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            System online
          </span>
          <span className="text-gray-300">|</span>
          <button className="hover:text-stripe-purple transition-colors">View records</button>
          <span className="text-gray-300">|</span>
          <button className="hover:text-stripe-purple transition-colors">Settings</button>
        </motion.div>
      </main>

      {/* 底部 */}
      <footer className="w-full py-4 text-center text-stripe-gray text-xs shrink-0">
        <p>© 2026 Fairy Booking System</p>
      </footer>
    </div>
  );
}
