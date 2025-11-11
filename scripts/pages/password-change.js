import { getErrorMessageElement } from "../utils/dom.js";

fetch("./scripts/components/header.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("header").innerHTML = html));

const form = document.querySelector("form");
const passwordInput = form?.querySelector("#password");
const passwordConfirmInput = form?.querySelector("#confirm-password");
const submitBtn = form?.querySelector('button[type="submit"]');

function validateField(input) {
  const help = getErrorMessageElement(input);
  help.textContent = "";

  if (input === passwordInput) {
    const v = input.value;

    if (v.length === 0) {
      help.textContent = "비밀번호를 입력해주세요.";
      return false;
    }
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/.test(v)) {
      help.textContent =
        "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
      return false;
    }
  }

  if (input === passwordConfirmInput) {
    if (input.value.length <= 0) {
      help.textContent = "비밀번호를 한 번 더 입력해주세요.";
      return false;
    }
    if (input.value != passwordInput.value) {
      help.textContent = "비밀번호가 다릅니다.";
      return false;
    }
  }

  return true;
}

const userId = localStorage.getItem("userId");
if (userId == null) {
  location.href = "/login.html";
}

async function changePassword(e) {
  e.preventDefault();

  if (!validateField(passwordInput) || !validateField(passwordConfirmInput)) {
    return;
  }

  try {
    const payload = { password: passwordInput.value };
    const res = await fetch(`http://localhost:8080/users/password?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      getErrorMessageElement(passwordConfirmInput).textContent = data.message;
    }

    location.href = "/";
  } catch (err) {
    getErrorMessageElement(passwordConfirmInput).textContent = "네트워크 오류: " + err.message;
  }
}

submitBtn.addEventListener("click", changePassword);
passwordInput.addEventListener("blur", () => validateField(passwordInput));
passwordConfirmInput.addEventListener("blur", () => validateField(passwordConfirmInput));
