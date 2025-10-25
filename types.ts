import React from 'react';

export interface CalculationInput {
  accountBalance: number;
  riskPercent: number;
  riskAmount: number;
  stopLoss: number;
  targetRR: string;
}

export interface CalculationResult {
  lotSize: number;
  pipValue: number;
  riskAmount: number;
  targetProfit: number;
  accountBalance: number;
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
}
