import { useCallback, useEffect, useMemo, useState } from 'react';
import { tr, LOCALES } from '../i18n/strings.js';
import { formatArea, unitSuffix } from '../lib/units.js';
import { SettingsContext } from './settingsContext.js';

const STORAGE_KEY = 'tetris-casa:settings';
const DEFAULTS = { locale: 'en', units: 'meters', view: '2d', viewRotation: 0 };
const LOCALE_CODES = new Set(LOCALES.map(l => l.code));
const UNIT_CODES = new Set(['meters', 'feet']);
const VIEW_CODES = new Set(['2d', 'iso']);
const PATH_LOCALES = new Set(LOCALES.map(l => l.code).filter(c => c !== 'en'));

function localeFromPath() {
  if (typeof window === 'undefined') return null;
  const m = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/i);
  if (!m) return null;
  const code = m[1].toLowerCase();
  return PATH_LOCALES.has(code) ? code : null;
}

function pathForLocale(locale) {
  return locale === 'en' ? '/' : `/${locale}/`;
}

function loadSettings() {
  const urlLocale = localeFromPath();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, locale: urlLocale ?? DEFAULTS.locale };
    const parsed = JSON.parse(raw);
    const rotation = Number.isInteger(parsed.viewRotation)
      ? ((parsed.viewRotation % 4) + 4) % 4
      : DEFAULTS.viewRotation;
    return {
      locale:
        urlLocale ??
        (LOCALE_CODES.has(parsed.locale) ? parsed.locale : DEFAULTS.locale),
      units: UNIT_CODES.has(parsed.units) ? parsed.units : DEFAULTS.units,
      view: VIEW_CODES.has(parsed.view) ? parsed.view : DEFAULTS.view,
      viewRotation: rotation,
    };
  } catch {
    return { ...DEFAULTS, locale: urlLocale ?? DEFAULTS.locale };
  }
}

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }, [settings]);

  // Keep URL in sync with locale, and update <html lang> + canonical link.
  useEffect(() => {
    const desiredPath = pathForLocale(settings.locale);
    if (window.location.pathname !== desiredPath) {
      window.history.replaceState({}, '', desiredPath + window.location.search + window.location.hash);
    }
    document.documentElement.lang = settings.locale;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://tetris.casa${desiredPath}`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://tetris.casa${desiredPath}`);
  }, [settings.locale]);

  // Respond to browser back/forward by re-reading the locale from the path.
  useEffect(() => {
    const onPop = () => {
      const urlLocale = localeFromPath() ?? 'en';
      setSettings(s => (s.locale === urlLocale ? s : { ...s, locale: urlLocale }));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setLocale = useCallback(
    locale => setSettings(s => {
      if (s.locale === locale) return s;
      window.history.pushState({}, '', pathForLocale(locale) + window.location.search + window.location.hash);
      return { ...s, locale };
    }),
    [],
  );
  const setUnits = useCallback(
    units => setSettings(s => (s.units === units ? s : { ...s, units })),
    [],
  );
  const setView = useCallback(
    view => setSettings(s => (s.view === view ? s : { ...s, view })),
    [],
  );
  const rotateView = useCallback(
    () => setSettings(s => ({ ...s, viewRotation: (s.viewRotation + 1) % 4 })),
    [],
  );

  const value = useMemo(() => {
    const t = (key, params) => tr(settings.locale, key, params);
    return {
      ...settings,
      setLocale,
      setUnits,
      setView,
      rotateView,
      t,
      formatArea: cells => formatArea(cells, settings.units),
      unitSuffix: () => unitSuffix(settings.units),
    };
  }, [settings, setLocale, setUnits, setView, rotateView]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
