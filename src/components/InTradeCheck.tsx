import React, { useState } from 'react';
import { InTradeCheckResult, Screen } from '../types';
import { getInTradeRecommendation } from '../utils/scoring';
import { saveCheck, generateId } from '../utils/storage';

interface InTradeCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: InTradeCheckResult) => void;
}

export default function InTradeCheck({ onNavigate, onResult }: InTradeCheckProps) {
  const [symbol, setSymbol] = useState('');
  const [reasonChanged, setReasonChanged] = useState(false);
  const [movingStop, setMovingStop] = useState(false);
  const [addingPain, setAddingPain] = useState(false);
  const [closingFear, setClosingFear] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const emotionalScore = [reasonChanged, movingStop, addingPain, closingFear].filter(Boolean).length * 12;
    const recommendation = getInTradeRecommendation(reasonChanged, movingStop, addingPain, closingFear);

    const result: InTradeCheckResult = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      checkType: 'in-trade',
      symbol,
      reasonChanged,
      movingStop,
      addingPain,
      closingFear,
      emotionalScore,
      result: recommendation.result,
      recommendation: recommendation.message
    };

    saveCheck(result);
    setSubmitted(true);
    onResult(result as any);
  };

  if (submitted) return null;

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">In-Trade Check</h2>
          <p className="text-slate-400 text-sm">You're in a trade. Let's check your management.</p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 mb-6">
        <p className="text-blue-300 text-sm font-medium">
          📊 You are currently in a trade. Answer these questions to check if your decisions are rational.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
        <div className="mb-4">
          <label className="text-slate-400 text-sm block mb-1">Symbol / Trade</label>
          <input
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            placeholder="e.g. BTCUSD long"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Trade Management Check</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setReasonChanged(!reasonChanged)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
              reasonChanged
                ? 'bg-amber-900/30 border-amber-600 text-amber-200'
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">🔄</span>
            <span className="font-medium text-left flex-1">Has the original reason for this trade changed?</span>
            <span className={`text-lg ${reasonChanged ? 'text-white' : 'text-slate-600'}`}>
              {reasonChanged ? '✓' : '○'}
            </span>
          </button>

          <button
            onClick={() => setMovingStop(!movingStop)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
              movingStop
                ? 'bg-red-900/30 border-red-600 text-red-200'
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">🛑</span>
            <span className="font-medium text-left flex-1">Am I moving my stop loss?</span>
            <span className={`text-lg ${movingStop ? 'text-white' : 'text-slate-600'}`}>
              {movingStop ? '✓' : '○'}
            </span>
          </button>

          <button
            onClick={() => setAddingPain(!addingPain)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
              addingPain
                ? 'bg-red-900/30 border-red-600 text-red-200'
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">📈</span>
            <span className="font-medium text-left flex-1">Am I adding because of analysis or pain?</span>
            <span className={`text-lg ${addingPain ? 'text-white' : 'text-slate-600'}`}>
              {addingPain ? '✓' : '○'}
            </span>
          </button>

          <button
            onClick={() => setClosingFear(!closingFear)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
              closingFear
                ? 'bg-amber-900/30 border-amber-600 text-amber-200'
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">😰</span>
            <span className="font-medium text-left flex-1">Am I closing early out of fear?</span>
            <span className={`text-lg ${closingFear ? 'text-white' : 'text-slate-600'}`}>
              {closingFear ? '✓' : '○'}
            </span>
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
      >
        Get Assessment
      </button>

      <p className="text-slate-500 text-xs text-center mt-4 italic">
        "Do not make decisions while emotionally flooded."
      </p>
    </div>
  );
}
