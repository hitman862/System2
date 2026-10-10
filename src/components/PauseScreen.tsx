import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import { getSettings } from '../utils/storage';

interface PauseScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function PauseScreen({ onNavigate }: PauseScreenProps) {
  const settings = getSettings();
  const [timeLeft, setTimeLeft] = useState(settings.pauseDuration * 60);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [completed, setCompleted] = useState(false);
  const [feelingCalmer, setFeelingCalmer] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCompleted(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);

    return () => clearInterval(breathInterval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const quotes = [
    "The market will still be there after five minutes.",
    "Your discipline matters more than your impulse.",
    "Do not trade to feel something.",
    "System 1 wants speed. System 2 wants clarity.",
    "Missed trades are less expensive than emotional trades.",
    "The best trade is often no trade.",
    "Patience is a position.",
    "You are not missing out. You are protecting yourself."
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {completed ? 'Timer Complete' : 'Pause Required'}
        </h2>
        <p className="text-slate-400 text-sm">
          {completed ? 'Check in with yourself.' : 'Do not trade during this time.'}
        </p>
      </div>

      {/* Timer Circle */}
      {!completed ? (
        <div className="relative mb-8">
          {/* Breathing Circle */}
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
            breathPhase === 'inhale' ? 'scale-110 bg-blue-900/40 border-2 border-blue-400/60' :
            breathPhase === 'hold' ? 'scale-110 bg-blue-900/40 border-2 border-blue-400/40' :
            'scale-90 bg-blue-900/20 border-2 border-blue-400/30'
          }`}>
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-white">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
              <p className="text-blue-300 text-sm mt-1 capitalize">{breathPhase}</p>
            </div>
          </div>
          
          {/* Breathing Guide */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <p className="text-blue-400 text-xs animate-pulse">
              {breathPhase === 'inhale' ? 'Breathe in...' : breathPhase === 'hold' ? 'Hold...' : 'Breathe out...'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 text-center">
          <div className="w-32 h-32 rounded-full bg-emerald-900/30 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">✓</span>
          </div>
        </div>
      )}

      {/* Quote */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8 max-w-md text-center">
        <p className="text-slate-300 text-sm italic leading-relaxed">
          "{quotes[currentQuote]}"
        </p>
      </div>

      {/* After Timer */}
      {completed && (
        <div className="w-full max-w-md space-y-3">
          <p className="text-slate-400 text-sm text-center mb-4">
            How do you feel now?
          </p>
          <button
            onClick={() => {
              setFeelingCalmer(true);
            }}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              feelingCalmer
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
            }`}
          >
            🧘 I feel calmer
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3 rounded-xl font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            😤 I still feel urgent
          </button>

          {feelingCalmer && (
            <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4 mt-4">
              <p className="text-emerald-300 text-sm text-center">
                Good. Now run a full Pre-Trade Check with a clear mind. If the setup is still valid, it will pass System 2.
              </p>
              <button
                onClick={() => onNavigate('pre-trade')}
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Run Pre-Trade Check
              </button>
            </div>
          )}

          {!feelingCalmer && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 mt-4">
              <p className="text-red-300 text-sm text-center">
                If you still feel urgent after a full pause, this is a strong signal to NOT trade. Walk away from the screen.
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
          )}
        </div>
      )}

      {/* Skip Timer (only if not completed) */}
      {!completed && (
        <button
          onClick={() => {
            setTimeLeft(0);
            setCompleted(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }}
          className="text-slate-600 text-xs hover:text-slate-400 transition-colors mt-4"
        >
          Skip timer (not recommended)
        </button>
      )}
    </div>
  );
}
