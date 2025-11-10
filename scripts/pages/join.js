fetch("./scripts/components/header.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("header").innerHTML = html));

const form = document.querySelector('form[action="/join"]');
const profileImageInput = form?.querySelector("#profile-image");
const emailInput = form?.querySelector("#email");
const passwordInput = form?.querySelector("#password");
const passwordConfirmInput = form?.querySelector("#confirm-password");
const nicknameInput = form?.querySelector("#nickname");
const submitBtn = form?.querySelector('button[type="submit"]');

function showErrorMessageElement(input, message) {
  let el = input.nextElementSibling;

  if (!el || !el.classList.contains("field-error-message")) {
    el = document.createElement("small");
    el.className = "field-error-message";
    el.style.display = "none";
    input.insertAdjacentElement("afterend", el);
  }

  el.textContent = message;
  el.style.display = "block";
  return el;
}

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
        emailInput,
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
    const res = await fetch("http://localhost:8080/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.message.includes("email_already_exists")) {
        const help = getErrorMessageElement(emailInput);
        help.textContent = "중복된 이메일 입니다.";
        help.style.display = "block";
      }

      if (data.message.includes("nickname_already_exists")) {
        const help = getErrorMessageElement(nicknameInput);
        help.textContent = "중복된 닉네임 입니다.";
        help.style.display = "block";
      }

      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = "";
      return;
    }
  } catch (err) {
    showErrorMessageElement(nicknameInput, "네트워크 오류: " + err.message);
  }
}

form.addEventListener("submit", join);
emailInput.addEventListener("blur", () => validateField(emailInput));
passwordInput.addEventListener("blur", () => validateField(passwordInput));
passwordConfirmInput.addEventListener("blur", () => validateField(passwordConfirmInput));
nicknameInput.addEventListener("blur", () => validateField(nicknameInput));
