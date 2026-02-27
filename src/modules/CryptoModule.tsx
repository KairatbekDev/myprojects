import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  BarChart3, Activity, Zap, Globe 
} from 'lucide-react';

// Типизация для стабильности кода
interface Coin {
  id: string;
  name: string;
  price: number;
  change: number;
  color: string;
  history: number[];
}

export const CryptoModule: React.FC = () => {
  const [marketSentiment, setMarketSentiment] = useState('BULLISH');
  const [coins, setCoins] = useState<Coin[]>([
    { id: 'BTC', name: 'Bitcoin', price: 64200, change: 2.4, color: '#F7931A', history: [40, 55, 45, 60, 50, 75, 70] },
    { id: 'ETH', name: 'Ethereum', price: 3450, change: -1.2, color: '#627EEA', history: [30, 40, 35, 50, 45, 40, 38] },
    { id: 'SOL', name: 'Solana', price: 145, change: 8.7, color: '#14F195', history: [20, 25, 40, 45, 60, 80, 95] },
  ]);

  // Симуляция живого тикера цен
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(currentCoins => 
        currentCoins.map(coin => ({
          ...coin,
          price: coin.price + (Math.random() - 0.5) * 20,
          change: coin.change + (Math.random() - 0.5) * 0.1
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* МИНИ-КАРТОЧКИ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coins.map((coin) => (
          <motion.div 
            key={coin.id}
            whileHover={{ scale: 1.02, translateY: -5 }}
            className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black" style={{ backgroundColor: `${coin.color}15`, color: coin.color }}>
                  {coin.id}
                </div>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full ${coin.change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </div>
              </div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">{coin.name}</p>
              <div className="text-2xl font-black text-white italic tracking-tighter">
                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* Декоративный "пульс" на фоне */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg viewBox="0 0 100 40" className="w-full h-full">
                 <motion.path 
                   initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                   d="M0 30 L20 25 L40 35 L60 15 L80 25 L100 5" 
                   fill="none" stroke={coin.color} strokeWidth="2" 
                 />
               </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* БОЛЬШОЙ АНАЛИТИЧЕСКИЙ ЦЕНТР */}
      <div className="bg-[#09090b] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
              <BarChart3 className="text-blue-600" size={32}/>
              Market intelligence _
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em]">Node: KAIRAT-05</span>
              <div className="h-1 w-1 bg-zinc-800 rounded-full" />
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em]">Sentiment: {marketSentiment}</span>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {['SCAN', 'ANALYSIS', 'PREDICT'].map(btn => (
              <button key={btn} className="px-6 py-2 rounded-xl text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest">{btn}</button>
            ))}
          </div>
        </div>

        {/* ГРАФИК МОЩНОСТИ СЕТИ */}
        <div className="h-80 w-full flex items-end gap-2 group">
          {[...Array(40)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 60 + 20}%` }}
              transition={{ delay: i * 0.01, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className={`flex-1 rounded-full transition-all duration-500 ${i % 5 === 0 ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* НИЖНЯЯ ПАНЕЛЬ СТАТИСТИКИ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12 pt-10 border-t border-white/5">
          <StatBox label="Network Load" val="1.4 GB/S" icon={<Globe size={14}/>} />
          <StatBox label="Efficiency" val="99.9%" icon={<Zap size={14}/>} />
          <StatBox label="Active Nodes" val="1,204" icon={<Activity size={14}/>} />
          <StatBox label="Global Hash" val="452 TH/S" icon={<TrendingUp size={14}/>} />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, val, icon }: any) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
      {icon} {label}
    </div>
    <div className="text-xl font-bold text-white italic tracking-tighter uppercase">{val}</div>
  </div>
);
