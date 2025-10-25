import React, { useState } from 'react';
import Header from './components/Header';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import Chatbot from './components/Chatbot';
import type { CalculationResult } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCalculate = (newResults: CalculationResult) => {
    // Prevent new calculations while one is in progress or fading out
    if (isCalculating || isFadingOut) return;

    if (results) {
      setIsFadingOut(true);
      setTimeout(() => {
        setResults(null);
        setIsFadingOut(false);
        setIsCalculating(true);
        setTimeout(() => {
          setResults(newResults);
          setIsCalculating(false);
        }, 2000);
      }, 300); // Fade-out duration
    } else {
      setIsCalculating(true);
      setTimeout(() => {
        setResults(newResults);
        setIsCalculating(false);
      }, 2000);
    }
  };
  
  const handleToggleChat = (isOpen: boolean) => {
    setIsChatOpen(isOpen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div 
        className={`relative z-10 flex flex-col items-center w-full max-w-md mx-auto space-y-8 pt-12 pb-12 transition-all duration-500 ${isChatOpen ? 'blur-sm brightness-50 pointer-events-none' : 'blur-none brightness-100'}`}
      >
        <Header />
        <div className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <CalculatorForm onCalculate={handleCalculate} isCalculating={isCalculating || isFadingOut} />
        </div>
        <ResultsDisplay results={results} isCalculating={isCalculating} isFadingOut={isFadingOut} />
      </div>
      <Chatbot onToggle={handleToggleChat} />
    </div>
  );
};

export default App;