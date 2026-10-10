import React, { useState } from 'react';
import { UrgencyCheckResult, Screen } from '../types';
import { getUrgencyRecommendation } from '../utils/scoring';
import { saveCheck, generateId } from '../utils/storage';

interface UrgencyCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: UrgencyCheckResult) => void;
}

export default function UrgencyCheck({ onNavigate, onResult }: UrgencyCheckProps) {
  const [angry, setAngry] = useState(false);
  const [winBack, setWinBack] = useState(false);
  const [chasing, setChasing] = useState(false);
  const [bored, setBored] = useState(false);
  const [scared, setScared] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const emotionalScore = [angry, winBack, chasing, bored, scared].filter(Boolean).length * 10;
    const recommendation = getUrgencyRecommendation(angry, winBack, chasing, bored, scared);

    const result: UrgencyCheckResult = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      checkType: 'urgency',
      angry,
      winBack,
      chasing,
      bored,
      scared,
      emotionalScore,
      result: recommendation.result,
      recommendation: recommendation.message
    };

    saveCheck(result);
    setSubmitted(true);
    onResult(result as any);
  };

  if (submitted) return null;

  const questions = [
    { label: 'Am I angry?', value: angry, setter: setAngry, emoji: '😤', color: 'red' },
    { label: 'Am I trying to win back money?', value: winBack, setter: setWinBack, emoji: '💸', color: 'red' },
    { label: 'Am I chasing price?', value: chasing, setter: setChasing, emoji: '🏃', color: 'amber' },
    { label: 'Am I bored?', value: bored, setter: setBored, emoji: '😑', color: 'amber' },
    { label: 'Am I scared?', value: scared, setter: setScared, emoji: '😨', color: 'amber' },
  ];

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
          <h2 className="text-xl font-bold text-white">Emotional Urgency Check</h2>
          <p className="text-slate-400 text-sm">Pause. Breathe. Answer honestly.</p>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6">
        <p className="text-amber-300 text-sm font-medium">
          ⚡ You feel an urgent need to trade. Before you act, answer these questions.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Self-Assessment</h3>
        
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => q.setter(!q.value)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                q.value
                  ? q.color === 'red'
                    ? 'bg-red-900/30 border-red-600 text-red-200'
                    : 'bg-amber-900/30 border-amber-600 text-amber-200'
                  : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{q.emoji}</span>
              <span className="font-medium text-left flex-1">{q.label}</span>
              <span className={`text-lg ${q.value ? 'text-white' : 'text-slate-600'}`}>
                {q.value ? '✓' : '○'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
      >
        Get Assessment
      </button>

      <p className="text-slate-500 text-xs text-center mt-4 italic">
        "Missed trades are less expensive than emotional trades."
      </p>
    </div>
  );
}
