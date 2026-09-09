/**
 * AccessAI - Local IndexedDB Storage Engine
 * Strictly 100% Client-Side Persistent Storage
 * Zero external telemetry or server transmission
 */

const DB_NAME = 'AccessAI_DB';
const DB_VERSION = 2;

export const DEFAULT_INITIAL_PROFILE = {
  fontFamily: 'Inter',
  fontSize: 16,
  lineSpacing: 1.4,
  letterSpacing: 0,
  theme: 'default', // 'default' | 'warm' | 'dark' | 'high-contrast' | 'dyslexia'
  focusMode: false,
  reducedMotion: false,
  contentWidth: 800,
  contrast: 100,
  readingRuler: false,
  createdAt: new Date().toISOString(),
};

class LearningStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    if (typeof indexedDB === 'undefined') {
      console.warn('[AccessAI] IndexedDB not available, using fallback storage');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Interaction Events Store
        if (!db.objectStoreNames.contains('interaction_events')) {
          const eventsStore = db.createObjectStore('interaction_events', { keyPath: 'id', autoIncrement: true });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('type', 'type', { unique: false });
          eventsStore.createIndex('domain', 'domain', { unique: false });
        }

        // Learned Preferences Store
        if (!db.objectStoreNames.contains('learned_preferences')) {
          db.createObjectStore('learned_preferences', { keyPath: 'dimension' });
        }

        // Reading Sessions Store
        if (!db.objectStoreNames.contains('reading_sessions')) {
          const sessionsStore = db.createObjectStore('reading_sessions', { keyPath: 'id', autoIncrement: true });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionsStore.createIndex('domain', 'domain', { unique: false });
        }

        // Profile Evolution Timeline Store
        if (!db.objectStoreNames.contains('profile_history')) {
          const historyStore = db.createObjectStore('profile_history', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Site Overrides Store
        if (!db.objectStoreNames.contains('site_overrides')) {
          db.createObjectStore('site_overrides', { keyPath: 'domain' });
        }

        // Global Key-Value Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.seedInitialSettings();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[AccessAI] IndexedDB error:', event.target.error);
        resolve(null);
      };
    });
  }

  async getDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  async seedInitialSettings() {
    const initialProfile = await this.getSetting('initialProfile');
    if (!initialProfile) {
      await this.setSetting('initialProfile', DEFAULT_INITIAL_PROFILE);
      await this.setSetting('currentProfile', { ...DEFAULT_INITIAL_PROFILE });
      await this.setSetting('adaptiveLearningEnabled', true);
      await this.setSetting('dismissedSuggestions', []);
      await this.addHistoryEntry({
        title: 'Initial Reading Fingerprint Created',
        description: 'Baseline reading preferences established.',
        timestamp: new Date().toISOString(),
        changes: {}
      });
    }
  }

  // --- Setting Getters / Setters ---
  async getSetting(key, defaultValue = null) {
    const db = await this.getDB();
    if (!db) {
      try {
        const item = localStorage.getItem(`accessai_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
        req.onerror = () => resolve(defaultValue);
      } catch (err) {
        resolve(defaultValue);
      }
    });
  }

  async setSetting(key, value) {
    const db = await this.getDB();
    if (!db) {
      try {
        localStorage.setItem(`accessai_${key}`, JSON.stringify(value));
      } catch (e) {}
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        store.put({ key, value });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // --- Interaction Events ---
  async logInteractionEvent(event) {
    // Strict privacy guarantee: only whitelist permitted fields
    const safeEvent = {
      type: event.type, // e.g. 'font_size_change', 'theme_change'
      dimension: event.dimension || event.type.replace('_change', '').replace('_toggle', ''),
      from: event.from,
      to: event.to,
      domain: event.domain || (typeof window !== 'undefined' ? window.location.hostname : 'unknown'),
      category: event.category || 'general',
      timestamp: event.timestamp || new Date().toISOString()
    };

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('interaction_events', 'readwrite');
        const store = tx.objectStore('interaction_events');
        store.add(safeEvent);
        tx.oncomplete = () => resolve(safeEvent);
        tx.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async getRecentEvents(limit = 200) {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('interaction_events', 'readonly');
        const store = tx.objectStore('interaction_events');
        const index = store.index('timestamp');
        const req = index.openCursor(null, 'prev');
        const events = [];

        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor && events.length < limit) {
            events.push(cursor.value);
            cursor.continue();
          } else {
            resolve(events);
          }
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async getEventsByDimension(dimension, limit = 100) {
    const all = await this.getRecentEvents(limit * 2);
    return all.filter(e => e.dimension === dimension || e.type.includes(dimension)).slice(0, limit);
  }

  // --- Learned Preferences ---
  async saveLearnedPreference(dimension, data) {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('learned_preferences', 'readwrite');
        const store = tx.objectStore('learned_preferences');
        store.put({
          dimension,
          value: data.value,
          confidence: data.confidence,
          observations: data.observations || 1,
          updatedAt: new Date().toISOString(),
          contextSpecific: data.contextSpecific || {}
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getAllLearnedPreferences() {
    const db = await this.getDB();
    if (!db) return {};

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('learned_preferences', 'readonly');
        const store = tx.objectStore('learned_preferences');
        const req = store.getAll();
        req.onsuccess = () => {
          const map = {};
          (req.result || []).forEach(item => {
            map[item.dimension] = item;
          });
          resolve(map);
        };
        req.onerror = () => resolve({});
      } catch {
        resolve({});
      }
    });
  }

  // --- Reading Sessions ---
  async recordReadingSession(session) {
    const db = await this.getDB();
    if (!db) return;

    const safeSession = {
      duration: session.duration || 0, // in seconds
      category: session.category || 'general',
      adjustmentsCount: session.adjustmentsCount || 0,
      domain: session.domain || (typeof window !== 'undefined' ? window.location.hostname : 'unknown'),
      timestamp: session.timestamp || new Date().toISOString()
    };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reading_sessions', 'readwrite');
        const store = tx.objectStore('reading_sessions');
        store.add(safeSession);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getRecentSessions(limit = 20) {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('reading_sessions', 'readonly');
        const store = tx.objectStore('reading_sessions');
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result || []).slice(-limit).reverse());
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // --- Evolution Timeline ---
  async addHistoryEntry(entry) {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('profile_history', 'readwrite');
        const store = tx.objectStore('profile_history');
        store.add({
          title: entry.title,
          description: entry.description,
          changes: entry.changes || {},
          confidence: entry.confidence || null,
          timestamp: entry.timestamp || new Date().toISOString()
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getHistoryEntries(limit = 50) {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('profile_history', 'readonly');
        const store = tx.objectStore('profile_history');
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result || []).slice(-limit).reverse());
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // --- Site Overrides ---
  async getSiteOverride(domain) {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('site_overrides', 'readonly');
        const store = tx.objectStore('site_overrides');
        const req = store.get(domain);
        req.onsuccess = () => resolve(req.result ? req.result.settings : null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async saveSiteOverride(domain, settings) {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('site_overrides', 'readwrite');
        const store = tx.objectStore('site_overrides');
        store.put({ domain, settings, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async getAllSiteOverrides() {
    const db = await this.getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('site_overrides', 'readonly');
        const store = tx.objectStore('site_overrides');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async deleteSiteOverride(domain) {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('site_overrides', 'readwrite');
        const store = tx.objectStore('site_overrides');
        store.delete(domain);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // --- Privacy & Reset Actions ---
  async resetLearnedData() {
    const db = await this.getDB();
    if (!db) return;

    const initial = await this.getSetting('initialProfile', DEFAULT_INITIAL_PROFILE);
    await this.setSetting('currentProfile', { ...initial });

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['interaction_events', 'learned_preferences', 'reading_sessions', 'profile_history'], 'readwrite');
        tx.objectStore('interaction_events').clear();
        tx.objectStore('learned_preferences').clear();
        tx.objectStore('reading_sessions').clear();
        tx.objectStore('profile_history').clear();

        tx.oncomplete = async () => {
          await this.addHistoryEntry({
            title: 'Learning Data Reset',
            description: 'Adaptive learning weights and history cleared. Initial profile retained.',
            timestamp: new Date().toISOString(),
            changes: {}
          });
          resolve(true);
        };
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async restoreInitialFingerprint() {
    const initial = await this.getSetting('initialProfile', DEFAULT_INITIAL_PROFILE);
    await this.setSetting('currentProfile', { ...initial });
    await this.addHistoryEntry({
      title: 'Restored Initial Reading Fingerprint',
      description: 'Active profile reverted to your original baseline settings.',
      timestamp: new Date().toISOString(),
      changes: initial
    });
    return initial;
  }

  async resetAllData() {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(
          ['interaction_events', 'learned_preferences', 'reading_sessions', 'profile_history', 'site_overrides', 'settings'],
          'readwrite'
        );
        tx.objectStore('interaction_events').clear();
        tx.objectStore('learned_preferences').clear();
        tx.objectStore('reading_sessions').clear();
        tx.objectStore('profile_history').clear();
        tx.objectStore('site_overrides').clear();
        tx.objectStore('settings').clear();

        tx.oncomplete = async () => {
          this.seedInitialSettings();
          resolve(true);
        };
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async exportAllData() {
    const db = await this.getDB();
    if (!db) return {};

    const [events, learned, sessions, history, overrides, initialProfile, currentProfile] = await Promise.all([
      this.getRecentEvents(1000),
      this.getAllLearnedPreferences(),
      this.getRecentSessions(100),
      this.getHistoryEntries(100),
      this.getAllSiteOverrides(),
      this.getSetting('initialProfile'),
      this.getSetting('currentProfile')
    ]);

    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      initialProfile,
      currentProfile,
      learnedPreferences: learned,
      recentInteractionsCount: events.length,
      readingSessionsCount: sessions.length,
      evolutionTimeline: history,
      siteOverrides: overrides,
      privacyGuarantee: '100% Client-Side. No webpage text, passwords, or browsing URLs collected.'
    };
  }
}

export const learningStorage = new LearningStorage();
