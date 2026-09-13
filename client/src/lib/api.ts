export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const TOKEN_KEY = "afterglow_token";
export const UNAUTHORIZED_EVENT = "afterglow:unauthorized";

export type User = { id: number; email: string; name: string; avatarUrl: string | null };
export type PublicUser = Pick<User, "id" | "name" | "avatarUrl">;

export type Pool = {
  id: number;
  name: string;
  ownerId: number;
  inviteCode: string;
  createdAt: string;
};

export type PoolSummary = Pool & {
  _count: { members: number; photos: number };
  photos: { id: number; thumbnailUrl: string | null }[];
};

export type PoolDetail = Pool & {
  _count: { photos: number };
  members: { role: string; user: PublicUser }[];
};

export type Photo = {
  id: number;
  poolId: number;
  uploaderId: number;
  storageUrl: string;
  thumbnailUrl: string | null;
  takenAt: string | null;
  uploadedAt: string;
  uploader?: PublicUser;
};

type AuthResponse = { user: User; token: string };

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");

export const assetUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${API_URL}${path}`);

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

const humanize = (msg: unknown) =>
  typeof msg === "string" && msg.length > 0 ? msg[0].toUpperCase() + msg.slice(1) : undefined;

function handleUnauthorized() {
  tokenStore.clear();
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0, null);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) handleUnauthorized();
    throw new ApiError(humanize(data?.error) ?? `Request failed (${res.status})`, res.status, data);
  }

  return data as T;
}

function uploadPhoto(poolId: number, file: File, onProgress?: (percent: number) => void) {
  return new Promise<Photo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/photos/${poolId}/upload`);

    const token = tokenStore.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as Photo);
      } else {
        if (xhr.status === 401) handleUnauthorized();
        reject(new ApiError(humanize(data?.error) ?? "Upload failed", xhr.status, data));
      }
    };

    xhr.onerror = () => reject(new ApiError("Network error during upload", 0, null));

    const form = new FormData();
    form.append("photo", file);
    xhr.send(form);
  });
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/auth/signup", { method: "POST", body }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body }),
    google: (credential: string) =>
      request<AuthResponse>("/auth/google", { method: "POST", body: { credential } }),
    me: () => request<{ user: User }>("/auth/me"),
  },
  pools: {
    list: () => request<{ pools: PoolSummary[] }>("/pools"),
    get: (poolId: number) => request<{ pool: PoolDetail; role: string }>(`/pools/${poolId}`),
    create: (name: string) => request<{ pool: Pool }>("/pools", { method: "POST", body: { name } }),
    join: (inviteCode: string) => request<{ pool: Pool }>("/pools/join", { method: "POST", body: { inviteCode } }),
  },
  photos: {
    list: (poolId: number) => request<{ photos: Photo[] }>(`/photos/${poolId}`),
    upload: uploadPhoto,
    remove: (poolId: number, photoId: number) =>
      request<null>(`/photos/${poolId}/${photoId}`, { method: "DELETE" }),
  },
};
