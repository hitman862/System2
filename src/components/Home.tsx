import React from 'react';
import { Screen } from '../types';
import { getTodayChecks, getStats } from '../utils/storage';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const todayCount = getTodayChecks().length;
  const stats = getStats();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">System 2 Trading Self-Check</h1>
          <p className="text-slate-400 text-lg">Slow down before you trade.</p>
          <p className="text-slate-500 text-sm mt-2 italic">"My goal is not to trade often. My goal is to trade correctly."</p>
        </div>

        {/* Today's Stats */}
        {todayCount > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
            <p className="text-slate-400 text-sm">Today's checks: <span className="text-white font-semibold">{todayCount}</span></p>
            {stats.pausedTrades > 0 && (
              <p className="text-amber-400 text-xs mt-1">⏸ {stats.pausedTrades} trades paused total</p>
            )}
          </div>
        )}

        {/* Main Actions */}
        <div className="space-y-3">
          <button
            onClick={() => onNavigate('pre-trade')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3"
          >
            <span className="text-xl">📋</span>
            <span>Pre-Trade Check</span>
          </button>

          <button
            onClick={() => onNavigate('urgency')}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3"
          >
            <span className="text-xl">⚡</span>
            <span>I Feel an Urgent Trade</span>
          </button>

          <button
            onClick={() => onNavigate('in-trade')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
          >
            <span className="text-xl">📊</span>
            <span>I Am in a Trade</span>
          </button>

          <button
            onClick={() => onNavigate('post-trade')}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/20 flex items-center justify-center gap-3"
          >
            <span className="text-xl">📝</span>
            <span>Post-Trade Review</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-slate-700 flex items-center justify-center gap-2"
          >
            <span>📜</span>
            <span>History</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-slate-700 flex items-center justify-center gap-2"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>

        {/* Footer Quote */}
        <div className="mt-8 text-slate-600 text-xs">
          <p>System 1 wants speed. System 2 wants clarity.</p>
        </div>
      </div>
    </div>
  );
}
