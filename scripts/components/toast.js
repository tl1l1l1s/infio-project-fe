let toastContainer = null;
let hideTimer = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, duration = 5000) {
  const container = createToastContainer();
  container.textContent = message;
  container.style.opacity = "0.9";

  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  hideTimer = setTimeout(() => {
    container.style.opacity = "0";
    hideTimer = null;
  }, duration);
}
