// A fake browser for the GA4 transport: no network, no DOM. Records what the transport would do.
export function makeEnv({ href = "https://keepitunderground.com/", referrer = "", stored = null, storageBlocked = false, throwOnScript = false } = {}) {
  const win = {};
  const state = { href, referrer, scripts: [], cookieWrites: [], store: new Map(), win };
  if (stored) state.store.set("kpt-analytics-consent-v1", stored);
  const storage = storageBlocked
    ? { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } }
    : { getItem: (k) => state.store.get(k) ?? null, setItem: (k, v) => void state.store.set(k, v) };
  const env = {
    win,
    location: () => { const u = new URL(state.href); return { href: u.href, origin: u.origin, pathname: u.pathname }; },
    referrer: () => state.referrer,
    hostname: new URL(href).hostname,
    storage,
    cookies: { read: () => "", write: (c) => void state.cookieWrites.push(c) },
    appendScript: (src, onLoad, onError) => {
      if (throwOnScript) throw new Error("append failed");
      state.scripts.push({ src, onLoad, onError });
    },
  };
  return {
    env, state,
    go: (url) => { state.href = new URL(url, state.href).href; },
    /** The gtag commands in the layer as plain arrays. */
    commands: () => (win.kptGa4Layer ?? []).map((e) => Array.from(e)),
    /** The layer entries as pushed: each must be a real `arguments` object. */
    rawEntries: () => win.kptGa4Layer ?? [],
    events: (name) => (win.kptGa4Layer ?? []).map((e) => Array.from(e)).filter((c) => c[0] === "event" && (name === undefined || c[1] === name)),
  };
}
export const GOOD_ID = "G-MOCKTEST01";
export const ACTIVE = { measurementId: GOOD_ID, ownerActivation: true };
