import { fetchHeader, fetchFooter } from "../utils/dom.js";
import { requireUser, clearUserCache } from "../utils/auth.js";
import { confirmModal } from "../components/modal.js";
import { api } from "../utils/api.js";
import { showToast } from "../components/toast.js";
import { applyImageSrc } from "../utils/image.js";

document.addEventListener("DOMContentLoaded", main);

async function main() {
  fetchHeader();
  fetchFooter();

  const user = await requireUser();

  const profileImg = document.querySelector(".profile-container img");
  const nicknameEl = document.querySelector(".profile-container h3");
  const joinedEl = document.querySelector(".profile-container p");
  const tabs = Array.from(document.querySelectorAll(".my-articles-tab"));
  const listContainer = document.querySelector(".my-articles-list-container");
  const logoutBtn = document.querySelector(".log-out");

  setProfileInfo(user);
  setupTabs();
  renderPlaceholderArticles();
  logoutBtn?.addEventListener("click", handleLogout);

  function setProfileInfo(userData) {
    applyImageSrc(profileImg, userData?.profile_image ?? userData?.profileImage);
    if (nicknameEl) nicknameEl.textContent = userData?.nickname || "닉네임";
    if (joinedEl) {
      const createdAt = userData?.createdAt ?? userData?.created_at;
      joinedEl.textContent = createdAt ? `가입일: ${new Date(createdAt).toLocaleDateString()}` : "";
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

    try {
      await api.post("/auth/logout");
    } catch (err) {
      showToast(err.message || "로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
      return;
    }

    clearUserCache();
    location.replace("/login.html");
  }
}
