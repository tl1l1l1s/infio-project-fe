export function getErrorMessageElement(input) {
  let el = input.nextElementSibling;
  if (!el || !el.classList.contains("field-error-message")) {
    el = document.createElement("small");
    el.className = "field-error-message";
    el.style.display = "none";
    input.insertAdjacentElement("afterend", el);
  }
  return el;
}

export function fetchHeader() {
  const headerRoot = document.getElementById("header");
  if (!headerRoot) return Promise.reject();

  return fetch("/scripts/components/header.html")
    .then((res) => {
      if (!res.ok) throw new Error("헤더 로딩에 실패했습니다.");
      return res.text();
    })
    .then((html) => {
      headerRoot.innerHTML = html;
      initializeHeader();
    })
    .catch((err) => {
      console.error(err);
    });
}

function initializeHeader() {
  setupBackButton();
  setupProfileMenu();
}

function setupBackButton() {
  const backBtn = document.querySelector(".header-back");
  if (!backBtn) return;

  const path = window.location.pathname || "/";
  const HIDE_PATHS = new Set(["/", "/index.html", "/login.html"]);
  const shouldShowBack = !HIDE_PATHS.has(path);

  if (!shouldShowBack) {
    backBtn.style.visibility = "hidden";
    return;
  }

  backBtn.style.visibility = "visible";
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/index.html");
    }
  });
}

function setupProfileMenu() {
  const headerActions = document.querySelector(".header-actions");
  const profileButton = document.querySelector(".header-profile");
  const profileImage = document.querySelector(".header-profile-image");
  const menu = document.querySelector(".header-menu");
  if (!headerActions || !profileButton || !menu) return;

  const userId = localStorage.getItem("userId");
  if (!userId) {
    profileButton.style.visibility = "hidden";
    return;
  }

  profileButton.style.visibility = "visible";
  const storedImage = localStorage.getItem("userProfileImage");
  if (storedImage && profileImage) {
    profileImage.style.backgroundImage = `url("${storedImage}")`;
    profileImage.style.backgroundSize = "cover";
    profileImage.style.backgroundPosition = "center";
  } else if (profileImage) {
    profileImage.style.removeProperty("background-image");
  }

  let isMenuOpen = false;

  const handleDocumentClick = (event) => {
    if (!menu.contains(event.target) && !profileButton.contains(event.target)) {
      closeMenu();
    }
  };

  function openMenu() {
    if (isMenuOpen) return;
    isMenuOpen = true;
    menu.classList.add("is-open");
    console.log(menu + " " + menu.classList);
    document.addEventListener("click", handleDocumentClick);
  }

  function closeMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    menu.classList.remove("is-open");
    document.removeEventListener("click", handleDocumentClick);
  }

  profileButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll(".header-menu-item[href]").forEach((item) => {
    item.addEventListener("click", () => closeMenu());
  });

  const logoutBtn = menu.querySelector(".header-menu-item-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();
      // TODO: 로그아웃 모달 연결
    });
  }
}
