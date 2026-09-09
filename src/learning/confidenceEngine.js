/**
 * AccessAI - Confidence Engine
 * Calculates deterministic, multi-factor confidence metrics (0.00 to 1.00)
 * for learned preferences and computes the overall Reading Comfort Profile.
 */

export class ConfidenceEngine {
  /**
   * Calculate confidence for a learned preference dimension
   * @param {Object} scoringResult - Output from PreferenceScoring (numeric or categorical)
   * @param {Array} events - Relevant interaction events
   * @param {any} initialValue - Baseline initial value from initial profile
   * @returns {number} Confidence score between 0.00 and 0.99
   */
  static calculateConfidence(scoringResult, events = [], initialValue = null) {
    const sampleCount = scoringResult.sampleCount || (events ? events.length : 0);

    // No events or 0 samples -> 0 confidence in learning
    if (sampleCount === 0) {
      return 0.0;
    }

    // 1. Sample Size Factor (Logistic saturation curve)
    // 1 event -> 0.15, 3 events -> 0.45, 6 events -> 0.72, 10+ events -> 0.90+
    const sampleFactor = 1 - Math.exp(-0.25 * sampleCount);

    // 2. Consistency Ratio (Peak or Dominant ratio)
    const consistencyRatio = scoringResult.dominantRatio || scoringResult.peakRatio || 0.5;

    // 3. Domain Diversity Factor
    // Preferences used across multiple distinct websites carry higher confidence
    const uniqueDomains = new Set(events.map(e => e.domain || 'general')).size;
    const domainFactor = Math.min(1.0, 0.6 + (uniqueDomains * 0.15));

    // 4. Stability Check: If user constantly flips back and forth, reduce confidence
    let stabilityMultiplier = 1.0;
    if (events.length >= 4) {
      const lastFour = events.slice(-4);
      const changes = lastFour.filter((e, idx) => {
        if (idx === 0) return false;
        return e.to !== lastFour[idx - 1].to;
      }).length;
      if (changes >= 3) {
        stabilityMultiplier = 0.7; // Volatile adjustments
      }
    }

    // Composite raw confidence formula
    const rawConfidence = (0.5 * sampleFactor + 0.35 * consistencyRatio + 0.15 * domainFactor) * stabilityMultiplier;

    // Clamp between 0.0 and 0.98 (leave headroom for continuous evolution)
    const finalConfidence = Math.min(0.98, Math.max(0.05, Math.round(rawConfidence * 100) / 100));

    return finalConfidence;
  }

  /**
   * Compute aggregated Reading Comfort Profile dimensions for UI dashboard
   * Dimension categories: Typography, Spacing, Focus, Theme, Motion
   */
  static computeReadingComfortProfile(learnedPreferences = {}, initialProfile = {}) {
    const getDimScore = (key, fallback = 70) => {
      const learned = learnedPreferences[key];
      if (learned && learned.confidence !== undefined) {
        return Math.round(learned.confidence * 100);
      }
      // If user hasn't changed it from initial baseline, comfort is well-aligned with initial setting
      return fallback;
    };

    const typographyScore = Math.round(
      (getDimScore('fontSize', 80) * 0.6) + (getDimScore('fontFamily', 75) * 0.4)
    );

    const spacingScore = Math.round(
      (getDimScore('lineSpacing', 78) * 0.6) + (getDimScore('letterSpacing', 72) * 0.4)
    );

    const focusScore = Math.round(
      (getDimScore('focusMode', 70) * 0.5) + (getDimScore('contentWidth', 75) * 0.5)
    );

    const themeScore = Math.round(
      (getDimScore('theme', 82) * 0.7) + (getDimScore('contrast', 78) * 0.3)
    );

    const motionScore = getDimScore('reducedMotion', 85);

    // Overall Comfort Index (weighted aggregate)
    const overallComfort = Math.round(
      (typographyScore * 0.3) +
      (spacingScore * 0.25) +
      (themeScore * 0.2) +
      (focusScore * 0.15) +
      (motionScore * 0.1)
    );

    return {
      typography: typographyScore,
      spacing: spacingScore,
      focus: focusScore,
      theme: themeScore,
      motion: motionScore,
      overall: overallComfort
    };
  }
}
