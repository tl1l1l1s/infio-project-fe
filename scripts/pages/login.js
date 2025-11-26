import { fetchHeader, fetchFooter, getErrorMessageElement } from "../utils/dom.js";
import { api } from "../utils/api.js";
import { setCurrentUser } from "../utils/auth.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  fetchFooter();

  const form = document.querySelector('form[action="/login"]');
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", handleLogin);
  emailInput?.addEventListener("blur", () => validateField(emailInput));
  passwordInput?.addEventListener("blur", () => validateField(passwordInput));

  function validateField(input) {
    const help = getErrorMessageElement(input);
    help.style.display = "none";

    if (input === emailInput) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!ok) {
        help.textContent = "올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
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
      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/.test(v)) {
        help.textContent =
          "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
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

  async function handleLogin(e) {
    e.preventDefault();
    if (!validateAll()) return;

    submitBtn.disabled = true;

    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    try {
      const data = await api.post("/auth/login", { body: payload });
      if (data?.result) {
        setCurrentUser({ user_id: data.result.user_id, profile_image: data.result.profile_image });
      }
      location.href = "/index.html";
    } catch (err) {
      const help = getErrorMessageElement(passwordInput);
      if (err.status === 401 || err.status === 400) {
        help.textContent = "아이디 또는 비밀번호를 확인하세요.";
      } else {
        help.textContent = err.message || "네트워크 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.";
      }
      help.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = "";
    }
  }
}
