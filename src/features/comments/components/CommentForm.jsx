import { useEffect, useRef } from "react";
import Button from "../../../components/common/Button";
import styles from "./CommentForm.module.css";

function CommentForm({ commentCount, value, isEditing = false, onChange, onSubmit, onCancel }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (isEditing && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isEditing]);

  return (
    <form
      className={styles.form}
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) {
          onSubmit({ content: value });
        }
      }}
    >
      <label className={styles.label} htmlFor="comment-content">
        댓글 ({commentCount})
      </label>
      <textarea
        id="comment-content"
        name="content"
        className={styles.textarea}
        placeholder="댓글을 남겨주세요!"
        rows="4"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <div className={styles.actions}>
        {isEditing && (
          <Button
            variant="secondary"
            className={styles.submit}
            type="button"
            onClick={() => {
              onCancel?.();
            }}
          >
            취소
          </Button>
        )}
        <Button variant="primary" className={styles.submit}>
          {isEditing ? "댓글 수정" : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
