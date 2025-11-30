import styles from "./Input.module.css";

export default function Input({ className = "", ...props }) {
  const classes = [styles.input, className].filter(Boolean).join(" ");
  return <input className={classes} {...props} />;
}
