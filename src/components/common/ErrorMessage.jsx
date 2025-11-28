import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ message }) {
  return <small className={styles.fieldErrorMessage}>{message}</small>;
}
