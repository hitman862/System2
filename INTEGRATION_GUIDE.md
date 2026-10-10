# System 2 Trading Self-Check - Integration Guide

## Overview
A trading psychology tool that helps traders pause, identify emotional states, and activate analytical thinking before making trading decisions. Based on Daniel Kahneman's "Thinking, Fast and Slow" concept.

## What It Does
- **Pre-Trade Check**: Validates trade setup, calculates risk, detects emotional bias
- **Urgency Check**: Quick emotional assessment when feeling compelled to trade
- **In-Trade Check**: Monitors trade management decisions
- **Post-Trade Review**: Evaluates process vs outcome
- **Pause Timer**: Forced cool-down with breathing exercises
- **History & Analytics**: Tracks all checks with insights

---

## Architecture

### Tech Stack
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **LocalStorage** for data persistence
- **No backend required** - fully client-side

### File Structure
```
src/
├── App.tsx                    # Main app component, routing
├── types.ts                   # TypeScript interfaces
├── utils/
│   ├── scoring.ts            # Core scoring algorithms
│   └── storage.ts            # LocalStorage operations
└── components/
    ├── Home.tsx              # Dashboard with navigation
    ├── PreTradeCheck.tsx     # 3-step pre-trade validation
    ├── UrgencyCheck.tsx      # Quick emotional check
    ├── InTradeCheck.tsx      # Trade management check
    ├── PostTradeReview.tsx   # Post-trade analysis
    ├── ResultScreen.tsx      # Displays assessment results
    ├── PauseScreen.tsx       # Timer with breathing exercise
    ├── History.tsx           # View/export past checks
    └── Settings.tsx          # Configuration options
```

---

## Core Data Structures

### Check Types
```typescript
type CheckType = 'pre-trade' | 'urgency' | 'in-trade' | 'post-trade';

type Screen = 'home' | 'pre-trade' | 'urgency' | 'in-trade' | 'post-trade' | 'result' | 'pause' | 'history' | 'settings';
```

### Trade Details (Pre-Trade Check)
```typescript
interface TradeDetails {
  symbol: string;           // e.g., "BTCUSD"
  direction: 'long' | 'short' | '';
  timeframe: string;        // e.g., "1H", "4H", "Daily"
  setup: string;            // e.g., "Breakout retest"
  entryReason: string;      // Why this trade?
  entry: string;            // Entry price
  stopLoss: string;         // Stop loss price
  target: string;           // Target price
  positionSize: string;     // e.g., "0.5 lots"
  riskAmount: string;       // Max loss in $
}
```

### Checklist Answers (System 2 Questions)
```typescript
interface ChecklistAnswers {
  inPlan: boolean;              // Is this in my trading plan?
  exitDefined: boolean;         // Do I know where to exit if wrong?
  riskCalculated: boolean;      // Have I calculated risk?
  willingToLose: boolean;       // Am I willing to lose this amount?
  setupRepeatable: boolean;     // Is this setup repeatable?
  wouldTakeIfFlat: boolean;     // Would I take if I missed the move?
  followingRule: boolean;       // Am I following a rule or reacting?
  thesis: string;               // Written thesis (min 20 chars recommended)
  preMortem: string;            // What could go wrong?
  regretTest: boolean;          // Will I be okay if I miss this?
}
```

### Emotional Scores (1-5 scale each)
```typescript
interface EmotionalScores {
  urgency: number;          // I feel I must enter NOW
  fomo: number;             // I am afraid of missing out
  revenge: number;          // I want to recover a previous loss
  fear: number;             // I feel anxious
  greed: number;            // I want to increase size
  boredom: number;          // I am bored and want action
  overconfidence: number;   // I feel overconfident
  mustEnterNow: number;     // My body feels tense or rushed
  chasingPrice: number;     // I am ignoring my usual rules
  thinkingProfit: number;   // I am thinking about profit more than risk
}
```

### Check Result (Saved Record)
```typescript
interface CheckResult {
  id: string;
  timestamp: string;
  checkType: CheckType;
  tradeDetails?: TradeDetails;
  checklistScore: number;     // 0-8 (System 2 questions)
  emotionalScore: number;     // 10-50 (sum of all emotions)
  result: 'proceed' | 'caution' | 'pause' | 'stop';
  redFlags: string[];         // List of triggered red flags
  notes: string;
  recommendation: string;     // Generated recommendation text
}
```

---

## Core Scoring Logic

### Emotional Risk Score Calculation
```typescript
function calculateEmotionalScore(emotions: EmotionalScores): number {
  // Sum all emotion values (each 1-5, total 10-50)
  return Object.values(emotions).reduce((sum, val) => sum + val, 0);
}

// Thresholds:
// 10-20: Low emotional risk
// 21-32: Moderate emotional risk
// 33-50: High emotional risk
```

### Checklist Score Calculation
```typescript
function calculateChecklistScore(checklist: ChecklistAnswers): number {
  let score = 0;
  if (checklist.inPlan) score++;
  if (checklist.exitDefined) score++;
  if (checklist.riskCalculated) score++;
  if (checklist.willingToLose) score++;
  if (checklist.setupRepeatable) score++;
  if (checklist.wouldTakeIfFlat) score++;
  if (checklist.followingRule) score++;
  if (checklist.regretTest) score++;
  return score; // 0-8
}

// Thresholds:
// 0-4: Weak plan
// 5-7: Needs review
// 8: Strong plan
```

### Red Flag Detection
```typescript
function detectRedFlags(emotions, checklist, tradeDetails): RedFlag[] {
  const flags = [];
  
  // Critical red flags (auto-stop):
  if (!tradeDetails.stopLoss) flags.push('no_stop_loss');
  if (!tradeDetails.riskAmount) flags.push('risk_not_calculated');
  if (emotions.revenge > 3) flags.push('revenge_flag');
  if (emotions.urgency > 4) flags.push('urgency_flag');
  if (!checklist.inPlan) flags.push('outside_plan');
  if (emotions.fomo > 4) flags.push('fomo_flag');
  if (emotions.mustEnterNow > 4) flags.push('must_enter_now');
  
  return flags;
}
```

### Final Decision Logic
```typescript
function generateRecommendation(emotionalScore, checklistScore, redFlags) {
  // Priority order:
  
  // 1. Red flags override everything
  if (redFlags.includes('no_stop_loss', 'revenge_flag', 'must_enter_now')) {
    return { result: 'stop', message: 'STOP. System 1 is driving.' };
  }
  
  // 2. High emotional risk = mandatory pause
  if (emotionalScore > 32) {
    return { result: 'pause', message: 'Emotional risk is high. Pause required.' };
  }
  
  // 3. Weak plan = don't trade
  if (checklistScore <= 4) {
    return { result: 'stop', message: 'Plan incomplete. Do not trade.' };
  }
  
  // 4. Moderate emotional + weak plan = pause
  if (emotionalScore > 20 && checklistScore <= 7) {
    return { result: 'pause', message: 'Pause and review plan.' };
  }
  
  // 5. Moderate emotional + strong plan = caution
  if (emotionalScore > 20 && checklistScore >= 8) {
    return { result: 'caution', message: 'Reduce size or wait for confirmation.' };
  }
  
  // 6. Low emotional + needs review = caution
  if (emotionalScore <= 20 && checklistScore <= 7) {
    return { result: 'caution', message: 'Review missing plan items.' };
  }
  
  // 7. Low emotional + strong plan = proceed
  return { result: 'proceed', message: 'Trade idea appears structured.' };
}
```

---

## Storage Operations

### LocalStorage Keys
```typescript
const STORAGE_KEY = 's2-trading-checks';      // All check records
const SETTINGS_KEY = 's2-trading-settings';   // User settings
```

### Key Functions
```typescript
// Save a check result
function saveCheck(record: CheckRecord): void

// Get all checks
function getAllChecks(): CheckRecord[]

// Delete specific check
function deleteCheck(id: string): void

// Clear all checks
function clearAllChecks(): void

// Export as JSON
function exportChecks(): string

// Get settings
function getSettings(): AppSettings

// Save settings
function saveSettings(settings: AppSettings): void

// Get today's checks
function getTodayChecks(): CheckRecord[]

// Get statistics
function getStats(): {
  total: number;
  avgEmotional: number;
  pausedTrades: number;
  redFlagCount: number;
  preTradeChecks: number;
  urgencyChecks: number;
}
```

---

## Settings Configuration

```typescript
interface AppSettings {
  pauseDuration: number;      // Minutes (default: 5)
  dailyMaxTrades: number;     // Max trades per day (default: 3)
  riskLimit: number;          // Max risk % per trade (default: 2)
  theme: 'dark' | 'light';    // UI theme (default: 'dark')
}
```

---

## Integration Points

### 1. Navigation Integration
Add a button/link in your trading app's main menu:
```jsx
<button onClick={() => navigate('/system2-check')}>
  🧠 System 2 Check
</button>
```

### 2. Pre-Trade Integration
Before executing a trade, prompt user:
```jsx
const handleTradeExecution = (trade) => {
  // Option A: Force check before trading
  if (!hasRecentSystem2Check()) {
    showSystem2CheckModal();
    return;
  }
  
  // Option B: Optional check
  if (userWantsSystem2Check()) {
    navigate('/system2-check/pre-trade', { tradeData: trade });
    return;
  }
  
  executeTrade(trade);
};
```

### 3. Result Integration
After System 2 check, use the result:
```typescript
const result = getLatestSystem2Check();

if (result.result === 'stop') {
  showWarning('System 2 check failed. Do not trade.');
  disableTradeButton();
} else if (result.result === 'pause') {
  showWarning('Pause required. Wait before trading.');
  disableTradeButton(result.pauseDuration * 60 * 1000);
} else if (result.result === 'caution') {
  showWarning('Proceed with caution. Consider reducing size.');
  // Optionally reduce position size
}
```

### 4. Analytics Integration
Display System 2 stats in your dashboard:
```typescript
const stats = getStats();

// Show in dashboard:
// - Total checks: {stats.total}
// - Average emotional score: {stats.avgEmotional}/50
// - Trades paused: {stats.pausedTrades}
// - Red flags triggered: {stats.redFlagCount}
```

### 5. Alert Integration
Trigger alerts based on emotional state:
```typescript
if (latestCheck.emotionalScore > 32) {
  sendNotification('High emotional risk detected. Consider taking a break.');
}

if (latestCheck.redFlags.includes('revenge_flag')) {
  sendNotification('Revenge trading detected. Walk away from the screen.');
}
```

---

## UI/UX Design System

### Color Palette
```css
/* Background */
bg-slate-900      /* Main background: #0f172a */
bg-slate-800      /* Cards: #1e293b */
bg-slate-700      /* Borders: #334155 */

/* Status Colors */
bg-emerald-600    /* Proceed/Success: #059669 */
bg-amber-600      /* Caution/Warning: #d97706 */
bg-orange-600     /* Pause: #ea580c */
bg-red-600        /* Stop/Danger: #dc2626 */
bg-blue-600       /* Info/Actions: #2563eb */
bg-purple-600     /* Post-trade: #9333ea */

/* Text */
text-white        /* Primary text */
text-slate-300    /* Secondary text */
text-slate-400    /* Tertiary text */
text-slate-500    /* Disabled/hint text */
```

### Component Patterns

#### Buttons
```jsx
// Primary action (green)
<button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl">
  Pre-Trade Check
</button>

// Secondary action (gray)
<button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl border border-slate-700">
  Back
</button>

// Danger action (red)
<button className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl">
  Clear All
</button>
```

#### Cards
```jsx
<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
  <h3 className="text-lg font-semibold text-white mb-4">Section Title</h3>
  {/* Content */}
</div>
```

#### Inputs
```jsx
<input 
  type="text"
  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
  placeholder="Enter value"
/>
```

#### Sliders (Emotional Rating)
```jsx
<input 
  type="range" 
  min="1" 
  max="5" 
  value={score}
  onChange={handleChange}
  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
/>
```

#### Checkboxes
```jsx
<label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer">
  <input 
    type="checkbox" 
    checked={value}
    onChange={handleChange}
    className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500"
  />
  <span className="text-slate-200 text-sm">Question text</span>
</label>
```

---

## Key Features to Implement

### 1. Pre-Trade Check (3 Steps)
**Step 1: Trade Details**
- Symbol, direction, timeframe, setup
- Entry, stop loss, target, position size, risk amount

**Step 2: System 2 Checklist**
- 8 yes/no questions about plan and risk
- Written thesis (min 20 chars recommended)
- Pre-mortem question

**Step 3: Emotional Temperature**
- 10 sliders (1-5 scale) for emotional states
- Calculate total emotional score (10-50)

**Result Screen:**
- Show emotional score and checklist score
- Display red flags if any
- Generate recommendation (proceed/caution/pause/stop)
- Option to start pause timer

### 2. Urgency Check (Quick)
- 5 yes/no questions: angry, win back, chasing, bored, scared
- Calculate emotional score
- Generate recommendation
- If high urgency, force pause

### 3. In-Trade Check
- Symbol input
- 4 yes/no questions: reason changed, moving stop, adding from pain, closing fear
- Generate recommendation for trade management

### 4. Post-Trade Review
- Symbol input
- 5 yes/no questions about process
- Result: profitable or loss
- Notes/lessons
- Label: Good/Bad Process × Good/Bad Result

### 5. Pause Screen
- Countdown timer (configurable, default 5 min)
- Breathing animation (inhale/hold/exhale cycle)
- Rotating motivational quotes
- After timer: "I feel calmer" or "I still feel urgent"
- If calmer, suggest running pre-trade check
- If still urgent, suggest not trading

### 6. History Screen
- Stats overview (total checks, avg emotional, paused trades)
- Filter by check type
- List of all checks with date, type, symbol, score, result
- Delete individual checks
- Export all data as JSON
- Clear all data

### 7. Settings Screen
- Pause duration (3, 5, 10, 15 min)
- Daily max trades (1, 2, 3, 5, 10)
- Risk limit % (0.5, 1, 2, 3, 5)
- About section with key principles

---

## Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x"
}
```

No additional libraries required. Everything uses vanilla React + TypeScript + Tailwind.

---

## Performance Considerations

- **Bundle size**: ~230 KB (single HTML file with everything inlined)
- **Load time**: Instant (no external dependencies)
- **Storage**: Uses localStorage (5-10 MB limit per domain)
- **Offline**: Works 100% offline after initial load

---

## Security & Privacy

- **No backend**: All data stays in browser
- **No tracking**: No analytics or telemetry
- **No external requests**: Fully self-contained
- **Local storage only**: Data persists in user's browser

---

## Customization Options

### Branding
- Change app name in `index.html` title
- Update emoji icons to your brand icons
- Modify color scheme in Tailwind config

### Logic Adjustments
- Adjust emotional score thresholds in `scoring.ts`
- Modify red flag conditions
- Change checklist questions
- Customize recommendation messages

### UI Customization
- Adjust pause timer duration
- Add/remove emotional questions
- Modify color palette
- Change layout/spacing

---

## Testing Recommendations

1. **Test all check types**: Pre-trade, urgency, in-trade, post-trade
2. **Test scoring logic**: Verify emotional and checklist scores calculate correctly
3. **Test red flags**: Ensure all red flags trigger appropriate warnings
4. **Test pause timer**: Verify timer counts down and breathing animation works
5. **Test storage**: Verify checks save/load correctly, export works
6. **Test edge cases**: Empty forms, max/min scores, rapid navigation
7. **Test responsiveness**: Mobile, tablet, desktop layouts
8. **Test offline**: Disconnect internet and verify app still works

---

## Future Enhancements

- **Cloud sync**: Add Firebase/Supabase for cross-device sync
- **Charts**: Add emotion history visualization with Chart.js
- **AI analysis**: Use GPT to analyze trading patterns
- **Broker integration**: Auto-fill trade details from broker API
- **Mobile app**: Wrap in React Native or Capacitor
- **Notifications**: Browser notifications for pause reminders
- **Export formats**: CSV, PDF reports
- **Multi-account**: Support multiple trading accounts
- **Team features**: Share checks with mentor/coach

---

## Support & Questions

For integration questions:
- Review the source code in `src/` directory
- Check TypeScript interfaces in `src/types.ts`
- Study scoring logic in `src/utils/scoring.ts`
- Examine component structure in `src/components/`

---

## License

This code is provided as-is for integration into your trading application. Modify as needed for your specific use case.
