import { fetchHeader, fetchFooter, getErrorMessageElement } from "../utils/dom.js";
import { api } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  fetchFooter();

  const form = document.querySelector('form[action="/join"]');
  const profileImageInput = document.getElementById("profile-image");
  const emailInput = document.getElementById("email");
  const emailVerifyInput = document.getElementById("email-verify");
  const passwordInput = document.getElementById("password");
  const passwordConfirmInput = document.getElementById("confirm-password");
  const nicknameInput = document.getElementById("nickname");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const sendCodeBtn = document.getElementById("send-email-code");
  const verifySection = document.getElementById("email-verify-section");

  function validateField(input) {
    showErrorMessageElement(input, "").style.display = "none";

    if (input === emailInput) {
      const v = input.value;

      if (v.length <= 0) {
        showErrorMessageElement(input, "이메일을 입력해주세요.");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        showErrorMessageElement(input, "올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)");
        return false;
      }
    }

    if (input === passwordInput) {
      const v = input.value;
      if (v.length === 0) {
        showErrorMessageElement(input, "비밀번호를 입력해주세요.");
        return false;
      }
      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/.test(v)) {
        showErrorMessageElement(
          passwordInput,
          "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
        );
        return false;
      }
    }

    if (input === passwordConfirmInput) {
      if (input.value != passwordInput.value) {
        showErrorMessageElement(input, "비밀번호가 다릅니다.");
        return false;
      }
    }

    if (input === nicknameInput) {
      const v = input.value;

      if (v.length <= 0) {
        showErrorMessageElement(input, "닉네임을 입력해주세요.");
        return false;
      }

      if (v.includes(" ")) {
        showErrorMessageElement(input, "띄어쓰기를 없애주세요.");
        return false;
      }

      if (v.length > 10) {
        showErrorMessageElement(input, "닉네임은 최대 10자까지 작성 가능합니다.");
        return false;
      }
    }

    return true;
  }

  async function join(e) {
    e.preventDefault();

    if (
      !(
        validateField(emailInput) &&
        validateField(passwordInput) &&
        validateField(passwordConfirmInput) &&
        validateField(nicknameInput)
      )
    ) {
      return;
    }

    submitBtn.style.backgroundColor = "#7F6AEE";
    submitBtn.disabled = true;

    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      nickname: nicknameInput.value,
    };

    try {
      const res = await api.post("/users", { body: payload });
      location.href = "/login.html";
    } catch (err) {
      const message = err.body?.message || "";
      if (message.includes("email_already_exists")) {
        const help = getErrorMessageElement(emailInput);
        help.textContent = "중복된 이메일 입니다.";
        help.style.display = "block";
      } else if (message.includes("nickname_already_exists")) {
        const help = getErrorMessageElement(nicknameInput);
        help.textContent = "중복된 닉네임 입니다.";
        help.style.display = "block";
      } else {
        showErrorMessageElement(
          nicknameInput,
          err.message || "네트워크 오류가 발생하였습니다. 잠시 후 다시 시도해주세요."
        );
      }
      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = "";
    }
  }

  form.addEventListener("submit", join);
  emailInput.addEventListener("blur", () => validateField(emailInput));
  passwordInput.addEventListener("blur", () => validateField(passwordInput));
  passwordConfirmInput.addEventListener("blur", () => validateField(passwordConfirmInput));
  nicknameInput.addEventListener("blur", () => validateField(nicknameInput));
  sendCodeBtn?.addEventListener("click", handleSendCode);

  function handleSendCode() {
    if (!validateField(emailInput)) return;
    verifySection?.classList.add("is-visible");
    if (emailVerifyInput) {
      emailVerifyInput.disabled = false;
    }
  }
}

function showErrorMessageElement(input, message) {
  const targetId = input?.dataset?.errorId;
  let el = null;
  if (targetId) {
    el = document.getElementById(targetId);
  }
  if (!el) {
    el = getErrorMessageElement(input);
  }
  el.textContent = message;
  el.style.display = message ? "block" : "none";
  return el;
}
