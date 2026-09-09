/**
 * AccessAI - Privacy & Security Manager
 * Strictly enforces client-side execution boundaries, input exclusion,
 * and zero external telemetry transmission.
 */

import { learningStorage } from '../learning/learningStorage.js';

export const EXCLUDED_SELECTORS = [
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  '[type="password"]',
  '[type="email"]',
  '[type="tel"]',
  '.accessai-ignore',
  '#accessai-hud-container',
  '#accessai-ruler-container'
];

export class PrivacyManager {
  /**
   * Check if a DOM element is excluded from font/style overrides
   */
  static isExcludedElement(el) {
    if (!el || !el.matches) return true;
    for (const sel of EXCLUDED_SELECTORS) {
      if (el.matches(sel) || el.closest(sel)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate and sanitize interaction payload before storage
   */
  static sanitizeEvent(event) {
    const ALLOWED_TYPES = [
      'font_change',
      'font_size_change',
      'line_spacing_change',
      'letter_spacing_change',
      'theme_change',
      'focus_mode_toggle',
      'animation_toggle',
      'content_width_change',
      'contrast_change',
      'ruler_toggle'
    ];

    if (!ALLOWED_TYPES.includes(event.type)) {
      console.warn(`[AccessAI Privacy] Rejected unrecognized event type: ${event.type}`);
      return null;
    }

    // Explicitly reject any fields that look like text or inputs
    const clean = {
      type: event.type,
      dimension: event.dimension,
      from: typeof event.from === 'object' ? null : event.from,
      to: typeof event.to === 'object' ? null : event.to,
      domain: event.domain || (typeof window !== 'undefined' ? window.location.hostname : 'unknown'),
      category: event.category || 'general',
      timestamp: new Date().toISOString()
    };

    return clean;
  }

  /**
   * Privacy status checklist for the Privacy Center UI
   */
  static getPrivacyChecklist() {
    return [
      {
        title: '100% Local In-Browser Processing',
        description: 'All scoring, confidence calculations, and fingerprint evolution happen entirely in your local browser.',
        status: 'active',
        badge: 'Verified Local'
      },
      {
        title: 'Zero Webpage Content or Text Collection',
        description: 'AccessAI never reads, copies, or stores words, article text, or page copy from sites you visit.',
        status: 'active',
        badge: 'Zero Text Read'
      },
      {
        title: 'Form Inputs & Passwords Never Accessed',
        description: 'All inputs, textareas, password fields, and contenteditable elements are strictly excluded by design.',
        status: 'active',
        badge: 'Strictly Excluded'
      },
      {
        title: 'No Browsing History Stored',
        description: 'Only high-level site context categories (e.g. article, doc) are used transiently. Full URLs and paths are never retained.',
        status: 'active',
        badge: 'No URLs Kept'
      },
      {
        title: 'Zero External Data Transmission',
        description: 'No telemetry servers, tracking pixels, third-party analytics, or cloud sync.',
        status: 'active',
        badge: 'No Cloud Sync'
      }
    ];
  }

  static async exportData() {
    return await learningStorage.exportAllData();
  }

  static async deleteLearningData() {
    return await learningStorage.resetLearnedData();
  }

  static async resetAllData() {
    return await learningStorage.resetAllData();
  }
}
