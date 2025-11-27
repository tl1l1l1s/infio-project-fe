let toastContainer = null;
let hideTimer = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  const icon = document.createElement("img");
  icon.className = "toast-icon";
  const text = document.createElement("span");
  text.className = "toast-message";
  toastContainer.append(icon, text);
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, options = {}) {
  const { duration = 5000, type = "info" } = typeof options === "number" ? { duration: options } : options || {};
  const container = createToastContainer();
  const icon = container.querySelector(".toast-icon");
  const text = container.querySelector(".toast-message");

  if (icon) {
    icon.src = type === "error" ? "/assets/images/x-circle.svg" : "/assets/images/alert.svg";
    icon.alt = type === "error" ? "오류" : "안내";
  }
  if (text) {
    text.textContent = message;
  } else {
    container.textContent = message;
  }

  container.style.opacity = "0.9";

  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  hideTimer = setTimeout(() => {
    container.style.opacity = "0";
    hideTimer = null;
  }, duration);
}
