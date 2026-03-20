import { motion } from 'framer-motion';
import { Bed, Car, Bus, Circle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Service } from '../../types';

const services = [
  { 
    id: 'room',
    key: 'room' as Service,
    title: 'Room Booking', 
    icon: Bed, 
    color: 'text-stripe-purple',
    bg: 'bg-stripe-purple/10',
    desc: 'Professional hotel reservation' 
  },
  { 
    id: 'car',
    key: 'car' as Service,
    title: 'Car Rental', 
    icon: Car, 
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    desc: 'Reliable transport' 
  },
  { 
    id: 'golf',
    key: 'golf' as Service,
    title: 'Golf Courses', 
    icon: Circle, 
    color: 'text-green-600',
    bg: 'bg-green-600/10',
    desc: 'Premium golf access' 
  },
  { 
    id: 'bus',
    key: 'bus' as Service,
    title: 'Bus Service', 
    icon: Bus, 
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    desc: 'Group transfers' 
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

interface HomeProps {
  selectedServices: Set<Service>;
  onToggleService: (service: Service) => void;
  onContinue?: () => void;
}

export const Home = ({ selectedServices, onToggleService }: HomeProps) => {
  return (
    <div className="min-h-screen bg-stripe-bg flex flex-col relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-stripe-purple/10 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-stripe-blue/10 rounded-full blur-3xl opacity-60" />

      <nav className="w-full p-6 flex justify-between items-center relative z-10 backdrop-blur-sm bg-stripe-bg/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-stripe-purple rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="font-bold text-stripe-text text-xl tracking-tight">Fairy</span>
        </div>
        <div className="text-xs font-medium text-stripe-gray bg-white px-3 py-1 rounded-full border border-stripe-lightGray shadow-sm">v2.1</div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-semibold text-stripe-purple shadow-sm mb-6 border border-stripe-purple/20">
            <ShieldCheck size={14} />
            <span>Trusted by professionals</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-stripe-text mb-6 tracking-tight leading-[1.1]">
            One-stop travel <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stripe-purple to-stripe-blue">service management</span>
          </h1>
          
          <p className="text-stripe-gray text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Simple, fast, reliable. Professional booking tool for Vietnam travel.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onToggleService(service.key)}
              className={`group bg-white p-8 rounded-2xl shadow-stripe hover:shadow-stripe-hover cursor-pointer transition-all duration-300 border border-gray-100 flex flex-col h-full ${
                selectedServices.has(service.key) ? 'ring-2 ring-stripe-purple' : ''
              }`}
            >
              <div className={`mb-6 w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${service.bg} ${service.color} group-hover:bg-stripe-purple group-hover:text-white`}>
                <service.icon size={28} strokeWidth={2} />
              </div>
              
              <h3 className="text-xl font-bold text-stripe-text mb-2">{service.title}</h3>
              <p className="text-stripe-gray text-sm mb-8 leading-relaxed flex-1">{service.desc}</p>
              
              <div className="flex items-center text-stripe-purple font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>{selectedServices.has(service.key) ? 'Selected' : 'Start booking'}</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="w-full py-8 text-center text-stripe-gray text-sm relative z-10 backdrop-blur-sm bg-stripe-bg/30">
        <p>© 2026 Fairy Booking System. All rights reserved.</p>
      </footer>
    </div>
  );
};
