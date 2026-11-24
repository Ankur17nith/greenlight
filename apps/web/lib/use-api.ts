'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, client } from './api';

/** Loads a GET endpoint, optionally refreshing every `everyMs`. A 401 clears nothing; the page shows the error. */
export function useApi<T>(path: string, everyMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await client().get<T>(path);
      if (alive.current) { setData(d); setError(null); }
    } catch (e) {
      if (alive.current) setError(e instanceof ApiError ? e : new ApiError(0, 'Cannot reach the server'));
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    void load();
    const t = everyMs ? setInterval(load, everyMs) : undefined;
    return () => { alive.current = false; if (t) clearInterval(t); };
  }, [load, everyMs]);

  return { data, error, reload: load };
}

export function describe(e: ApiError): string {
  if (e.status === 0) return 'Cannot reach the server. Is the API running?';
  if (e.status === 401) return 'The dashboard token was not accepted. Use "Forget token" and enter it again.';
  return e.message;
}
