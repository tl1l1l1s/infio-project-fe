import { fetchHeader, fetchFooter } from "../utils/dom.js";
import { getUserId } from "../utils/auth.js";
import { confirmModal } from "../components/modal.js";
import { api } from "../utils/api.js";
import { showToast } from "../components/toast.js";
import { resolveImageUrl } from "../utils/image.js";

document.addEventListener("DOMContentLoaded", main);

async function main() {
  fetchHeader();
  fetchFooter();
  const userId = getUserId();

  const profileImg = document.querySelector(".profile-container img");
  const nicknameEl = document.querySelector(".profile-container h3");
  const joinedEl = document.querySelector(".profile-container p");
  const tabs = Array.from(document.querySelectorAll(".my-articles-tab"));
  const listContainer = document.querySelector(".my-articles-list-container");
  const logoutBtn = document.querySelector(".log-out");

  setProfileInfo();
  if (userId) {
    await loadProfile(userId);
  }
  setupTabs();
  renderPlaceholderArticles();
  logoutBtn?.addEventListener("click", handleLogout);

  function setProfileInfo() {
    const storedImage = localStorage.getItem("userProfileImage");
    if (profileImg) {
      const resolved = resolveImageUrl(storedImage);
      if (resolved) {
        profileImg.src = resolved;
      } else {
        profileImg.removeAttribute("src");
      }
    }
    if (nicknameEl) nicknameEl.textContent = "닉네임";
    if (joinedEl) joinedEl.textContent = "가입일: 2025.11.18";
  }

  async function loadProfile(userId) {
    try {
      const data = await api.get("/users", { params: { userId } });
      const user = data?.result;
      if (!user) return;

      if (nicknameEl) nicknameEl.textContent = user.nickname || "닉네임";
      if (joinedEl) {
        const createdAt = user.createdAt ?? user.created_at;
        joinedEl.textContent = createdAt ? `가입일: ${new Date(createdAt).toLocaleDateString()}` : "";
      }

      const resolved = resolveImageUrl(user.profile_image ?? user.profileImage);
      if (profileImg) {
        if (resolved) {
          profileImg.src = resolved;
        } else {
          profileImg.removeAttribute("src");
        }
      }
    } catch (err) {
      console.error("마이페이지 정보를 불러오지 못했습니다.", err);
    }
  }

  function setupTabs() {
    if (!tabs.length) return;
    const defaultTab = tabs[0];
    activateTab(defaultTab);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activateTab(tab);
        handleTabChange(tab);
      });
    });
  }

  function activateTab(targetTab) {
    tabs.forEach((tab) => tab.classList.remove("is-active"));
    targetTab.classList.add("is-active");
  }

  function handleTabChange(tab) {
    const isWrittenTab = tab.textContent.includes("작성한");
    if (isWrittenTab) {
      renderPlaceholderArticles("written");
    } else {
      renderPlaceholderArticles("bookmarked");
    }
  }

  function renderPlaceholderArticles(type = "written") {
    if (!listContainer) return;
    listContainer.innerHTML = "";
    const article = document.createElement("div");
    article.className = "my-article";
    article.innerHTML = `
      <div class="theme">${type === "written" ? "React" : "JS"}</div>
      <h2 class="card-title">제목</h2>
      <div class="card-meta">
        <div class="card-author">
          <span class="name">작성자</span>
          <time class="card-time" datetime="2021-01-01">2021-01-01 23:04:24</time>
        </div>
        <div class="card-stats">
          <span><img src="./assets/images/heart.svg" />0</span>
          <span><img src="./assets/images/message-square.svg" />0</span>
          <span><img src="./assets/images/eye.svg" />0</span>
        </div>
      </div>
    `;
    listContainer.appendChild(article);
  }

  async function handleLogout() {
    const ok = await confirmModal({
      title: "로그아웃",
      message: "정말 로그아웃하시겠습니까?",
      confirmText: "로그아웃",
      cancelText: "취소",
    });
    if (!ok) return;

    const userId = getUserId();
    try {
      if (userId) {
        await api.post("/auth/logout", { params: { userId } });
      }
    } catch (err) {
      showToast(err.message || "로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
      return;
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("userProfileImage");
    location.replace("/login.html");
  }
}
