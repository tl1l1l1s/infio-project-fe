import { API_BASE_URL } from "./api.js";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export function resolveImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (ABSOLUTE_URL_REGEX.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    const base = API_BASE_URL.replace(/\/$/, "");
    return `${base}${trimmed}`;
  }
  return "";
}

export function applyImageSrc(imgEl, path) {
  if (!imgEl) return;
  const resolved = resolveImageUrl(path);
  if (resolved) {
    imgEl.src = resolved;
    imgEl.style.display = "";
  } else {
    imgEl.removeAttribute("src");
    imgEl.style.display = "";
  }
  return resolved;
}

export function applyAvatarBackground(target, path) {
  if (!target) return;
  const resolved = resolveImageUrl(path);
  if (resolved) {
    target.style.backgroundImage = `url("${resolved}")`;
    target.style.backgroundSize = "cover";
    target.style.backgroundPosition = "center";
  } else {
    target.style.removeProperty("background-image");
  }
}
