let modalEl = null;
let titleEl = null;
let msgEl = null;
let cancelBtn = null;
let confirmBtn = null;
let sentinelStart = null;
let sentinelEnd = null;

let lastFocused = null;
let resolver = null;

function createModal() {
  if (modalEl) return;

  modalEl = document.createElement("div");
  modalEl.id = "confirm-modal";
  modalEl.className = "modal-wrapper";

  const container = document.createElement("div");
  container.className = "modal-container";

  titleEl = document.createElement("h2");
  titleEl.id = "confirm-modal-title";
  titleEl.className = "modal-title";

  msgEl = document.createElement("p");
  msgEl.id = "confirm-modal-message";
  msgEl.className = "modal-message";

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.id = "confirm-modal-cancel";
  cancelBtn.className = "modal-button modal-button-cancel";

  confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.id = "confirm-modal-confirm";
  confirmBtn.className = "modal-button modal-button-confirm";

  actions.append(cancelBtn, confirmBtn);

  sentinelEnd = document.createElement("span");
  sentinelEnd.id = "confirm-modal-sentinel-end";
  sentinelEnd.className = "visually-hidden";
  sentinelEnd.tabIndex = 0;

  sentinelStart = document.createElement("span");
  sentinelStart.id = "confirm-modal-sentinel-start";
  sentinelStart.className = "visually-hidden";
  sentinelStart.tabIndex = 0;

  container.append(titleEl, msgEl, actions, sentinelEnd);
  modalEl.append(container, sentinelStart);
  document.body.appendChild(modalEl);

  cancelBtn.addEventListener("click", onCancel);
  confirmBtn.addEventListener("click", onConfirm);
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) onCancel();
  });

  modalEl.addEventListener("keydown", handleFocusTrap);
  sentinelStart.addEventListener("focus", () => confirmBtn.focus());
  sentinelEnd.addEventListener("focus", () => cancelBtn.focus());
}

function handleFocusTrap(event) {
  if (event.key !== "Tab") return;
  const focusables = [cancelBtn, confirmBtn];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openModal({ title, message, confirmText = "확인", cancelText = "취소" } = {}) {
  createModal();

  lastFocused = document.activeElement;
  titleEl.textContent = title;
  msgEl.textContent = message;
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;

  modalEl.classList.add("is-open");

  confirmBtn.focus();
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  document.body.style.overflow = "";

  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus();
  }
}

export function confirmModal({ title, message, confirmText = "확인", cancelText = "취소" } = {}) {
  openModal({ title, message, confirmText, cancelText });
  return new Promise((resolve) => {
    resolver = resolve;
  });
}

function onCancel() {
  if (resolver) resolver(false);
  resolver = null;
  closeModal();
}

function onConfirm() {
  if (resolver) resolver(true);
  resolver = null;
  closeModal();
}
