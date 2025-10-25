import React from 'react';
import type { CalculationResult } from '../types';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface ResultsDisplayProps {
  results: CalculationResult | null;
  isCalculating: boolean;
  isFadingOut: boolean;
}

const getMotivationalMessage = (balance: number): string => {
  if (balance < 100) return "💭 Small wins make great traders. Keep going! 🌱";
  if (balance <= 5000) return "💸 Nice one! 📈 You’re building real momentum — keep pushing forward!";
  if (balance <= 20000) return "💥 Boom! 💪 You’re breaking limits and moving to the next level!";
  if (balance <= 50000) return "🔥 Unstoppable energy! 🔥 You’re trading like a champion!";
  if (balance <= 100000) return "👑 You’re becoming unstoppable — precision meets power!";
  if (balance <= 200000) return "👑 Legend status unlocked! 👑 You’re the GOAT of the markets!";
  return "👑 Legend status unlocked! 👑 You’re the GOAT of the markets!";
};

const ResultRow: React.FC<{ label: string; value: number; prefix?: string; isCurrency?: boolean; isProfit?: boolean }> = ({ label, value, prefix = '', isCurrency = true, isProfit = false }) => {
  const animatedValue = useAnimatedNumber(value, 500);
  const displayValue = isCurrency 
    ? animatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : animatedValue.toFixed(2);

  return (
    <div className="flex justify-between items-center py-4 border-b border-white/10 last:border-b-0">
      <span className="text-white/80">{label}</span>
      <span className={`font-semibold text-lg ${isProfit ? 'text-green-400' : 'text-white'}`}>
        {prefix}{displayValue}
      </span>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isCalculating, isFadingOut }) => {
  const motivationalMessage = results ? getMotivationalMessage(results.accountBalance) : '';

  return (
    <div className="w-full h-[324px]"> 
      <div className={`w-full transition-opacity duration-300 ${isFadingOut || !results ? 'opacity-0' : 'opacity-100'}`}>
        {results && (
          <>
            <div className="w-full p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 animate-fade-in">
              <div className="px-4">
                <ResultRow label="Lot Size" value={results.lotSize} isCurrency={false} />
                <ResultRow label="Pip Value" value={results.pipValue} prefix="$" />
                <ResultRow label="Risk Amount" value={results.riskAmount} prefix="$" />
                <ResultRow label="Target Profit" value={results.targetProfit} prefix="$" isProfit={true} />
              </div>
            </div>
            <div className="h-10 text-center flex items-center justify-center mt-4">
                  <p className="text-green-400 font-medium animate-fade-in" style={{ textShadow: '0 0 10px rgba(52, 211, 153, 0.6)' }}>
                      {motivationalMessage}
                  </p>
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;