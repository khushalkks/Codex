// src/config.ts

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:8000";
};

export const API_BASE_URL = getBaseUrl();

export const getWsUrl = (path: string): string => {
  // If API_BASE_URL is https://..., replaces https with wss. If http://..., replaces http with ws.
  const base = API_BASE_URL.replace(/^http/, "ws");
  return `${base}${path}`;
};
