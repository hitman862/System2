import React, { useState } from 'react';
import { Screen, CheckResult, UrgencyCheckResult, InTradeCheckResult, PostTradeResult } from './types';
import Home from './components/Home';
import PreTradeCheck from './components/PreTradeCheck';
import UrgencyCheck from './components/UrgencyCheck';
import InTradeCheck from './components/InTradeCheck';
import PostTradeReview from './components/PostTradeReview';
import ResultScreen from './components/ResultScreen';
import PauseScreen from './components/PauseScreen';
import History from './components/History';
import Settings from './components/Settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentResult, setCurrentResult] = useState<CheckResult | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handlePreTradeResult = (result: CheckResult) => {
    setCurrentResult(result);
    setCurrentScreen('result');
  };

  const handleUrgencyResult = (result: UrgencyCheckResult) => {
    // Convert urgency result to CheckResult format for ResultScreen
    const checkResult: CheckResult = {
      id: result.id,
      timestamp: result.timestamp,
      checkType: 'urgency',
      checklistScore: 0,
      emotionalScore: result.emotionalScore,
      result: result.result,
      redFlags: [],
      notes: `Angry: ${result.angry}, Win back: ${result.winBack}, Chasing: ${result.chasing}, Bored: ${result.bored}, Scared: ${result.scared}`,
      recommendation: result.recommendation
    };
    setCurrentResult(checkResult);
    setCurrentScreen('result');
  };

  const handleInTradeResult = (result: InTradeCheckResult) => {
    const checkResult: CheckResult = {
      id: result.id,
      timestamp: result.timestamp,
      checkType: 'in-trade',
      tradeDetails: {
        symbol: result.symbol,
        direction: '',
        timeframe: '',
        setup: '',
        entryReason: '',
        entry: '',
        stopLoss: '',
        target: '',
        positionSize: '',
        riskAmount: ''
      },
      checklistScore: 0,
      emotionalScore: result.emotionalScore,
      result: result.result,
      redFlags: [],
      notes: `Reason changed: ${result.reasonChanged}, Moving stop: ${result.movingStop}, Adding from pain: ${result.addingPain}, Closing fear: ${result.closingFear}`,
      recommendation: result.recommendation
    };
    setCurrentResult(checkResult);
    setCurrentScreen('result');
  };

  const handlePostTradeResult = (result: PostTradeResult) => {
    const checkResult: CheckResult = {
      id: result.id,
      timestamp: result.timestamp,
      checkType: 'post-trade',
      tradeDetails: {
        symbol: result.symbol,
        direction: '',
        timeframe: '',
        setup: '',
        entryReason: '',
        entry: '',
        stopLoss: '',
        target: '',
        positionSize: '',
        riskAmount: ''
      },
      checklistScore: 0,
      emotionalScore: 0,
      result: result.followedPlan ? 'proceed' : 'caution',
      redFlags: [],
      notes: result.label + (result.notes ? ' | ' + result.notes : ''),
      recommendation: result.label
    };
    setCurrentResult(checkResult);
    setCurrentScreen('result');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'pre-trade':
        return <PreTradeCheck onNavigate={handleNavigate} onResult={handlePreTradeResult} />;
      case 'urgency':
        return <UrgencyCheck onNavigate={handleNavigate} onResult={handleUrgencyResult} />;
      case 'in-trade':
        return <InTradeCheck onNavigate={handleNavigate} onResult={handleInTradeResult} />;
      case 'post-trade':
        return <PostTradeReview onNavigate={handleNavigate} onResult={handlePostTradeResult} />;
      case 'result':
        return <ResultScreen result={currentResult} onNavigate={handleNavigate} onPause={() => handleNavigate('pause')} />;
      case 'pause':
        return <PauseScreen onNavigate={handleNavigate} />;
      case 'history':
        return <History onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {renderScreen()}
    </div>
  );
}

export default App;
