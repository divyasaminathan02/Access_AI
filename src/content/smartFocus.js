/**
 * AccessAI - Smart Content Focus & Context Detection Engine
 * Classifies page layout structurally without capturing text content.
 * Isolates readability zones, preserves code blocks, and manages the reading ruler.
 */

export class SmartFocusEngine {
  /**
   * Detect structural page category from DOM signals
   */
  static detectPageCategory() {
    if (typeof document === 'undefined') return 'general';

    // 1. Documentation detection
    const codeBlocks = document.querySelectorAll('pre, code, .highlight, .code-snippet, .hljs');
    const docSidebars = document.querySelectorAll('.sidebar, .docs-nav, .table-of-contents, [role="navigation"]');
    if (codeBlocks.length >= 3 || (codeBlocks.length >= 1 && docSidebars.length >= 1)) {
      return 'documentation';
    }

    // 2. Article / News / Blog detection
    const articles = document.querySelectorAll('article, [itemtype*="Article"], [role="article"], .article-body, .entry-content, .post-content');
    const paragraphs = document.querySelectorAll('p');
    if (articles.length >= 1 || (paragraphs.length >= 6 && document.querySelector('h1'))) {
      return 'article';
    }

    // 3. Dashboard / Data App detection
    const charts = document.querySelectorAll('canvas, svg.chart, .metric, .kpi, .dashboard-grid, [data-chart]');
    const tables = document.querySelectorAll('table, .data-grid');
    if (charts.length >= 2 || (charts.length >= 1 && tables.length >= 1)) {
      return 'dashboard';
    }

    // 4. Shopping / E-commerce detection
    const buyButtons = document.querySelectorAll('[class*="add-to-cart"], [id*="add-to-cart"], [class*="product-price"], [itemtype*="Product"]');
    if (buyButtons.length >= 1) {
      return 'shopping';
    }

    // 5. Education / Courseware detection
    const eduSignals = document.querySelectorAll('.quiz, .lesson, .course-outline, .lecture, [class*="exercise"]');
    if (eduSignals.length >= 1) {
      return 'education';
    }

    return 'general';
  }

  /**
   * Find main reading target element without storing text
   */
  static findPrimaryReadingContainer() {
    if (typeof document === 'undefined') return null;

    // Check standard semantic landmarks
    const candidate = document.querySelector('article, main, [role="main"], .main-content, .entry-content, .post-content, #content');
    if (candidate) return candidate;

    // Fallback: search for container with highest paragraph count
    let bestContainer = null;
    let maxParas = 0;
    const containers = document.querySelectorAll('section, div');
    containers.forEach(c => {
      const pCount = c.querySelectorAll(':scope > p, :scope > div > p').length;
      if (pCount > maxParas) {
        maxParas = pCount;
        bestContainer = c;
      }
    });

    return maxParas >= 3 ? bestContainer : document.body;
  }

  /**
   * Apply Context-Aware Smart Focus
   */
  static applyFocusMode(enabled, category = 'general') {
    const existingOverlay = document.getElementById('accessai-focus-style');
    if (existingOverlay) existingOverlay.remove();

    document.querySelectorAll('.accessai-focused-primary').forEach(el => el.classList.remove('accessai-focused-primary'));

    if (!enabled) return;

    const primaryEl = this.findPrimaryReadingContainer();
    if (primaryEl && primaryEl !== document.body) {
      primaryEl.classList.add('accessai-focused-primary');
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'accessai-focus-style';

    if (category === 'documentation') {
      // For docs: preserve code, sidebar, and headers while gently calming surrounding ads/footers
      styleEl.textContent = `
        body:not(:has(#accessai-hud-container)) {
          transition: background-color 0.3s ease;
        }
        aside:not(.docs-nav):not(.sidebar), .ad, .advertisement, [id*="banner"], footer, .sidebar-ad {
          opacity: 0.15 !important;
          transition: opacity 0.3s ease;
        }
        aside:hover, footer:hover {
          opacity: 0.9 !important;
        }
        pre, code {
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `;
    } else {
      // For articles: isolate main reading container
      styleEl.textContent = `
        body.accessai-focus-active > *:not(main):not(article):not(#accessai-hud-container):not(#accessai-ruler-container) {
          opacity: 0.2 !important;
          filter: grayscale(40%) !important;
          transition: all 0.3s ease;
        }
        .accessai-focused-primary {
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.25) !important;
          position: relative !important;
          z-index: 10 !important;
          opacity: 1.0 !important;
          filter: none !important;
          transition: all 0.3s ease;
        }
        aside, .ads, .sidebar-promo, [class*="sponsored"] {
          opacity: 0.1 !important;
          transition: opacity 0.3s ease;
        }
        aside:hover {
          opacity: 0.8 !important;
        }
      `;
    }

    document.head.appendChild(styleEl);
    document.body.classList.add('accessai-focus-active');
  }

  /**
   * Initialize / Toggle Reading Ruler
   */
  static toggleReadingRuler(enabled) {
    let ruler = document.getElementById('accessai-reading-ruler');

    if (!enabled) {
      if (ruler) ruler.remove();
      if (window._accessaiRulerMove) {
        window.removeEventListener('mousemove', window._accessaiRulerMove);
        window._accessaiRulerMove = null;
      }
      return;
    }

    if (!ruler) {
      ruler = document.createElement('div');
      ruler.id = 'accessai-reading-ruler';
      ruler.className = 'accessai-reading-ruler';
      document.body.appendChild(ruler);

      window._accessaiRulerMove = (e) => {
        if (ruler) {
          ruler.style.top = `${e.clientY - 24}px`;
        }
      };
      window.addEventListener('mousemove', window._accessaiRulerMove, { passive: true });
    }
  }
}
