import { fetchHeader } from "../../utils/dom.js";
import { getUserId } from "../../utils/auth.js";
import { formatDate, formatCount } from "../../utils/format.js";
import { showToast } from "../../components/toast.js";
import { api } from "../../utils/api.js";
import { confirmModal } from "../../components/modal.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();

  const COMMENT_PAGE_SIZE = 8;

  let articleId;
  let userId = getUserId();
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

  const params = new URLSearchParams(location.search);
  articleId = params.get("articleId");
  if (!articleId) {
    // TODO: 잘못된 접근입니다. 모달? 같은 거 표시
    location.replace("/index.html");
    return;
  }

  setupCommentList();

  loadArticle();
  loadComments(true);
  bindArticleButtons();
  bindCommentForm();
  bindCommentActions();

  async function loadArticle() {
    try {
      const data = await api.get(`/articles/${articleId}`);
      renderArticle(data.result);
    } catch (err) {
      showGlobalMessage(err.message || "게시글을 불러오지 못했습니다.");
      disableDetailInteractions();
    }
  }

  function renderArticle(article) {
    if (!article) return;

    document.querySelector(".article-detail-container")?.setAttribute("data-article-id", article.article_id ?? "");

    document.getElementById("post-title").textContent = article.title || "제목 없음";

    const authorNickname = article?.writtenBy?.nickname;
    document.getElementById("post-author").textContent = authorNickname;
    setAvatarImage(document.querySelector(".author .avatar"), article?.writtenBy?.profile_image);

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

    if (imageUrl) {
      image.src = imageUrl;
      image.alt = "게시글 이미지";
      image.style.display = "block";
      cover.style.background = "transparent";
    } else {
      image.removeAttribute("src");
      image.style.display = "none";
      cover.style.background = "#e5e7eb";
    }
  }

  function toggleArticleActions(writerId) {
    const editBtn = document.getElementById("post-edit-button");
    const deleteBtn = document.getElementById("post-delete-button");

    const displayValue = String(writerId ?? "") === String(userId) ? "inline-flex" : "none";
    if (editBtn) editBtn.style.display = displayValue;
    if (deleteBtn) deleteBtn.style.display = displayValue;
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
    try {
      const data = await api.get(`/articles/${articleId}/likes`, { params: { userId } });
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
          await api.del(`/articles/${articleId}`, { params: { userId } });
          location.replace("/index.html");
        } catch (err) {
          showToast(err.message || "게시글 삭제에 실패했습니다.");
        }
      });
    }
  }

  async function handleToggleLike() {
    if (likeThrottle) return;
    likeThrottle = true;
    try {
      if (isLiked) {
        await api.delete(`/articles/${articleId}/likes`, { params: { userId } });
        likeCount = Math.max(0, likeCount - 1);
        isLiked = false;
      } else {
        await api.post(`/articles/${articleId}/likes`, { params: { userId } });
        likeCount += 1;
        isLiked = true;
      }
      updateLikeButtonAppearance();
    } catch (err) {
      // TODO: 좋아요 처리 실패
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
    likeButton.style.backgroundColor = isLiked ? "#ACA0EB" : "#D9D9D9";
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
        const isEditing = Boolean(editingCommentId);
        if (isEditing) {
          await api.patch(`/articles/${articleId}/comments/${editingCommentId}`, {
            params: { userId },
            body: { content },
          });
        } else {
          await api.post(`/articles/${articleId}/comments`, {
            params: { userId },
            body: { content },
          });
        }

        commentTextarea.value = "";
        resetCommentFormState();
        await loadComments(true);
      } catch (err) {
        setCommentError(err.message || "댓글 등록에 실패했습니다.");
      } finally {
        commentSubmitBtn.disabled = false;
      }
    });
  }

  function bindCommentActions() {
    if (!commentListEl) return;
    commentListEl.addEventListener("click", async (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;

      const commentItem = target.closest(".comment-item");
      const commentId = commentItem?.dataset.commentId;
      if (!commentId) return;

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
    const ok = await confirmModal({
      title: "댓글을 삭제하시겠습니까?",
      message: "삭제한 내용은 복구할 수 없습니다.",
    });

    if (!ok) return;

    try {
      await api.delete(`/articles/${articleId}/comments/${commentId}`, {
        params: { userId },
      });

      if (editingCommentId === commentId) {
        resetCommentFormState();
      }
      await loadComments(true);
    } catch (err) {
      // TODO: 댓글 삭제 처리에 실패했습니다
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
  setAvatarImage(avatar, comment?.writtenBy?.profile_image ?? comment?.writtenBy?.profileImage);
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
    actions.className = "post-actions";

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

    actions.append(editBtn, deleteBtn);
    metaContainer.appendChild(actions);
  }

  const body = document.createElement("p");
  body.className = "comment-body";
  body.textContent = comment?.content || "";

  contentWrapper.append(metaContainer, body);
  item.append(avatarWrapper, contentWrapper);

  return item;
}

function showGlobalMessage(message) {
  const container = document.querySelector(".article-detail-container");
  if (!container) return;

  const info = document.createElement("p");
  info.className = "article-error-message";
  info.textContent = message;
  container.prepend(info);
}

function setAvatarImage(target, imageUrl) {
  if (!target) return;
  if (imageUrl) {
    target.style.backgroundImage = `url("${imageUrl}")`;
    target.style.backgroundSize = "cover";
    target.style.backgroundPosition = "center";
  } else {
    target.style.removeProperty("background-image");
  }
}
