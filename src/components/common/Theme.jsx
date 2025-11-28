import styles from "./Theme.module.css";

export default function Theme({ theme, isActive = false }) {
  return <div className={`${styles.theme} ${isActive ? styles.isActive : ""}`}>{theme}</div>;
}
