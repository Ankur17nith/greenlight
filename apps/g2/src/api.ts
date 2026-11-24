import type { CardView } from "./render";

export interface QueueCard extends CardView { id: string }
export class ApiError extends Error {
  constructor(public status: number, message = `HTTP ${status}`) { super(message); }
}

export interface Api {
  queue(): Promise<QueueCard[]>;
  act(id: string, action: "APPROVE" | "DECLINE" | "SNOOZE"): Promise<{ status: string; write_back: string }>;
}

/** HTTP client. Status 0 means the network failed. Only the session token is held here, never provider keys. */
export function httpApi(baseUrl: string, getToken: () => string | null, f: typeof fetch = fetch): Api {
  const call = async (path: string, init: RequestInit = {}) => {
    const token = getToken();
    let res: Response;
    try {
      res = await f(baseUrl + path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` } });
    } catch { throw new ApiError(0, "network"); }
    if (!res.ok) throw new ApiError(res.status);
    return res.json();
  };
  return {
    queue: async () => (await call("/api/queue")).cards,
    act: (id, action) => call(`/api/decisions/${id}/act`, { method: "POST", body: JSON.stringify({ action }) }),
  };
}

export async function exchangeCode(baseUrl: string, code: string, f: typeof fetch = fetch): Promise<string> {
  let res: Response;
  try {
    res = await f(`${baseUrl}/api/pair/exchange`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
  } catch { throw new ApiError(0, "network"); }
  if (!res.ok) throw new ApiError(res.status, "Code is invalid, used or expired");
  return (await res.json()).token as string;
}
