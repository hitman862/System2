import React, { useState } from 'react';
import { PostTradeResult, Screen } from '../types';
import { getPostTradeLabel } from '../utils/scoring';
import { saveCheck, generateId } from '../utils/storage';

interface PostTradeReviewProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: PostTradeResult) => void;
}

export default function PostTradeReview({ onNavigate, onResult }: PostTradeReviewProps) {
  const [symbol, setSymbol] = useState('');
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
  const [entryPlanned, setEntryPlanned] = useState<boolean | null>(null);
  const [riskDefined, setRiskDefined] = useState<boolean | null>(null);
  const [movedStop, setMovedStop] = useState<boolean | null>(null);
  const [revengeTrade, setRevengeTrade] = useState<boolean | null>(null);
  const [resultGood, setResultGood] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const processGood = followedPlan === true && entryPlanned === true && riskDefined === true && movedStop === false && revengeTrade === false;
    const label = getPostTradeLabel(followedPlan === true, resultGood);

    const result: PostTradeResult = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      checkType: 'post-trade',
      symbol,
      followedPlan: followedPlan === true,
      entryPlanned: entryPlanned === true,
      riskDefined: riskDefined === true,
      movedStop: movedStop === true,
      revengeTrade: revengeTrade === true,
      resultGood,
      processGood,
      label,
      notes
    };

    saveCheck(result);
    setSubmitted(true);
    onResult(result);
  };

  if (submitted) return null;

  const BoolQuestion = ({ label, value, setter, emoji }: { label: string; value: boolean | null; setter: (v: boolean | null) => void; emoji: string }) => (
    <div className="space-y-2">
      <p className="text-slate-200 text-sm flex items-center gap-2">
        <span>{emoji}</span>
        <span>{label}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setter(true)}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            value === true
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => setter(false)}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            value === false
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );

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
          <h2 className="text-xl font-bold text-white">Post-Trade Review</h2>
          <p className="text-slate-400 text-sm">Judge the process, not only the profit.</p>
        </div>
      </div>

      <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4 mb-6">
        <p className="text-purple-300 text-sm font-medium">
          📝 The trade is closed. Now let's review what happened — process over outcome.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-4">
        <div className="mb-4">
          <label className="text-slate-400 text-sm block mb-1">Symbol / Trade</label>
          <input
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            placeholder="e.g. BTCUSD long"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Process Questions</h3>
        <div className="space-y-5">
          <BoolQuestion
            label="Did I follow my plan?"
            value={followedPlan}
            setter={setFollowedPlan}
            emoji="📋"
          />
          <BoolQuestion
            label="Was entry planned (not impulsive)?"
            value={entryPlanned}
            setter={setEntryPlanned}
            emoji="🎯"
          />
          <BoolQuestion
            label="Was risk defined before entry?"
            value={riskDefined}
            setter={setRiskDefined}
            emoji="🛡️"
          />
          <BoolQuestion
            label="Did I move my stop loss?"
            value={movedStop}
            setter={setMovedStop}
            emoji="🔄"
          />
          <BoolQuestion
            label="Was this a revenge trade?"
            value={revengeTrade}
            setter={setRevengeTrade}
            emoji="😤"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Outcome</h3>
        <p className="text-slate-400 text-sm mb-3">Was the result profitable?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setResultGood(true)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              resultGood === true
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            ✅ Profitable
          </button>
          <button
            onClick={() => setResultGood(false)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              resultGood === false
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            ❌ Loss
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
        <label className="text-slate-400 text-sm block mb-1">Notes / Lessons</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What did you learn? What would you do differently?"
          rows={3}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
      >
        Complete Review
      </button>

      <p className="text-slate-500 text-xs text-center mt-4 italic">
        "A profitable trade from bad process can become a dangerous habit."
      </p>
    </div>
  );
}
