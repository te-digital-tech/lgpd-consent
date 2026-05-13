export { createConsentManager } from './manager.js';
export type {
  ConsentCategory,
  ConsentConfig,
  ConsentEvent,
  ConsentManager,
  ConsentPreferences,
  ConsentState,
  ConsentStatus,
  ConsentStrings,
  IntegrationsConfig,
  StorageStrategy,
} from './types.js';
export { isPolicyStale } from './version.js';
export { exportConsentLog, exportConsentLogJson } from './export.js';
export type { ConsentLogRecord } from './export.js';
export { resolveGeoGate } from './geo.js';
export type { GeoDecision, GeoPolicy } from './geo.js';
export { createAuditRecorder } from './audit.js';
export type { AuditRecorder, AuditSink, BannerAuditEvent } from './audit.js';
export {
  DEFAULT_COOKIE_CATALOG,
  clearCookiesByCategory,
  scanCookies,
} from './cookies.js';
export type { CookieCatalog, ScannedCookie } from './cookies.js';
