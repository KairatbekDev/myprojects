import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="relative p-8 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] shadow-2xl animate-pulse">
      <div className="w-6 h-6 bg-zinc-800 rounded-lg mb-6" />
      <div className="h-7 bg-zinc-800 rounded-xl w-3/4 mb-2" />
      <div className="h-3 bg-zinc-800/60 rounded-lg w-1/2" />
      <div className="mt-10 flex justify-between items-center">
        <div className="h-2 bg-zinc-800/40 rounded-lg w-1/3" />
        <div className="w-4 h-4 bg-zinc-800/40 rounded" />
      </div>
    </div>
  );
};
