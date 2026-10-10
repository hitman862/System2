import { EmotionalScores, ChecklistAnswers, RedFlag } from '../types';

export function calculateEmotionalScore(emotions: EmotionalScores): number {
  const values = Object.values(emotions);
  return values.reduce((sum, val) => sum + val, 0);
}

export function calculateChecklistScore(checklist: ChecklistAnswers): number {
  let score = 0;
  if (checklist.inPlan) score++;
  if (checklist.exitDefined) score++;
  if (checklist.riskCalculated) score++;
  if (checklist.willingToLose) score++;
  if (checklist.setupRepeatable) score++;
  if (checklist.wouldTakeIfFlat) score++;
  if (checklist.followingRule) score++;
  if (checklist.regretTest) score++;
  return score;
}

export function detectRedFlags(
  emotions: EmotionalScores,
  checklist: ChecklistAnswers,
  tradeDetails: { stopLoss: string; riskAmount: string; inPlan: boolean }
): RedFlag[] {
  const flags: RedFlag[] = [];

  if (!tradeDetails.stopLoss || tradeDetails.stopLoss.trim() === '') {
    flags.push({
      name: 'no_stop_loss',
      message: 'No stop loss defined. Risk is undefined.'
    });
  }

  if (!tradeDetails.riskAmount || tradeDetails.riskAmount.trim() === '') {
    flags.push({
      name: 'risk_not_calculated',
      message: 'Risk amount not calculated. You must know your max loss before entering.'
    });
  }

  if (emotions.revenge > 3) {
    flags.push({
      name: 'revenge_flag',
      message: 'Revenge trading detected. You are trying to recover a previous loss.'
    });
  }

  if (emotions.urgency > 4) {
    flags.push({
      name: 'urgency_flag',
      message: 'Extreme urgency detected. System 1 is driving this decision.'
    });
  }

  if (!checklist.inPlan) {
    flags.push({
      name: 'outside_plan',
      message: 'This trade is not in your trading plan.'
    });
  }

  if (emotions.fomo > 4) {
    flags.push({
      name: 'fomo_flag',
      message: 'High FOMO detected. You may be chasing price.'
    });
  }

  if (emotions.mustEnterNow > 4) {
    flags.push({
      name: 'must_enter_now',
      message: 'You feel you must enter NOW. This is a System 1 signal.'
    });
  }

  return flags;
}

export function getEmotionalRiskLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 20) return 'low';
  if (score <= 32) return 'moderate';
  return 'high';
}

export function getChecklistLevel(score: number): 'weak' | 'needs_review' | 'strong' {
  if (score <= 4) return 'weak';
  if (score <= 7) return 'needs_review';
  return 'strong';
}

export function generateRecommendation(
  emotionalScore: number,
  checklistScore: number,
  redFlags: RedFlag[]
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string } {
  const emotionalLevel = getEmotionalRiskLevel(emotionalScore);
  const checklistLevel = getChecklistLevel(checklistScore);

  // Red flags override everything
  if (redFlags.some(f => ['no_stop_loss', 'revenge_flag', 'must_enter_now'].includes(f.name))) {
    return {
      result: 'stop',
      message: 'STOP. System 1 is likely driving this decision. Do not trade until all red flags are resolved.'
    };
  }

  // High emotional risk = mandatory pause
  if (emotionalLevel === 'high') {
    return {
      result: 'pause',
      message: 'Emotional risk is high. Complete a 5-minute pause before making any decision. The market will still be there.'
    };
  }

  // High urgency
  if (redFlags.some(f => f.name === 'urgency_flag')) {
    return {
      result: 'pause',
      message: 'Urgency is too high. Delay for 5-10 minutes. If the setup is real, it will still be valid after the pause.'
    };
  }

  // Weak plan
  if (checklistLevel === 'weak') {
    return {
      result: 'stop',
      message: 'Your trade plan is incomplete. Do not trade until you can answer all checklist questions with confidence.'
    };
  }

  // Moderate emotional + weak plan
  if (emotionalLevel === 'moderate' && checklistLevel === 'needs_review') {
    return {
      result: 'pause',
      message: 'Some emotional pressure and plan gaps detected. Pause, review your plan, and reduce position size if you proceed.'
    };
  }

  // Moderate emotional + strong plan
  if (emotionalLevel === 'moderate' && checklistLevel === 'strong') {
    return {
      result: 'caution',
      message: 'Your plan is solid but some emotional pressure detected. Consider reducing size or waiting for extra confirmation.'
    };
  }

  // Low emotional + needs review plan
  if (emotionalLevel === 'low' && checklistLevel === 'needs_review') {
    return {
      result: 'caution',
      message: 'You feel calm but your plan has gaps. Review the missing items before executing.'
    };
  }

  // Low emotional + strong plan
  if (emotionalLevel === 'low' && checklistLevel === 'strong') {
    return {
      result: 'proceed',
      message: 'Your trade idea appears structured and your emotional state is calm. Proceed with execution following your plan.'
    };
  }

  return {
    result: 'caution',
    message: 'Review your plan and emotional state before proceeding.'
  };
}

export function getUrgencyRecommendation(
  angry: boolean,
  winBack: boolean,
  chasing: boolean,
  bored: boolean,
  scared: boolean
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string } {
  const flags = [angry, winBack, chasing, bored, scared].filter(Boolean).length;

  if (flags >= 3) {
    return {
      result: 'stop',
      message: 'Multiple emotional triggers detected. Walk away from the screen. Do not trade today.'
    };
  }

  if (angry || winBack) {
    return {
      result: 'stop',
      message: 'You are in a revenge or anger state. Do not trade. Wait at least 30 minutes and reassess.'
    };
  }

  if (flags >= 2) {
    return {
      result: 'pause',
      message: 'Multiple emotional signals detected. Wait 10 minutes. If the urge persists, reduce position size by 50%.'
    };
  }

  if (chasing || scared) {
    return {
      result: 'caution',
      message: 'You may be chasing or acting from fear. Wait 5 minutes and check if the setup still meets your rules.'
    };
  }

  if (bored) {
    return {
      result: 'caution',
      message: 'Boredom is not a reason to trade. Only trade setups that meet your plan criteria.'
    };
  }

  return {
    result: 'proceed',
    message: 'You seem relatively calm. Still, run a full Pre-Trade Check before entering.'
  };
}

export function getInTradeRecommendation(
  reasonChanged: boolean,
  movingStop: boolean,
  addingPain: boolean,
  closingFear: boolean
): { result: 'proceed' | 'caution' | 'pause' | 'stop'; message: string } {
  if (movingStop && addingPain) {
    return {
      result: 'stop',
      message: 'You are moving stops AND adding from pain. This is dangerous. Step away and follow your original plan mechanically.'
    };
  }

  if (movingStop) {
    return {
      result: 'pause',
      message: 'You are moving your stop loss. Only do this if your pre-defined rules allow it. Otherwise, respect your original plan.'
    };
  }

  if (closingFear) {
    return {
      result: 'caution',
      message: 'You want to close early out of fear. Ask: has my original reason changed? If not, follow the plan.'
    };
  }

  if (addingPain) {
    return {
      result: 'pause',
      message: 'You are adding to a position from pain, not analysis. Do not add unless your system specifically calls for it.'
    };
  }

  if (reasonChanged) {
    return {
      result: 'caution',
      message: 'The original reason for this trade has changed. Consider reducing size or exiting at the next logical point.'
    };
  }

  return {
    result: 'proceed',
    message: 'Your trade management appears rational. Continue following your original plan.'
  };
}

export function getPostTradeLabel(
  followedPlan: boolean,
  resultGood: boolean | null
): string {
  const processGood = followedPlan;

  if (processGood && resultGood === true) {
    return 'Good Process / Good Result ✅';
  }
  if (processGood && resultGood === false) {
    return 'Good Process / Bad Result 📊';
  }
  if (!processGood && resultGood === true) {
    return 'Bad Process / Good Result ⚠️';
  }
  if (!processGood && resultGood === false) {
    return 'Bad Process / Bad Result ❌';
  }
  return 'Incomplete Review';
}
