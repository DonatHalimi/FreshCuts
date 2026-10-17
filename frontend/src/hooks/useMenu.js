import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getMenu } from '../services/menus.api.js';

const CACHE_TTL_MS = 60_000;
const cache = new Map();
const inFlight = new Map();
const generations = new Map();

export function useMenu(menuKey) {
  const role = useSelector((state) => state.auth.user?.role ?? 'guest');
  const cacheKey = `${menuKey}:${role}`;
  const [state, setState] = useState(() => ({
    menu: cache.get(cacheKey)?.menu ?? null,
    loading: !cache.has(cacheKey),
    error: '',
  }));

  useEffect(() => {
    let current = true;
    const load = (force = false) => {
      const cached = cache.get(cacheKey);
      if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setState({ menu: cached.menu, loading: false, error: '' });
        return;
      }

      setState((previous) => ({ ...previous, loading: true, error: '' }));
      let request = inFlight.get(cacheKey);
      const generation = generations.get(cacheKey) ?? 0;
      if (!request) {
        request = getMenu(menuKey).finally(() => {
          if (inFlight.get(cacheKey) === request) inFlight.delete(cacheKey);
        });
        inFlight.set(cacheKey, request);
      }

      request.then((menu) => {
        if ((generations.get(cacheKey) ?? 0) !== generation) return;
        cache.set(cacheKey, { menu, timestamp: Date.now() });
        if (current) setState({ menu, loading: false, error: '' });
      }).catch((error) => {
        if ((generations.get(cacheKey) ?? 0) !== generation) return;
        if (current) setState({ menu: null, loading: false, error: error.message });
      });
    };

    const handleUpdate = () => load(true);
    load();
    window.addEventListener('freshcuts:menus-updated', handleUpdate);
    return () => {
      current = false;
      window.removeEventListener('freshcuts:menus-updated', handleUpdate);
    };
  }, [menuKey, cacheKey]);

  return state;
}

export function clearMenuCache(menuKey) {
  const keys = new Set([...cache.keys(), ...inFlight.keys()]);
  for (const key of keys) {
    if (!menuKey || key.startsWith(`${menuKey}:`)) {
      cache.delete(key);
      inFlight.delete(key);
      generations.set(key, (generations.get(key) ?? 0) + 1);
    }
  }
}
