import { fetchHeader, fetchFooter, getErrorMessageElement } from "../utils/dom.js";
import { getUserId } from "../utils/auth.js";
import { showToast } from "../components/toast.js";
import { api } from "../utils/api.js";
import { confirmModal } from "../components/modal.js";
import { resolveImageUrl } from "../utils/image.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
  fetchHeader();
  fetchFooter();

  const userId = getUserId();
  const form = document.querySelector(".my-change-form");
  const nicknameInput = document.getElementById("nickname");
  const emailField = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const avatarPicker = document.querySelector(".profile-image-picker");
  const profilePreviewImg = document.getElementById("profile-preview");
  const profileImageInput = document.getElementById("profile-image");
  const deleteBtn = document.getElementById("account-delete");
  const removeProfileBtn = document.getElementById("profile-image-remove");

  let currentProfileImage = null;
  let initialNickname = "";
  let selectedProfileFile = null;
  let removeProfileImage = false;

  nicknameInput?.addEventListener("blur", validateNickname);
  passwordInput?.addEventListener("blur", () => validatePassword(passwordInput));
  confirmPasswordInput?.addEventListener("blur", () => validatePassword(confirmPasswordInput));
  form?.addEventListener("submit", handleSubmit);
  avatarPicker?.addEventListener("click", handleAvatarClick);
  profileImageInput?.addEventListener("change", handleProfileImageChange);
  deleteBtn?.addEventListener("click", handleAccountDelete);
  removeProfileBtn?.addEventListener("click", handleRemoveProfileImage);

  loadUserProfile();

  async function loadUserProfile() {
    if (!emailField || !nicknameInput) return;

    emailField.textContent = "로딩 중...";
    nicknameInput.disabled = true;
    submitBtn.disabled = true;

    try {
      const data = await api.get("/users", { params: { userId } });
      if (!data?.result) {
        throw new Error("회원 정보를 불러오지 못했습니다.");
      }

      const user = data.result;
      emailField.textContent = user.email || "-";
      nicknameInput.value = user.nickname || "";
      initialNickname = nicknameInput.value;
      setProfileImage(user.profile_image ?? user.profileImage ?? null);
      removeProfileImage = false;
    } catch (err) {
      if (emailField) {
        emailField.textContent = "";
      }
      showToast(err.message || "프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    } finally {
      nicknameInput.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function setProfileImage(imageUrl) {
    currentProfileImage = imageUrl || null;

    if (!profilePreviewImg || !avatarPicker) return;

    const resolved = resolveImageUrl(currentProfileImage);

    if (resolved) {
      profilePreviewImg.src = resolved;
      avatarPicker.classList.add("has-image");
    } else {
      profilePreviewImg.removeAttribute("src");
      avatarPicker.classList.remove("has-image");
    }
  }

  function handleAvatarClick(event) {
    event.preventDefault();
    profileImageInput?.click();
  }

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0];
    selectedProfileFile = file || null;
    if (file && profilePreviewImg) {
      const reader = new FileReader();
      reader.onload = () => {
        profilePreviewImg.src = reader.result;
        avatarPicker?.classList.add("has-image");
      };
      reader.readAsDataURL(file);
      removeProfileImage = false;
    } else if (!file) {
      setProfileImage(currentProfileImage);
    }
  }

  function handleRemoveProfileImage() {
    selectedProfileFile = null;
    removeProfileImage = true;
    currentProfileImage = null;
    if (profilePreviewImg) {
      profilePreviewImg.removeAttribute("src");
    }
    avatarPicker?.classList.remove("has-image");
    if (profileImageInput) {
      profileImageInput.value = "";
    }
  }
  async function handleAccountDelete() {
    const ok = await confirmModal({
      title: "회원 탈퇴",
      message: "정말 탈퇴하시겠습니까? 탈퇴 후에는 다시 복구할 수 없습니다.",
      confirmText: "탈퇴",
      cancelText: "취소",
    });
    if (!ok) return;

    try {
      await api.delete("/users", { params: { userId } });
      localStorage.removeItem("userId");
      localStorage.removeItem("userProfileImage");
      showToast("회원 탈퇴가 완료되었습니다.");
      location.replace("/login.html");
    } catch (err) {
      showToast(err.message || "회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    }
  }

  function validateNickname() {
    if (!nicknameInput) return false;

    const help = getErrorMessageElement(nicknameInput);
    help.style.display = "none";
    help.textContent = "";

    const value = nicknameInput.value.trim();

    if (value.length === 0) {
      help.textContent = "닉네임을 입력해주세요.";
    } else if (/\s/.test(value)) {
      help.textContent = "띄어쓰기를 없애주세요.";
    } else if (value.length > 10) {
      help.textContent = "닉네임은 최대 10자까지 작성 가능합니다.";
    }

    if (help.textContent) {
      help.style.display = "block";
      return false;
    }

    return true;
  }

  function validatePassword(targetInput) {
    const help = getErrorMessageElement(targetInput);
    help.textContent = "";

    const pwd = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    if (targetInput === passwordInput) {
      if (pwd.length === 0) {
        // 비워두면 무시
        return true;
      }
      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/.test(pwd)) {
        help.textContent =
          "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        return false;
      }
      if (confirm.length > 0 && pwd !== confirm) {
        const confirmHelp = getErrorMessageElement(confirmPasswordInput);
        confirmHelp.textContent = "비밀번호가 다릅니다.";
        confirmHelp.style.display = "block";
        return false;
      }
    }

    if (targetInput === confirmPasswordInput) {
      if (confirm.length === 0) {
        // 비워두면 무시
        return true;
      }
      if (pwd.length === 0) {
        help.textContent = "비밀번호를 먼저 입력해주세요.";
        return false;
      }
      if (pwd !== confirm) {
        help.textContent = "비밀번호가 다릅니다.";
        return false;
      }
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isNicknameValid = validateNickname();
    const isPasswordValid =
      validatePassword(passwordInput) && validatePassword(confirmPasswordInput) && passwordsMatchOrEmpty();

    if (!isNicknameValid || !isPasswordValid) {
      return;
    }

    const nickname = nicknameInput.value.trim();
    const pwd = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    const nicknameChanged = nickname !== initialNickname;
    const imageChanged = Boolean(selectedProfileFile);
    const profileChanged = nicknameChanged || imageChanged || removeProfileImage;
    const passwordChanged = pwd.length > 0 && confirm.length > 0;

    if (!profileChanged && !passwordChanged) {
      showToast("변경할 정보가 없습니다.");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    const requests = [];
    if (profileChanged) {
      const payload = {
        nickname,
        profile_image: removeProfileImage ? "" : currentProfileImage,
      };
      const formData = new FormData();
      formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (selectedProfileFile) {
        formData.append("profileImage", selectedProfileFile);
      }

      requests.push(
        api.patch("/users", {
          params: { userId },
          body: formData,
        }),
      );
    }

    if (passwordChanged) {
      requests.push(api.patch("/users/password", { params: { userId }, body: { password: pwd } }));
    }

    try {
      const results = await Promise.all(requests);
      if (profileChanged) {
        const profileResponse = results[0]?.result;
        currentProfileImage = profileResponse?.profile_image ?? currentProfileImage;
        initialNickname = profileResponse?.nickname ?? nickname;
        setProfileImage(currentProfileImage);
        removeProfileImage = false;
        if (currentProfileImage) {
          localStorage.setItem("userProfileImage", currentProfileImage);
        } else {
          localStorage.removeItem("userProfileImage");
        }
        selectedProfileFile = null;
        if (profileImageInput) {
          profileImageInput.value = "";
        }
      }
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      showToast("정보 변경 완료.");
    } catch (err) {
      const errorMessage = deriveErrorMessage({ profileChanged, passwordChanged }, err);
      showToast(errorMessage, { type: "error" });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function passwordsMatchOrEmpty() {
    const pwd = passwordInput.value;
    const confirm = confirmPasswordInput.value;
    if (pwd.length === 0 && confirm.length === 0) return true;
    return pwd === confirm;
  }

  function deriveErrorMessage(flags, err) {
    const { profileChanged, passwordChanged } = flags;
    if (profileChanged && passwordChanged) {
      return err?.message || "정보 변경 실패. 잠시 후 다시 시도해주세요.";
    }
    if (passwordChanged) {
      return err?.message || "비밀번호 수정 실패. 잠시 후 다시 시도해주세요.";
    }
    if (profileChanged) {
      return err?.message || "정보 변경 실패. 잠시 후 다시 시도해주세요.";
    }
  }
}
