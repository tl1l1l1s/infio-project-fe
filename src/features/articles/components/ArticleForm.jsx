import { useEffect, useRef, useState } from "react";
import Button from "../../../components/common/Button";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Input from "../../../components/common/Input";
import { useForm } from "../../../hooks/useForm";
import { usePageRouter } from "../../../hooks/usePageRouter";
import { FALLBACK_THEME_OPTIONS, THEME_LABEL_MAP } from "../../../constants/themes";
import { resolveImageUrl } from "../../../utils/image";
import styles from "./ArticleForm.module.css";

function ArticleForm({
  mode = "create",
  submitLabel = "작성",
  cancelLabel = "취소",
  initialValues = {},
  themes = [],
  onSubmit,
  onCancel,
}) {
  const { theme = "NONE", title = "", content = "", imageSrc = "" } = initialValues;
  const [preview, setPreview] = useState(resolveImageUrl(imageSrc));

  const objectUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  const { goBack } = usePageRouter();

  const { register, handleSubmit, errors, setValue } = useForm({
    defaultValues: { theme: theme || "NONE", title, content, image: null },
  });

  const handleImageChange = (file) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!file) {
      setPreview("");
      setValue("image", null, { shouldValidate: false });
      return;
    }
    setValue("image", file, { shouldValidate: false });
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const submitHandler = (values) => {
    if (!onSubmit) return;
    const payload = {
      title: values.title,
      content: values.content,
      theme: values.theme || "NONE",
    };
    const imageFile = values.image instanceof File ? values.image : null;
    onSubmit({ payload, imageFile });
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{mode === "edit" ? "게시글 수정" : "게시글 작성"}</h1>
      <main className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="theme">
              주제*
            </label>
            <select id="theme" className={styles.select} {...register("theme")} defaultValue={theme || ""}>
              <option value="">주제를 선택하세요</option>
              {themes.length > 0
                ? themes
                : FALLBACK_THEME_OPTIONS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label ?? THEME_LABEL_MAP[t.key] ?? t.key}
                    </option>
                  ))}
            </select>
            <ErrorMessage message={errors.theme} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              제목*
            </label>
            <Input
              type="text"
              placeholder="제목을 입력해주세요. (최대 26글자)"
              maxLength="26"
              {...register("title", {
                required: { message: "제목을 입력해주세요." },
                maxLength: { value: 26, message: "제목은 최대 26자까지 작성 가능합니다." },
              })}
            />
            <ErrorMessage message={errors.title} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="content">
              내용*
            </label>
            <textarea
              className={styles.textarea}
              placeholder="내용을 입력해주세요."
              rows="10"
              {...register("content", {
                required: { message: "내용을 입력해주세요." },
              })}
            />
            <ErrorMessage message={errors.content} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="image">
              이미지
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className={styles.file}
              ref={fileInputRef}
              onChange={(e) => handleImageChange(e.target.files?.[0])}
            />
            <div className={`${styles.imagePreview} ${preview ? styles.imagePreviewVisible : ""}`}>
              {preview ? <img src={preview} /> : null}
              <Button
                variant="tertiary"
                size="sm"
                type="button"
                onClick={() => {
                  handleImageChange(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                이미지 삭제
              </Button>
            </div>
          </div>

          <div className={styles.buttons}>
            <Button className={styles.buttonHalf} variant="secondary" type="button" onClick={onCancel || goBack}>
              {cancelLabel}
            </Button>
            <Button className={styles.buttonHalf} variant="primary" type="submit">
              {submitLabel}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ArticleForm;
