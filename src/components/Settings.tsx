import React, { useState, useEffect } from 'react';
import { AppSettings, Screen } from '../types';
import { getSettings, saveSettings } from '../utils/storage';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Pause Duration */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">⏱️ Pause Duration</h3>
          <p className="text-slate-400 text-sm mb-3">How long should the mandatory pause last?</p>
          <div className="flex gap-2">
            {[3, 5, 10, 15].map(min => (
              <button
                key={min}
                onClick={() => setSettings({ ...settings, pauseDuration: min })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  settings.pauseDuration === min
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Daily Max Trades */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">📊 Daily Max Trades</h3>
          <p className="text-slate-400 text-sm mb-3">Maximum number of trades per day (for reference)</p>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 10].map(num => (
              <button
                key={num}
                onClick={() => setSettings({ ...settings, dailyMaxTrades: num })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  settings.dailyMaxTrades === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Limit */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">🛡️ Risk Limit (% per trade)</h3>
          <p className="text-slate-400 text-sm mb-3">Maximum risk as percentage of account</p>
          <div className="flex gap-2">
            {[0.5, 1, 2, 3, 5].map(pct => (
              <button
                key={pct}
                onClick={() => setSettings({ ...settings, riskLimit: pct })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  settings.riskLimit === pct
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">ℹ️ About</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">System 2 Trading Self-Check</strong> is a tool designed to help traders
              interrupt emotional impulses and activate analytical thinking before making trading decisions.
            </p>
            <p>
              Based on Daniel Kahneman's "Thinking, Fast and Slow" — System 1 is fast and emotional,
              System 2 is slow and deliberate. This app helps you engage System 2.
            </p>
            <p className="text-slate-500 text-xs mt-3">
              All data is stored locally in your browser. No data is sent to any server.
            </p>
          </div>
        </div>

        {/* Key Principles */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">🧠 Key Principles</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Judge process over outcome</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Never trade without a defined stop loss</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Pause before acting on urgency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>A missed trade costs nothing; an emotional trade costs everything</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>My goal is not to trade often, but to trade correctly</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full mt-6 font-semibold py-3 rounded-xl transition-all duration-200 ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
