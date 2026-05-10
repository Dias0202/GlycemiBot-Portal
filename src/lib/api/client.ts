const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "X-Requested-With": "fetch" },
  });
  if (!res.ok) throw new Error("Refresh failed");
}

async function apiFetch<T>(path: string, init?: RequestInit, allowRetry = true): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "X-Requested-With": "fetch",
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    if (allowRetry) {
      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return apiFetch<T>(path, init, false);
      } catch {
        // refresh failed
      }
    }
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface AuthResponse { tokenType: string }
export interface LoginPayload { email: string; password: string }

export interface PractitionerMe {
  id: string;
  name: string;
  role: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  diabetesType: string;
  currentGlucose: number;
  glucoseTrend: string;
  lastSyncedAt: string;
}

export const api = {
  auth: {
    login: (data: LoginPayload) =>
      apiFetch<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () =>
      apiFetch<void>("/api/v1/auth/logout", { method: "POST" }),
  },
  portal: {
    me: () => apiFetch<PractitionerMe>("/api/v1/portal/me"),
    patients: () => apiFetch<PatientSummary[]>("/api/v1/portal/patients"),
  },
};
