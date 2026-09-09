/**
 * AccessAI - Adaptive Learning Engine
 * Master Coordinator for real-time interaction observation,
 * gradual preference learning, confidence calculation, and profile evolution.
 */

import { learningStorage, DEFAULT_INITIAL_PROFILE } from './learningStorage.js';
import { PreferenceScoring } from './preferenceScoring.js';
import { ConfidenceEngine } from './confidenceEngine.js';
import { RecommendationEngine } from './recommendationEngine.js';

export class AdaptiveEngine {
  constructor() {
    this.storage = learningStorage;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  /**
   * Record an interaction from AccessAI controls
   */
  async recordInteraction(event) {
    // 1. Check if adaptive learning is enabled
    const isEnabled = await this.storage.getSetting('adaptiveLearningEnabled', true);
    if (!isEnabled) {
      return { learned: false, reason: 'adaptive_learning_disabled' };
    }

    // 2. Log safe interaction event
    const logged = await this.storage.logInteractionEvent(event);
    if (!logged) return { learned: false };

    const dimension = logged.dimension;

    // 3. Retrieve event history for this dimension
    const dimensionEvents = await this.storage.getEventsByDimension(dimension, 100);
    const initialProfile = await this.storage.getSetting('initialProfile', DEFAULT_INITIAL_PROFILE);
    const currentProfile = await this.storage.getSetting('currentProfile', { ...DEFAULT_INITIAL_PROFILE });
    const initialValue = initialProfile[dimension];

    // 4. Calculate Preference Scoring & Confidence
    let scoringResult;
    if (typeof initialValue === 'number') {
      const step = dimension === 'lineSpacing' ? 0.05 : (dimension === 'letterSpacing' ? 0.2 : 1);
      scoringResult = PreferenceScoring.scoreNumeric(dimensionEvents, initialValue, step);
    } else {
      scoringResult = PreferenceScoring.scoreCategorical(dimensionEvents, initialValue);
    }

    const confidence = ConfidenceEngine.calculateConfidence(scoringResult, dimensionEvents, initialValue);

    // 5. Store updated learned preference record
    const learnedData = {
      value: scoringResult.preferredValue,
      confidence,
      observations: dimensionEvents.length,
      directionality: scoringResult.directionality || 'neutral'
    };

    await this.storage.saveLearnedPreference(dimension, learnedData);

    // 6. Check if criteria met for subtle automatic evolution (high confidence & repeated behavior)
    let profileUpdated = false;
    if (confidence >= 0.82 && dimensionEvents.length >= 4 && currentProfile[dimension] !== learnedData.value) {
      const oldVal = currentProfile[dimension];
      const newVal = learnedData.value;

      currentProfile[dimension] = newVal;
      await this.storage.setSetting('currentProfile', currentProfile);

      // Log evolution event to timeline
      await this.storage.addHistoryEntry({
        title: `Learned Preference Updated: ${this.formatDimensionName(dimension)}`,
        description: `AccessAI observed consistent adjustments. Preferred ${this.formatDimensionName(dimension).toLowerCase()} evolved from ${oldVal} to ${newVal}.`,
        changes: { [dimension]: { from: oldVal, to: newVal } },
        confidence: Math.round(confidence * 100),
        timestamp: new Date().toISOString()
      });

      profileUpdated = true;
    }

    const fullState = await this.getFullState();
    this.notifyListeners(fullState);

    return {
      learned: true,
      dimension,
      learnedData,
      profileUpdated
    };
  }

  formatDimensionName(dim) {
    const map = {
      fontSize: 'Font Size',
      fontFamily: 'Typography',
      lineSpacing: 'Line Spacing',
      letterSpacing: 'Letter Spacing',
      theme: 'Reading Theme',
      focusMode: 'Focus Mode',
      reducedMotion: 'Motion Preference',
      contentWidth: 'Content Width',
      contrast: 'Contrast'
    };
    return map[dim] || dim;
  }

  /**
   * Get complete adaptive state for UI dashboards and popup
   */
  async getFullState(pageCategory = 'general', currentSession = null) {
    const [
      initialProfile,
      currentProfile,
      learnedPreferences,
      recentEvents,
      historyEntries,
      adaptiveEnabled,
      dismissedList,
      siteOverrides
    ] = await Promise.all([
      this.storage.getSetting('initialProfile', DEFAULT_INITIAL_PROFILE),
      this.storage.getSetting('currentProfile', DEFAULT_INITIAL_PROFILE),
      this.storage.getAllLearnedPreferences(),
      this.storage.getRecentEvents(100),
      this.storage.getHistoryEntries(30),
      this.storage.getSetting('adaptiveLearningEnabled', true),
      this.storage.getSetting('dismissedSuggestions', []),
      this.storage.getAllSiteOverrides()
    ]);

    const comfortProfile = ConfidenceEngine.computeReadingComfortProfile(learnedPreferences, initialProfile);
    const insights = RecommendationEngine.getHumanInsightList(learnedPreferences, recentEvents);
    const recommendations = RecommendationEngine.generateRecommendations({
      currentProfile,
      learnedPreferences,
      recentEvents,
      pageCategory,
      session: currentSession,
      dismissedList
    });

    return {
      initialProfile: initialProfile || DEFAULT_INITIAL_PROFILE,
      currentProfile: currentProfile || DEFAULT_INITIAL_PROFILE,
      learnedPreferences: learnedPreferences || {},
      comfortProfile,
      insights,
      recommendations,
      evolutionTimeline: historyEntries || [],
      adaptiveLearningEnabled: !!adaptiveEnabled,
      siteOverrides: siteOverrides || []
    };
  }

  /**
   * Apply a user-approved recommendation
   */
  async applyRecommendation(recId, dimension, value, isPermanent = true) {
    if (isPermanent) {
      const currentProfile = await this.storage.getSetting('currentProfile', DEFAULT_INITIAL_PROFILE);
      const oldVal = currentProfile[dimension];
      currentProfile[dimension] = value;
      await this.storage.setSetting('currentProfile', currentProfile);

      await this.storage.addHistoryEntry({
        title: `Recommendation Approved: ${this.formatDimensionName(dimension)}`,
        description: `User accepted suggestion to update ${this.formatDimensionName(dimension).toLowerCase()} to ${value}.`,
        changes: { [dimension]: { from: oldVal, to: value } },
        timestamp: new Date().toISOString()
      });
    }

    // Dismiss this recommendation from active list
    const dismissed = await this.storage.getSetting('dismissedSuggestions', []);
    if (!dismissed.includes(recId)) {
      dismissed.push(recId);
      await this.storage.setSetting('dismissedSuggestions', dismissed);
    }

    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Dismiss or mute a recommendation
   */
  async dismissRecommendation(recId) {
    const dismissed = await this.storage.getSetting('dismissedSuggestions', []);
    if (!dismissed.includes(recId)) {
      dismissed.push(recId);
      await this.storage.setSetting('dismissedSuggestions', dismissed);
    }
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Toggle Adaptive Learning On/Off
   */
  async setAdaptiveLearningEnabled(enabled) {
    await this.storage.setSetting('adaptiveLearningEnabled', !!enabled);
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Update active profile manually
   */
  async updateCurrentProfile(newSettings) {
    const current = await this.storage.getSetting('currentProfile', DEFAULT_INITIAL_PROFILE);
    const updated = { ...current, ...newSettings };
    await this.storage.setSetting('currentProfile', updated);
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Restore initial fingerprint baseline
   */
  async restoreInitialFingerprint() {
    await this.storage.restoreInitialFingerprint();
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Reset learned preferences while keeping initial fingerprint
   */
  async resetLearnedPreferences() {
    await this.storage.resetLearnedData();
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }

  /**
   * Reset everything to factory state
   */
  async resetEverything() {
    await this.storage.resetAllData();
    const state = await this.getFullState();
    this.notifyListeners(state);
    return state;
  }
}

export const adaptiveEngine = new AdaptiveEngine();
