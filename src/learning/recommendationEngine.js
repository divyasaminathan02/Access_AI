/**
 * AccessAI - Explainable Recommendation Engine
 * Deterministic, local recommendation architecture.
 * Formats actionable suggestions with transparent, human-readable rationales.
 */

export class RecommendationEngine {
  /**
   * Generate contextual suggestions based on current profile, learned preferences, and session state
   */
  static generateRecommendations({
    currentProfile = {},
    learnedPreferences = {},
    recentEvents = [],
    pageCategory = 'general',
    session = null,
    dismissedList = []
  }) {
    const recommendations = [];
    const dismissedSet = new Set(dismissedList || []);

    // 1. Check for Learned Profile Evolution Prompts (High Confidence Learned Traits)
    Object.entries(learnedPreferences).forEach(([dimension, learned]) => {
      const recId = `evolve_${dimension}_${learned.value}`;
      if (dismissedSet.has(recId)) return;

      const currentValue = currentProfile[dimension];
      const hasSignificantDiff = currentValue !== learned.value;

      if (hasSignificantDiff && learned.confidence >= 0.75 && learned.observations >= 3) {
        let label = dimension;
        let unit = '';
        if (dimension === 'fontSize') { label = 'Text Size'; unit = 'px'; }
        else if (dimension === 'lineSpacing') { label = 'Line Spacing'; unit = 'x'; }
        else if (dimension === 'theme') { label = 'Reading Theme'; }
        else if (dimension === 'focusMode') { label = 'Focus Mode'; }

        recommendations.push({
          id: recId,
          type: 'profile_evolution',
          targetDimension: dimension,
          suggestedValue: learned.value,
          confidence: learned.confidence,
          title: `Update ${label} in your Reading Fingerprint?`,
          reason: 'frequent_manual_adjustments',
          explanation: `AccessAI noticed that you frequently adjust ${label.toLowerCase()} to ${learned.value}${unit} (${Math.round(learned.confidence * 100)}% confidence). Would you like to save this as your default?`,
          actions: [
            { label: 'Update Profile', action: 'apply_profile' },
            { label: 'Keep Current', action: 'dismiss' },
            { label: "Don't Ask Again", action: 'mute' }
          ]
        });
      }
    });

    // 2. Context-Specific Recommendations (Articles, Documentation, Dashboard)
    if (pageCategory === 'article' || pageCategory === 'education') {
      const recId = 'context_article_focus';
      if (!dismissedSet.has(recId) && !currentProfile.focusMode) {
        // If user frequently enabled focus mode in past article sessions
        const articleFocusEvents = recentEvents.filter(e => e.type === 'focus_mode_toggle' && (e.category === 'article' || e.to === true));
        if (articleFocusEvents.length >= 2 || (session && session.duration > 180)) {
          recommendations.push({
            id: recId,
            type: 'context_adaptation',
            targetDimension: 'focusMode',
            suggestedValue: true,
            confidence: 0.82,
            title: 'Long Article Detected',
            reason: 'long_article_distraction_reduction',
            explanation: 'You are reading a long article. Would you like to enable Smart Focus Mode to reduce surrounding sidebar distractions?',
            actions: [
              { label: 'Enable Focus Mode', action: 'apply_transient' },
              { label: 'Not Now', action: 'dismiss' },
              { label: "Don't Ask Again", action: 'mute' }
            ]
          });
        }
      }
    }

    if (pageCategory === 'documentation') {
      const recId = 'context_doc_spacing';
      if (!dismissedSet.has(recId) && (currentProfile.lineSpacing || 1.4) < 1.6) {
        recommendations.push({
          id: recId,
          type: 'context_adaptation',
          targetDimension: 'lineSpacing',
          suggestedValue: 1.6,
          confidence: 0.78,
          title: 'Technical Documentation View',
          reason: 'documentation_readability',
          explanation: 'AccessAI can optimize typography for technical documentation while preserving code block formatting.',
          actions: [
            { label: 'Increase Spacing', action: 'apply_transient' },
            { label: 'Keep Standard', action: 'dismiss' }
          ]
        });
      }
    }

    // 3. Fatigue-Inspired Adaptation Heuristic (Non-Medical Behavioral Observation)
    if (session && session.duration >= 600 && session.adjustmentsCount >= 3) {
      const recId = `fatigue_session_${Math.floor(session.duration / 600)}`;
      if (!dismissedSet.has(recId)) {
        recommendations.push({
          id: recId,
          type: 'fatigue_comfort',
          targetDimension: 'theme',
          suggestedValue: 'warm',
          confidence: 0.85,
          title: 'Extended Reading Session',
          reason: 'extended_session_comfort_adjustment',
          explanation: 'You have been actively reading for an extended session with multiple adjustments. Would you like to switch to the Warm Reading Theme for softer contrast?',
          actions: [
            { label: 'Enable Warm Theme', action: 'apply_transient' },
            { label: 'No Thanks', action: 'dismiss' }
          ]
        });
      }
    }

    return recommendations;
  }

  /**
   * Explainable summary text for dashboard insights
   */
  static getHumanInsightList(learnedPreferences = {}, events = []) {
    const insights = [];

    if (learnedPreferences.fontSize && learnedPreferences.fontSize.confidence >= 0.6) {
      const val = learnedPreferences.fontSize.value;
      if (val > 16) {
        insights.push({
          id: 'insight_font_size',
          category: 'Typography',
          text: `You usually prefer larger text (~${val}px) for comfortable reading.`,
          confidence: learnedPreferences.fontSize.confidence,
          icon: 'type'
        });
      } else if (val < 16) {
        insights.push({
          id: 'insight_font_size',
          category: 'Typography',
          text: `You tend to prefer compact text (~${val}px) to view more content at once.`,
          confidence: learnedPreferences.fontSize.confidence,
          icon: 'type'
        });
      }
    }

    if (learnedPreferences.lineSpacing && learnedPreferences.lineSpacing.confidence >= 0.6) {
      const val = learnedPreferences.lineSpacing.value;
      if (val >= 1.6) {
        insights.push({
          id: 'insight_line_spacing',
          category: 'Spacing',
          text: 'You often use increased line spacing to separate dense paragraphs.',
          confidence: learnedPreferences.lineSpacing.confidence,
          icon: 'align-justify'
        });
      }
    }

    if (learnedPreferences.theme && learnedPreferences.theme.confidence >= 0.6) {
      const themeName = learnedPreferences.theme.value;
      if (themeName === 'warm') {
        insights.push({
          id: 'insight_theme_warm',
          category: 'Theme',
          text: 'You prefer warm parchment backgrounds for extended reading sessions.',
          confidence: learnedPreferences.theme.confidence,
          icon: 'sun'
        });
      } else if (themeName === 'dark') {
        insights.push({
          id: 'insight_theme_dark',
          category: 'Theme',
          text: 'You consistently opt for dark mode to reduce ambient glare.',
          confidence: learnedPreferences.theme.confidence,
          icon: 'moon'
        });
      } else if (themeName === 'dyslexia') {
        insights.push({
          id: 'insight_theme_dyslexia',
          category: 'Theme',
          text: 'You prefer specialized tint and weighted letter spacing.',
          confidence: learnedPreferences.theme.confidence,
          icon: 'book-open'
        });
      }
    }

    if (learnedPreferences.focusMode && learnedPreferences.focusMode.confidence >= 0.6) {
      insights.push({
        id: 'insight_focus',
        category: 'Focus',
        text: 'You frequently enable Focus Mode on multi-paragraph articles.',
        confidence: learnedPreferences.focusMode.confidence,
        icon: 'scan'
      });
    }

    if (learnedPreferences.reducedMotion && learnedPreferences.reducedMotion.confidence >= 0.6) {
      insights.push({
        id: 'insight_motion',
        category: 'Motion',
        text: 'You prefer reduced animations to prevent visual distractions.',
        confidence: learnedPreferences.reducedMotion.confidence,
        icon: 'sparkles'
      });
    }

    // Default friendly observation if starting fresh
    if (insights.length === 0) {
      insights.push({
        id: 'insight_initial',
        category: 'System',
        text: 'AccessAI is observing your natural reading habits. Insights will appear as you interact with controls.',
        confidence: 0.5,
        icon: 'sparkles'
      });
    }

    return insights;
  }
}
