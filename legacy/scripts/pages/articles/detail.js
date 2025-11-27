import { fetchFooter, fetchHeader } from "../../utils/dom.js";
import { getCurrentUser, requireUser } from "../../utils/auth.js";
import { formatDate, formatCount } from "../../utils/format.js";
import { showToast } from "../../components/toast.js";
import { api } from "../../utils/api.js";
import { confirmModal } from "../../components/modal.js";
import { applyAvatarBackground, applyImageSrc } from "../../utils/image.js";

document.addEventListener("DOMContentLoaded", main);

async function main() {
  fetchHeader();
  fetchFooter();

  const COMMENT_PAGE_SIZE = 8;

  let articleId;
  let currentUser = null;
  let userId = null;
  const commentListEl = document.getElementById("comment-list");
  const commentForm = document.getElementById("comment-form");
  const commentTextarea = document.getElementById("comment-content");
  let commentErrorEl;
  const commentSubmitBtn = document.getElementById("comment-submit");
  let commentObserver;
  let commentSentinelEl;
  let commentStateEl;
  let nextCommentPage = 1;
  let hasNextComments = true;
  let isLoadingComments = false;
  let editingCommentId = null;
  const commentCountEl = document.getElementById("comment-count");
  let commentCountValue = Number(commentCountEl?.textContent) || 0;
  let likeButton;
  let likeCount = 0;
  let isLiked = false;
  let likeThrottle = false;
  const articleActionMenu = document.getElementById("post-action-menu");
  const articleActionToggle = document.getElementById("post-action-toggle");
  const articleActionDropdown = document.getElementById("post-action-dropdown");
  if (articleActionMenu) {
    articleActionMenu.style.display = "none";
  }

  const params = new URLSearchParams(location.search);
  articleId = params.get("articleId");
  if (!articleId) {
    // TODO: 잘못된 접근입니다. 모달? 같은 거 표시
    location.replace("/index.html");
    return;
  }

  await loadCurrentUser();

  setupCommentList();

  loadArticle();
  loadComments(true);
  bindArticleButtons();
  bindCommentForm();
  bindCommentActions();

  async function loadCurrentUser() {
    currentUser = await getCurrentUser();
    userId = currentUser?.user_id ?? currentUser?.userId ?? null;
  }

  async function ensureAuth() {
    if (userId) return userId;
    const user = await requireUser();
    currentUser = user;
    userId = user?.user_id ?? user?.userId ?? null;
    return userId;
  }

  async function loadArticle() {
    try {
      const data = await api.get(`/articles/${articleId}`);
      renderArticle(data.result);
    } catch (err) {
      showToast(err.message || "게시글을 불러오지 못했습니다.", { type: "error" });
      disableDetailInteractions();
    }
  }

  function renderArticle(article) {
    if (!article) return;

    document.querySelector(".article-detail-container")?.setAttribute("data-article-id", article.article_id ?? "");

    document.getElementById("post-title").textContent = article.title || "제목 없음";

    const authorNickname = article?.writtenBy?.nickname;
    document.getElementById("post-author").textContent = authorNickname;
    applyAvatarBackground(document.querySelector(".author .avatar"), article?.writtenBy?.profile_image);

    const createdAt = article.createdAt ?? article.created_at;
    const timeEl = document.getElementById("post-time");
    if (timeEl) {
      timeEl.dateTime = createdAt || "";
      timeEl.textContent = createdAt ? formatDate(createdAt) : "";
    }

    likeCount = article.likeCount;
    setStatValue("like-count", likeCount);
    setStatValue("view-count", article.viewCount);
    setCommentCount(article.commentCount);

    renderArticleContent(article.content);
    renderArticleImage(article.article_image);
    toggleArticleActions(article.writtenBy.user_id);
  }

  function renderArticleContent(content) {
    const bodyEl = document.getElementById("post-body");
    if (!bodyEl) return;

    bodyEl.innerHTML = "";
    const normalized = (content || "").trim();
    if (normalized.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "작성된 내용이 없습니다.";
      bodyEl.appendChild(empty);
      return;
    }

    normalized.split(/\n{2,}|\r\n{2,}/).forEach((paragraph) => {
      const text = paragraph.trim();
      if (text.length === 0) return;
      const p = document.createElement("p");
      p.textContent = text;
      bodyEl.appendChild(p);
    });
  }

  function renderArticleImage(imageUrl) {
    const image = document.getElementById("post-image");
    const cover = document.querySelector(".post-cover");
    if (!image || !cover) return;

    const resolvedUrl = applyImageSrc(image, imageUrl);

    if (resolvedUrl) {
      image.alt = "게시글 이미지";
      image.style.display = "block";
      cover.style.background = "transparent";
    } else {
      image.style.display = "none";
      cover.style.background = "#e5e7eb";
    }
  }

  function toggleArticleActions(writerId) {
    const isOwner = String(writerId ?? "") === String(userId);
    const editBtn = document.getElementById("post-edit-button");
    const deleteBtn = document.getElementById("post-delete-button");

    const displayValue = isOwner ? "inline-flex" : "none";
    if (editBtn) editBtn.style.display = displayValue;
    if (deleteBtn) deleteBtn.style.display = displayValue;
    if (articleActionMenu) articleActionMenu.style.display = displayValue;

    if (!isOwner) {
      closeAllDropdowns();
    }
  }

  function setStatValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = formatCount(value ?? 0);
  }

  function setCommentCount(value) {
    commentCountValue = Number(value) || 0;
    renderCommentCount();
  }

  function renderCommentCount() {
    if (commentCountEl) {
      commentCountEl.textContent = formatCount(commentCountValue);
    }
  }

  async function fetchLikeStatus() {
    if (!userId) return;
    try {
      const data = await api.get(`/articles/${articleId}/likes`);
      likeCount = data.result.like_count ?? likeCount;
      isLiked = Boolean(data.result.is_liked);
      updateLikeButtonAppearance();
    } catch (err) {
      console.error("좋아요 상태를 불러오지 못했습니다.", err);
    }
  }

  function bindArticleButtons() {
    const editBtn = document.getElementById("post-edit-button");
    const deleteBtn = document.getElementById("post-delete-button");
    likeButton = document.getElementById("like-button");
    if (articleActionToggle && articleActionDropdown) {
      articleActionToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDropdown(articleActionDropdown, articleActionToggle);
      });
    }

    if (likeButton) {
      likeButton.addEventListener("click", handleToggleLike);
      fetchLikeStatus();
    }

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        location.href = `/articles/edit.html?articleId=${articleId}`;
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const ok = await confirmModal({
          title: "게시글을 삭제하시겠습니까?",
          message: "삭제한 내용은 복구할 수 없습니다.",
        });

        if (!ok) return;

        try {
          await ensureAuth();
          await api.delete(`/articles/${articleId}`);
          location.replace("/index.html");
        } catch (err) {
          showToast(err.message || "게시글 삭제에 실패했습니다.");
        }
      });
    }
  }

  async function handleToggleLike() {
    const ensuredUserId = await ensureAuth();
    if (!ensuredUserId) {
      return;
    }
    if (likeThrottle) return;
    likeThrottle = true;
    try {
      if (isLiked) {
        await api.delete(`/articles/${articleId}/likes`);
        likeCount = Math.max(0, likeCount - 1);
        isLiked = false;
      } else {
        await api.post(`/articles/${articleId}/likes`);
        likeCount += 1;
        isLiked = true;
      }
      updateLikeButtonAppearance();
    } catch (err) {
      showToast("좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    } finally {
      setTimeout(() => {
        likeThrottle = false;
      }, 1000);
    }
  }

  function updateLikeButtonAppearance() {
    const likeCountEl = document.getElementById("like-count");
    if (likeCountEl) {
      likeCountEl.textContent = formatCount(likeCount);
    }
    if (!likeButton) return;
    likeButton.classList.toggle("is-liked", isLiked);
    const likeIcon = likeButton.querySelector("img");
    if (likeIcon) {
      likeIcon.src = isLiked ? "../assets/images/heart-fill.svg" : "../assets/images/heart.svg";
      likeIcon.alt = isLiked ? "좋아요 취소" : "좋아요";
    }
  }

  async function loadComments(reset = false) {
    if (!commentListEl) return;

    if (reset) {
      clearCommentItems();
      nextCommentPage = 1;
      hasNextComments = true;
      isLoadingComments = false;
      resetCommentFormState();
      setCommentListState("로딩 중...");
      if (commentObserver && commentSentinelEl) {
        commentObserver.observe(commentSentinelEl);
      }
    }

    if (isLoadingComments || !hasNextComments) return;

    isLoadingComments = true;
    const pageToFetch = nextCommentPage;

    try {
      const data = await api.get(`/articles/${articleId}/comments`, {
        params: { page: pageToFetch, size: COMMENT_PAGE_SIZE },
      });

      const comments = data?.result?.comments ?? [];
      const totalCount = data?.result?.totalCount;
      const totalPages = Number(data?.result?.totalPages ?? 0);
      const apiHasNext = data?.result?.hasNext;
      const currentPage = Number(data?.result?.currentPage ?? pageToFetch);

      updateCommentCount(totalCount, comments.length);

      if (comments.length === 0 && pageToFetch === 1) {
        setCommentListState("첫 댓글을 남겨보세요.");
        hasNextComments = false;
        stopCommentObserver();
        return;
      }

      if (comments.length === 0) {
        hasNextComments = false;
        hideCommentListState();
        stopCommentObserver();
        return;
      }

      appendComments(comments);
      hideCommentListState();

      hasNextComments =
        typeof apiHasNext === "boolean"
          ? apiHasNext
          : totalPages > 0
          ? currentPage < totalPages
          : comments.length === COMMENT_PAGE_SIZE;

      nextCommentPage = currentPage + 1;

      if (!hasNextComments) {
        hideCommentListState();
        stopCommentObserver();
      }
    } catch (err) {
      setCommentListState(err.message || "댓글을 불러오지 못했습니다.");
      if (pageToFetch === 1) {
        updateCommentCount(0, 0);
      }
    } finally {
      isLoadingComments = false;
    }
  }

  function bindCommentForm() {
    if (!commentForm || !commentTextarea) {
      return;
    }

    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const content = commentTextarea.value.trim();

      if (content.length === 0) {
        setCommentError("댓글을 입력해주세요.");
        commentTextarea.focus();
        return;
      }

      setCommentError("");
      if (commentSubmitBtn) commentSubmitBtn.disabled = true;

      try {
        await ensureAuth();
        const isEditing = Boolean(editingCommentId);
        if (isEditing) {
          await api.patch(`/articles/${articleId}/comments/${editingCommentId}`, {
            body: { content },
          });
        } else {
          await api.post(`/articles/${articleId}/comments`, {
            body: { content },
          });
        }

        commentTextarea.value = "";
        resetCommentFormState();
        const successMessage = isEditing ? "댓글 수정 완료" : "댓글 등록 완료";
        showToast(successMessage);
        await loadComments(true);
      } catch (err) {
        const errorMessage = editingCommentId
          ? "댓글 수정에 실패했습니다. 잠시 후 다시 시도해주세요."
          : "댓글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.";
        showToast(err.message || errorMessage, { type: "error" });
      } finally {
        commentSubmitBtn.disabled = false;
      }
    });
  }

  function bindCommentActions() {
    if (!commentListEl) return;
    commentListEl.addEventListener("click", async (event) => {
      const dropdownToggle = event.target.closest(".post-action-toggle");
      if (dropdownToggle) {
        const dropdown = dropdownToggle.nextElementSibling;
        if (dropdown?.classList.contains("post-action-dropdown")) {
          event.stopPropagation();
          toggleDropdown(dropdown, dropdownToggle);
        }
        return;
      }
      const target = event.target.closest("[data-action]");
      if (!target) return;

      const commentItem = target.closest(".comment-item");
      const commentId = commentItem?.dataset.commentId;
      if (!commentId) return;

      closeAllDropdowns();
      if (target.dataset.action === "edit") {
        activateCommentEdit(commentItem, commentId);
      }
      if (target.dataset.action === "delete") {
        await handleCommentDelete(commentId);
      }
    });
  }

  function activateCommentEdit(commentItem, commentId) {
    const currentContent = commentItem?.querySelector(".comment-body")?.textContent ?? "";
    if (commentTextarea) {
      commentTextarea.value = currentContent.trim();
      commentTextarea.focus();
    }
    editingCommentId = commentId;
    if (commentSubmitBtn) {
      commentSubmitBtn.textContent = "댓글 수정";
    }
  }

  async function handleCommentDelete(commentId) {
    await ensureAuth();
    const ok = await confirmModal({
      title: "댓글을 삭제하시겠습니까?",
      message: "삭제한 내용은 복구할 수 없습니다.",
    });

    if (!ok) return;

    try {
      await api.delete(`/articles/${articleId}/comments/${commentId}`);

      if (editingCommentId === commentId) {
        resetCommentFormState();
      }
      showToast("댓글 삭제 완료");
      await loadComments(true);
    } catch (err) {
      showToast(err.message || "댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    }
  }

  function setupCommentList() {
    if (!commentListEl) return;
    commentListEl.innerHTML = "";

    commentStateEl = document.createElement("p");
    commentStateEl.className = "comment-list__state";
    commentStateEl.textContent = "로딩 중...";

    commentSentinelEl = document.createElement("div");
    commentSentinelEl.className = "comment-list__sentinel";

    commentListEl.append(commentStateEl, commentSentinelEl);

    commentObserver = new IntersectionObserver(handleCommentIntersection, {
      rootMargin: "0px 0px 200px 0px",
    });
    commentObserver.observe(commentSentinelEl);
  }

  function handleCommentIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadComments();
      }
    });
  }

  function appendComments(comments) {
    if (!commentListEl || !commentSentinelEl) return;
    const fragment = document.createDocumentFragment();
    comments.forEach((comment) => {
      fragment.appendChild(createCommentItem(comment, { showActions: isCommentOwner(comment) }));
    });
    commentListEl.insertBefore(fragment, commentSentinelEl);
  }

  function isCommentOwner(comment) {
    const ownerId = comment?.writtenBy?.user_id ?? comment?.writtenBy?.userId;
    if (ownerId == null) return false;
    return String(ownerId) === String(userId);
  }

  function clearCommentItems() {
    if (!commentListEl) return;
    commentListEl.querySelectorAll(".comment-item").forEach((item) => item.remove());
  }

  function setCommentListState(message) {
    if (!commentStateEl) return;
    if (message) {
      commentStateEl.textContent = message;
      commentStateEl.style.display = "block";
    } else {
      commentStateEl.textContent = "";
      commentStateEl.style.display = "none";
    }
  }

  function hideCommentListState() {
    setCommentListState("");
  }

  function stopCommentObserver() {
    if (commentObserver && commentSentinelEl) {
      commentObserver.unobserve(commentSentinelEl);
    }
  }

  function updateCommentCount(totalCount, fallbackLength = 0) {
    if (typeof totalCount === "number" && Number.isFinite(totalCount)) {
      commentCountValue = totalCount;
      renderCommentCount();
      return;
    }

    if (typeof totalCount === "string" && totalCount.trim().length > 0) {
      const parsed = Number(totalCount);
      if (!Number.isNaN(parsed)) {
        commentCountValue = parsed;
        renderCommentCount();
        return;
      }
    }

    commentCountValue += fallbackLength;
    renderCommentCount();
  }

  function setCommentError(message) {
    if (!commentForm) return;
    if (!commentErrorEl) {
      commentErrorEl = document.createElement("small");
      commentErrorEl.className = "field-error-message";
      commentForm.appendChild(commentErrorEl);
    }

    commentErrorEl.textContent = message;
    commentErrorEl.style.display = message ? "block" : "none";
  }

  function disableDetailInteractions() {
    const editBtn = document.getElementById("post-edit-button");
    const deleteBtn = document.getElementById("post-delete-button");
    if (editBtn) editBtn.disabled = true;
    if (deleteBtn) deleteBtn.disabled = true;
    if (commentTextarea) commentTextarea.disabled = true;
    const submitBtn = commentForm?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
  }

  function resetCommentFormState() {
    editingCommentId = null;
    if (commentSubmitBtn) {
      commentSubmitBtn.textContent = "댓글 등록";
    }
    setCommentError("");
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".post-action-menu")) {
      closeAllDropdowns();
    }
  });

  function toggleDropdown(dropdownEl, toggleEl) {
    if (!dropdownEl || !toggleEl) return;
    const isOpen = dropdownEl.classList.contains("is-open");
    closeAllDropdowns(dropdownEl);
    if (isOpen) {
      dropdownEl.classList.remove("is-open");
    } else {
      dropdownEl.classList.add("is-open");
    }
  }

  function closeAllDropdowns(exceptDropdown) {
    document.querySelectorAll(".post-action-dropdown.is-open").forEach((dropdown) => {
      if (dropdown !== exceptDropdown) {
        dropdown.classList.remove("is-open");
      }
    });
  }
}

function createCommentItem(comment, options = {}) {
  const { showActions = false } = options;
  const item = document.createElement("article");
  item.className = "comment-item";
  item.dataset.commentId = comment?.comment_id ?? "";

  const avatarWrapper = document.createElement("div");
  avatarWrapper.className = "comment-avatar";
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  applyAvatarBackground(avatar, comment?.writtenBy?.profile_image ?? comment?.writtenBy?.profileImage);
  avatarWrapper.appendChild(avatar);

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "comment-content";

  const metaContainer = document.createElement("div");
  metaContainer.className = "comment-meta-container";

  const meta = document.createElement("div");
  meta.className = "comment-meta";

  const nameEl = document.createElement("span");
  nameEl.className = "name";
  nameEl.textContent = comment?.writtenBy?.nickname;

  const timeEl = document.createElement("time");
  timeEl.className = "time";
  const createdAt = comment?.createdAt ?? comment?.created_at;
  timeEl.dateTime = createdAt;
  timeEl.textContent = createdAt ? formatDate(createdAt) : "";

  meta.append(nameEl, timeEl);
  metaContainer.appendChild(meta);

  if (showActions) {
    const actions = document.createElement("div");
    actions.className = "post-action-menu";

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "post-action-toggle";

    const toggleIcon = document.createElement("img");
    toggleIcon.src = "../assets/images/more-vertical.svg";
    toggleIcon.alt = "댓글 더보기";
    toggleButton.appendChild(toggleIcon);

    const dropdown = document.createElement("div");
    dropdown.className = "post-action-dropdown";
    dropdown.setAttribute("role", "menu");

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "post-action-button";
    editBtn.dataset.action = "edit";
    editBtn.textContent = "수정";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "post-action-button";
    deleteBtn.dataset.action = "delete";
    deleteBtn.textContent = "삭제";

    dropdown.append(editBtn, deleteBtn);
    actions.append(toggleButton, dropdown);
    metaContainer.appendChild(actions);
  }

  const body = document.createElement("p");
  body.className = "comment-body";
  body.textContent = comment?.content || "";

  contentWrapper.append(metaContainer, body);
  item.append(avatarWrapper, contentWrapper);

  return item;
}
