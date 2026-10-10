export type CheckType = 'pre-trade' | 'urgency' | 'in-trade' | 'post-trade';

export type Screen = 'home' | 'pre-trade' | 'urgency' | 'in-trade' | 'post-trade' | 'result' | 'pause' | 'history' | 'settings';

export interface TradeDetails {
  symbol: string;
  direction: 'long' | 'short' | '';
  timeframe: string;
  setup: string;
  entryReason: string;
  entry: string;
  stopLoss: string;
  target: string;
  positionSize: string;
  riskAmount: string;
}

export interface ChecklistAnswers {
  inPlan: boolean;
  exitDefined: boolean;
  riskCalculated: boolean;
  willingToLose: boolean;
  setupRepeatable: boolean;
  wouldTakeIfFlat: boolean;
  followingRule: boolean;
  thesis: string;
  preMortem: string;
  regretTest: boolean;
}

export interface EmotionalScores {
  urgency: number;
  fomo: number;
  revenge: number;
  fear: number;
  greed: number;
  boredom: number;
  overconfidence: number;
  mustEnterNow: number;
  chasingPrice: number;
  thinkingProfit: number;
}

export interface RedFlag {
  name: string;
  message: string;
}

export interface CheckResult {
  id: string;
  timestamp: string;
  checkType: CheckType;
  tradeDetails?: TradeDetails;
  checklistScore: number;
  emotionalScore: number;
  result: 'proceed' | 'caution' | 'pause' | 'stop';
  redFlags: string[];
  notes: string;
  recommendation: string;
}

export interface UrgencyCheckResult {
  id: string;
  timestamp: string;
  checkType: 'urgency';
  angry: boolean;
  winBack: boolean;
  chasing: boolean;
  bored: boolean;
  scared: boolean;
  emotionalScore: number;
  result: 'proceed' | 'caution' | 'pause' | 'stop';
  recommendation: string;
}

export interface InTradeCheckResult {
  id: string;
  timestamp: string;
  checkType: 'in-trade';
  symbol: string;
  reasonChanged: boolean;
  movingStop: boolean;
  addingPain: boolean;
  closingFear: boolean;
  emotionalScore: number;
  result: 'proceed' | 'caution' | 'pause' | 'stop';
  recommendation: string;
}

export interface PostTradeResult {
  id: string;
  timestamp: string;
  checkType: 'post-trade';
  symbol: string;
  followedPlan: boolean;
  entryPlanned: boolean;
  riskDefined: boolean;
  movedStop: boolean;
  revengeTrade: boolean;
  resultGood: boolean | null;
  processGood: boolean | null;
  label: string;
  notes: string;
}

export interface AppSettings {
  pauseDuration: number;
  dailyMaxTrades: number;
  riskLimit: number;
  theme: 'dark' | 'light';
}

export type CheckRecord = CheckResult | UrgencyCheckResult | InTradeCheckResult | PostTradeResult;
