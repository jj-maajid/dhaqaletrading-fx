import React, { useState, useEffect, useCallback } from 'react';
import type { CalculationResult } from '../types';

interface CalculatorFormProps {
  onCalculate: (results: CalculationResult) => void;
  isCalculating: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, isCalculating }) => {
  const [accountBalance, setAccountBalance] = useState('');
  const [riskPercent, setRiskPercent] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetRR, setTargetRR] = useState('');
  const [riskInputMode, setRiskInputMode] = useState<'percent' | 'amount'>('percent');

  const parseNumber = (str: string) => parseFloat(str.replace(/,/g, '')) || 0;

  useEffect(() => {
    const balance = parseNumber(accountBalance);
    if (balance > 0) {
      if (riskInputMode === 'percent') {
        if (riskPercent) {
            const percent = parseNumber(riskPercent);
            const amount = (balance * (percent / 100)).toFixed(2);
            setRiskAmount(amount);
        } else {
            setRiskAmount('');
        }
      } else { // riskInputMode === 'amount'
        if (riskAmount) {
            const amount = parseNumber(riskAmount);
            const percentValue = (amount / balance) * 100;
            if (isFinite(percentValue) && percentValue >= 0) {
              setRiskPercent(percentValue.toFixed(2));
            } else {
              setRiskPercent('');
            }
        } else {
            setRiskPercent('');
        }
      }
    } else {
        // When balance is cleared, the calculated risk amount is no longer valid.
        setRiskAmount('');
        if (riskInputMode === 'amount') {
            setRiskPercent('');
        }
    }
  }, [accountBalance, riskPercent, riskAmount, riskInputMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const balance = parseNumber(accountBalance);
    const finalRiskAmount = parseNumber(riskAmount);
    const sl = parseNumber(stopLoss);
    
    const rrString = targetRR.trim();
    let rrRatio = 0;
    if (rrString.includes(':')) {
        const rrParts = rrString.split(':').map(parseNumber);
        if (rrParts.length === 2 && rrParts[0] !== 0) {
            rrRatio = rrParts[1] / rrParts[0];
        }
    } else if (rrString) {
        const singleNumber = parseNumber(rrString);
        if (singleNumber > 0) {
            rrRatio = singleNumber; // Interpret as 1:N
        }
    }
    
    if (balance > 0 && finalRiskAmount > 0 && sl > 0) {
      const lotSize = finalRiskAmount / (sl * 10);
      const pipValue = lotSize * 10;
      const targetProfit = finalRiskAmount * rrRatio;

      onCalculate({
        lotSize,
        pipValue,
        riskAmount: finalRiskAmount,
        targetProfit,
        accountBalance: balance,
      });
    }
  };

  const handleAccountBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    
    // Regex to allow numbers with up to one decimal point and up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;

    if (value === '' || regex.test(value)) {
      setAccountBalance(value);
    }
  };
  
  const getFormattedBalance = () => {
    if (accountBalance === '') return '';
    if (accountBalance === '.') return '0.';

    const [integerPart, decimalPart] = accountBalance.split('.');
    
    // Format the integer part with commas
    const formattedInteger = new Intl.NumberFormat('en-US').format(
        BigInt(integerPart || '0')
    );

    // If there's a decimal part (even if empty, like "123."), append it
    if (decimalPart !== undefined) {
        return `${formattedInteger}.${decimalPart}`;
    }

    return formattedInteger;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="accountBalance" className="block text-sm font-medium text-white/90 mb-2">Account Balance ($)</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a1a1a1]">$</span>
          <input
            id="accountBalance"
            type="text"
            value={getFormattedBalance()}
            onChange={handleAccountBalanceChange}
            placeholder="10,000.00"
            className="w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl placeholder:text-slate-400 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="riskPercent" className="block text-sm font-medium text-white/90 mb-2">Risk (%)</label>
            <input
              id="riskPercent"
              type="number"
              step="0.01"
              value={riskPercent}
              onFocus={() => setRiskInputMode('percent')}
              onChange={(e) => { setRiskPercent(e.target.value); setRiskInputMode('percent'); }}
              placeholder="1%"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl placeholder:text-slate-400 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition duration-200"
            />
        </div>
        <div>
          <label htmlFor="riskAmount" className="block text-sm font-medium text-white/90 mb-2">Risk Amount ($)</label>
           <div className="relative">
             <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a1a1a1]">$</span>
            <input
              id="riskAmount"
              type="number"
              step="0.01"
              value={riskAmount}
              onFocus={() => setRiskInputMode('amount')}
              onChange={(e) => { setRiskAmount(e.target.value); setRiskInputMode('amount'); }}
              placeholder="100"
              className="w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl placeholder:text-slate-400 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition duration-200"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="stopLoss" className="block text-sm font-medium text-white/90 mb-2">Stop Loss (Pips)</label>
        <input
          id="stopLoss"
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          placeholder="25 pips"
          className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl placeholder:text-slate-400 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition duration-200"
        />
      </div>

      <div>
        <label htmlFor="targetRR" className="block text-sm font-medium text-white/90 mb-2">Target R:R</label>
        <input
          id="targetRR"
          type="text"
          value={targetRR}
          onChange={(e) => setTargetRR(e.target.value)}
          placeholder="1:2RR"
          className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl placeholder:text-slate-400 focus:placeholder:text-transparent focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 active:scale-[0.98] transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? 'Calculating...' : 'Calculate'}
      </button>
    </form>
  );
};

export default CalculatorForm;