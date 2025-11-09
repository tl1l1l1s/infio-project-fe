fetch("./scripts/components/header.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("header").innerHTML = html));

const form = document.querySelector('form[action="/login"]');
const emailInput = form?.querySelector("#email");
const passwordInput = form?.querySelector("#password");
const submitBtn = form?.querySelector('button[type="submit"]');

function getHelper(input) {
  let el = input.nextElementSibling;
  if (!el || !el.classList.contains("field-error-message")) {
    el = document.createElement("small");
    el.className = "field-error-message";
    el.style.display = "none";
    input.insertAdjacentElement("afterend", el);
  }
  return el;
}

function validateField(input) {
  const help = getHelper(input);
  help.style.display = "none";

  if (input === emailInput) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (!ok) {
      help.textContent = "유효한 이메일을 입력하세요.";
      help.style.display = "block";
      return false;
    }
  }

  if (input === passwordInput) {
    const v = input.value;
    if (v.length === 0) {
      help.textContent = "비밀번호를 입력해주세요.";
      help.style.display = "block";
      return false;
    }
    if (v.length < 8 || v.length > 20) {
      help.textContent = "비밀번호는 8~20자여야 합니다.";
      help.style.display = "block";
      return false;
    }
  }
  return true;
}

function validateAll() {
  const a = validateField(emailInput);
  const b = validateField(passwordInput);
  return a && b;
}

async function login(e) {
  e.preventDefault();
  if (!validateAll()) return;

  submitBtn.style.backgroundColor = "rgb(150, 140, 210)";
  submitBtn.disabled = true;

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  try {
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const help = getHelper(passwordInput);
      help.textContent = "아이디 또는 비밀번호를 확인하세요.";
      help.style.visibility = "visible";
      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = "";
      return;
    }

    location.href = "/articles/list.html";
  } catch (err) {
    const help = getHelper(passwordInput);
    help.textContent = "네트워크 오류: " + err.message;
    help.style.visibility = "visible";
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = "";
  }
}

form.addEventListener("submit", login);
emailInput.addEventListener("blur", () => validateField(emailInput));
passwordInput.addEventListener("blur", () => validateField(passwordInput));
