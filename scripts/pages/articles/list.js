import { fetchFooter, fetchHeader } from "../../utils/dom.js";
import { formatDate, formatCount } from "../../utils/format.js";
import { api } from "../../utils/api.js";
import { applyAvatarBackground } from "../../utils/image.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  fetchFooter();

  const ARTICLE_PAGE_SIZE = 7;
  const articleListEl = document.querySelector(".article-list");
  if (!articleListEl) return;

  let stateMessageEl;
  let sentinelEl;
  let observer;
  let isLoading = false;
  let hasNextPage = true;
  let page;

  setupListScaffolding();
  const params = new URLSearchParams(location.search);
  page = Math.max(Number(params.get("page") || 1), 1);

  observer = new IntersectionObserver(handleArticleIntersection, {
    rootMargin: "0px 0px 200px 0px",
  });
  observer.observe(sentinelEl);

  loadArticles(true);

  function setupListScaffolding() {
    articleListEl.innerHTML = "";

    sentinelEl = document.createElement("div");
    sentinelEl.className = "article-list__sentinel";

    stateMessageEl = document.createElement("p");
    stateMessageEl.className = "article-list__state";
    stateMessageEl.textContent = "로딩 중...";

    articleListEl.append(stateMessageEl, sentinelEl);
  }

  function handleArticleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadArticles();
      }
    });
  }

  async function loadArticles(reset = false) {
    if (reset) {
      clearArticleCards();
      hasNextPage = true;
      stateMessageEl.textContent = "로딩 중...";
      stateMessageEl.style.display = "block";
      if (observer && sentinelEl) {
        observer.observe(sentinelEl);
      }
    }

    if (isLoading || !hasNextPage) return;

    isLoading = true;
    stateMessageEl.textContent = "로딩 중...";
    stateMessageEl.style.display = "block";

    try {
      const data = await api.get("/articles", {
        params: { page, size: ARTICLE_PAGE_SIZE },
      });

      const articles = data?.result?.articles ?? [];
      const totalPages = Number(data?.result?.totalPages ?? 0);
      const currentPage = Number(data?.result?.currentPage ?? page);
      const apiHasNext = data?.result?.hasNext;

      if (articles.length === 0 && currentPage === 1) {
        stateMessageEl.textContent = "아직 작성된 게시글이 없습니다.";
        hasNextPage = false;
        stopArticleObserver();
        return;
      }

      if (articles.length === 0) {
        hasNextPage = false;
        stateMessageEl.style.display = "none";
        stopArticleObserver();
        return;
      }

      renderArticleCards(articles);

      hasNextPage =
        typeof apiHasNext === "boolean"
          ? apiHasNext
          : totalPages > 0
          ? currentPage < totalPages
          : articles.length === ARTICLE_PAGE_SIZE;

      page = currentPage + 1;
      stateMessageEl.style.display = "none";

      if (!hasNextPage) {
        stopArticleObserver();
      }
    } catch (err) {
      stateMessageEl.textContent = err.message || "게시글 목록을 불러오지 못했습니다.";
    } finally {
      isLoading = false;
    }
  }

  function clearArticleCards() {
    const cards = articleListEl.querySelectorAll(".article-card");
    cards.forEach((card) => card.remove());
  }

  function stopArticleObserver() {
    if (observer && sentinelEl) {
      observer.unobserve(sentinelEl);
    }
  }

  function renderArticleCards(articles) {
    const fragment = document.createDocumentFragment();

    articles.forEach((article) => {
      const card = document.createElement("article");
      card.className = "article-card";
      card.dataset.articleId = article?.article_id ?? "";
      card.tabIndex = 0;

      const header = document.createElement("div");
      header.className = "card-header";

      const titleEl = document.createElement("h2");
      titleEl.className = "card-title";
      titleEl.textContent = article?.title || "제목 없음";
      header.appendChild(titleEl);

      const meta = document.createElement("div");
      meta.className = "card-meta";

      const stats = document.createElement("div");
      stats.className = "card-stats";

      const likeEl = document.createElement("span");
      likeEl.innerHTML = `<img src="./assets/images/heart.svg" /> ${formatCount(article?.likeCount ?? 0)}`;

      const commentEl = document.createElement("span");
      commentEl.innerHTML = `<img src="./assets/images/message-square.svg" /> ${formatCount(
        article?.commentCount ?? 0
      )}`;

      const viewEl = document.createElement("span");
      viewEl.innerHTML = `<img src="./assets/images/eye.svg" /> ${formatCount(article?.viewCount ?? 0)}`;

      stats.append(likeEl, commentEl, viewEl);

      const timeEl = document.createElement("time");
      timeEl.className = "card-time";
      const createdAt = article?.createdAt ?? article?.created_at;
      if (createdAt) {
        timeEl.dateTime = createdAt;
        timeEl.textContent = formatDate(createdAt);
      } else {
        timeEl.textContent = "";
      }

      meta.append(stats, timeEl);

      const divider = document.createElement("hr");
      divider.className = "card-divider";

      const author = document.createElement("div");
      author.className = "card-author";

      const avatar = document.createElement("span");
      avatar.className = "avatar";
      applyAvatarBackground(avatar, article?.writtenBy?.profile_image ?? article?.writtenBy?.profileImage);

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = article?.writtenBy?.nickname || "익명";

      author.append(avatar, name);
      card.append(header, meta, divider, author);

      card.addEventListener("click", () => goToDetail(card.dataset.articleId));
      fragment.appendChild(card);
    });

    articleListEl.insertBefore(fragment, sentinelEl);
  }
}

function goToDetail(articleId) {
  if (!articleId) return;
  location.href = `/articles/detail.html?articleId=${articleId}`;
}
