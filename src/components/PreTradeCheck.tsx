import React, { useState } from 'react';
import { TradeDetails, ChecklistAnswers, EmotionalScores, CheckResult, RedFlag, Screen } from '../types';
import { calculateEmotionalScore, calculateChecklistScore, detectRedFlags, generateRecommendation } from '../utils/scoring';
import { saveCheck, generateId } from '../utils/storage';

interface PreTradeCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: CheckResult) => void;
}

const defaultTradeDetails: TradeDetails = {
  symbol: '',
  direction: '',
  timeframe: '',
  setup: '',
  entryReason: '',
  entry: '',
  stopLoss: '',
  target: '',
  positionSize: '',
  riskAmount: ''
};

const defaultChecklist: ChecklistAnswers = {
  inPlan: false,
  exitDefined: false,
  riskCalculated: false,
  willingToLose: false,
  setupRepeatable: false,
  wouldTakeIfFlat: false,
  followingRule: false,
  thesis: '',
  preMortem: '',
  regretTest: false
};

const defaultEmotions: EmotionalScores = {
  urgency: 1,
  fomo: 1,
  revenge: 1,
  fear: 1,
  greed: 1,
  boredom: 1,
  overconfidence: 1,
  mustEnterNow: 1,
  chasingPrice: 1,
  thinkingProfit: 1
};

export default function PreTradeCheck({ onNavigate, onResult }: PreTradeCheckProps) {
  const [step, setStep] = useState<'details' | 'checklist' | 'emotions'>('details');
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>(defaultTradeDetails);
  const [checklist, setChecklist] = useState<ChecklistAnswers>(defaultChecklist);
  const [emotions, setEmotions] = useState<EmotionalScores>(defaultEmotions);

  const handleDetailsSubmit = () => {
    setStep('checklist');
  };

  const handleChecklistSubmit = () => {
    setStep('emotions');
  };

  const handleEmotionsSubmit = () => {
    const emotionalScore = calculateEmotionalScore(emotions);
    const checklistScore = calculateChecklistScore(checklist);
    const redFlags = detectRedFlags(emotions, checklist, {
      stopLoss: tradeDetails.stopLoss,
      riskAmount: tradeDetails.riskAmount,
      inPlan: checklist.inPlan
    });
    const recommendation = generateRecommendation(emotionalScore, checklistScore, redFlags);

    const result: CheckResult = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      checkType: 'pre-trade',
      tradeDetails,
      checklistScore,
      emotionalScore,
      result: recommendation.result,
      redFlags: redFlags.map(f => f.name),
      notes: `Thesis: ${checklist.thesis || 'Not provided'}`,
      recommendation: recommendation.message
    };

    saveCheck(result);
    onResult(result);
  };

  const emotionLabels: { key: keyof EmotionalScores; label: string; emoji: string }[] = [
    { key: 'urgency', label: 'I feel I must enter NOW', emoji: '⏰' },
    { key: 'fomo', label: 'I am afraid of missing out', emoji: '😰' },
    { key: 'revenge', label: 'I want to recover a previous loss', emoji: '😤' },
    { key: 'fear', label: 'I feel anxious', emoji: '😨' },
    { key: 'greed', label: 'I want to increase size because I feel certain', emoji: '💰' },
    { key: 'boredom', label: 'I am bored and want action', emoji: '😑' },
    { key: 'overconfidence', label: 'I feel overconfident', emoji: '🦸' },
    { key: 'mustEnterNow', label: 'My body feels tense or rushed', emoji: '💓' },
    { key: 'chasingPrice', label: 'I am ignoring my usual rules', emoji: '🏃' },
    { key: 'thinkingProfit', label: 'I am thinking about profit more than risk', emoji: '🤑' },
  ];

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step === 'details' ? onNavigate('home') : setStep(step === 'emotions' ? 'checklist' : 'details')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Pre-Trade Check</h2>
          <p className="text-slate-400 text-sm">Step {step === 'details' ? '1' : step === 'checklist' ? '2' : '3'} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: step === 'details' ? '33%' : step === 'checklist' ? '66%' : '100%' }}
        />
      </div>

      {/* Step 1: Trade Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Trade Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Symbol</label>
                <input
                  type="text"
                  value={tradeDetails.symbol}
                  onChange={e => setTradeDetails({ ...tradeDetails, symbol: e.target.value })}
                  placeholder="e.g. BTCUSD"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Direction</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTradeDetails({ ...tradeDetails, direction: 'long' })}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      tradeDetails.direction === 'long'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    Long ↑
                  </button>
                  <button
                    onClick={() => setTradeDetails({ ...tradeDetails, direction: 'short' })}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      tradeDetails.direction === 'short'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    Short ↓
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Timeframe</label>
                <input
                  type="text"
                  value={tradeDetails.timeframe}
                  onChange={e => setTradeDetails({ ...tradeDetails, timeframe: e.target.value })}
                  placeholder="e.g. 1H, 4H, Daily"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Setup Name</label>
                <input
                  type="text"
                  value={tradeDetails.setup}
                  onChange={e => setTradeDetails({ ...tradeDetails, setup: e.target.value })}
                  placeholder="e.g. Breakout retest"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-slate-400 text-sm block mb-1">Entry Reason</label>
              <textarea
                value={tradeDetails.entryReason}
                onChange={e => setTradeDetails({ ...tradeDetails, entryReason: e.target.value })}
                placeholder="Why this trade? What conditions must be met?"
                rows={2}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Entry Price</label>
                <input
                  type="text"
                  value={tradeDetails.entry}
                  onChange={e => setTradeDetails({ ...tradeDetails, entry: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Position Size</label>
                <input
                  type="text"
                  value={tradeDetails.positionSize}
                  onChange={e => setTradeDetails({ ...tradeDetails, positionSize: e.target.value })}
                  placeholder="e.g. 0.5 lots"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Stop Loss</label>
                <input
                  type="text"
                  value={tradeDetails.stopLoss}
                  onChange={e => setTradeDetails({ ...tradeDetails, stopLoss: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Target</label>
                <input
                  type="text"
                  value={tradeDetails.target}
                  onChange={e => setTradeDetails({ ...tradeDetails, target: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-slate-400 text-sm block mb-1">Max Loss Amount ($)</label>
              <input
                type="text"
                value={tradeDetails.riskAmount}
                onChange={e => setTradeDetails({ ...tradeDetails, riskAmount: e.target.value })}
                placeholder="e.g. 200"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleDetailsSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continue to System 2 Checklist →
          </button>
        </div>
      )}

      {/* Step 2: System 2 Checklist */}
      {step === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">System 2 Checklist</h3>
            <p className="text-slate-400 text-sm mb-4">Answer each question honestly. This is for you, not for anyone else.</p>
            
            <div className="space-y-3">
              {[
                { key: 'inPlan' as const, label: 'Is this trade in my trading plan?' },
                { key: 'exitDefined' as const, label: 'Do I know exactly where I will exit if wrong?' },
                { key: 'riskCalculated' as const, label: 'Have I calculated my risk?' },
                { key: 'willingToLose' as const, label: 'Am I willing to lose this amount?' },
                { key: 'setupRepeatable' as const, label: 'Is this setup repeatable?' },
                { key: 'wouldTakeIfFlat' as const, label: 'Would I take this trade if I had already missed the move?' },
                { key: 'followingRule' as const, label: 'Am I reacting to price or following a rule?' },
                { key: 'regretTest' as const, label: 'If I miss this trade, will I be okay?' },
              ].map(item => (
                <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={e => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-200 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Written Thesis</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">
                  I am entering this trade because...
                </label>
                <textarea
                  value={checklist.thesis}
                  onChange={e => setChecklist({ ...checklist, thesis: e.target.value })}
                  placeholder="Be specific. Vague answers are a System 1 warning sign."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
                {checklist.thesis.length > 0 && checklist.thesis.length < 20 && (
                  <p className="text-amber-400 text-xs mt-1">⚠️ Thesis seems short. System 2 needs more precision.</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-1">
                  Pre-Mortem: If this trade loses, what will be the most likely reason?
                </label>
                <textarea
                  value={checklist.preMortem}
                  onChange={e => setChecklist({ ...checklist, preMortem: e.target.value })}
                  placeholder="Think about what could go wrong..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('details')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl border border-slate-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleChecklistSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continue to Emotions →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Emotional Temperature */}
      {step === 'emotions' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-2">Emotional Temperature</h3>
            <p className="text-slate-400 text-sm mb-4">Rate how strongly you feel each statement right now (1 = not at all, 5 = extremely)</p>
            
            <div className="space-y-4">
              {emotionLabels.map(item => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 text-sm flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </label>
                    <span className={`text-sm font-bold ${
                      emotions[item.key] <= 2 ? 'text-emerald-400' :
                      emotions[item.key] <= 3 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {emotions[item.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={emotions[item.key]}
                    onChange={e => setEmotions({ ...emotions, [item.key]: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Not at all</span>
                    <span>Extremely</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('checklist')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl border border-slate-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleEmotionsSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Get System 2 Check ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
