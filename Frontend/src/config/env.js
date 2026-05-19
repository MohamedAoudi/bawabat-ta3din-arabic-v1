const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const env = {
  apiBaseUrl,
  apiUrl: `${apiBaseUrl}/api`,
};

/** URL complète pour photos / fichiers servis par le backend (/uploads/...) */
export function resolveAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
