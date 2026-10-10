import { CheckRecord, AppSettings } from '../types';

const STORAGE_KEY = 's2-trading-checks';
const SETTINGS_KEY = 's2-trading-settings';

export function saveCheck(record: CheckRecord): void {
  const records = getAllChecks();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getAllChecks(): CheckRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteCheck(id: string): void {
  const records = getAllChecks().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearAllChecks(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportChecks(): string {
  const records = getAllChecks();
  return JSON.stringify(records, null, 2);
}

export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      pauseDuration: 5,
      dailyMaxTrades: 3,
      riskLimit: 2,
      theme: 'dark'
    };
  } catch {
    return {
      pauseDuration: 5,
      dailyMaxTrades: 3,
      riskLimit: 2,
      theme: 'dark'
    };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTodayChecks(): CheckRecord[] {
  const today = new Date().toDateString();
  return getAllChecks().filter(r => new Date(r.timestamp).toDateString() === today);
}

export function getStats() {
  const records = getAllChecks();
  const total = records.length;
  
  const preTradeChecks = records.filter(r => r.checkType === 'pre-trade');
  const urgencyChecks = records.filter(r => r.checkType === 'urgency');
  
  const avgEmotional = preTradeChecks.length > 0
    ? preTradeChecks.reduce((sum, r) => sum + (r as any).emotionalScore, 0) / preTradeChecks.length
    : 0;

  const pausedTrades = records.filter(r => 'result' in r && (r.result === 'pause' || r.result === 'stop')).length;
  
  const redFlagCount = records.reduce((sum, r) => {
    if ('redFlags' in r) return sum + (r as any).redFlags.length;
    return sum;
  }, 0);

  return {
    total,
    avgEmotional: Math.round(avgEmotional),
    pausedTrades,
    redFlagCount,
    preTradeChecks: preTradeChecks.length,
    urgencyChecks: urgencyChecks.length
  };
}
