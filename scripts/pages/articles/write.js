import { fetchFooter, fetchHeader, getErrorMessageElement } from "../../utils/dom.js";
import { getUserId } from "../../utils/auth.js";
import { api } from "../../utils/api.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  fetchFooter();

  const form = document.querySelector(".article-form");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const imagePreviewWrapper = document.getElementById("article-image-preview");
  const imagePreviewImg = document.getElementById("article-image-preview-img");
  const imageRemoveBtn = document.getElementById("article-image-remove");
  const cancelBtn = document.querySelector(".article-form .cancel");
  const help = getErrorMessageElement(contentInput);
  let selectedImageFile = null;

  form.addEventListener("submit", handleSubmit);
  titleInput?.addEventListener("blur", () => validateField(titleInput));
  contentInput?.addEventListener("blur", () => validateField(contentInput));
  imageInput?.addEventListener("change", handleImageChange);
  imageRemoveBtn?.addEventListener("click", handleImageRemove);
  cancelBtn?.addEventListener("click", handleCancel);

  function validateField(input) {
    help.style.display = "block";

    if (input === titleInput) {
      if (titleInput.value.trim().length <= 0) {
        help.textContent = "제목을 반드시 채워야 합니다.";
        return false;
      }
    }

    if (input === contentInput) {
      if (contentInput.value.trim().length <= 0) {
        help.textContent = "내용을 반드시 채워야 합니다.";
        return false;
      }
    }

    help.textContent = "";
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const userId = getUserId();

    if (!validateField(titleInput) || !validateField(contentInput)) {
      return;
    }

    const payload = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      article_image: "",
    };
    const formData = new FormData();
    formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (selectedImageFile) {
      formData.append("image", selectedImageFile);
    }

    try {
      await api.post("/articles", { params: { userId }, body: formData });
      location.href = "/index.html";
    } catch (err) {
      help.textContent = err.message || "네트워크 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.";
    }
  }

  function handleCancel() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      location.replace("/index.html");
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    selectedImageFile = file || null;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateImagePreview(previewUrl);
    } else {
      updateImagePreview("");
    }
  }

  function handleImageRemove() {
    selectedImageFile = null;
    if (imageInput) {
      imageInput.value = "";
    }
    updateImagePreview("");
  }

  function updateImagePreview(src) {
    if (!imagePreviewWrapper || !imagePreviewImg) return;
    if (src) {
      imagePreviewImg.src = src;
      imagePreviewWrapper.classList.add("is-visible");
    } else {
      imagePreviewImg.removeAttribute("src");
      imagePreviewWrapper.classList.remove("is-visible");
    }
  }
}
