# System 2 Trading Self-Check - Quick Integration Reference

## Copy-Paste Integration Examples

### 1. Add Navigation Button (React)
```jsx
import { useNavigate } from 'react-router-dom';

function TradingDashboard() {
  const navigate = useNavigate();
  
  return (
    <div>
      {/* Your existing trading UI */}
      
      {/* Add System 2 Check Button */}
      <button 
        onClick={() => navigate('/system2-check')}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg"
      >
        🧠 System 2 Check
      </button>
    </div>
  );
}
```

### 2. Force Check Before Trade Execution
```jsx
import { getLatestCheck, hasRecentCheck } from './utils/storage';

function TradeExecutionButton({ tradeData }) {
  const handleClick = () => {
    // Check if user has completed a System 2 check in last 30 minutes
    const hasRecent = hasRecentCheck(30); // 30 minutes
    
    if (!hasRecent) {
      alert('Please complete a System 2 Check before trading.');
      navigate('/system2-check/pre-trade', { state: { tradeData } });
      return;
    }
    
    // Get latest check result
    const latestCheck = getLatestCheck();
    
    if (latestCheck.result === 'stop') {
      alert('⛔ System 2 check failed. Do not trade.');
      return;
    }
    
    if (latestCheck.result === 'pause') {
      alert('⏸️ Pause required. Please wait before trading.');
      return;
    }
    
    if (latestCheck.result === 'caution') {
      const confirmed = confirm('⚠️ Caution: Some emotional pressure detected. Proceed anyway?');
      if (!confirmed) return;
    }
    
    // Execute trade
    executeTrade(tradeData);
  };
  
  return <button onClick={handleClick}>Execute Trade</button>;
}
```

### 3. Pre-Fill Trade Details from Your App
```jsx
// When navigating to System 2 check, pass trade data
const navigateToSystem2Check = (trade) => {
  navigate('/system2-check/pre-trade', {
    state: {
      prefillData: {
        symbol: trade.symbol,
        direction: trade.side, // 'long' or 'short'
        entry: trade.entryPrice,
        stopLoss: trade.stopLoss,
        target: trade.takeProfit,
        positionSize: trade.quantity,
        riskAmount: trade.riskAmount
      }
    }
  });
};
```

### 4. Display System 2 Stats in Dashboard
```jsx
import { getStats } from './utils/storage';

function TradingDashboard() {
  const stats = getStats();
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-slate-400 text-sm">Total Checks</p>
        <p className="text-2xl font-bold text-white">{stats.total}</p>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-slate-400 text-sm">Avg Emotional</p>
        <p className="text-2xl font-bold text-amber-400">{stats.avgEmotional}/50</p>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-slate-400 text-sm">Trades Paused</p>
        <p className="text-2xl font-bold text-red-400">{stats.pausedTrades}</p>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-lg">
        <p className="text-slate-400 text-sm">Red Flags</p>
        <p className="text-2xl font-bold text-red-400">{stats.redFlagCount}</p>
      </div>
    </div>
  );
}
```

### 5. Alert on High Emotional State
```jsx
import { useEffect } from 'react';
import { getLatestCheck } from './utils/storage';

function EmotionalAlert() {
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const latestCheck = getLatestCheck();
      
      if (!latestCheck) return;
      
      // High emotional risk
      if (latestCheck.emotionalScore > 32) {
        showNotification({
          type: 'warning',
          title: 'High Emotional Risk',
          message: 'Your emotional score is elevated. Consider taking a break.',
          duration: 10000
        });
      }
      
      // Revenge trading detected
      if (latestCheck.redFlags.includes('revenge_flag')) {
        showNotification({
          type: 'error',
          title: 'Revenge Trading Detected',
          message: 'Walk away from the screen. Do not trade.',
          duration: 15000
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, []);
  
  return null;
}
```

### 6. Disable Trading During Pause
```jsx
import { useState, useEffect } from 'react';
import { getLatestCheck } from './utils/storage';

function TradeButton() {
  const [isPaused, setIsPaused] = useState(false);
  const [pauseEndTime, setPauseEndTime] = useState(null);
  
  useEffect(() => {
    const latestCheck = getLatestCheck();
    
    if (latestCheck?.result === 'pause') {
      const pauseDuration = 5 * 60 * 1000; // 5 minutes
      const endTime = Date.now() + pauseDuration;
      
      setIsPaused(true);
      setPauseEndTime(endTime);
      
      const timer = setInterval(() => {
        if (Date.now() >= endTime) {
          setIsPaused(false);
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, []);
  
  const formatTimeLeft = () => {
    if (!pauseEndTime) return '';
    const timeLeft = Math.max(0, pauseEndTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <button 
      disabled={isPaused}
      className={`py-3 px-6 rounded-lg font-semibold ${
        isPaused 
          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
      }`}
    >
      {isPaused ? `Paused (${formatTimeLeft()})` : 'Execute Trade'}
    </button>
  );
}
```

### 7. Export System 2 Data to Your Backend
```jsx
import { getAllChecks } from './utils/storage';

async function syncSystem2Data() {
  const checks = getAllChecks();
  
  try {
    const response = await fetch('/api/system2-checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checks,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log('System 2 data synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync System 2 data:', error);
  }
}
```

### 8. Custom Scoring Thresholds
```typescript
// Override default thresholds in your app config
const CUSTOM_THRESHOLDS = {
  emotional: {
    low: 20,      // 10-20: Low risk
    moderate: 32, // 21-32: Moderate risk
    high: 50      // 33-50: High risk
  },
  checklist: {
    weak: 4,      // 0-4: Weak plan
    needsReview: 7, // 5-7: Needs review
    strong: 8     // 8: Strong plan
  },
  redFlags: {
    revengeThreshold: 3,
    urgencyThreshold: 4,
    fomoThreshold: 4
  }
};

// Use in your scoring logic
function getEmotionalRiskLevel(score: number) {
  if (score <= CUSTOM_THRESHOLDS.emotional.low) return 'low';
  if (score <= CUSTOM_THRESHOLDS.emotional.moderate) return 'moderate';
  return 'high';
}
```

---

## Component API Reference

### Home Component
```typescript
interface HomeProps {
  onNavigate: (screen: Screen) => void;
}
```

### PreTradeCheck Component
```typescript
interface PreTradeCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: CheckResult) => void;
}
```

### UrgencyCheck Component
```typescript
interface UrgencyCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: UrgencyCheckResult) => void;
}
```

### InTradeCheck Component
```typescript
interface InTradeCheckProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: InTradeCheckResult) => void;
}
```

### PostTradeReview Component
```typescript
interface PostTradeReviewProps {
  onNavigate: (screen: Screen) => void;
  onResult: (result: PostTradeResult) => void;
}
```

### ResultScreen Component
```typescript
interface ResultScreenProps {
  result: CheckResult | null;
  onNavigate: (screen: Screen) => void;
  onPause: () => void;
}
```

### PauseScreen Component
```typescript
interface PauseScreenProps {
  onNavigate: (screen: Screen) => void;
}
```

### History Component
```typescript
interface HistoryProps {
  onNavigate: (screen: Screen) => void;
}
```

### Settings Component
```typescript
interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}
```

---

## Utility Function Reference

### Storage Functions
```typescript
// Save a check result
saveCheck(record: CheckRecord): void

// Get all checks
getAllChecks(): CheckRecord[]

// Get latest check
getLatestCheck(): CheckRecord | undefined

// Check if recent check exists (within minutes)
hasRecentCheck(minutes: number): boolean

// Delete specific check
deleteCheck(id: string): void

// Clear all checks
clearAllChecks(): void

// Export as JSON string
exportChecks(): string

// Get settings
getSettings(): AppSettings

// Save settings
saveSettings(settings: AppSettings): void

// Get today's checks
getTodayChecks(): CheckRecord[]

// Get statistics
getStats(): {
  total: number;
  avgEmotional: number;
  pausedTrades: number;
  redFlagCount: number;
  preTradeChecks: number;
  urgencyChecks: number;
}

// Generate unique ID
generateId(): string
```

### Scoring Functions
```typescript
// Calculate emotional score (10-50)
calculateEmotionalScore(emotions: EmotionalScores): number

// Calculate checklist score (0-8)
calculateChecklistScore(checklist: ChecklistAnswers): number

// Detect red flags
detectRedFlags(
  emotions: EmotionalScores,
  checklist: ChecklistAnswers,
  tradeDetails: { stopLoss: string; riskAmount: string; inPlan: boolean }
): RedFlag[]

// Get emotional risk level
getEmotionalRiskLevel(score: number): 'low' | 'moderate' | 'high'

// Get checklist level
getChecklistLevel(score: number): 'weak' | 'needs_review' | 'strong'

// Generate recommendation
generateRecommendation(
  emotionalScore: number,
  checklistScore: number,
  redFlags: RedFlag[]
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string }

// Get urgency recommendation
getUrgencyRecommendation(
  angry: boolean,
  winBack: boolean,
  chasing: boolean,
  bored: boolean,
  scared: boolean
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string }

// Get in-trade recommendation
getInTradeRecommendation(
  reasonChanged: boolean,
  movingStop: boolean,
  addingPain: boolean,
  closingFear: boolean
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string }

// Get post-trade label
getPostTradeLabel(
  followedPlan: boolean,
  resultGood: boolean | null
): string
```

---

## File-by-File Summary

| File | Purpose | Lines | Key Exports |
|------|---------|-------|-------------|
| `App.tsx` | Main app, routing | ~100 | `App` component |
| `types.ts` | TypeScript interfaces | ~100 | All type definitions |
| `utils/scoring.ts` | Scoring algorithms | ~200 | Scoring functions |
| `utils/storage.ts` | LocalStorage operations | ~100 | Storage functions |
| `components/Home.tsx` | Dashboard | ~80 | `Home` component |
| `components/PreTradeCheck.tsx` | Pre-trade validation | ~300 | `PreTradeCheck` component |
| `components/UrgencyCheck.tsx` | Quick emotional check | ~120 | `UrgencyCheck` component |
| `components/InTradeCheck.tsx` | Trade management check | ~150 | `InTradeCheck` component |
| `components/PostTradeReview.tsx` | Post-trade analysis | ~200 | `PostTradeReview` component |
| `components/ResultScreen.tsx` | Display results | ~180 | `ResultScreen` component |
| `components/PauseScreen.tsx` | Timer with breathing | ~150 | `PauseScreen` component |
| `components/History.tsx` | View past checks | ~200 | `History` component |
| `components/Settings.tsx` | Configuration | ~150 | `Settings` component |

---

## Integration Checklist

- [ ] Add navigation button to your trading app
- [ ] Import System 2 components
- [ ] Set up routing for `/system2-check/*` routes
- [ ] Pre-fill trade details when navigating from trade form
- [ ] Check latest System 2 result before trade execution
- [ ] Disable trade button if result is 'stop' or 'pause'
- [ ] Display System 2 stats in dashboard
- [ ] Add alerts for high emotional states
- [ ] Test all check types work correctly
- [ ] Verify data persists in localStorage
- [ ] Test export/import functionality
- [ ] Customize scoring thresholds if needed
- [ ] Adjust UI colors to match your brand
- [ ] Add your logo/branding

---

## Common Integration Patterns

### Pattern 1: Optional Check
User can choose to run System 2 check before trading.

### Pattern 2: Mandatory Check
Force user to complete System 2 check before any trade execution.

### Pattern 3: Periodic Check
Prompt user to run check after X trades or Y minutes.

### Pattern 4: Risk-Based Check
Only require check for trades above certain risk threshold.

### Pattern 5: Emotional Trigger
Automatically prompt check when detecting rapid trading or large losses.

---

## Troubleshooting

**Issue**: Data not persisting
- **Solution**: Check localStorage is enabled, not in private/incognito mode

**Issue**: Components not rendering
- **Solution**: Ensure React 18+ and all dependencies installed

**Issue**: Styling broken
- **Solution**: Verify Tailwind CSS is configured correctly

**Issue**: Scoring seems wrong
- **Solution**: Review thresholds in `utils/scoring.ts`, adjust as needed

**Issue**: Timer not working
- **Solution**: Check browser permissions for timers, not blocked by ad blocker
