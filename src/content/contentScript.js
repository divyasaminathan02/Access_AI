/**
 * AccessAI - Content Script & Website Personalization Engine
 * Injects non-destructive accessibility overrides and mounts the floating HUD.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingHUD } from './floatingHUD.jsx';
import { SmartFocusEngine } from './smartFocus.js';
import { sessionTracker } from '../analytics/readingSession.js';
import { adaptiveEngine } from '../learning/adaptiveEngine.js';
import { learningStorage, DEFAULT_INITIAL_PROFILE } from '../learning/learningStorage.js';

let styleElement = null;

function getPersonalizationCSS(profile) {
  if (!profile) return '';

  const themeStyles = {
    default: '',
    warm: `
      body, html {
        background-color: #fbf4e2 !important;
        color: #2e261a !important;
      }
      p, li, article, section, h1, h2, h3, h4, h5, h6, span {
        color: #2e261a !important;
      }
      a { color: #8c4b18 !important; text-decoration: underline !important; }
    `,
    dark: `
      body, html {
        background-color: #121824 !important;
        color: #e2e8f0 !important;
      }
      p, li, article, section, h1, h2, h3, h4, h5, h6, span {
        color: #e2e8f0 !important;
      }
      a { color: #60a5fa !important; text-decoration: underline !important; }
    `,
    dyslexia: `
      body, html {
        background-color: #f4edd8 !important;
        color: #1a1e24 !important;
      }
      p, li, article, section, h1, h2, h3, h4, h5, h6, span {
        color: #1a1e24 !important;
      }
      a { color: #1e3a8a !important; font-weight: 600 !important; }
    `,
    'high-contrast': `
      body, html {
        background-color: #000000 !important;
        color: #ffff00 !important;
      }
      p, li, article, section, h1, h2, h3, h4, h5, h6, span {
        color: #ffff00 !important;
      }
      a { color: #00ffff !important; text-decoration: underline !important; font-weight: bold !important; }
    `
  };

  const fontFamilies = {
    'Inter': 'Inter, system-ui, sans-serif',
    'Lexend': 'Lexend, system-ui, sans-serif',
    'Atkinson Hyperlegible': '"Atkinson Hyperlegible", sans-serif',
    'Merriweather': '"Merriweather", Georgia, serif',
    'OpenDyslexic': '"OpenDyslexic", sans-serif'
  };

  const chosenFont = fontFamilies[profile.fontFamily] || profile.fontFamily || 'inherit';

  return `
    /* AccessAI Global Reading Overrides */
    p, li, dd, dt, blockquote, .reading-text, article p {
      font-family: ${chosenFont} !important;
      font-size: ${profile.fontSize}px !important;
      line-height: ${profile.lineSpacing} !important;
      letter-spacing: ${profile.letterSpacing || 0}px !important;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: ${chosenFont} !important;
      letter-spacing: ${(profile.letterSpacing || 0) * 0.5}px !important;
    }

    ${profile.reducedMotion ? `
      *, *::before, *::after {
        animation-duration: 0.001s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001s !important;
        scroll-behavior: auto !important;
      }
    ` : ''}

    ${profile.contentWidth && profile.contentWidth < 1200 ? `
      article, main, .main-content, .entry-content, .post-content {
        max-width: ${profile.contentWidth}px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
    ` : ''}

    ${themeStyles[profile.theme] || ''}
  `;
}

function applyProfile(profile) {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'accessai-injected-styles';
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = getPersonalizationCSS(profile);
}

async function initContentScript() {
  if (window._accessaiInitialized) return;
  window._accessaiInitialized = true;

  const pageCategory = SmartFocusEngine.detectPageCategory();
  sessionTracker.startSession(pageCategory, window.location.hostname);

  // Load active profile and per-site override if any
  const currentProfile = await learningStorage.getSetting('currentProfile', DEFAULT_INITIAL_PROFILE);
  const initialProfile = await learningStorage.getSetting('initialProfile', DEFAULT_INITIAL_PROFILE);
  const siteOverride = await learningStorage.getSiteOverride(window.location.hostname);

  const activeProfile = siteOverride ? { ...currentProfile, ...siteOverride } : currentProfile;
  applyProfile(activeProfile);

  // Mount Floating HUD
  const hudContainer = document.createElement('div');
  hudContainer.id = 'accessai-hud-container';
  document.body.appendChild(hudContainer);

  const root = createRoot(hudContainer);
  root.render(
    <FloatingHUD
      initialProfile={initialProfile}
      currentProfile={activeProfile}
      pageCategory={pageCategory}
    />
  );

  // Listen for local profile update events from HUD
  window.addEventListener('accessai:apply_profile', (e) => {
    if (e.detail) {
      applyProfile(e.detail);
    }
  });

  // Handle session cleanup on page leave
  window.addEventListener('beforeunload', () => {
    sessionTracker.endSession();
  });
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
