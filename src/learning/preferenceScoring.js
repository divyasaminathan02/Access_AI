/**
 * AccessAI - Preference Scoring Engine
 * Computes frequency distributions, recency-weighted preference clusters,
 * and detects behavioral convergence over time.
 */

// Half-life for interaction recency decay in hours (e.g. 72 hours = 3 days)
const RECENCY_HALF_LIFE_HOURS = 72;

export class PreferenceScoring {
  /**
   * Calculate time decay weight for an event
   * Events closer to now have weight closer to 1.0, older events decay smoothly.
   */
  static getRecencyWeight(eventTimestamp) {
    const eventTime = new Date(eventTimestamp).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, (now - eventTime) / (1000 * 60 * 60));
    return Math.pow(0.5, diffHours / RECENCY_HALF_LIFE_HOURS);
  }

  /**
   * Score discrete/categorical dimensions (e.g. fontFamily, theme, focusMode)
   */
  static scoreCategorical(events, initialValue) {
    if (!events || events.length === 0) {
      return {
        preferredValue: initialValue,
        frequencyMap: { [initialValue]: 1 },
        totalWeight: 1,
        dominantRatio: 1.0,
        sampleCount: 0
      };
    }

    const frequencyMap = {};
    const weightedMap = {};
    let totalWeight = 0;

    events.forEach((ev) => {
      const val = ev.to !== undefined ? ev.to : ev.value;
      if (val === undefined || val === null) return;

      const weight = this.getRecencyWeight(ev.timestamp);
      frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      weightedMap[val] = (weightedMap[val] || 0) + weight;
      totalWeight += weight;
    });

    // Find highest weighted value
    let bestValue = initialValue;
    let maxWeight = 0;

    Object.entries(weightedMap).forEach(([val, weight]) => {
      // Cast booleans / numbers if needed
      let parsedVal = val;
      if (val === 'true') parsedVal = true;
      else if (val === 'false') parsedVal = false;
      else if (!isNaN(Number(val)) && typeof initialValue === 'number') parsedVal = Number(val);

      if (weight > maxWeight) {
        maxWeight = weight;
        bestValue = parsedVal;
      }
    });

    const dominantRatio = totalWeight > 0 ? (maxWeight / totalWeight) : 0;

    return {
      preferredValue: bestValue,
      frequencyMap,
      weightedMap,
      totalWeight,
      dominantRatio,
      sampleCount: events.length
    };
  }

  /**
   * Score continuous numeric dimensions (e.g. fontSize, lineSpacing, letterSpacing, contentWidth)
   * Uses weighted mean and peak modal density to prevent erratic jumps.
   */
  static scoreNumeric(events, initialValue, stepTolerance = 1) {
    if (!events || events.length === 0) {
      return {
        preferredValue: initialValue,
        frequencyMap: { [initialValue]: 1 },
        meanValue: initialValue,
        sampleCount: 0,
        directionality: 'neutral' // 'increasing' | 'decreasing' | 'neutral'
      };
    }

    const frequencyMap = {};
    let weightedSum = 0;
    let totalWeight = 0;
    let increaseCount = 0;
    let decreaseCount = 0;

    events.forEach((ev) => {
      const val = Number(ev.to !== undefined ? ev.to : ev.value);
      if (isNaN(val)) return;

      const fromVal = Number(ev.from);
      if (!isNaN(fromVal)) {
        if (val > fromVal) increaseCount++;
        else if (val < fromVal) decreaseCount++;
      }

      const weight = this.getRecencyWeight(ev.timestamp);
      frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      weightedSum += val * weight;
      totalWeight += weight;
    });

    const weightedMean = totalWeight > 0 ? (weightedSum / totalWeight) : initialValue;

    // Determine modal peak (most chosen exact value)
    let peakValue = initialValue;
    let peakCount = 0;
    Object.entries(frequencyMap).forEach(([valStr, count]) => {
      if (count > peakCount) {
        peakCount = count;
        peakValue = Number(valStr);
      }
    });

    // Balance weighted mean with modal peak
    // If user selected 18px 14 times, modal peak dominates
    let preferredValue;
    if (peakCount >= 3 && (peakCount / events.length) > 0.45) {
      preferredValue = peakValue;
    } else {
      // Round to nearest clean increment (0.05 for spacing, 1 for size, 10 for width)
      if (stepTolerance < 0.1) {
        preferredValue = Math.round(weightedMean * 20) / 20; // 0.05 step
      } else if (stepTolerance <= 1) {
        preferredValue = Math.round(weightedMean);
      } else {
        preferredValue = Math.round(weightedMean / stepTolerance) * stepTolerance;
      }
    }

    let directionality = 'neutral';
    if (increaseCount > decreaseCount * 1.5) directionality = 'increasing';
    else if (decreaseCount > increaseCount * 1.5) directionality = 'decreasing';

    return {
      preferredValue,
      frequencyMap,
      meanValue: weightedMean,
      sampleCount: events.length,
      directionality,
      peakValue,
      peakRatio: events.length > 0 ? (peakCount / events.length) : 0
    };
  }

  /**
   * Evaluate context-specific deviations (e.g. Long articles vs Dashboard vs Docs)
   */
  static scoreByContext(events, category) {
    const filtered = events.filter(e => e.category === category);
    return {
      count: filtered.length,
      events: filtered
    };
  }
}
