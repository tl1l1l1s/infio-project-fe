import { API_BASE_URL } from "./api.js";

let cachedUser = null;
let cachePending = null;
const SESSION_KEY = "currentUser";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    location.replace("/login.html");
  }
  return user;
}

export async function getCurrentUser() {
  if (!cachedUser) {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        cachedUser = JSON.parse(stored);
      } catch (err) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }

  if (cachedUser) return cachedUser;
  if (cachePending) return cachePending;

  cachePending = fetch(`${API_BASE_URL}/users`, { credentials: "include" })
    .then(async (res) => {
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) throw new Error("사용자 정보를 불러오지 못했습니다.");
      const data = await res.json();
      return data?.result ?? null;
    })
    .catch((err) => {
      console.error("현재 사용자 조회 실패", err);
      return null;
    })
    .finally(() => {
      cachePending = null;
    });

  cachedUser = await cachePending;
  if (cachedUser) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(cachedUser));
    } catch (err) {
      console.warn("세션 캐시에 사용자 정보를 저장하지 못했습니다.", err);
    }
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
  return cachedUser;
}

export function clearUserCache() {
  cachedUser = null;
  sessionStorage.removeItem(SESSION_KEY);
}

export function setCurrentUser(user) {
  cachedUser = user ?? null;
  if (user) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn("세션 캐시에 사용자 정보를 저장하지 못했습니다.", err);
    }
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
