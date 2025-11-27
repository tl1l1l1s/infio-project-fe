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

export function fetchFooter() {
  const footerRoot = document.getElementById("footer");
  if (!footerRoot) return Promise.reject();

  return fetch("/scripts/components/footer.html")
    .then((res) => {
      if (!res.ok) throw new Error("푸터 로딩에 실패했습니다.");
      return res.text();
    })
    .then((html) => {
      footerRoot.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
    });
}

function initializeHeader() {
  setupHeaderSearch();
}

function setupHeaderSearch() {
  const searchBox = document.querySelector(".header-search-box");
  const searchTrigger = document.getElementById("header-search-trigger");
  const searchInput = document.getElementById("search");
  const dropdown = document.getElementById("search-dropdown");
  const themeListEl = document.getElementById("search-theme-list");
  const popularListEl = document.getElementById("search-popular-list");

  if (!searchBox || !searchTrigger || !searchInput || !dropdown || !themeListEl || !popularListEl) return;

  const defaultThemes = ["Java", "Spring", "JavaScript", "React", "Kotlin"]; // TODO: Theme 동적으로 받아오기
  const defaultPopular = ["비동기 처리", "Spring Security", "Vanila JS", "JWT인증", "React Hooks"]; // TODO : 인기 검색어 동적으로 받아오기
  let activeTheme = "all";
  let dropdownLoaded = false;

  searchTrigger.addEventListener("click", () => {
    toggleDropdown(true);
  });
  searchInput.addEventListener("focus", () => toggleDropdown(true));
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-search-box")) {
      toggleDropdown(false);
    }
  });

  async function toggleDropdown(shouldOpen) {
    if (shouldOpen) {
      dropdown.classList.add("is-open");
      if (!dropdownLoaded) {
        await loadDropdownData();
        dropdownLoaded = true;
      }
    } else {
      dropdown.classList.remove("is-open");
    }
  }

  async function loadDropdownData() {
    const [themes, popular] = await Promise.all([fetchThemes(), fetchPopular()]);
    renderThemes(themes);
    renderPopular(popular);
  }

  async function fetchThemes() {
    try {
      const res = await fetch("/api/search/themes");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const themes = Array.isArray(data?.themes) ? data.themes : [];
      return themes.map((item) => (typeof item === "string" ? item : item?.label || item?.name)).filter(Boolean);
    } catch (err) {
      return defaultThemes;
    }
  }

  async function fetchPopular() {
    try {
      const res = await fetch("/api/search/popular");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = Array.isArray(data?.keywords) ? data.keywords : [];
      return items.map((item) => (typeof item === "string" ? item : item?.keyword || item?.name)).filter(Boolean);
    } catch (err) {
      return defaultPopular;
    }
  }

  function renderThemes(themes) {
    themeListEl.innerHTML = "";
    const uniqueThemes = ["All", ...themes].filter(Boolean);
    uniqueThemes.forEach((theme) => {
      const value = theme.toLowerCase();
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-theme-button";
      if (value === activeTheme) {
        button.classList.add("is-active");
      }
      button.dataset.theme = value;
      button.textContent = theme;
      button.addEventListener("click", () => {
        activeTheme = value;
        themeListEl.querySelectorAll(".search-theme-button").forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
      });
      themeListEl.appendChild(button);
    });
  }

  function renderPopular(popularKeywords) {
    popularListEl.innerHTML = "";
    popularKeywords.slice(0, 5).forEach((keyword) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-popular-item";
      button.textContent = keyword;
      button.addEventListener("click", () => {
        searchInput.value = keyword;
        handleSearchSubmit();
      });
      popularListEl.appendChild(button);
    });
  }

  function handleSearchSubmit() {
    const query = searchInput.value.trim();
    const payload = { query, theme: activeTheme };
    document.dispatchEvent(
      new CustomEvent("header:search", {
        detail: payload,
      })
    );
    toggleDropdown(false);
  }
}
