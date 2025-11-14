import { fetchHeader, getErrorMessageElement } from "../../utils/dom.js";
import { getUserId } from "../../utils/auth.js";
import { api } from "../../utils/api.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  const userId = getUserId();

  const articleId = new URLSearchParams(location.search).get("articleId");
  if (!articleId) {
    location.replace("/index.html");
    return;
  }

  const form = document.querySelector(".article-edit-form");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const formMessageEl = getErrorMessageElement(contentInput);
  const imageInput = document.getElementById("image");
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (!form || !titleInput || !contentInput || !imageInput) return;

  let originalImageUrl = "";

  setFormDisabled(true);
  loadArticle();
  form.addEventListener("submit", handleSubmit);
  titleInput.addEventListener("blur", () => validateField(titleInput));
  contentInput.addEventListener("blur", () => validateField(contentInput));

  async function loadArticle() {
    try {
      const data = await api.get(`/articles/${articleId}`);
      const article = data?.result;
      const writerId = article?.writtenBy?.user_id ?? article?.writtenBy?.userId;
      if (String(writerId ?? "") !== String(userId)) {
        location.replace(`/articles/detail.html?articleId=${articleId}`);
        return;
      }

      titleInput.value = article?.title;
      contentInput.value = article?.content;
      originalImageUrl = article?.article_image ?? "";
      form.setAttribute("articleId", article?.article_id ?? "");
      formMessageEl.textContent = "";
    } catch (err) {
      formMessageEl.textContent = "게시글 정보를 불러오지 못했습니다.";
      return;
    }
    setFormDisabled(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const titleOk = validateField(titleInput);
    const contentOk = validateField(contentInput);
    if (!titleOk || !contentOk) return;

    const payload = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
    };

    formMessageEl.textContent = "";
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      const res = await api.patch(`/articles/${articleId}`, { params: { userId }, body: payload });

      location.replace(`/articles/detail.html?articleId=${articleId}`);
    } catch (err) {
      formMessageEl.textContent = err.message || "네트워크 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  }

  function validateField(input) {
    if (!input) return true;

    const value = input.value.trim();
    let message = "";

    if (input === titleInput) {
      if (value.length === 0) {
        message = "제목을 입력해주세요.";
      } else if (value.length > 26) {
        message = "제목은 최대 26자까지 입력할 수 있습니다.";
      }
    }

    if (input === contentInput && value.length === 0) {
      message = "내용을 입력해주세요.";
    }

    showFieldError(input, message);
    return message.length === 0;
  }

  function showFieldError(input, message) {
    if (!input) return;
    let helper = input.parentElement?.querySelector(".field-error-message");
    if (!helper) {
      helper = document.createElement("small");
      helper.className = "field-error-message";
      input.insertAdjacentElement("afterend", helper);
    }

    helper.textContent = message;
    helper.style.display = message ? "block" : "none";
  }

  function setFormDisabled(disabled) {
    const fields = form.querySelectorAll("input, textarea, button");
    fields.forEach((el) => {
      el.disabled = disabled;
    });
  }
}
