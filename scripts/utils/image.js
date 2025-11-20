import { API_BASE_URL } from "./api.js";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export function resolveImageUrl(path) {
  if (!path) return "";
  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }
  if (path.startsWith("/uploads/")) {
    const base = API_BASE_URL.replace(/\/$/, "");
    return `${base}${path}`;
  }
  return path;
}
