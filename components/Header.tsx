import React, { useState, useEffect } from 'react';
import { TRADING_QUOTES } from '../constants';

const Header: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setQuoteIndex((prevIndex) => (prevIndex + 1) % TRADING_QUOTES.length);
        setIsFading(false);
      }, 500); // Fade out duration
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="text-center w-full">
      <h1 className="text-5xl font-bold tracking-wider text-white">DHAQAALE</h1>
      <p className="text-sm font-light text-white/80 tracking-[0.2em] mt-1">CURRENCY TRADING CALCULATOR</p>
      <p className="text-sm font-medium text-white/90 mt-4">#JJ | MΛΛJID🍂</p>
      <div className="h-8 mt-6">
        <p className={`text-base text-[#a1a1a1] transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          "{TRADING_QUOTES[quoteIndex]}"
        </p>
      </div>
    </header>
  );
};

export default Header;