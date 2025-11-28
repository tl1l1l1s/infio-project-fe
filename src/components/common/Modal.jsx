import styles from "./Modal.module.css";

export default function Modal({ title, message, onConfirm, onCancel }) {
  return (
    <div className={`${styles.wrapper} ${styles.open}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.button} ${styles.buttonCancel}`} onClick={onCancel}>
            취소
          </button>
          <button type="button" className={`${styles.button} ${styles.buttonConfirm}`} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
