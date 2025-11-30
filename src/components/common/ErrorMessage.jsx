import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ message, className = "" }) {
  const classes = [styles.fieldErrorMessage, className].filter(Boolean).join(" ");
  return <small className={classes}>{message}</small>;
}
