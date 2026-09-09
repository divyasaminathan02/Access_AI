/**
 * AccessAI - Reading Session Analytics
 * Lightweight, strictly private session observation.
 * Tracks session duration, context category, and adjustment frequency.
 * Strictly NO page text or private telemetry.
 */

import { learningStorage } from '../learning/learningStorage.js';

export class ReadingSessionTracker {
  constructor() {
    this.currentSession = null;
    this.timerInterval = null;
  }

  startSession(category = 'general', domain = '') {
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      startTime: Date.now(),
      category,
      domain: domain || (typeof window !== 'undefined' ? window.location.hostname : 'unknown'),
      adjustmentsCount: 0,
      duration: 0
    };

    if (typeof window !== 'undefined') {
      // Periodic duration updater
      this.timerInterval = setInterval(() => {
        if (this.currentSession) {
          this.currentSession.duration = Math.floor((Date.now() - this.currentSession.startTime) / 1000);
        }
      }, 10000);
    }

    return this.currentSession;
  }

  recordAdjustment() {
    if (!this.currentSession) {
      this.startSession();
    }
    this.currentSession.adjustmentsCount += 1;
    return this.currentSession.adjustmentsCount;
  }

  setCategory(category) {
    if (this.currentSession) {
      this.currentSession.category = category;
    }
  }

  async endSession() {
    if (!this.currentSession) return null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const duration = Math.max(1, Math.floor((Date.now() - this.currentSession.startTime) / 1000));
    const sessionData = {
      duration,
      category: this.currentSession.category,
      adjustmentsCount: this.currentSession.adjustmentsCount,
      domain: this.currentSession.domain,
      timestamp: new Date().toISOString()
    };

    // Only record sessions longer than 15 seconds to avoid noise
    if (duration >= 15) {
      await learningStorage.recordReadingSession(sessionData);
    }

    const completed = { ...sessionData };
    this.currentSession = null;
    return completed;
  }

  getCurrentSession() {
    if (!this.currentSession) return null;
    return {
      ...this.currentSession,
      duration: Math.floor((Date.now() - this.currentSession.startTime) / 1000)
    };
  }
}

export const sessionTracker = new ReadingSessionTracker();
