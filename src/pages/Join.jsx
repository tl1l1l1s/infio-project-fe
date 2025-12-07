import { useState } from "react";
import { usePageRouter } from "../hooks/usePageRouter";
import { useForm } from "../hooks/useForm";
import { registerUser } from "../api/users";
import { showToast } from "../lib/toast";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import styles from "./Join.module.css";

function Join() {
  const { goToLogin } = usePageRouter();
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, handleSubmit, errors, isSubmitting, getValues } = useForm({
    defaultValues: { email: "", nickname: "", password: "", passwordConfirm: "" },
  });

  const onSubmit = async (values) => {
    setFieldErrors({});
    try {
      await registerUser({
        email: values.email.trim(),
        nickname: values.nickname.trim(),
        password: values.password,
      });
      showToast("회원가입이 완료되었습니다.", { type: "info" });
      goToLogin();
    } catch (err) {
      const message = err?.response?.data?.message || "";
      if (message.includes("email_already_exists")) {
        setFieldErrors((prev) => ({ ...prev, email: "중복된 이메일 입니다." }));
      } else if (message.includes("nickname_already_exists")) {
        setFieldErrors((prev) => ({ ...prev, nickname: "중복된 닉네임 입니다." }));
      } else {
        showToast("회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>회원가입</h1>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.section}>
          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <div className={styles.inline}>
              <Input
                type="email"
                placeholder="이메일을 입력하세요"
                {...register("email", {
                  required: { message: "이메일을 입력해주세요." },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)",
                  },
                })}
              />
            </div>
            <ErrorMessage message={fieldErrors.email || errors.email} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.field}>
            <label className={styles.label}>닉네임</label>
            <Input
              type="text"
              placeholder="닉네임을 입력하세요"
              {...register("nickname", {
                required: { message: "닉네임을 입력해주세요." },
                validate: (v) => (!v?.includes(" ") ? true : "띄어쓰기를 없애주세요."),
                maxLength: { value: 10, message: "닉네임은 최대 10자까지 작성 가능합니다." },
              })}
            />
            <ErrorMessage message={fieldErrors.nickname || errors.nickname} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register("password", {
                required: { message: "비밀번호를 입력해주세요." },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/,
                  message: "비밀번호는 8~20자, 대문자/소문자/숫자/특수문자 각 1개 이상 포함해야 합니다.",
                },
              })}
            />
            <ErrorMessage message={errors.password} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호 확인</label>
            <Input
              type="password"
              placeholder="비밀번호를 한 번 더 입력하세요"
              {...register("passwordConfirm", {
                required: { message: "비밀번호를 한 번 더 입력하세요." },
                validate: (v) => (v === getValues().password ? true : "비밀번호가 다릅니다."),
              })}
            />
            <ErrorMessage message={errors.passwordConfirm} />
          </div>
        </div>

        <Button type="submit" variant="primary" className={styles.submit} disabled={isSubmitting}>
          회원가입
        </Button>
      </form>
    </div>
  );
}

export default Join;
