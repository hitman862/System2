import React from 'react';
import { CheckResult, Screen } from '../types';

interface ResultScreenProps {
  result: CheckResult | null;
  onNavigate: (screen: Screen) => void;
  onPause: () => void;
}

export default function ResultScreen({ result, onNavigate, onPause }: ResultScreenProps) {
  if (!result) return null;

  const resultConfig = {
    proceed: {
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-600',
      text: 'text-emerald-300',
      icon: '✅',
      title: 'Cleared for Review',
      subtitle: 'Your trade idea appears structured.'
    },
    caution: {
      bg: 'bg-amber-900/30',
      border: 'border-amber-600',
      text: 'text-amber-300',
      icon: '⚠️',
      title: 'Proceed with Caution',
      subtitle: 'Some factors need attention.'
    },
    pause: {
      bg: 'bg-orange-900/30',
      border: 'border-orange-600',
      text: 'text-orange-300',
      icon: '⏸️',
      title: 'Pause Required',
      subtitle: 'Emotional pressure detected.'
    },
    stop: {
      bg: 'bg-red-900/30',
      border: 'border-red-600',
      text: 'text-red-300',
      icon: '🛑',
      title: 'Do Not Trade',
      subtitle: 'System 1 is likely driving.'
    }
  };

  const config = resultConfig[result.result];

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ← Home
        </button>
        <h2 className="text-xl font-bold text-white">System 2 Result</h2>
      </div>

      {/* Main Result Card */}
      <div className={`${config.bg} border ${config.border} rounded-2xl p-6 mb-6 text-center`}>
        <span className="text-5xl block mb-3">{config.icon}</span>
        <h3 className={`text-2xl font-bold ${config.text} mb-1`}>{config.title}</h3>
        <p className="text-slate-400 text-sm">{config.subtitle}</p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Emotional Score</p>
          <p className={`text-3xl font-bold ${
            result.emotionalScore <= 20 ? 'text-emerald-400' :
            result.emotionalScore <= 32 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {result.emotionalScore}
          </p>
          <p className="text-slate-500 text-xs mt-1">/ 50</p>
          <p className={`text-xs mt-1 ${
            result.emotionalScore <= 20 ? 'text-emerald-500' :
            result.emotionalScore <= 32 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {result.emotionalScore <= 20 ? 'Low Risk' : result.emotionalScore <= 32 ? 'Moderate' : 'High Risk'}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Plan Score</p>
          <p className={`text-3xl font-bold ${
            result.checklistScore >= 8 ? 'text-emerald-400' :
            result.checklistScore >= 5 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {result.checklistScore}
          </p>
          <p className="text-slate-500 text-xs mt-1">/ 8</p>
          <p className={`text-xs mt-1 ${
            result.checklistScore >= 8 ? 'text-emerald-500' :
            result.checklistScore >= 5 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {result.checklistScore >= 8 ? 'Strong' : result.checklistScore >= 5 ? 'Needs Review' : 'Weak'}
          </p>
        </div>
      </div>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 mb-6">
          <h4 className="text-red-300 font-semibold text-sm mb-2">🚩 Red Flags Detected</h4>
          <ul className="space-y-2">
            {result.redFlags.map((flag, idx) => (
              <li key={idx} className="text-red-200/80 text-sm flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>{flag.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
        <h4 className="text-white font-semibold mb-2">💡 Recommendation</h4>
        <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
      </div>

      {/* Trade Summary */}
      {result.tradeDetails && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
          <h4 className="text-white font-semibold mb-3">📋 Trade Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {result.tradeDetails.symbol && (
              <div><span className="text-slate-500">Symbol:</span> <span className="text-white">{result.tradeDetails.symbol}</span></div>
            )}
            {result.tradeDetails.direction && (
              <div><span className="text-slate-500">Direction:</span> <span className={`font-medium ${result.tradeDetails.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{result.tradeDetails.direction.toUpperCase()}</span></div>
            )}
            {result.tradeDetails.setup && (
              <div><span className="text-slate-500">Setup:</span> <span className="text-white">{result.tradeDetails.setup}</span></div>
            )}
            {result.tradeDetails.timeframe && (
              <div><span className="text-slate-500">Timeframe:</span> <span className="text-white">{result.tradeDetails.timeframe}</span></div>
            )}
            {result.tradeDetails.entry && (
              <div><span className="text-slate-500">Entry:</span> <span className="text-white">{result.tradeDetails.entry}</span></div>
            )}
            {result.tradeDetails.stopLoss && (
              <div><span className="text-slate-500">Stop:</span> <span className="text-white">{result.tradeDetails.stopLoss}</span></div>
            )}
            {result.tradeDetails.target && (
              <div><span className="text-slate-500">Target:</span> <span className="text-white">{result.tradeDetails.target}</span></div>
            )}
            {result.tradeDetails.riskAmount && (
              <div><span className="text-slate-500">Risk:</span> <span className="text-white">${result.tradeDetails.riskAmount}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {(result.result === 'pause' || result.result === 'stop') && (
          <button
            onClick={onPause}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>🫁</span>
            <span>Start Pause Timer</span>
          </button>
        )}
        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl border border-slate-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
